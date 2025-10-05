"""
Data Services - The Soul of Lighthouse
═══════════════════════════════════════════════════════════════════════════

"The intersection of science and art" - Steve Jobs

This module orchestrates intelligence from three worlds:
  🛰️  Space:  NASA TEMPO satellite constellation
  🌍 Earth:  OpenAQ ground sensors across the globe
  🌤️  Sky:    NOAA weather observations

═══════════════════════════════════════════════════════════════════════════
"""
import os
import requests
import numpy as np
from typing import Optional, Dict, Any
from datetime import datetime
from config import config
from cache import cached, tempo_cache, forecast_cache
import tempo_util


# ═══════════════════════════════════════════════════════════════════════════
# Air Quality Index Calculator - EPA Standard
# ═══════════════════════════════════════════════════════════════════════════

class AQICalculator:
    """
    Transform raw pollutant measurements into human-readable Air Quality Index.
    Based on EPA AQI standard - the language everyone understands.
    """

    # NO2 breakpoints (ppb to AQI) - converted from molecules/cm²
    NO2_BREAKPOINTS = [
        (0, 53, 0, 50),          # Good
        (54, 100, 51, 100),      # Moderate
        (101, 360, 101, 150),    # Unhealthy for Sensitive
        (361, 649, 151, 200),    # Unhealthy
        (650, 1249, 201, 300),   # Very Unhealthy
        (1250, 2049, 301, 500),  # Hazardous
    ]

    @staticmethod
    def molecules_cm2_to_ppb(value: float) -> float:
        """
        Convert TEMPO's molecules/cm² to ppb (parts per billion).
        This is where satellite data meets human intuition.

        Args:
            value: NO2 vertical column density in molecules/cm²

        Returns:
            Approximate surface concentration in ppb
        """
        # Simplified conversion: 1e15 molecules/cm² ≈ 20 ppb (empirical)
        # Real conversion requires atmospheric modeling, but this gives useful estimates
        return (value / 1e15) * 20

    @staticmethod
    def calculate_aqi(pollutant: str, value: float, unit: str, source: str = None) -> Dict[str, Any]:
        """
        Calculate Air Quality Index from pollutant measurement.
        The magic happens here - numbers become meaning.

        Args:
            pollutant: Name of pollutant (e.g., 'NO2', 'O3')
            value: Measurement value
            unit: Unit of measurement
            source: Data source (helps identify pollutant type)

        Returns:
            Dictionary with AQI, category, and health advisory
        """
        # Handle TEMPO satellite NO2 data
        # Check if molecules/cm² unit (satellite data) or if source indicates NO2
        is_no2_data = (
            ('no2' in pollutant.lower()) or
            (source and 'no2' in source.lower()) or
            ('troposphere' in pollutant.lower() and 'molecules' in unit.lower())  # TEMPO NO2 specific
        )

        if is_no2_data and 'molecules' in unit.lower():
            ppb = AQICalculator.molecules_cm2_to_ppb(value)

            # Find appropriate AQI breakpoint
            for c_low, c_high, aqi_low, aqi_high in AQICalculator.NO2_BREAKPOINTS:
                if c_low <= ppb <= c_high:
                    # Linear interpolation within breakpoint range
                    aqi = ((aqi_high - aqi_low) / (c_high - c_low)) * (ppb - c_low) + aqi_low
                    return {
                        'aqi': int(aqi),
                        'category': AQICalculator._get_category(int(aqi)),
                        'pollutant_ppb': round(ppb, 2),
                        'advisory': AQICalculator._get_advisory(int(aqi))
                    }

            # Exceeds all breakpoints - hazardous
            return {
                'aqi': 500,
                'category': 'Hazardous',
                'pollutant_ppb': round(ppb, 2),
                'advisory': 'Health alert: everyone may experience serious health effects'
            }

        # Default fallback for other pollutants
        return {
            'aqi': None,
            'category': 'Unknown',
            'advisory': 'Insufficient data for AQI calculation'
        }

    @staticmethod
    def _get_category(aqi: int) -> str:
        """Map AQI number to category name."""
        if aqi <= 50:
            return 'Good'
        elif aqi <= 100:
            return 'Moderate'
        elif aqi <= 150:
            return 'Unhealthy for Sensitive Groups'
        elif aqi <= 200:
            return 'Unhealthy'
        elif aqi <= 300:
            return 'Very Unhealthy'
        else:
            return 'Hazardous'

    @staticmethod
    def _get_advisory(aqi: int) -> str:
        """
        Generate human-readable health advisory.
        This is where data becomes wisdom.
        """
        if aqi <= 50:
            return 'Air quality excellent — ideal conditions for outdoor activity'
        elif aqi <= 100:
            return 'Air quality acceptable — outdoor activity safe for everyone'
        elif aqi <= 150:
            return 'Air quality moderate — sensitive groups should limit prolonged outdoor exertion'
        elif aqi <= 200:
            return 'Air quality unhealthy — everyone should reduce prolonged outdoor exertion'
        elif aqi <= 300:
            return 'Air quality very unhealthy — avoid outdoor activity'
        else:
            return 'Health alert: everyone may experience serious health effects — remain indoors'


