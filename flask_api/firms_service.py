"""
NASA FIRMS Wildfire Service
═══════════════════════════════════════════════════════════════════════════

"When wildfires burn, the Earth watches from space."

This module integrates NASA FIRMS (Fire Information for Resource Management System)
to detect and track active wildfires using satellite data.

Data source: NASA FIRMS API
- MODIS and VIIRS satellite instruments
- Near real-time fire detection (within 3 hours)
- Global coverage with high accuracy

═══════════════════════════════════════════════════════════════════════════
"""

import requests
from typing import Dict, List, Any, Optional
from datetime import datetime
import math
from config import config


class FirmsService:
    """
    NASA FIRMS - Eyes in the sky watching for fires.

    Detects active wildfires using thermal anomalies from satellite sensors.
    """

    # NASA FIRMS API endpoint (CSV format for simplicity)
    # Note: In production, you would need to register for a MAP_KEY at https://firms.modaps.eosdis.nasa.gov/api/
    FIRMS_API = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"

    # Mock API key placeholder - replace with real key for production
    MAP_KEY = "DEMO_MAP_KEY"

    @staticmethod
    def _calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two points using Haversine formula.

        Args:
            lat1, lon1: First point coordinates
            lat2, lon2: Second point coordinates

        Returns:
            Distance in kilometers
        """
        # Earth's radius in kilometers
        R = 6371.0

        # Convert to radians
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)

        # Haversine formula
        a = math.sin(delta_lat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c

    @staticmethod
    def _classify_fire_severity(brightness: float, confidence: float) -> str:
        """
        Classify fire severity based on brightness and confidence.

        Args:
            brightness: Fire brightness temperature in Kelvin
            confidence: Confidence percentage (0-100)

        Returns:
            Severity classification: 'low', 'moderate', 'high', 'extreme'
        """
        if brightness >= 380 and confidence >= 80:
            return 'extreme'
        elif brightness >= 360 or confidence >= 70:
            return 'high'
        elif brightness >= 340 or confidence >= 50:
            return 'moderate'
        else:
            return 'low'

    @staticmethod
    def get_active_fires(lat: float, lon: float, radius_km: int = 100) -> Dict[str, Any]:
        """
        Fetch active wildfire data from NASA FIRMS.

        Args:
            lat: Latitude of query point
            lon: Longitude of query point
            radius_km: Search radius in kilometers (default: 100km)

        Returns:
            Dictionary containing wildfire data and statistics
        """
        try:
            # Note: Real FIRMS API requires authentication
            # Format: /api/area/csv/{MAP_KEY}/{source}/{area}/{day_range}
            # For demo purposes, we'll use mock data if API fails

            # Construct API URL
            source = 'VIIRS_SNPP_NRT'  # VIIRS sensor on Suomi NPP satellite
            day_range = 1  # Last 24 hours

            # FIRMS uses bounding box, but we'll approximate with lat/lon + radius
            # For simplicity, converting radius to approximate degrees (very rough)
            degree_offset = radius_km / 111.0  # ~111km per degree latitude

            url = f"{FirmsService.FIRMS_API}/{FirmsService.MAP_KEY}/{source}/{lat},{lon},{degree_offset}/{day_range}"

            # Make request with timeout
            response = requests.get(url, timeout=10)

            # If demo key fails, return mock data for demonstration
            if response.status_code != 200 or FirmsService.MAP_KEY == "DEMO_MAP_KEY":
                return FirmsService._get_mock_wildfire_data(lat, lon, radius_km)

            # Parse CSV response
            fires = FirmsService._parse_firms_csv(response.text, lat, lon, radius_km)

            return fires

        except Exception as e:
            # Gracefully fallback to mock data
            print(f"FIRMS API error: {e}. Using mock data.")
            return FirmsService._get_mock_wildfire_data(lat, lon, radius_km)

    @staticmethod
    def _parse_firms_csv(csv_text: str, origin_lat: float, origin_lon: float, max_radius: float) -> Dict[str, Any]:
        """
        Parse FIRMS CSV response into structured wildfire data.

        Args:
            csv_text: Raw CSV response from FIRMS API
            origin_lat, origin_lon: Query point coordinates
            max_radius: Maximum search radius

        Returns:
            Structured wildfire data dictionary
        """
        import csv
        from io import StringIO

        fires = []
        reader = csv.DictReader(StringIO(csv_text))

        for row in reader:
            fire_lat = float(row['latitude'])
            fire_lon = float(row['longitude'])

            # Calculate distance from query point
            distance = FirmsService._calculate_distance(origin_lat, origin_lon, fire_lat, fire_lon)

            # Only include fires within radius
            if distance <= max_radius:
                brightness = float(row.get('bright_ti4', row.get('brightness', 0)))
                confidence = float(row.get('confidence', 0))

                fires.append({
                    'latitude': fire_lat,
                    'longitude': fire_lon,
                    'brightness': brightness,
                    'confidence': confidence,
                    'scan': float(row.get('scan', 0)),
                    'track': float(row.get('track', 0)),
                    'acq_date': row.get('acq_date'),
                    'acq_time': row.get('acq_time'),
                    'satellite': row.get('satellite', 'Unknown'),
                    'distance_km': round(distance, 2),
                    'severity': FirmsService._classify_fire_severity(brightness, confidence)
                })

        # Sort by distance
        fires.sort(key=lambda x: x['distance_km'])

        return {
            'count': len(fires),
            'fires': fires,
            'closest_fire': fires[0] if fires else None,
            'search_radius_km': max_radius,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    @staticmethod
    def _get_mock_wildfire_data(lat: float, lon: float, radius_km: int) -> Dict[str, Any]:
        """
        Generate mock wildfire data for demo purposes.

        This is used when:
        - FIRMS API is unavailable
        - No API key is configured
        - For testing and development

        Args:
            lat, lon: Query coordinates
            radius_km: Search radius

        Returns:
            Mock wildfire data matching FIRMS format
        """
        # Simulate realistic wildfire scenarios based on location
        mock_fires = []

        # Example: California-like coordinates often have fires
        if 32 <= lat <= 42 and -124 <= lon <= -114:
            # Simulate 2 active fires
            mock_fires = [
                {
                    'latitude': lat + 0.5,
                    'longitude': lon - 0.3,
                    'brightness': 365.2,
                    'confidence': 85,
                    'scan': 1.2,
                    'track': 1.1,
                    'acq_date': datetime.utcnow().strftime('%Y-%m-%d'),
                    'acq_time': '1430',
                    'satellite': 'VIIRS_SNPP',
                    'distance_km': 55.3,
                    'severity': 'high'
                },
                {
                    'latitude': lat - 0.7,
                    'longitude': lon + 0.4,
                    'brightness': 342.8,
                    'confidence': 65,
                    'scan': 1.0,
                    'track': 1.0,
                    'acq_date': datetime.utcnow().strftime('%Y-%m-%d'),
                    'acq_time': '1245',
                    'satellite': 'VIIRS_SNPP',
                    'distance_km': 78.6,
                    'severity': 'moderate'
                }
            ]

        # Sort by distance
        mock_fires.sort(key=lambda x: x['distance_km'])

        return {
            'count': len(mock_fires),
            'fires': mock_fires,
            'closest_fire': mock_fires[0] if mock_fires else None,
            'search_radius_km': radius_km,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'note': 'Mock data - Configure FIRMS API key for real data'
        }
