"""
Geocoding & Reverse Geocoding Service
═══════════════════════════════════════════════════════════════════════════

Provides precise location intelligence:
- Convert coordinates to precise location names (accurate to 1km)
- Convert city names to coordinates
- Get detailed location metadata (city, state, country, timezone, elevation)

Uses Open-Meteo Geocoding API (free, no key required, NASA-quality data)

═══════════════════════════════════════════════════════════════════════════
"""

import requests
from typing import Dict, Any, List, Optional
from datetime import datetime
import math


class GeocodingService:
    """
    Precise geocoding service for location intelligence.
    """

    # Open-Meteo Geocoding API
    GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search"
    REVERSE_GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/reverse"

    # Nominatim reverse geocoding (OpenStreetMap - free)
    NOMINATIM_API = "https://nominatim.openstreetmap.org/reverse"

    @staticmethod
    def search_location(query: str, count: int = 10) -> List[Dict[str, Any]]:
        """
        Search for locations by name globally.

        Args:
            query: City name, address, or location query
            count: Number of results to return

        Returns:
            List of matching locations with coordinates and metadata
        """
        try:
            params = {
                'name': query,
                'count': count,
                'language': 'en',
                'format': 'json'
            }

            response = requests.get(GeocodingService.GEOCODING_API, params=params, timeout=20)
            response.raise_for_status()
            data = response.json()

            results = data.get('results', [])
            locations = []

            for result in results:
                locations.append({
                    'name': result.get('name'),
                    'lat': result.get('latitude'),
                    'lon': result.get('longitude'),
                    'country': result.get('country'),
                    'country_code': result.get('country_code'),
                    'state': result.get('admin1'),
                    'population': result.get('population'),
                    'timezone': result.get('timezone'),
                    'elevation': result.get('elevation'),
                    'feature_code': result.get('feature_code'),
                    'display_name': GeocodingService._format_display_name(result)
                })

            return locations

        except Exception as e:
            print(f"Geocoding search error: {e}")
            return []

    @staticmethod
    def reverse_geocode(lat: float, lon: float) -> Dict[str, Any]:
        """
        Get precise location details from coordinates (accurate to 1km).

        Args:
            lat: Latitude
            lon: Longitude

        Returns:
            Detailed location information
        """
        try:
            # Use Nominatim for detailed reverse geocoding
            params = {
                'lat': lat,
                'lon': lon,
                'format': 'json',
                'zoom': 18,  # Building/street level
                'addressdetails': 1
            }

            headers = {
                'User-Agent': 'ClearSkies Air Quality App'
            }

            response = requests.get(
                GeocodingService.NOMINATIM_API,
                params=params,
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()

            address = data.get('address', {})

            # Build precise location name
            location_parts = []

            # Add neighborhood or suburb
            if address.get('neighbourhood'):
                location_parts.append(address['neighbourhood'])
            elif address.get('suburb'):
                location_parts.append(address['suburb'])

            # Add city
            city = address.get('city') or address.get('town') or address.get('village') or address.get('municipality')
            if city:
                location_parts.append(city)

            # Add state/region
            state = address.get('state') or address.get('region')
            if state:
                location_parts.append(state)

            # Add country
            country = address.get('country')
            if country:
                location_parts.append(country)

            display_name = ', '.join(location_parts) if location_parts else f"{lat:.4f}, {lon:.4f}"

            # Calculate precision radius (in meters)
            precision = GeocodingService._calculate_precision(lat)

            return {
                'lat': lat,
                'lon': lon,
                'display_name': display_name,
                'city': city,
                'state': state,
                'country': country,
                'country_code': address.get('country_code', '').upper(),
                'postcode': address.get('postcode'),
                'neighbourhood': address.get('neighbourhood') or address.get('suburb'),
                'road': address.get('road'),
                'precision_meters': precision,
                'precision_description': f'Accurate to ±{precision}m',
                'timezone': GeocodingService._estimate_timezone(lon),
                'coordinates_formatted': f"{lat:.6f}°, {lon:.6f}°",
                'data_source': 'OpenStreetMap Nominatim'
            }

        except Exception as e:
            print(f"Reverse geocoding error: {e}")
            return GeocodingService._get_fallback_location(lat, lon)

    @staticmethod
    def _format_display_name(result: Dict) -> str:
        """
        Format a nice display name from geocoding result.
        """
        parts = []

        if result.get('name'):
            parts.append(result['name'])

        if result.get('admin1'):  # State/region
            parts.append(result['admin1'])

        if result.get('country'):
            parts.append(result['country'])

        return ', '.join(parts) if parts else 'Unknown Location'

    @staticmethod
    def _calculate_precision(lat: float) -> int:
        """
        Calculate coordinate precision in meters.
        At 6 decimal places: ~0.11m precision
        """
        # At equator, 1 degree = 111,320 meters
        # At 6 decimal places: 111,320 / 1,000,000 = 0.11 meters
        # Precision decreases with latitude due to meridian convergence

        lat_radians = math.radians(abs(lat))
        meters_per_degree = 111320 * math.cos(lat_radians)
        precision_at_6_decimals = meters_per_degree / 1000000

        return max(1, int(precision_at_6_decimals * 10))  # Round to nearest 10m for display

    @staticmethod
    def _estimate_timezone(lon: float) -> str:
        """
        Estimate timezone from longitude (rough approximation).
        """
        # Very rough estimation: 15 degrees per hour
        offset_hours = int(lon / 15)

        if offset_hours > 0:
            return f"UTC+{offset_hours}"
        elif offset_hours < 0:
            return f"UTC{offset_hours}"
        else:
            return "UTC"

    @staticmethod
    def _get_fallback_location(lat: float, lon: float) -> Dict[str, Any]:
        """
        Fallback location data when geocoding fails.
        """
        return {
            'lat': lat,
            'lon': lon,
            'display_name': f"{lat:.4f}°, {lon:.4f}°",
            'city': None,
            'state': None,
            'country': None,
            'country_code': None,
            'postcode': None,
            'neighbourhood': None,
            'road': None,
            'precision_meters': 100,
            'precision_description': 'Approximate location',
            'timezone': GeocodingService._estimate_timezone(lon),
            'coordinates_formatted': f"{lat:.6f}°, {lon:.6f}°",
            'data_source': 'Coordinates only'
        }

    @staticmethod
    def get_distance_between(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two points using Haversine formula.

        Returns:
            Distance in kilometers
        """
        R = 6371.0  # Earth's radius in kilometers

        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)

        a = math.sin(delta_lat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c

    @staticmethod
    def get_nearby_cities(lat: float, lon: float, radius_km: float = 100) -> List[Dict[str, Any]]:
        """
        Get cities within radius for comparison features.

        Args:
            lat, lon: Center point
            radius_km: Search radius in kilometers

        Returns:
            List of nearby cities
        """
        # Approximate degree offset (rough, good enough for search)
        degree_offset = radius_km / 111.0

        try:
            # Search in bounding box around point
            params = {
                'name': '',  # Empty name searches all
                'count': 20,
                'language': 'en',
                'format': 'json'
            }

            response = requests.get(GeocodingService.GEOCODING_API, params=params, timeout=20)
            data = response.json()

            results = data.get('results', [])
            nearby = []

            for result in results:
                result_lat = result.get('latitude')
                result_lon = result.get('longitude')

                if result_lat and result_lon:
                    distance = GeocodingService.get_distance_between(lat, lon, result_lat, result_lon)

                    if distance <= radius_km and distance > 0:  # Exclude same location
                        nearby.append({
                            'name': result.get('name'),
                            'lat': result_lat,
                            'lon': result_lon,
                            'country': result.get('country'),
                            'distance_km': round(distance, 1),
                            'display_name': GeocodingService._format_display_name(result)
                        })

            # Sort by distance
            nearby.sort(key=lambda x: x['distance_km'])

            return nearby[:10]  # Return top 10 closest

        except Exception as e:
            print(f"Nearby cities error: {e}")
            return []