# ═══════════════════════════════════════════════════════════════════════════
# Data Services - Intelligence Gathering
# ═══════════════════════════════════════════════════════════════════════════

class TempoService:
    """NASA TEMPO - Eyes in the sky, watching our atmosphere breathe."""

    @staticmethod
    @cached(tempo_cache)
    def get_pollutant_data(lat: float, lon: float) -> Dict[str, Any]:
        """
        Retrieve satellite-observed pollutant data.
        From 22,000 miles above, TEMPO sees what ground sensors cannot.
        """
        tempo_file = tempo_util.get_most_recent_tempo_file(config.TEMPO_DATA_DIR)

        if not tempo_file:
            return None

        result = tempo_util.get_nearest_value(tempo_file, lat, lon)

        if result.get('error'):
            return None

        return {
            'pollutant': result['variable_name'],
            'value': result['value'],
            'unit': result['unit'],
            'source': 'NASA TEMPO Satellite',
            'coordinates': {
                'lat': result['nearest_lat'],
                'lon': result['nearest_lon']
            }
        }


class WAQIService:
    """
    World Air Quality Index (WAQI) - Real-time AQI used by weather apps globally.
    This is the SAME data source used by iPhone Weather, Google, and other major apps.
    """

    # WAQI API token - Real-time global AQI data (same as Apple Maps, Google Weather)
    # Get your own free token at: https://aqicn.org/data-platform/token/
    WAQI_API_TOKEN = os.getenv("WAQI_API_TOKEN", "demo")  # Replace "demo" with your token
    WAQI_API_BASE = "https://api.waqi.info"

    @staticmethod
    def get_real_time_aqi(lat: float, lon: float) -> Dict[str, Any]:
        """
        Get REAL-TIME AQI from WAQI - the exact same data weather apps use.

        Returns:
            AQI, dominant pollutant, and all pollutant concentrations
        """
        try:
            # Get AQI from nearest station
            url = f"{WAQIService.WAQI_API_BASE}/feed/geo:{lat};{lon}/"
            params = {'token': WAQIService.WAQI_API_TOKEN}

            response = requests.get(url, params=params, timeout=10)

            if response.status_code != 200:
                return None

            data = response.json()

            if data.get('status') != 'ok':
                return None

            station_data = data.get('data', {})

            # Extract AQI and pollutants
            aqi = station_data.get('aqi')
            if aqi == '-' or aqi is None:
                return None

            # Get individual pollutants
            iaqi = station_data.get('iaqi', {})
            pollutants = {}

            for pollutant, value_data in iaqi.items():
                if isinstance(value_data, dict) and 'v' in value_data:
                    pollutants[pollutant.upper()] = {
                        'aqi': value_data['v'],
                        'source': 'WAQI Ground Stations'
                    }

            # Determine dominant pollutant
            dominant_pollutant = station_data.get('dominentpol', 'pm25').upper()

            return {
                'aqi': int(aqi),
                'dominant_pollutant': dominant_pollutant,
                'pollutants': pollutants,
                'station': {
                    'name': station_data.get('city', {}).get('name', 'Unknown'),
                    'coordinates': station_data.get('city', {}).get('geo', []),
                    'url': station_data.get('city', {}).get('url', '')
                },
                'timestamp': station_data.get('time', {}).get('iso', ''),
                'source': 'World Air Quality Index (WAQI) - Used by major weather apps'
            }

        except Exception as e:
            print(f"WAQI API Error: {str(e)}")
            return None

    @staticmethod
    def _get_aqi_category(aqi: int) -> str:
        """Get AQI category from numeric value"""
        if aqi <= 50:
            return 'Good'
        elif aqi <= 100:
            return 'Moderate'
        elif aqi <= 150:
            return 'Unhealthy for Sensitive Groups'
        elif aqi <= 200:
            return 'Unhealthy'
        elif aqi <= 300:
            return 'Very Unhealthy'
        else:
            return 'Hazardous'


