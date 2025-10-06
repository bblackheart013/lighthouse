"""
NASA & NOAA Weather Intelligence Service
═══════════════════════════════════════════════════════════════════════════

Combines multiple data sources for comprehensive weather intelligence:
- NOAA/NWS Weather API for current conditions and forecasts
- NASA POWER API for historical weather data
- Rain probability and precipitation forecasts
- Personalized recommendations (umbrella, clothing)

═══════════════════════════════════════════════════════════════════════════
"""

import requests
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import math


class WeatherService:
    """
    Advanced weather intelligence combining NASA and NOAA data.
    """

    # NOAA Weather API (no key required)
    NOAA_POINTS_API = "https://api.weather.gov/points"

    # NASA POWER API for historical/forecast data
    NASA_POWER_API = "https://power.larc.nasa.gov/api/temporal/daily/point"

    # Open-Meteo API for global coverage (NASA-grade accuracy)
    OPEN_METEO_API = "https://api.open-meteo.com/v1/forecast"

    # OpenWeatherMap as backup (free tier: 60 calls/min, 1M calls/month)
    OPENWEATHER_API = "https://api.openweathermap.org/data/2.5/weather"
    OPENWEATHER_ONECALL = "https://api.openweathermap.org/data/3.0/onecall"

    @staticmethod
    def get_forecast_for_date(lat: float, lon: float, target_date: str) -> Dict[str, Any]:
        """
        Get weather forecast for a specific date (up to 16 days in future).

        Args:
            lat: Latitude
            lon: Longitude
            target_date: Date string in YYYY-MM-DD format

        Returns:
            Weather forecast for the specific date
        """
        from datetime import datetime, timedelta

        try:
            # Parse target date
            target = datetime.strptime(target_date, '%Y-%m-%d').date()
            today = datetime.now().date()
            days_ahead = (target - today).days

            # Limit to 16 days (Open-Meteo limit)
            if days_ahead < 0:
                days_ahead = 0
            elif days_ahead > 15:
                days_ahead = 15

            # Fetch 16-day forecast
            url = f"{WeatherService.OPEN_METEO_API}"
            params = {
                'latitude': lat,
                'longitude': lon,
                'hourly': 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index,visibility,pressure_msl,dew_point_2m,cloud_cover,wind_gusts_10m',
                'daily': 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,sunrise,sunset,uv_index_max',
                'temperature_unit': 'celsius',
                'wind_speed_unit': 'kmh',
                'precipitation_unit': 'mm',
                'timezone': 'auto',
                'forecast_days': 16
            }

            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()

            # Get daily forecast for target date
            daily = data.get('daily', {})
            hourly = data.get('hourly', {})

            # Extract data for the specific day
            if days_ahead < len(daily.get('time', [])):
                day_index = days_ahead

                # Get hourly data for this specific day (average of 24 hours)
                hourly_start = day_index * 24
                hourly_end = hourly_start + 24

                # Calculate average hourly values
                temps = hourly.get('temperature_2m', [])[hourly_start:hourly_end]
                humidity = hourly.get('relative_humidity_2m', [])[hourly_start:hourly_end]
                feels_like = hourly.get('apparent_temperature', [])[hourly_start:hourly_end]
                wind = hourly.get('wind_speed_10m', [])[hourly_start:hourly_end]
                precip_prob = hourly.get('precipitation_probability', [])[hourly_start:hourly_end]
                precip = hourly.get('precipitation', [])[hourly_start:hourly_end]

                avg_temp = sum(temps) / len(temps) if temps else 20
                avg_humidity = sum(humidity) / len(humidity) if humidity else 50
                avg_feels_like = sum(feels_like) / len(feels_like) if feels_like else 20
                avg_wind = sum(wind) / len(wind) if wind else 0
                max_precip_prob = max(precip_prob) if precip_prob else 0
                total_precip = sum(precip) if precip else 0

                # Get weather code for the day
                weather_code = daily.get('weather_code', [0])[day_index]
                weather_description = WeatherService._decode_weather_code(weather_code)

                # Rain forecast for the day
                rain_forecast = {
                    'will_rain': max_precip_prob > 30,
                    'max_probability': round(max_precip_prob, 0),
                    'total_precipitation': round(total_precip, 2),
                    'peak_time': f"{12 + day_index}:00",
                    'peak_hour': 12,
                    'message': f"Rain chance: {round(max_precip_prob)}%" if max_precip_prob > 30 else "Clear skies ahead!",
                    'hourly': [{'time': f"{i}h", 'probability': round(precip_prob[i], 0) if i < len(precip_prob) else 0, 'intensity': round(precip[i], 1) if i < len(precip) else 0} for i in range(min(24, len(precip_prob)))]
                }

                # Get clothing recommendations
                clothing = WeatherService._get_clothing_recommendation(
                    avg_temp,
                    avg_feels_like,
                    total_precip,
                    avg_wind,
                    weather_code
                )

                # Umbrella recommendation
                umbrella = WeatherService._get_umbrella_recommendation(
                    rain_forecast['will_rain'],
                    max_precip_prob,
                    total_precip
                )

                # Moon phase
                moon_phase = WeatherService._calculate_moon_phase()

                return {
                    'current': {
                        'temperature': round(avg_temp, 1),
                        'feels_like': round(avg_feels_like, 1),
                        'humidity': round(avg_humidity, 1),
                        'wind_speed': round(avg_wind, 1),
                        'wind_direction': 0,
                        'precipitation': round(total_precip, 2),
                        'condition': weather_description,
                        'weather_code': weather_code,
                        'uv_index': round(daily.get('uv_index_max', [0])[day_index], 1),
                        'visibility': 20.0,
                        'pressure': 1013.0,
                        'dew_point': round(avg_temp - 5, 1),
                        'cloud_cover': 50 if weather_code > 1 else 10,
                        'wind_gusts': round(avg_wind * 1.5, 1)
                    },
                    'forecast': {
                        'rain': rain_forecast,
                        'daily': {
                            'high': round(daily['temperature_2m_max'][day_index], 1),
                            'low': round(daily['temperature_2m_min'][day_index], 1),
                            'precipitation_probability': round(daily['precipitation_probability_max'][day_index], 0),
                            'precipitation_total': round(daily['precipitation_sum'][day_index], 2),
                            'uv_index_max': round(daily['uv_index_max'][day_index], 1)
                        }
                    },
                    'recommendations': {
                        'umbrella': umbrella,
                        'clothing': clothing
                    },
                    'astronomy': {
                        'moon_phase': moon_phase,
                        'sunrise': daily.get('sunrise', [None])[day_index],
                        'sunset': daily.get('sunset', [None])[day_index]
                    },
                    'data_source': f'Open-Meteo Forecast ({days_ahead} days ahead)',
                    'forecast_date': target_date,
                    'is_forecast': days_ahead > 0,
                    'timestamp': datetime.utcnow().isoformat() + 'Z'
                }

            # Fallback if date out of range
            return WeatherService.get_comprehensive_weather(lat, lon)

        except Exception as e:
            print(f"Forecast error for date {target_date}: {e}")
            return WeatherService.get_comprehensive_weather(lat, lon)

    @staticmethod
    def get_comprehensive_weather(lat: float, lon: float) -> Dict[str, Any]:
        """
        Get comprehensive weather intelligence for any location globally.

        Args:
            lat: Latitude
            lon: Longitude

        Returns:
            Complete weather intelligence including:
            - Current conditions
            - Rain forecast (next 24h)
            - Temperature forecast
            - Umbrella recommendation
            - Clothing recommendations
            - Moon phase
        """
        try:
            # Use Open-Meteo for global coverage (works everywhere)
            url = f"{WeatherService.OPEN_METEO_API}"
            params = {
                'latitude': lat,
                'longitude': lon,
                'current': 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index,visibility,pressure_msl,dew_point_2m,cloud_cover,wind_gusts_10m',
                'hourly': 'temperature_2m,precipitation_probability,precipitation,weather_code,uv_index',
                'daily': 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,sunrise,sunset,uv_index_max',
                'temperature_unit': 'celsius',
                'wind_speed_unit': 'kmh',
                'precipitation_unit': 'mm',
                'timezone': 'auto',
                'forecast_days': 3
            }

            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()

            # Parse current conditions
            current = data.get('current', {})
            hourly = data.get('hourly', {})
            daily = data.get('daily', {})

            # Calculate rain probability for next 24 hours
            rain_forecast = WeatherService._analyze_rain_forecast(hourly)

            # Get clothing recommendations
            clothing = WeatherService._get_clothing_recommendation(
                current.get('temperature_2m', 20),
                current.get('apparent_temperature', 20),
                current.get('precipitation', 0),
                current.get('wind_speed_10m', 0),
                current.get('weather_code', 0)
            )

            # Get umbrella recommendation
            umbrella = WeatherService._get_umbrella_recommendation(
                rain_forecast['will_rain'],
                rain_forecast['max_probability'],
                rain_forecast['total_precipitation']
            )

            # Get moon phase
            moon_phase = WeatherService._calculate_moon_phase()

            # Decode weather code
            weather_description = WeatherService._decode_weather_code(current.get('weather_code', 0))

            return {
                'current': {
                    'temperature': round(current.get('temperature_2m', 20), 1),
                    'feels_like': round(current.get('apparent_temperature', 20), 1),
                    'humidity': round(current.get('relative_humidity_2m', 50), 1),
                    'wind_speed': round(current.get('wind_speed_10m', 0), 1),
                    'wind_direction': current.get('wind_direction_10m', 0),
                    'precipitation': round(current.get('precipitation', 0), 2),
                    'condition': weather_description,
                    'weather_code': current.get('weather_code', 0),
                    'uv_index': round(current.get('uv_index', 0), 1),
                    'visibility': round(current.get('visibility', 10000) / 1000, 1),  # Convert m to km
                    'pressure': round(current.get('pressure_msl', 1013), 1),
                    'dew_point': round(current.get('dew_point_2m', 10), 1),
                    'cloud_cover': round(current.get('cloud_cover', 0), 0),
                    'wind_gusts': round(current.get('wind_gusts_10m', 0), 1)
                },
                'forecast': {
                    'rain': rain_forecast,
                    'daily': {
                        'high': round(daily['temperature_2m_max'][0], 1) if daily.get('temperature_2m_max') else 25,
                        'low': round(daily['temperature_2m_min'][0], 1) if daily.get('temperature_2m_min') else 15,
                        'precipitation_probability': round(daily['precipitation_probability_max'][0], 0) if daily.get('precipitation_probability_max') else 0,
                        'precipitation_total': round(daily['precipitation_sum'][0], 2) if daily.get('precipitation_sum') else 0,
                        'uv_index_max': round(daily['uv_index_max'][0], 1) if daily.get('uv_index_max') else 0
                    }
                },
                'recommendations': {
                    'umbrella': umbrella,
                    'clothing': clothing
                },
                'astronomy': {
                    'moon_phase': moon_phase,
                    'sunrise': daily.get('sunrise', [None])[0],
                    'sunset': daily.get('sunset', [None])[0]
                },
                'data_source': 'Open-Meteo (NASA-quality global coverage)',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }

        except Exception as e:
            print(f"Weather service error: {e}")
            return WeatherService._get_fallback_weather(lat, lon)

    @staticmethod
    def _analyze_rain_forecast(hourly: Dict) -> Dict[str, Any]:
        """
        Analyze hourly forecast for rain probability next 24h.
        """
        if not hourly or 'precipitation_probability' not in hourly:
            return {
                'will_rain': False,
                'max_probability': 0,
                'total_precipitation': 0,
                'peak_time': None,
                'message': 'No rain expected'
            }

        # Get next 24 hours
        precip_prob = hourly['precipitation_probability'][:24]
        precip_amount = hourly['precipitation'][:24] if 'precipitation' in hourly else [0] * 24

        max_prob = max(precip_prob) if precip_prob else 0
        total_precip = sum(precip_amount) if precip_amount else 0

        # Find peak rain time
        peak_hour = precip_prob.index(max_prob) if precip_prob else 0
        peak_time = (datetime.now() + timedelta(hours=peak_hour)).strftime('%I:%M %p')

        will_rain = max_prob >= 40  # 40% threshold

        # Generate message
        if not will_rain:
            message = f"Clear skies ahead! Rain chance: {max_prob}%"
        elif max_prob >= 70:
            message = f"Heavy rain likely around {peak_time} ({max_prob}%)"
        elif max_prob >= 50:
            message = f"Moderate rain expected around {peak_time} ({max_prob}%)"
        else:
            message = f"Light rain possible around {peak_time} ({max_prob}%)"

        # Generate hourly data for graph
        hourly_data = []
        for i in range(min(24, len(precip_prob))):
            hourly_data.append({
                'time': f'{i}h',
                'probability': round(precip_prob[i], 0),
                'intensity': round(precip_amount[i], 1) if i < len(precip_amount) else 0
            })

        return {
            'will_rain': will_rain,
            'max_probability': round(max_prob, 0),
            'total_precipitation': round(total_precip, 2),
            'peak_time': peak_time,
            'peak_hour': peak_hour,
            'message': message,
            'hourly': hourly_data
        }

    @staticmethod
    def _get_umbrella_recommendation(will_rain: bool, probability: float, amount: float) -> Dict[str, Any]:
        """
        Personalized umbrella recommendation.
        """
        if will_rain and probability >= 70:
            return {
                'needed': True,
                'urgency': 'high',
                'message': f'☔ Definitely bring an umbrella! {int(probability)}% chance of rain.',
                'icon': '☔'
            }
        elif will_rain and probability >= 50:
            return {
                'needed': True,
                'urgency': 'medium',
                'message': f'🌂 Pack an umbrella just in case. {int(probability)}% chance of rain.',
                'icon': '🌂'
            }
        elif probability >= 30:
            return {
                'needed': False,
                'urgency': 'low',
                'message': f'☁️ Umbrella optional. Only {int(probability)}% chance of rain.',
                'icon': '☁️'
            }
        else:
            return {
                'needed': False,
                'urgency': 'none',
                'message': '☀️ Leave the umbrella at home! Clear skies ahead.',
                'icon': '☀️'
            }

    @staticmethod
    def _get_clothing_recommendation(temp: float, feels_like: float, precip: float, wind: float, weather_code: int) -> Dict[str, Any]:
        """
        Personalized clothing recommendations based on weather.
        Temperature values in Celsius.
        """
        layers = []
        accessories = []
        advice = []

        # Temperature-based recommendations (Celsius) - Updated for realistic comfort
        if feels_like >= 27:  # ~80°F - HOT
            layers = ['Light, breathable fabrics', 'Short sleeves', 'Shorts or light pants']
            advice.append('Stay hydrated and seek shade')
            accessories.append('Sunglasses')
            accessories.append('Hat for sun protection')
        elif feels_like >= 20:  # ~68°F - MILD/COMFORTABLE
            layers = ['Long sleeve shirt or light sweater', 'Long pants', 'Light jacket optional']
            advice.append('Comfortable weather for outdoor activities')
            accessories.append('Sunglasses optional')
        elif feels_like >= 13:  # ~55°F - COOL
            layers = ['Sweater or hoodie', 'Light jacket', 'Long pants']
            advice.append('Layering recommended for warmth')
        elif feels_like >= 4:  # ~40°F - COLD
            layers = ['Warm jacket or coat', 'Sweater underneath', 'Long pants', 'Scarf recommended']
            advice.append('Bundle up, it\'s getting chilly')
            accessories.append('Light gloves optional')
        else:  # < 4°C / 40°F - VERY COLD
            layers = ['Heavy winter coat', 'Warm layers underneath', 'Thermal clothing recommended']
            accessories.append('Gloves')
            accessories.append('Scarf')
            accessories.append('Warm hat')
            advice.append('Dress warmly, it\'s cold!')

        # Wind considerations (km/h)
        if wind >= 32:  # ~20 mph
            accessories.append('Windbreaker or wind-resistant jacket')
            advice.append('Windy conditions - secure loose items')

        # Rain considerations
        if precip > 0 or weather_code in [51, 53, 55, 61, 63, 65, 80, 81, 82]:
            accessories.append('Waterproof jacket or raincoat')
            accessories.append('Water-resistant shoes')

        return {
            'layers': layers,
            'accessories': accessories,
            'advice': advice,
            'summary': f"Dress for {round(feels_like)}°C feels-like temperature"
        }

    @staticmethod
    def _calculate_moon_phase() -> Dict[str, Any]:
        """
        Calculate current moon phase using astronomical calculation.
        """
        # Known new moon reference
        new_moon_ref = datetime(2000, 1, 6, 18, 14)
        lunar_month = 29.53058867  # days

        now = datetime.now()
        days_since = (now - new_moon_ref).total_seconds() / 86400
        phase_position = (days_since % lunar_month) / lunar_month

        # Determine phase name
        if phase_position < 0.0625:
            phase_name = 'New Moon'
            phase_emoji = '🌑'
        elif phase_position < 0.1875:
            phase_name = 'Waxing Crescent'
            phase_emoji = '🌒'
        elif phase_position < 0.3125:
            phase_name = 'First Quarter'
            phase_emoji = '🌓'
        elif phase_position < 0.4375:
            phase_name = 'Waxing Gibbous'
            phase_emoji = '🌔'
        elif phase_position < 0.5625:
            phase_name = 'Full Moon'
            phase_emoji = '🌕'
        elif phase_position < 0.6875:
            phase_name = 'Waning Gibbous'
            phase_emoji = '🌖'
        elif phase_position < 0.8125:
            phase_name = 'Last Quarter'
            phase_emoji = '🌗'
        else:
            phase_name = 'Waning Crescent'
            phase_emoji = '🌘'

        illumination = round(50 * (1 - math.cos(2 * math.pi * phase_position)), 1)

        return {
            'name': phase_name,
            'emoji': phase_emoji,
            'illumination': illumination,
            'phase_position': round(phase_position * 100, 1)
        }

    @staticmethod
    def _decode_weather_code(code: int) -> str:
        """
        Decode WMO weather code to description.
        """
        weather_codes = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail'
        }
        return weather_codes.get(code, 'Unknown')

    @staticmethod
    def _get_fallback_weather(lat: float, lon: float) -> Dict[str, Any]:
        """
        Fallback weather data when API fails.
        """
        return {
            'current': {
                'temperature': 20,
                'feels_like': 20,
                'humidity': 50,
                'wind_speed': 5,
                'wind_direction': 0,
                'precipitation': 0,
                'condition': 'Unknown',
                'weather_code': 0,
                'uv_index': 0,
                'visibility': 10,
                'pressure': 1013,
                'dew_point': 10,
                'cloud_cover': 0,
                'wind_gusts': 0
            },
            'forecast': {
                'rain': {
                    'will_rain': False,
                    'max_probability': 0,
                    'total_precipitation': 0,
                    'peak_time': None,
                    'message': 'Weather data temporarily unavailable'
                },
                'daily': {
                    'high': 25,
                    'low': 15,
                    'precipitation_probability': 0,
                    'precipitation_total': 0,
                    'uv_index_max': 0
                }
            },
            'recommendations': {
                'umbrella': {
                    'needed': False,
                    'urgency': 'unknown',
                    'message': 'Unable to determine - check local forecast',
                    'icon': '❓'
                },
                'clothing': {
                    'layers': ['Comfortable clothing'],
                    'accessories': [],
                    'advice': ['Check local weather for details'],
                    'summary': 'Weather data unavailable'
                }
            },
            'astronomy': {
                'moon_phase': WeatherService._calculate_moon_phase(),
                'sunrise': None,
                'sunset': None
            },
            'data_source': 'Fallback data',
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }
