"""
NASA FIRMS Wildfire Service
═══════════════════════════════════════════════════════════════════════════

"When wildfires burn, the Earth watches from space."

This module integrates NASA FIRMS (Fire Information for Resource Management System)
to detect and track active wildfires using satellite data.

Learn more: https://firms.modaps.eosdis.nasa.gov/map/

FIRMS provides real-time active fire data from NASA's MODIS and VIIRS satellites:
- VIIRS (Visible Infrared Imaging Radiometer Suite) - 375m resolution
- MODIS (Moderate Resolution Imaging Spectroradiometer) - 1km resolution
- Near real-time detection (updated every 3 hours)
- Global coverage with exact GPS coordinates

How FIRMS Works:
━━━━━━━━━━━━━━━━
1. SATELLITE DETECTION: NASA satellites detect thermal anomalies using infrared sensors
2. ALGORITHM PROCESSING: Advanced algorithms distinguish fires from other heat sources
3. DATA VALIDATION: Each detection includes brightness, confidence, and precise location
4. REAL-TIME DELIVERY: Data is processed and made available within 3 hours

Data source: NASA FIRMS API
- MODIS and VIIRS satellite instruments
- Near real-time fire detection (within 3 hours)
- Global coverage with high accuracy

═══════════════════════════════════════════════════════════════════════════
"""

import requests
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import math
from config import config


class FirmsService:
    """
    NASA FIRMS - Eyes in the sky watching for fires.

    Detects active wildfires using thermal anomalies from satellite sensors.

    FIRMS uses NASA's MODIS and VIIRS satellites to detect thermal anomalies
    that indicate active fires. Each detection includes:
    - Exact GPS coordinates (latitude/longitude)
    - Fire Radiative Power (FRP) - measures fire intensity
    - Brightness temperature in Kelvin
    - Detection confidence level
    - Satellite source (MODIS/VIIRS)
    """

    # NASA FIRMS API endpoint (CSV format for simplicity)
    # Official docs: https://firms.modaps.eosdis.nasa.gov/api/
    FIRMS_API = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"

    # Get FIRMS MAP KEY from environment variable
    # Get your free key at: https://firms.modaps.eosdis.nasa.gov/api/
    MAP_KEY = os.getenv("FIRMS_MAP_KEY", "DEMO_MAP_KEY")

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

        FIRMS API Format: /api/area/csv/{MAP_KEY}/{source}/{radius}/{lat},{lon}/{day_range}

        Args:
            lat: Latitude of query point
            lon: Longitude of query point
            radius_km: Search radius in kilometers (default: 100km)

        Returns:
            Dictionary containing wildfire data and statistics
        """
        try:
            # Use VIIRS_NOAA20_NRT for highest resolution (375m) fire detection
            # VIIRS NOAA-20 provides better fire detection than MODIS (1km resolution)
            source = 'VIIRS_NOAA20_NRT'  # Near Real-Time VIIRS data from NOAA-20 satellite
            day_range = 1  # Last 24 hours

            # Construct FIRMS API URL
            # Format: https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/{source}/{radius}/{lat},{lon}/{day_range}
            url = f"{FirmsService.FIRMS_API}/{FirmsService.MAP_KEY}/{source}/{radius_km}/{lat},{lon}/{day_range}"

            print(f"FIRMS API Request: {url.replace(FirmsService.MAP_KEY, '***KEY***')}")  # Log without exposing key

            # Make request with timeout
            response = requests.get(url, timeout=15)

            # Check if we have a valid API key and successful response
            if response.status_code != 200:
                print(f"FIRMS API returned status code: {response.status_code}")
                if FirmsService.MAP_KEY == "DEMO_MAP_KEY":
                    print("Using mock data - Configure FIRMS_MAP_KEY environment variable for real data")
                return FirmsService._get_mock_wildfire_data(lat, lon, radius_km)

            # Parse CSV response
            fires = FirmsService._parse_firms_csv(response.text, lat, lon, radius_km)

            # Add success note
            fires['note'] = 'Real-time FIRMS data from NASA VIIRS NOAA-20 satellite'

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
        Generate mock wildfire data for demo purposes with exact coordinates.

        This is used when:
        - FIRMS API is unavailable
        - No API key is configured
        - For testing and development

        Args:
            lat, lon: Query coordinates
            radius_km: Search radius

        Returns:
            Mock wildfire data matching FIRMS format with precise coordinates
        """
        # Simulate realistic wildfire scenarios based on location
        mock_fires = []

        # Example: California-like coordinates often have fires
        if 32 <= lat <= 42 and -124 <= lon <= -114:
            # Fire 1: Calculate exact coordinates and precise distance
            fire1_lat = lat + 0.5
            fire1_lon = lon - 0.3
            fire1_distance = FirmsService._calculate_distance(lat, lon, fire1_lat, fire1_lon)

            # Fire 2: Calculate exact coordinates and precise distance
            fire2_lat = lat - 0.7
            fire2_lon = lon + 0.4
            fire2_distance = FirmsService._calculate_distance(lat, lon, fire2_lat, fire2_lon)

            # Simulate 2 active fires with exact coordinates
            mock_fires = [
                {
                    'latitude': round(fire1_lat, 6),
                    'longitude': round(fire1_lon, 6),
                    'brightness': 365.2,
                    'confidence': 85,
                    'scan': 1.2,
                    'track': 1.1,
                    'acq_date': datetime.utcnow().strftime('%Y-%m-%d'),
                    'acq_time': '1430',
                    'satellite': 'VIIRS_SNPP',
                    'distance_km': round(fire1_distance, 2),
                    'severity': 'high'
                },
                {
                    'latitude': round(fire2_lat, 6),
                    'longitude': round(fire2_lon, 6),
                    'brightness': 342.8,
                    'confidence': 65,
                    'scan': 1.0,
                    'track': 1.0,
                    'acq_date': datetime.utcnow().strftime('%Y-%m-%d'),
                    'acq_time': '1245',
                    'satellite': 'VIIRS_SNPP',
                    'distance_km': round(fire2_distance, 2),
                    'severity': 'moderate'
                }
            ]

        # Sort by distance (closest first)
        mock_fires.sort(key=lambda x: x['distance_km'])

        return {
            'count': len(mock_fires),
            'fires': mock_fires,
            'closest_fire': mock_fires[0] if mock_fires else None,
            'search_radius_km': radius_km,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'note': 'Mock data with precise coordinates - Configure FIRMS API key for real data'
        }