class OpenAQService:
    """OpenAQ - Truth from the ground, measured where we breathe."""

    @staticmethod
    def get_measurements(lat: float, lon: float, radius_km: float = 25) -> Dict[str, Any]:
        """
        Gather ground-based measurements from nearby sensors using OpenAQ v3 API.
        The human perspective - air quality at street level.

        Returns comprehensive pollutant data including:
        - PM2.5 (Particulate Matter < 2.5 microns)
        - PM10 (Particulate Matter < 10 microns)
        - NO2 (Nitrogen Dioxide)
        - CO (Carbon Monoxide)
        - SO2 (Sulfur Dioxide)
        - O3 (Ozone)
        """
        try:
            # Step 1: Get nearby locations
            locations_url = f"{config.OPENAQ_API}/locations"
            params = {
                'coordinates': f"{lat},{lon}",
                'radius': radius_km * 1000,
                'limit': 10
            }
            headers = {
                'X-API-Key': config.OPENAQ_API_KEY
            }

            locations_response = requests.get(locations_url, params=params, headers=headers, timeout=10)

            if locations_response.status_code != 200:
                return None

            locations_data = locations_response.json()
            locations = locations_data.get('results', [])

            if not locations:
                return None

            # Step 2: Collect measurements from all nearby locations
            aggregated = {}
            sensor_cache = {}  # Cache sensor metadata to reduce API calls

            for location in locations:
                location_id = location.get('id')

                # Get latest measurements for this location
                latest_url = f"{config.OPENAQ_API}/locations/{location_id}/latest"
                latest_response = requests.get(latest_url, headers=headers, timeout=10)

                if latest_response.status_code == 200:
                    latest_data = latest_response.json()
                    measurements = latest_data.get('results', [])

                    for measurement in measurements:
                        sensor_id = measurement.get('sensorsId')
                        value = measurement.get('value')

                        if sensor_id and value is not None:
                            # Get or fetch sensor metadata
                            if sensor_id not in sensor_cache:
                                sensor_url = f"{config.OPENAQ_API}/sensors/{sensor_id}"
                                sensor_response = requests.get(sensor_url, headers=headers, timeout=10)

                                if sensor_response.status_code == 200:
                                    sensor_data = sensor_response.json()
                                    sensor_results = sensor_data.get('results', [])
                                    if sensor_results:
                                        sensor_cache[sensor_id] = sensor_results[0]
                                else:
                                    continue

                            sensor_info = sensor_cache.get(sensor_id)
                            if sensor_info:
                                param_info = sensor_info.get('parameter', {})
                                param_name = param_info.get('name', '').lower()
                                param_unit = param_info.get('units', '')

                                if param_name:
                                    # Normalize parameter name
                                    param_normalized = param_name.replace('.', '').replace('_', '')

                                    if param_normalized not in aggregated:
                                        aggregated[param_normalized] = {'values': [], 'unit': param_unit, 'display_name': param_info.get('displayName', param_name.upper())}
                                    aggregated[param_normalized]['values'].append(value)

            # Step 3: Calculate averages and format output
            averaged = {}
            for param, data in aggregated.items():
                # Use display name from API
                standard_name = data['display_name']

                averaged[standard_name] = {
                    'value': round(np.mean(data['values']), 2),
                    'unit': data['unit'],
                    'source': 'OpenAQ Ground Stations',
                    'sample_count': len(data['values']),
                    'quality': OpenAQService._assess_pollutant_quality(standard_name, round(np.mean(data['values']), 2))
                }

            return averaged if averaged else None

        except Exception as e:
            # Log error for debugging but return None to maintain API consistency
            print(f"OpenAQ API Error: {str(e)}")
            return None

    @staticmethod
    def calculate_pollutant_aqi(pollutant: str, value: float) -> int:
        """
        Calculate AQI from pollutant concentration using US EPA formula.

        Args:
            pollutant: Pollutant name (PM2.5, PM10, NO2, CO, SO2, O3)
            value: Concentration value in standard units

        Returns:
            AQI value (0-500+)
        """
        # US EPA AQI breakpoints: (C_low, C_high, AQI_low, AQI_high)
        breakpoints = {
            'PM2.5': [
                (0.0, 12.0, 0, 50),
                (12.1, 35.4, 51, 100),
                (35.5, 55.4, 101, 150),
                (55.5, 150.4, 151, 200),
                (150.5, 250.4, 201, 300),
                (250.5, 500.4, 301, 500)
            ],
            'PM10': [
                (0, 54, 0, 50),
                (55, 154, 51, 100),
                (155, 254, 101, 150),
                (255, 354, 151, 200),
                (355, 424, 201, 300),
                (425, 604, 301, 500)
            ],
            'NO2': [
                (0, 53, 0, 50),
                (54, 100, 51, 100),
                (101, 360, 101, 150),
                (361, 649, 151, 200),
                (650, 1249, 201, 300),
                (1250, 2049, 301, 500)
            ],
            'O3': [
                (0, 54, 0, 50),
                (55, 70, 51, 100),
                (71, 85, 101, 150),
                (86, 105, 151, 200),
                (106, 200, 201, 300)
            ],
            'CO': [
                (0.0, 4.4, 0, 50),
                (4.5, 9.4, 51, 100),
                (9.5, 12.4, 101, 150),
                (12.5, 15.4, 151, 200),
                (15.5, 30.4, 201, 300),
                (30.5, 50.4, 301, 500)
            ],
            'SO2': [
                (0, 35, 0, 50),
                (36, 75, 51, 100),
                (76, 185, 101, 150),
                (186, 304, 151, 200),
                (305, 604, 201, 300),
                (605, 1004, 301, 500)
            ]
        }

        if pollutant not in breakpoints:
            return None

        # Find the appropriate breakpoint
        for c_low, c_high, aqi_low, aqi_high in breakpoints[pollutant]:
            if c_low <= value <= c_high:
                # Linear interpolation: AQI = ((AQI_high - AQI_low) / (C_high - C_low)) * (C - C_low) + AQI_low
                aqi = ((aqi_high - aqi_low) / (c_high - c_low)) * (value - c_low) + aqi_low
                return int(round(aqi))

        # If exceeds all breakpoints, return hazardous
        return 500

    @staticmethod
    def _assess_pollutant_quality(pollutant: str, value: float) -> str:
        """
        Assess air quality based on pollutant concentration.

        Args:
            pollutant: Pollutant name (PM2.5, PM10, NO2, CO, SO2, O3)
            value: Concentration value

        Returns:
            Quality assessment: 'good', 'moderate', 'unhealthy', 'very_unhealthy', 'hazardous'
        """
        # Calculate AQI and map to category
        aqi = OpenAQService.calculate_pollutant_aqi(pollutant, value)

        if aqi is None:
            return 'unknown'

        if aqi <= 50:
            return 'good'
        elif aqi <= 100:
            return 'moderate'
        elif aqi <= 150:
            return 'unhealthy_sensitive'
        elif aqi <= 200:
            return 'unhealthy'
        elif aqi <= 300:
            return 'very_unhealthy'
        else:
            return 'hazardous'


