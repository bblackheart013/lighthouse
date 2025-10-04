"""
Data Services - The Soul of ClearSkies
═══════════════════════════════════════════════════════════════════════════

"The intersection of science and art" - Steve Jobs

This module orchestrates intelligence from three worlds:
  🛰️  Space:  NASA TEMPO satellite constellation
  🌍 Earth:  OpenAQ ground sensors across the globe
  🌤️  Sky:    NOAA weather observations

═══════════════════════════════════════════════════════════════════════════
"""
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


class OpenAQService:
    """OpenAQ - Truth from the ground, measured where we breathe."""

    @staticmethod
    def get_measurements(lat: float, lon: float, radius_km: float = 25) -> Dict[str, Any]:
        """
        Gather ground-based measurements from nearby sensors.
        The human perspective - air quality at street level.
        """
        try:
            url = f"{config.OPENAQ_API}/latest"
            params = {
                'coordinates': f"{lat},{lon}",
                'radius': radius_km * 1000,
                'limit': 3
            }

            response = requests.get(url, params=params, timeout=10)

            if response.status_code != 200:
                return None

            data = response.json()
            results = data.get('results', [])

            if not results:
                return None

            # Aggregate measurements from all nearby stations
            aggregated = {}
            for station in results:
                for measurement in station.get('measurements', []):
                    param = measurement.get('parameter')
                    value = measurement.get('value')
                    unit = measurement.get('unit')

                    if param and value:
                        if param not in aggregated:
                            aggregated[param] = {'values': [], 'unit': unit}
                        aggregated[param]['values'].append(value)

            # Calculate averages
            averaged = {}
            for param, data in aggregated.items():
                averaged[param] = {
                    'value': round(np.mean(data['values']), 2),
                    'unit': data['unit'],
                    'source': 'OpenAQ Ground Stations'
                }

            return averaged if averaged else None

        except Exception:
            return None


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

        # Merge ground station data
        if ground:
            for pollutant, data in ground.items():
                # Normalize pollutant names
                clean_name = pollutant.upper().replace('.', '')
                forecast['pollutants'][clean_name] = {
                    'value': data['value'],
                    'unit': data['unit'],
                    'source': 'ground'
                }

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