class NOAAWeatherService:
    """NOAA - Atmospheric context, the stage on which pollution performs."""

    @staticmethod
    def get_conditions(lat: float, lon: float) -> Dict[str, Any]:
        """
        Fetch weather conditions that shape air quality.
        Wind disperses. Rain cleanses. Heat concentrates.
        """
        try:
            # Get NOAA grid point
            points_url = f"{config.NOAA_WEATHER_API}/points/{lat},{lon}"
            points_response = requests.get(points_url, timeout=10)

            if points_response.status_code != 200:
                return None

            points_data = points_response.json()
            forecast_url = points_data['properties']['forecast']

            # Get current forecast
            forecast_response = requests.get(forecast_url, timeout=10)
            forecast_data = forecast_response.json()

            current = forecast_data['properties']['periods'][0]

            return {
                'temperature': current['temperature'],
                'temperature_unit': current['temperatureUnit'],
                'humidity': None,  # NOAA forecast doesn't provide humidity
                'wind_speed': current['windSpeed'],
                'wind_direction': current['windDirection'],
                'conditions': current['shortForecast']
            }

        except Exception:
            return None


class FIRMSService:
    """
    NASA FIRMS (Fire Information for Resource Management System) -
    Real-time wildfire detection from space.

    FIRMS provides active fire data from multiple NASA satellites (MODIS and VIIRS)
    that detect thermal anomalies indicating wildfires, with exact GPS coordinates.
    Data is updated every 3 hours with detections from the last 24 hours.

    Learn more: https://firms.modaps.eosdis.nasa.gov/
    """

    FIRMS_API_BASE = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"
    FIRMS_MAP_KEY = os.getenv("FIRMS_MAP_KEY", "")

    @staticmethod
    def get_nearby_wildfires(lat: float, lon: float, radius_km: int = 100, days: int = 1) -> Dict[str, Any]:
        """
        Get active wildfire detections near a location.

        FIRMS uses NASA's MODIS and VIIRS satellites to detect thermal anomalies
        that indicate active fires. Each detection includes:
        - Exact GPS coordinates (latitude/longitude)
        - Fire Radiative Power (FRP) - measures fire intensity
        - Brightness temperature in Kelvin
        - Detection confidence level
        - Satellite source (MODIS/VIIRS)

        Args:
            lat: Center latitude
            lon: Center longitude
            radius_km: Search radius in kilometers (max 1000km)
            days: Number of days to look back (1-10)

        Returns:
            Dictionary with wildfire detections and statistics
        """
        if not FIRMSService.FIRMS_MAP_KEY:
            print("FIRMS API Key not configured")
            return None

        try:
            # FIRMS API uses VIIRS for high-resolution (375m) fire detection
            source = "VIIRS_NOAA20_NRT"  # Near Real-Time VIIRS data

            # Build URL: https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/{source}/{radius}/{lat},{lon}/{days}
            url = f"{FIRMSService.FIRMS_API_BASE}/{FIRMSService.FIRMS_MAP_KEY}/{source}/{radius_km}/{lat},{lon}/{days}"

            response = requests.get(url, timeout=15)

            if response.status_code != 200:
                print(f"FIRMS API error: {response.status_code}")
                return None

            # Parse CSV response
            lines = response.text.strip().split('\n')

            if len(lines) < 2:  # No detections (only header)
                return {
                    'total_fires': 0,
                    'fires': [],
                    'statistics': {
                        'max_brightness': 0,
                        'max_frp': 0,
                        'avg_confidence': 0
                    },
                    'radius_km': radius_km,
                    'days_back': days,
                    'source': 'NASA FIRMS - VIIRS Satellite',
                    'info_url': 'https://firms.modaps.eosdis.nasa.gov/map/'
                }

            # Parse header
            header = lines[0].split(',')

            # Parse fire detections
            fires = []
            total_brightness = 0
            total_frp = 0
            total_confidence = 0
            max_brightness = 0
            max_frp = 0

            for line in lines[1:]:
                values = line.split(',')
                if len(values) < len(header):
                    continue

                fire_data = dict(zip(header, values))

                # Extract key fields
                fire_lat = float(fire_data.get('latitude', 0))
                fire_lon = float(fire_data.get('longitude', 0))
                brightness = float(fire_data.get('bright_ti4', 0))  # Brightness temperature (Kelvin)
                frp = float(fire_data.get('frp', 0))  # Fire Radiative Power (MW)
                confidence = fire_data.get('confidence', 'nominal')  # low/nominal/high
                acq_date = fire_data.get('acq_date', '')
                acq_time = fire_data.get('acq_time', '')

                # Calculate distance from center point
                from math import radians, cos, sin, asin, sqrt

                def haversine(lat1, lon1, lat2, lon2):
                    """Calculate distance between two points in km"""
                    R = 6371  # Earth radius in km
                    dlat = radians(lat2 - lat1)
                    dlon = radians(lon2 - lon1)
                    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
                    c = 2 * asin(sqrt(a))
                    return R * c

                distance_km = haversine(lat, lon, fire_lat, fire_lon)

                fire = {
                    'latitude': fire_lat,
                    'longitude': fire_lon,
                    'brightness_kelvin': brightness,
                    'frp_mw': frp,  # Fire Radiative Power in Megawatts
                    'confidence': confidence,
                    'distance_km': round(distance_km, 2),
                    'detected_date': acq_date,
                    'detected_time': acq_time,
                    'satellite': fire_data.get('satellite', 'VIIRS')
                }

                fires.append(fire)

                # Update statistics
                total_brightness += brightness
                total_frp += frp
                max_brightness = max(max_brightness, brightness)
                max_frp = max(max_frp, frp)

                # Convert confidence to numeric for averaging
                confidence_map = {'low': 1, 'nominal': 2, 'high': 3}
                total_confidence += confidence_map.get(confidence.lower(), 2)

            # Sort by distance (closest first)
            fires.sort(key=lambda x: x['distance_km'])

            num_fires = len(fires)

            return {
                'total_fires': num_fires,
                'fires': fires[:50],  # Limit to 50 closest fires
                'statistics': {
                    'max_brightness_kelvin': round(max_brightness, 2),
                    'max_frp_mw': round(max_frp, 2),
                    'avg_confidence': round(total_confidence / num_fires, 2) if num_fires > 0 else 0,
                    'total_frp_mw': round(total_frp, 2)  # Total fire power
                },
                'radius_km': radius_km,
                'days_back': days,
                'source': 'NASA FIRMS - VIIRS NOAA-20 Satellite',
                'info_url': 'https://firms.modaps.eosdis.nasa.gov/map/',
                'description': 'FIRMS uses NASA satellites to detect thermal anomalies indicating active fires, updated every 3 hours'
            }

        except Exception as e:
            print(f"FIRMS API Error: {str(e)}")
            return None


# ═══════════════════════════════════════════════════════════════════════════
# Unified Forecast Service - The Masterpiece
# ═══════════════════════════════════════════════════════════════════════════

class UnifiedForecastService:
    """
    The crown jewel - merging space, earth, and sky into one elegant truth.

    This is what Steve Jobs meant by "the intersection of technology and liberal arts."
    We take complex, disparate data and make it beautifully simple.
    """

    @staticmethod
    @cached(forecast_cache)
    def get_forecast(lat: float, lon: float) -> Dict[str, Any]:
        """
        Generate unified air quality forecast.

        From satellites in space to sensors on street corners to weather patterns
        in the atmosphere - we synthesize it all into one coherent story.

        Args:
            lat: Latitude
            lon: Longitude

        Returns:
            Elegant, human-readable forecast
        """
        # Gather intelligence from all sources
        satellite = TempoService.get_pollutant_data(lat, lon)
        ground = OpenAQService.get_measurements(lat, lon)
        weather = NOAAWeatherService.get_conditions(lat, lon)

        # Build the unified response - clean, minimal, meaningful
        forecast = {
            'location': {
                'lat': round(lat, 4),
                'lon': round(lon, 4)
            },
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'air_quality_index': None,
            'pollutants': {},
            'weather': {},
            'advisory': 'Insufficient data for forecast'
        }

        # Process satellite data and calculate AQI
        if satellite:
            aqi_data = AQICalculator.calculate_aqi(
                satellite['pollutant'],
                satellite['value'],
                satellite['unit'],
                source=satellite.get('source', '')
            )

            forecast['air_quality_index'] = aqi_data['aqi']
            forecast['advisory'] = aqi_data['advisory']

            # Add NO2 to pollutants
            forecast['pollutants']['NO2'] = {
                'value': satellite['value'],
                'unit': satellite['unit'],
                'ppb': aqi_data.get('pollutant_ppb'),
                'source': 'satellite'
            }

        # Merge ground station data and calculate composite AQI
        pollutant_aqis = []  # Track all pollutant AQIs to find the worst (dominant pollutant)

        if ground:
            for pollutant, data in ground.items():
                # Normalize pollutant names
                clean_name = pollutant.upper().replace('.', '')

                # Calculate AQI for this pollutant
                pollutant_aqi = OpenAQService.calculate_pollutant_aqi(clean_name, data['value'])

                forecast['pollutants'][clean_name] = {
                    'value': data['value'],
                    'unit': data['unit'],
                    'source': 'ground',
                    'aqi': pollutant_aqi
                }

                if pollutant_aqi is not None:
                    pollutant_aqis.append({
                        'pollutant': clean_name,
                        'aqi': pollutant_aqi,
                        'value': data['value']
                    })

        # Use the WORST pollutant AQI as the overall AQI (EPA standard)
        # This ensures we show the most concerning pollutant
        if pollutant_aqis:
            worst_pollutant = max(pollutant_aqis, key=lambda x: x['aqi'])

            # Only override satellite AQI if ground data shows worse conditions
            if forecast['air_quality_index'] is None or worst_pollutant['aqi'] > forecast['air_quality_index']:
                forecast['air_quality_index'] = worst_pollutant['aqi']
                forecast['dominant_pollutant'] = worst_pollutant['pollutant']

                # Update advisory based on composite AQI
                aqi_val = worst_pollutant['aqi']
                if aqi_val <= 50:
                    forecast['advisory'] = 'Air quality excellent — ideal conditions for outdoor activity'
                elif aqi_val <= 100:
                    forecast['advisory'] = f'Air quality acceptable — outdoor activity safe for everyone (driven by {worst_pollutant["pollutant"]})'
                elif aqi_val <= 150:
                    forecast['advisory'] = f'Air quality moderate — sensitive groups should limit prolonged outdoor exertion (high {worst_pollutant["pollutant"]})'
                elif aqi_val <= 200:
                    forecast['advisory'] = f'Air quality unhealthy — everyone should reduce prolonged outdoor exertion (high {worst_pollutant["pollutant"]})'
                elif aqi_val <= 300:
                    forecast['advisory'] = f'Air quality very unhealthy — avoid outdoor activity (dangerous {worst_pollutant["pollutant"]} levels)'
                else:
                    forecast['advisory'] = f'Health alert: everyone may experience serious health effects — remain indoors (hazardous {worst_pollutant["pollutant"]} levels)'

        # Add weather context
        if weather:
            forecast['weather'] = {
                'temp': weather['temperature'],
                'temp_unit': weather['temperature_unit'],
                'humidity': weather.get('humidity'),
                'wind_speed': weather['wind_speed'],
                'wind_direction': weather['wind_direction'],
                'conditions': weather['conditions']
            }

        return forecast
