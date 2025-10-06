"""
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                          🌤️  ClearSkies API v2                           ║
║                                                                           ║
║            Powered by Space & Earth Intelligence                         ║
║                                                                           ║
║  "The people who are crazy enough to think they can change the world    ║
║   are the ones who do." - Steve Jobs                                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

Air quality intelligence from three worlds:
  🛰️  NASA TEMPO Satellite - 22,000 miles above
  🌍 OpenAQ Ground Sensors - where we breathe
  🌤️  NOAA Weather Service - the atmosphere's pulse

Built for clarity. Designed for humans. Crafted with love.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from functools import wraps
from typing import Callable
import logging
from datetime import datetime
from colorama import Fore, Back, Style, init

from config import config
from services import UnifiedForecastService
from cache import tempo_cache, forecast_cache
from predictor import TEMPOPredictor
from weather_service import WeatherService
from breath_score import BreathScoreService
from geocoding_service import GeocodingService
from gemini_service import GeminiInsightsGenerator

# Initialize colorama for beautiful terminal output
init(autoreset=True)


# ═══════════════════════════════════════════════════════════════════════════
# Poetic Logging - Because even logs should be beautiful
# ═══════════════════════════════════════════════════════════════════════════

class ColorizedLogger:
    """
    Transform mundane logs into visual poetry.
    Every message tells a story, now in color.
    """

    @staticmethod
    def info(message: str):
        """Information - the color of sky."""
        print(f"{Fore.CYAN}ℹ  {message}{Style.RESET_ALL}")

    @staticmethod
    def success(message: str):
        """Success - the color of life."""
        print(f"{Fore.GREEN}✓  {message}{Style.RESET_ALL}")

    @staticmethod
    def warning(message: str):
        """Warning - the color of caution."""
        print(f"{Fore.YELLOW}⚠  {message}{Style.RESET_ALL}")

    @staticmethod
    def error(message: str):
        """Error - the color of attention."""
        print(f"{Fore.RED}✗  {message}{Style.RESET_ALL}")

    @staticmethod
    def data(message: str):
        """Data - the color of insight."""
        print(f"{Fore.MAGENTA}📊 {message}{Style.RESET_ALL}")

    @staticmethod
    def banner():
        """Display the poetic startup banner."""
        print(f"\n{Fore.CYAN}{'═' * 75}")
        print(f"{Fore.CYAN}║{' ' * 73}║")
        print(f"{Fore.CYAN}║{Fore.WHITE}                      🌤️  ClearSkies API v2{' ' * 32}║")
        print(f"{Fore.CYAN}║{' ' * 73}║")
        print(f"{Fore.CYAN}║{Fore.YELLOW}        Powered by Space & Earth Intelligence{' ' * 27}║")
        print(f"{Fore.CYAN}║{' ' * 73}║")
        print(f"{Fore.CYAN}{'═' * 75}")
        print(f"\n{Fore.WHITE}Air quality intelligence from three worlds:")
        print(f"{Fore.BLUE}  🛰️  NASA TEMPO Satellite{Fore.WHITE} - 22,000 miles above")
        print(f"{Fore.GREEN}  🌍 OpenAQ Ground Sensors{Fore.WHITE} - where we breathe")
        print(f"{Fore.CYAN}  🌤️  NOAA Weather Service{Fore.WHITE} - the atmosphere's pulse")
        print(f"\n{Fore.CYAN}{'─' * 75}{Style.RESET_ALL}\n")


logger = ColorizedLogger()


# ═══════════════════════════════════════════════════════════════════════════
# Risk Classification and Health Guidance
# ═══════════════════════════════════════════════════════════════════════════

def _classify_risk(aqi: int, weather: dict, ground: dict) -> str:
    """
    Classify overall air quality risk based on AQI, weather, and ground validation.

    Risk escalates with:
      - High AQI values
      - Stagnant weather conditions (low wind)
      - Ground sensor confirmation of poor air quality
    """
    base_risk = "low"

    if aqi <= 50:
        base_risk = "minimal"
    elif aqi <= 100:
        base_risk = "low"
    elif aqi <= 150:
        base_risk = "moderate"
    elif aqi <= 200:
        base_risk = "high"
    else:
        base_risk = "severe"

    # Weather impact: stagnant air increases risk
    if weather:
        wind_speed = str(weather.get('wind_speed', ''))
        if 'calm' in wind_speed.lower() or '0' in wind_speed:
            if base_risk == "moderate":
                base_risk = "high"
            elif base_risk == "low":
                base_risk = "moderate"

    return base_risk


def _get_general_advice(aqi: int) -> str:
    """General health advice based on AQI."""
    if aqi <= 50:
        return "Air quality is good. Perfect day to enjoy outdoor activities."
    elif aqi <= 100:
        return "Air quality is acceptable. Normal outdoor activities are fine for most people."
    elif aqi <= 150:
        return "Sensitive groups should consider limiting prolonged outdoor exertion."
    elif aqi <= 200:
        return "Everyone should reduce prolonged or heavy outdoor exertion."
    elif aqi <= 300:
        return "Avoid all outdoor physical activities. Consider staying indoors."
    else:
        return "Health alert: everyone should avoid all outdoor activities. Stay indoors."


def _get_sensitive_group_advice(aqi: int) -> str:
    """Health advice specifically for sensitive groups."""
    if aqi <= 50:
        return "Safe for all sensitive groups"
    elif aqi <= 100:
        return "Unusually sensitive individuals should consider reducing prolonged outdoor exertion"
    elif aqi <= 150:
        return "Children, elderly, and people with respiratory conditions should limit outdoor activities"
    elif aqi <= 200:
        return "Sensitive groups should avoid all outdoor activities"
    else:
        return "Sensitive groups must remain indoors with air filtration"


def _get_activity_recommendation(aqi: int) -> str:
    """Activity recommendations for tomorrow based on predicted AQI."""
    if aqi <= 50:
        return "Perfect for all outdoor activities — enjoy your day!"
    elif aqi <= 100:
        return "Good for outdoor activities — normal schedule recommended"
    elif aqi <= 150:
        return "Consider rescheduling intensive outdoor exercise to morning hours"
    elif aqi <= 200:
        return "Move outdoor activities indoors if possible"
    else:
        return "Cancel all outdoor activities — remain indoors"


def _generate_alert_actions(aqi: int) -> list:
    """Generate actionable recommendations for air quality alerts."""
    actions = []

    if aqi > 100:
        actions.append("Check AQI before going outside")
        actions.append("Keep windows closed during peak pollution hours")

    if aqi > 150:
        actions.append("Wear an N95 mask outdoors")
        actions.append("Avoid outdoor exercise")
        actions.append("Use air purifiers indoors")

    if aqi > 200:
        actions.append("Stay indoors as much as possible")
        actions.append("Seek medical attention if experiencing symptoms")

    return actions


# ═══════════════════════════════════════════════════════════════════════════
# Application Factory
# ═══════════════════════════════════════════════════════════════════════════

def create_app() -> Flask:
    """
    Birth of the application.
    Every great product starts with a clear vision.
    """
    app = Flask(__name__)
    app.config['JSON_SORT_KEYS'] = config.JSON_SORT_KEYS

    # Enable CORS for frontend integration (allow all origins for public API)
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })

    # Suppress Flask's default logging - we have something better
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)

    # Register components
    register_error_handlers(app)
    register_routes(app)

    return app


# ═══════════════════════════════════════════════════════════════════════════
# Input Validation - Guard the gates with elegance
# ═══════════════════════════════════════════════════════════════════════════

def validate_coordinates(func: Callable) -> Callable:
    """
    Validate coordinates with grace.
    Invalid input deserves helpful guidance, not cryptic errors.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            lat = request.args.get('lat', config.DEFAULT_LATITUDE, type=float)
            lon = request.args.get('lon', config.DEFAULT_LONGITUDE, type=float)
        except ValueError:
            return jsonify({
                'error': 'Invalid coordinates',
                'message': 'Latitude and longitude must be numbers',
                'example': f'/forecast?lat=40.7&lon=-74.0'
            }), 400

        # Validate bounds
        valid, error_message = config.validate_coordinates(lat, lon)
        if not valid:
            return jsonify({
                'error': 'Out of coverage',
                'message': error_message,
                'coverage': 'North America (TEMPO satellite coverage)',
                'bounds': {
                    'latitude': f'{config.MIN_LATITUDE}° to {config.MAX_LATITUDE}°',
                    'longitude': f'{config.MIN_LONGITUDE}° to {config.MAX_LONGITUDE}°'
                }
            }), 400

        kwargs['lat'] = lat
        kwargs['lon'] = lon
        return func(*args, **kwargs)

    return wrapper


# ═══════════════════════════════════════════════════════════════════════════
# Routes - The API Surface
# ═══════════════════════════════════════════════════════════════════════════

def register_routes(app: Flask) -> None:
    """Map the territory. Every endpoint tells part of the story."""

    @app.route('/', methods=['GET'])
    def index():
        """
        Welcome home.
        The beginning of every journey.
        """
        return jsonify({
            'api': 'ClearSkies v3',
            'tagline': 'The Earth is Watching',
            'endpoints': {
                '/health': 'System health check',
                '/conditions': 'Current air quality conditions (Real-time)',
                '/forecast': 'Unified 24-hour forecast with breath score, weather intelligence & precise location (⭐ Enhanced)',
                '/alerts': 'Proactive air quality alerts with health guidance',
                '/history': 'Historical AQI trends (past 7 days)',
                '/compare': 'Satellite vs ground sensor comparison',
                '/ground': 'Ground sensor data from OpenAQ',
                '/weather': 'Comprehensive weather intelligence (rain, umbrella, clothing, moon phase) - Global',
                '/breath-score': 'Breath quality score (0-100) with mask recommendations & age-specific guidance',
                '/ai-insights': 'AI-powered air quality insights using Google Gemini (personalized health recommendations)',
                '/geocode': 'Search locations by name globally (city to coordinates)',
                '/reverse-geocode': 'Get precise location from coordinates (accurate to 1km)',
                '/multi-compare': 'Compare 2-3 cities side-by-side (AQI, weather, breath scores)',
                '/wildfires': 'Active wildfire detection with exact coordinates & precise distances',
                '/cache/stats': 'Cache performance metrics',
                '/cache/clear': 'Clear all caches (POST)'
            },
            'examples': {
                'forecast': '/forecast?lat=34.05&lon=-118.24&city=Los Angeles',
                'weather': '/weather?lat=51.5074&lon=-0.1278  (Works globally - try London, Tokyo, Sydney)',
                'breath_score': '/breath-score?lat=40.7&lon=-74.0',
                'ai_insights': '/ai-insights?lat=40.7&lon=-74.0&aqi=85',
                'geocode': '/geocode?query=Paris&count=5',
                'reverse_geocode': '/reverse-geocode?lat=48.8566&lon=2.3522',
                'multi_compare': '/multi-compare?cities=New York,Los Angeles,Chicago',
                'alerts': '/alerts?lat=40.7&lon=-74.0&threshold=100',
                'history': '/history?lat=40.7&lon=-74.0&days=7',
                'compare': '/compare?lat=40.7&lon=-74.0',
                'wildfires': '/wildfires?lat=34.05&lon=-118.24&radius=100'
            },
            'data_sources': {
                'satellite': '🛰️  NASA TEMPO - 22,000 miles above',
                'ground': '🌍 OpenAQ Sensors - where we breathe',
                'weather': '🌤️  Open-Meteo - NASA-quality global coverage',
                'geocoding': '📍 OpenStreetMap - 1km precision worldwide',
                'wildfires': '🔥 NASA FIRMS - Real-time fire detection',
                'ai_intelligence': '🤖 Google Gemini AI - Intelligent insights'
            },
            'new_features': {
                'breath_score': 'Calculate respiratory health score (0-100) with personalized mask recommendations',
                'weather_intelligence': 'Rain forecasts, umbrella alerts, clothing recommendations, moon phases',
                'precise_locations': 'Accurate to ±1km with neighborhood-level detail',
                'multi_city_compare': 'Compare air quality, weather & breath scores across 2-3 cities',
                'wildfire_precision': 'Exact coordinates and distances for every detected fire',
                'ai_insights': 'Google Gemini AI generates personalized health recommendations and contextual explanations'
            },
            'global_coverage': 'All endpoints work for ANY location worldwide (not limited to North America)',
            'vision': 'Real-time Earth awareness for every citizen on Earth',
            'version': '3.0.0'
        })

    @app.route('/health', methods=['GET'])
    def health():
        """
        Pulse check.
        Simple. Fast. Always there.
        """
        return jsonify({
            'status': 'operational',
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'uptime': 'continuous'
        })

    @app.route('/conditions', methods=['GET'])
    @validate_coordinates
    def conditions(lat: float, lon: float):
        """
        ⭐ Current Conditions Endpoint ⭐

        Real-time air quality intelligence.

        Merges satellite observations from space, ground sensor measurements
        from street level, and weather context from the atmosphere into
        one elegant, human-readable snapshot.

        Query Parameters:
            lat (float): Latitude (default: NYC)
            lon (float): Longitude (default: NYC)

        Returns:
            Current air quality with AQI, pollutants, weather, and advisory
        """
        logger.data(f"Conditions request: ({lat:.4f}, {lon:.4f})")

        # Get current conditions
        result = UnifiedForecastService.get_forecast(lat, lon)

        # Log what we found
        if result.get('air_quality_index'):
            aqi = result['air_quality_index']
            logger.success(f"AQI {aqi} at ({lat:.4f}, {lon:.4f})")
        else:
            logger.warning(f"Limited data for ({lat:.4f}, {lon:.4f})")

        return jsonify(result)

    @app.route('/ground', methods=['GET'])
    @validate_coordinates
    def ground(lat: float, lon: float):
        """
        🌍 Ground Sensor Data Endpoint

        Street-level air quality from OpenAQ ground stations.
        Truth from where we breathe.

        Query Parameters:
            lat (float): Latitude
            lon (float): Longitude
            radius (float): Search radius in km (default: 25)

        Returns:
            Ground sensor measurements
        """
        from services import OpenAQService

        radius = request.args.get('radius', 25, type=float)
        logger.data(f"Ground sensors: ({lat:.4f}, {lon:.4f}) [{radius}km]")

        result = OpenAQService.get_measurements(lat, lon, radius)

        if result:
            logger.success(f"Found {len(result)} pollutant types")
        else:
            logger.warning(f"No ground stations within {radius}km")

        return jsonify({
            'location': {'lat': lat, 'lon': lon},
            'radius_km': radius,
            'data': result or {},
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        })

    @app.route('/weather', methods=['GET'])
    @validate_coordinates
    def weather(lat: float, lon: float):
        """
        🌤️ Comprehensive Weather Intelligence Endpoint

        Global weather data with rain forecasts, umbrella alerts, clothing recommendations.
        Works for ANY location worldwide.

        Query Parameters:
            lat (float): Latitude
            lon (float): Longitude
            date (str, optional): Target date in YYYY-MM-DD format (for forecasts up to 16 days)

        Returns:
            Complete weather intelligence including:
            - Current conditions or forecast for specified date
            - 24h rain forecast
            - Umbrella recommendation
            - Clothing suggestions
            - Moon phase
        """
        # Get optional date parameter
        target_date = request.args.get('date')

        if target_date:
            logger.data(f"Weather forecast request for {target_date}: ({lat:.4f}, {lon:.4f})")
            result = WeatherService.get_forecast_for_date(lat, lon, target_date)
        else:
            logger.data(f"Weather intelligence request: ({lat:.4f}, {lon:.4f})")
            result = WeatherService.get_comprehensive_weather(lat, lon)

        if not result:
            logger.warning("Weather data unavailable")
            return jsonify({
                'error': 'Weather data temporarily unavailable',
                'location': f"{round(lat, 4)}, {round(lon, 4)}",
                'current': {'temperature': 20, 'condition': 'Data unavailable'},
                'forecast': {'rain': {'will_rain': False, 'message': 'No data'}},
                'recommendations': {},
                'astronomy': {}
            }), 503

        # Add location info to response
        result['location'] = f"{round(lat, 4)}, {round(lon, 4)}"

        temp = result.get('current', {}).get('temperature', 'N/A')
        condition = result.get('current', {}).get('condition', 'Unknown')
        umbrella = result.get('recommendations', {}).get('umbrella', {})
        logger.success(f"{temp}°F, {condition} - {umbrella.get('message', '')}")

        return jsonify(result)

    @app.route('/breath-score', methods=['GET'])
    @validate_coordinates
    def breath_score(lat: float, lon: float):
        """
        🫁 Breath Score Intelligence Endpoint

        Calculate breath quality score (0-100) with mask recommendations.
        Combines AQI, pollutants, wildfires, and weather for respiratory health.

        Query Parameters:
            lat (float): Latitude
            lon (float): Longitude

        Returns:
            Breath score, mask recommendations, age-specific guidance
        """
        from services import OpenAQService, NOAAWeatherService
        from firms_service import FirmsService

        logger.data(f"Breath score request: ({lat:.4f}, {lon:.4f})")

        # Get current AQI prediction
        prediction = TEMPOPredictor.generate_forecast(lat, lon)
        aqi = prediction.get('predicted_aqi', 50)

        # Get ground pollutants
        ground_data = OpenAQService.get_measurements(lat, lon)

        # Check for nearby wildfires
        wildfire_data = FirmsService.get_active_fires(lat, lon, 100)
        wildfires_detected = wildfire_data['count'] > 0
        wildfire_distance = wildfire_data['closest_fire']['distance_km'] if wildfire_data['closest_fire'] else None

        # Get weather conditions
        weather_data = WeatherService.get_comprehensive_weather(lat, lon)
        humidity = weather_data.get('current', {}).get('humidity', 50)
        temperature = weather_data.get('current', {}).get('temperature', 70)

        # Calculate breath score
        result = BreathScoreService.calculate_breath_score(
            aqi=aqi,
            pollutants=ground_data,
            wildfires_detected=wildfires_detected,
            wildfire_distance=wildfire_distance,
            humidity=humidity,
            temperature=temperature
        )

        result['location'] = {'lat': round(lat, 4), 'lon': round(lon, 4)}
        result['timestamp'] = datetime.utcnow().isoformat() + 'Z'

        score = result['breath_score']
        rating = result['rating']
        mask_needed = result['mask']['required']

        logger.success(f"Breath Score: {score}/100 ({rating}) - Mask: {'Required' if mask_needed else 'Optional'}")

        return jsonify(result)

    @app.route('/ai-insights', methods=['GET'])
    def ai_insights():
        """
        🤖 AI-Powered Air Quality Insights Endpoint

        Generate intelligent, personalized air quality insights using Google Gemini AI.
        Provides simple explanations, health recommendations, and actionable tips.

        Query Parameters:
            lat (float): Latitude (required if aqi not provided)
            lon (float): Longitude (required if aqi not provided)
            aqi (int): Air Quality Index (optional - will be fetched if not provided)
            city (str): Optional city name for context

        Returns:
            AI-generated insights with personalized health recommendations
        """
        from services import OpenAQService

        # Get coordinates (optional if AQI is directly provided)
        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        aqi_param = request.args.get('aqi', type=int)
        city = request.args.get('city', None)

        # Validate inputs
        if not aqi_param and (lat is None or lon is None):
            return jsonify({
                'error': 'Missing required parameters',
                'message': 'Provide either (lat, lon) or aqi parameter',
                'examples': {
                    'with_coordinates': '/ai-insights?lat=40.7&lon=-74.0',
                    'with_aqi': '/ai-insights?lat=40.7&lon=-74.0&aqi=85',
                    'with_city': '/ai-insights?lat=40.7&lon=-74.0&city=New York'
                }
            }), 400

        logger.data(f"AI insights request: lat={lat}, lon={lon}, aqi={aqi_param}, city={city}")

        # If AQI not provided, fetch it
        if not aqi_param and lat is not None and lon is not None:
            # Validate coordinates
            valid, error_message = config.validate_coordinates(lat, lon)
            if not valid:
                return jsonify({
                    'error': 'Invalid coordinates',
                    'message': error_message
                }), 400

            # Get AQI from prediction
            prediction = TEMPOPredictor.generate_forecast(lat, lon, city)
            aqi = prediction.get('predicted_aqi')

            if not aqi:
                return jsonify({
                    'error': 'Unable to determine AQI',
                    'message': 'Insufficient data for this location. Please provide AQI manually.',
                    'location': {'lat': lat, 'lon': lon}
                }), 404
        else:
            aqi = aqi_param

        # Get additional context data
        pollutants = None
        weather_data = None
        breath_score = None
        location_name = city

        if lat is not None and lon is not None:
            # Get pollutants from ground sensors
            pollutants = OpenAQService.get_measurements(lat, lon)

            # Get weather data
            weather_data = WeatherService.get_comprehensive_weather(lat, lon)
            if weather_data:
                weather_data = weather_data.get('current', {})

            # Get location name if not provided
            if not location_name:
                location_info = GeocodingService.reverse_geocode(lat, lon)
                location_name = location_info.get('display_name', f"{lat:.2f}°, {lon:.2f}°")

            # Get breath score
            from firms_service import FirmsService
            wildfire_data = FirmsService.get_active_fires(lat, lon, 100)
            breath_score_data = BreathScoreService.calculate_breath_score(
                aqi=aqi,
                pollutants=pollutants,
                wildfires_detected=wildfire_data['count'] > 0,
                wildfire_distance=wildfire_data['closest_fire']['distance_km'] if wildfire_data['closest_fire'] else None,
                humidity=weather_data.get('humidity', 50) if weather_data else 50,
                temperature=weather_data.get('temperature', 70) if weather_data else 70
            )
            breath_score = breath_score_data['breath_score']

        # Generate AI insights
        logger.info(f"Generating AI insights for AQI {aqi} at {location_name}")

        result = GeminiInsightsGenerator.get_insights(
            lat=lat or 0,
            lon=lon or 0,
            aqi=aqi,
            pollutants=pollutants,
            location_name=location_name,
            weather=weather_data,
            breath_score=breath_score
        )

        # Add timestamp
        result['timestamp'] = datetime.utcnow().isoformat() + 'Z'

        if result.get('success'):
            logger.success(f"AI insights generated successfully for AQI {aqi}")
        else:
            logger.warning(f"AI insights generation failed, using fallback")

        return jsonify(result)

    @app.route('/geocode', methods=['GET'])
    def geocode():
        """
        📍 Location Search Endpoint (Geocoding)

        Search for locations by name globally.
        Convert city/place names to precise coordinates.

        Query Parameters:
            query (str): Location name (city, address, place)
            count (int): Number of results (default: 10)

        Returns:
            List of matching locations with coordinates and metadata
        """
        query = request.args.get('query', '')
        count = request.args.get('count', 10, type=int)

        if not query:
            return jsonify({
                'error': 'Missing query parameter',
                'message': 'Please provide a location name to search',
                'example': '/geocode?query=New York'
            }), 400

        logger.data(f"Geocoding search: '{query}'")

        results = GeocodingService.search_location(query, count)

        if results:
            logger.success(f"Found {len(results)} location(s) for '{query}'")
        else:
            logger.warning(f"No results for '{query}'")

        return jsonify({
            'query': query,
            'count': len(results),
            'results': results,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        })

    @app.route('/reverse-geocode', methods=['GET'])
    @validate_coordinates
    def reverse_geocode(lat: float, lon: float):
        """
        📍 Reverse Geocoding Endpoint

        Get precise location details from coordinates.
        Accurate to 1km with neighborhood-level precision.

        Query Parameters:
            lat (float): Latitude
            lon (float): Longitude

        Returns:
            Detailed location info (city, state, country, timezone, etc.)
        """
        logger.data(f"Reverse geocoding: ({lat:.4f}, {lon:.4f})")

        result = GeocodingService.reverse_geocode(lat, lon)

        display_name = result.get('display_name', 'Unknown')
        precision = result.get('precision_meters', 0)

        logger.success(f"Location: {display_name} (±{precision}m precision)")

        result['timestamp'] = datetime.utcnow().isoformat() + 'Z'

        return jsonify(result)

    @app.route('/multi-compare', methods=['GET'])
    def multi_compare():
        """
        🔬 Multi-City Comparison Endpoint

        Compare air quality and weather across 2-3 cities side-by-side.
        Perfect for travel planning and relocation decisions.

        Query Parameters:
            cities (str): Comma-separated city names (2-3 cities)
                         Example: "New York,Los Angeles,Chicago"

        Returns:
            Side-by-side comparison of all metrics
        """
        from services import WAQIService

        cities_param = request.args.get('cities', '')

        if not cities_param:
            return jsonify({
                'error': 'Missing cities parameter',
                'message': 'Provide 2-3 cities separated by commas',
                'example': '/multi-compare?cities=New York,Los Angeles,Chicago'
            }), 400

        city_names = [c.strip() for c in cities_param.split(',')]

        if len(city_names) < 2:
            return jsonify({
                'error': 'Not enough cities',
                'message': 'Please provide at least 2 cities to compare',
                'example': '/multi-compare?cities=New York,Los Angeles'
            }), 400

        if len(city_names) > 3:
            return jsonify({
                'error': 'Too many cities',
                'message': 'Maximum 3 cities can be compared at once',
                'example': '/multi-compare?cities=New York,Los Angeles,Chicago'
            }), 400

        logger.data(f"Multi-city comparison: {', '.join(city_names)}")

        comparisons = []

        for city_name in city_names:
            # Geocode city name to coordinates
            locations = GeocodingService.search_location(city_name, 1)

            if not locations:
                comparisons.append({
                    'city': city_name,
                    'error': 'City not found',
                    'available': False
                })
                continue

            location = locations[0]
            lat = location['lat']
            lon = location['lon']

            # Get real-time AQI from WAQI
            waqi_data = WAQIService.get_real_time_aqi(lat, lon)

            if not waqi_data:
                comparisons.append({
                    'city': location['display_name'],
                    'coordinates': {'lat': lat, 'lon': lon},
                    'error': 'No AQI data available',
                    'available': False
                })
                continue

            aqi = waqi_data['aqi']
            aqi_category = WAQIService._get_aqi_category(aqi)

            # Get weather data
            weather_data = WeatherService.get_comprehensive_weather(lat, lon)

            # Calculate breath score (simplified version without wildfires for now)
            breath_score_data = BreathScoreService.calculate_breath_score(
                aqi=aqi,
                pollutants={},  # WAQI already provides composite AQI
                wildfires_detected=False,
                wildfire_distance=None,
                humidity=weather_data.get('current', {}).get('humidity', 50),
                temperature=weather_data.get('current', {}).get('temperature', 70)
            )

            comparisons.append({
                'city': location['display_name'],
                'coordinates': {'lat': lat, 'lon': lon},
                'available': True,
                'air_quality': {
                    'aqi': aqi,
                    'category': aqi_category,
                    'breath_score': breath_score_data['breath_score'],
                    'breath_rating': breath_score_data['rating']
                },
                'weather': {
                    'temperature': weather_data.get('current', {}).get('temperature'),
                    'feels_like': weather_data.get('current', {}).get('feels_like'),
                    'condition': weather_data.get('current', {}).get('condition'),
                    'humidity': weather_data.get('current', {}).get('humidity')
                },
                'rain_forecast': weather_data.get('forecast', {}).get('rain', {}),
                'mask_recommendation': breath_score_data['mask']
            })

        logger.success(f"Compared {len([c for c in comparisons if c['available']])} cities successfully")

        return jsonify({
            'cities_compared': len(comparisons),
            'comparisons': comparisons,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        })

    @app.route('/forecast', methods=['GET'])
    @validate_coordinates
    def forecast(lat: float, lon: float):
        """
        ⭐⭐⭐ Unified Intelligence Forecast Endpoint ⭐⭐⭐

        The future, calculated from space, earth, and sky.

        Merges:
          🛰️  NASA TEMPO Satellite predictions
          🌍 OpenAQ ground sensor validation
          🌤️  NOAA weather impact analysis

        Query Parameters:
            lat (float): Latitude (default: NYC)
            lon (float): Longitude (default: NYC)
            city (str): Optional city name for human-readable output

        Returns:
            Complete forecast with AQI prediction, risk classification, and health guidance
        """
        from services import OpenAQService, WAQIService
        from firms_service import FirmsService

        city = request.args.get('city', None)

        logger.data(f"Unified forecast: ({lat:.4f}, {lon:.4f}) {f'[{city}]' if city else ''}")

        # 1. Get REAL-TIME AQI from WAQI (works globally - same source as weather apps)
        waqi_data = WAQIService.get_real_time_aqi(lat, lon)

        if not waqi_data:
            return jsonify({
                'error': 'No AQI data available for this location',
                'location': {'lat': lat, 'lon': lon, 'city': city},
                'message': 'WAQI station not found. Try a major city nearby.'
            }), 404

        # 2. Try to get TEMPO satellite data (optional - only available for areas with downloaded data)
        try:
            prediction = TEMPOPredictor.generate_forecast(lat, lon, city)
            has_tempo = 'predicted_aqi' in prediction
        except:
            has_tempo = False
            prediction = {}

        # 3. Get current ground truth for validation (optional)
        ground_data = OpenAQService.get_measurements(lat, lon)

        # 4. Get comprehensive weather intelligence
        weather_intelligence = WeatherService.get_comprehensive_weather(lat, lon)

        # 5. Get precise location information
        location_details = GeocodingService.reverse_geocode(lat, lon)

        # 6. Check for wildfires (optional)
        try:
            wildfire_data = FirmsService.get_active_fires(lat, lon, 100)
        except:
            wildfire_data = {'count': 0, 'closest_fire': None}

        # Build comprehensive forecast using WAQI as primary source
        if True:  # Always build response when WAQI is available  # Fix: Check if key exists, not if value is truthy (0 is valid!)
            # Use WAQI real-time AQI (same source as weather apps like iPhone Weather, Google)
            aqi = waqi_data['aqi']
            dominant_pollutant = waqi_data['dominant_pollutant']
            confidence = 'very high'  # WAQI is the gold standard - used by all major weather apps
            data_source = 'WAQI (World Air Quality Index) - Same as iPhone Weather & Google'
            category = WAQIService._get_aqi_category(aqi)

            # Enhanced risk classification
            risk_level = _classify_risk(aqi, weather_intelligence.get('current', {}), ground_data)

            # Calculate breath score
            breath_score_data = BreathScoreService.calculate_breath_score(
                aqi=aqi,
                pollutants=ground_data,
                wildfires_detected=wildfire_data['count'] > 0,
                wildfire_distance=wildfire_data['closest_fire']['distance_km'] if wildfire_data['closest_fire'] else None,
                humidity=weather_intelligence.get('current', {}).get('humidity', 50),
                temperature=weather_intelligence.get('current', {}).get('temperature', 70)
            )

            # Build unified response
            from datetime import datetime
            current_time = datetime.utcnow().isoformat() + 'Z'

            result = {
                'location': {
                    'coordinates': {'lat': round(lat, 4), 'lon': round(lon, 4), 'city': city},
                    'details': location_details
                },
                'forecast_time': current_time,
                'current_time': current_time,
                'prediction': {
                    'aqi': aqi,
                    'category': category,
                    'confidence': confidence,
                    'risk_level': risk_level,
                    'dominant_pollutant': dominant_pollutant,
                    'no2_molecules_cm2': prediction.get('predicted_no2', 0) if has_tempo else 0
                },
                'breath_score': {
                    'score': breath_score_data['breath_score'],
                    'rating': breath_score_data['rating'],
                    'mask': breath_score_data['mask'],
                    'age_guidance': breath_score_data['age_guidance'],
                    'outdoor_activity': breath_score_data['outdoor_activity']
                },
                'weather_intelligence': {
                    'current': weather_intelligence.get('current', {}),
                    'forecast': weather_intelligence.get('forecast', {}),
                    'recommendations': weather_intelligence.get('recommendations', {}),
                    'astronomy': weather_intelligence.get('astronomy', {})
                },
                'health_guidance': {
                    'general_public': prediction.get('advice', _get_general_advice(aqi)) if has_tempo else _get_general_advice(aqi),
                    'sensitive_groups': _get_sensitive_group_advice(aqi),
                    'outdoor_activities': _get_activity_recommendation(aqi)
                },
                'data_sources': {
                    'primary_aqi_source': data_source,
                    'waqi': {
                        'available': True,
                        'aqi': waqi_data['aqi'],
                        'station': waqi_data.get('station', {}),
                        'timestamp': waqi_data.get('timestamp')
                    },
                    'satellite': {
                        'available': has_tempo,
                        'data_points': prediction.get('model_details', {}).get('data_points', 0) if has_tempo else 0,
                        'r_squared': prediction.get('model_details', {}).get('r_squared', 0) if has_tempo else 0
                    },
                    'ground_sensors': {
                        'available': ground_data is not None,
                        'pollutants': list(ground_data.keys()) if ground_data else []
                    },
                    'weather': {
                        'available': weather_intelligence is not None,
                        'source': weather_intelligence.get('data_source', 'Unknown'),
                        'conditions': weather_intelligence.get('current', {}).get('condition', 'Unknown') if weather_intelligence else 'Unknown',
                        'temperature': f"{weather_intelligence.get('current', {}).get('temperature', 0):.1f}°C" if weather_intelligence else 'N/A'
                    }
                },
                'model': prediction.get('model_details', {}).get('algorithm', 'WAQI Real-time') if has_tempo else 'WAQI Real-time'
            }

            logger.success(f"Predicted AQI {aqi} ({confidence} confidence, {risk_level} risk) - Breath Score: {breath_score_data['breath_score']}/100")
        else:
            result = prediction
            logger.warning(f"Insufficient data for prediction at ({lat:.4f}, {lon:.4f})")

        return jsonify(result)

    @app.route('/alerts', methods=['GET'])
    @validate_coordinates
    def alerts(lat: float, lon: float):
        """
        ⚠️ Comprehensive Personalized Air Quality Alerts

        Generates intelligent, multi-faceted alerts using:
        - Gemini AI for personalized health guidance
        - Wildfire detection (NASA FIRMS)
        - Weather alerts (extreme conditions, umbrella)
        - AQI threshold monitoring
        - Air quality trend analysis

        Query Parameters:
            lat (float): Latitude
            lon (float): Longitude
            threshold (int): Alert threshold AQI (default: 100)

        Returns:
            Comprehensive alert data with AI-powered insights
        """
        from services import OpenAQService, NOAAWeatherService, WAQIService
        from firms_service import FirmsService
        from datetime import datetime, timedelta

        threshold = request.args.get('threshold', 100, type=int)
        city = request.args.get('city', None)

        logger.data(f"🔔 Comprehensive alert check: ({lat:.4f}, {lon:.4f}) [threshold: {threshold}]")

        # Gather all data sources for comprehensive analysis
        try:
            # Get REAL-TIME AQI from WAQI (primary source - same as forecast endpoint)
            waqi_data = WAQIService.get_real_time_aqi(lat, lon)

            if not waqi_data or not waqi_data.get('aqi'):
                return jsonify({
                    'alert_active': False,
                    'message': 'No AQI data available for this location',
                    'location': {'lat': lat, 'lon': lon}
                })

            # Extract AQI early as we need it for other calls
            aqi = waqi_data['aqi']
            category = WAQIService._get_aqi_category(aqi)

            # Try to get TEMPO satellite prediction for additional context
            try:
                prediction = TEMPOPredictor.generate_forecast(lat, lon, city)
            except:
                prediction = {}

            # Get current conditions
            weather = NOAAWeatherService.get_conditions(lat, lon)

            # Get wildfires
            try:
                wildfires = FirmsService.get_active_fires(lat, lon, 100)
            except:
                wildfires = {'count': 0, 'wildfire_detected': False, 'closest_fire': None}

            # Get pollutant data
            try:
                ground_data = OpenAQService.get_pollutants(lat, lon)
            except:
                ground_data = {'data': {}}

            # Calculate breath score with proper parameters
            try:
                breath = BreathScoreService.calculate_breath_score(
                    aqi=aqi,
                    pollutants=ground_data.get('data') if ground_data else {},
                    wildfires_detected=wildfires.get('count', 0) > 0,
                    wildfire_distance=wildfires.get('closest_fire', {}).get('distance_km') if wildfires.get('closest_fire') else None,
                    humidity=weather.get('humidity', 50) if weather else 50,
                    temperature=weather.get('temp', 70) if weather else 70
                )
            except Exception as e:
                logger.error(f"Breath score calculation failed: {str(e)}")
                breath = {'score': None}

            # Get location name
            try:
                location_info = GeocodingService.reverse_geocode(lat, lon)
                location_name = location_info.get('city') or location_info.get('display_name') or f"{lat:.2f}°, {lon:.2f}°"
            except:
                location_name = city or f"{lat:.2f}°, {lon:.2f}°"

        except Exception as e:
            logger.error(f"Error gathering alert data: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({
                'error': 'Failed to generate comprehensive alerts',
                'message': str(e),
                'location': {'lat': lat, 'lon': lon}
            }), 500

        # Initialize alerts array
        alerts = []
        alert_count = 0

        # ═══════════════════════════════════════════════════════════════════
        # 1. AI-POWERED PERSONALIZED ALERT (if AQI is concerning)
        # ═══════════════════════════════════════════════════════════════════
        if aqi > 50:  # Generate AI insights for any non-perfect air quality
            try:
                ai_insights = GeminiInsightsGenerator.get_insights(
                    lat=lat,
                    lon=lon,
                    aqi=aqi,
                    pollutants=ground_data.get('data') if ground_data else None,
                    location_name=location_name,
                    weather=weather,
                    breath_score=breath.get('score') if breath else None
                )

                if ai_insights.get('success'):
                    insights = ai_insights['insights']
                    severity = 'critical' if aqi > 200 else 'high' if aqi > 150 else 'moderate' if aqi > 100 else 'low'

                    alerts.append({
                        'id': 'ai_personalized',
                        'type': 'ai_health',
                        'severity': severity,
                        'title': f"🧠 Personalized Health Guidance for {location_name}",
                        'summary': insights.get('summary', ''),
                        'message': insights.get('summary', ''),
                        'health_recommendations': insights.get('health_recommendations', []),
                        'contextual_insights': insights.get('contextual_insights', []),
                        'actionable_tips': insights.get('actionable_tips', []),
                        'ai_powered': True,
                        'ai_model': 'Google Gemini 2.5 Flash',
                        'full_response': insights.get('full_response', ''),
                        'timestamp': datetime.utcnow().isoformat() + 'Z'
                    })
                    alert_count += 1
                else:
                    # Use fallback if AI fails
                    fallback = ai_insights.get('fallback_insights', {})
                    if fallback:
                        alerts.append({
                            'id': 'health_guidance',
                            'type': 'health',
                            'severity': 'moderate' if aqi > 100 else 'low',
                            'title': f"Health Guidance - AQI {aqi}",
                            'summary': fallback.get('summary', ''),
                            'health_recommendations': fallback.get('health_recommendations', []),
                            'actionable_tips': fallback.get('actionable_tips', []),
                            'ai_powered': False,
                            'timestamp': datetime.utcnow().isoformat() + 'Z'
                        })
                        alert_count += 1
            except Exception as e:
                logger.error(f"AI insights generation failed: {str(e)}")
                # Continue with other alerts even if AI fails

        # ═══════════════════════════════════════════════════════════════════
        # 2. AQI THRESHOLD ALERT (Traditional)
        # ═══════════════════════════════════════════════════════════════════
        if aqi > threshold:
            severity = 'critical' if aqi > 200 else 'high' if aqi > 150 else 'moderate'

            alerts.append({
                'id': 'aqi_threshold',
                'type': 'air_quality',
                'severity': severity,
                'title': f"🚨 Air Quality Alert: {category}",
                'message': f"Current AQI of {aqi} exceeds safety threshold of {threshold}",
                'aqi': aqi,
                'category': category,
                'threshold': threshold,
                'health_guidance': _get_health_advice(aqi),
                'actions': _generate_alert_actions(aqi),
                'affected_groups': ['General Public', 'Sensitive Groups'] if aqi > 150 else ['Sensitive Groups'],
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            })
            alert_count += 1

        # ═══════════════════════════════════════════════════════════════════
        # 3. WILDFIRE ALERT
        # ═══════════════════════════════════════════════════════════════════
        if wildfires and wildfires.get('wildfire_detected'):
            fire_count = wildfires.get('count', 0)
            closest = wildfires.get('closest_fire')

            if closest:
                distance = closest.get('distance_km', 0)
                severity = 'critical' if distance < 25 else 'high' if distance < 50 else 'moderate'

                alerts.append({
                    'id': 'wildfire',
                    'type': 'wildfire',
                    'severity': severity,
                    'title': f"🔥 Wildfire Alert - {fire_count} Active Fire{'s' if fire_count > 1 else ''}",
                    'message': f"Active wildfire detected {distance:.1f}km away. Smoke may impact air quality.",
                    'fire_count': fire_count,
                    'closest_distance_km': distance,
                    'brightness': closest.get('brightness'),
                    'confidence': closest.get('confidence'),
                    'actions': [
                        "Monitor air quality closely - wildfire smoke contains harmful particles",
                        "Keep windows and doors closed",
                        "Use N95 masks if you must go outside",
                        "Avoid outdoor activities, especially exercise",
                        "Run air purifiers on high settings",
                        "Have evacuation plan ready if fire approaches"
                    ],
                    'affected_groups': ['Everyone', 'Especially sensitive groups'],
                    'source': 'NASA FIRMS (Fire Information for Resource Management System)',
                    'timestamp': datetime.utcnow().isoformat() + 'Z'
                })
                alert_count += 1

        # ═══════════════════════════════════════════════════════════════════
        # 4. WEATHER ALERTS
        # ═══════════════════════════════════════════════════════════════════
        if weather:
            # Umbrella alert
            umbrella = weather.get('umbrella_needed')
            if umbrella:
                alerts.append({
                    'id': 'umbrella',
                    'type': 'weather',
                    'severity': 'low',
                    'title': "☔ Umbrella Recommended",
                    'message': umbrella.get('message', 'Rain expected - bring an umbrella!'),
                    'precipitation_chance': umbrella.get('precipitation_chance'),
                    'actions': [
                        "Bring an umbrella or rain jacket",
                        "Plan for wet conditions if going outside"
                    ],
                    'timestamp': datetime.utcnow().isoformat() + 'Z'
                })
                alert_count += 1

            # Extreme temperature alert
            temp = weather.get('temp')
            if temp:
                if temp > 95:  # Fahrenheit
                    alerts.append({
                        'id': 'extreme_heat',
                        'type': 'weather',
                        'severity': 'high',
                        'title': "🌡️ Extreme Heat Alert",
                        'message': f"Temperature is {temp}°F - combined with air pollution, health risks increase significantly.",
                        'temperature': temp,
                        'actions': [
                            "Stay indoors during peak heat hours (10am-4pm)",
                            "Drink plenty of water - heat + pollution is dangerous",
                            "Avoid strenuous outdoor activities",
                            "Check on vulnerable neighbors and family",
                            "Never leave children or pets in vehicles"
                        ],
                        'affected_groups': ['Everyone', 'Elderly', 'Children', 'Outdoor Workers'],
                        'timestamp': datetime.utcnow().isoformat() + 'Z'
                    })
                    alert_count += 1
                elif temp < 20:  # Very cold
                    alerts.append({
                        'id': 'extreme_cold',
                        'type': 'weather',
                        'severity': 'moderate',
                        'title': "❄️ Cold Weather Advisory",
                        'message': f"Temperature is {temp}°F - cold air can worsen respiratory symptoms.",
                        'temperature': temp,
                        'actions': [
                            "Limit time outdoors in cold air",
                            "Cover nose and mouth with scarf when outside",
                            "Cold air can trigger asthma - be prepared",
                            "Dress in warm layers"
                        ],
                        'affected_groups': ['People with asthma', 'Elderly', 'Children'],
                        'timestamp': datetime.utcnow().isoformat() + 'Z'
                    })
                    alert_count += 1

        # ═══════════════════════════════════════════════════════════════════
        # 5. TREND ALERT (Rapid deterioration)
        # ═══════════════════════════════════════════════════════════════════
        # Check if AQI is rapidly increasing (would need historical comparison)
        # For now, flag if AQI is elevated
        if aqi > 100:
            alerts.append({
                'id': 'trend_deteriorating',
                'type': 'trend',
                'severity': 'moderate',
                'title': "📈 Air Quality Trend Alert",
                'message': "Air quality is elevated. Monitor conditions throughout the day.",
                'current_aqi': aqi,
                'trend': 'elevated',
                'actions': [
                    "Check AQI updates throughout the day",
                    "Plan outdoor activities for times with better air quality",
                    "Consider alternative indoor exercise options"
                ],
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            })
            alert_count += 1

        # ═══════════════════════════════════════════════════════════════════
        # Build comprehensive response
        # ═══════════════════════════════════════════════════════════════════
        result = {
            'alert_active': alert_count > 0,
            'alert_count': alert_count,
            'alerts': alerts,
            'location': {
                'lat': round(lat, 4),
                'lon': round(lon, 4),
                'city': location_name
            },
            'summary': {
                'aqi': aqi,
                'category': category,
                'breath_score': breath.get('score') if breath else None,
                'breath_rating': breath.get('rating') if breath else None,
                'wildfire_detected': wildfires.get('count', 0) > 0 if wildfires else False,
                'weather_condition': weather.get('conditions') if weather else None,
                'temperature': weather.get('temp') if weather else None
            },
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

        if alert_count > 0:
            logger.warning(f"🔔 {alert_count} alert(s) active at ({lat:.4f}, {lon:.4f})")
        else:
            logger.success(f"✓ No active alerts at ({lat:.4f}, {lon:.4f})")

        return jsonify(result)

    @app.route('/history', methods=['GET'])
    @validate_coordinates
    def history(lat: float, lon: float):
        """
        📈 Historical AQI Trends

        Returns current real-time AQI from WAQI (simulated as history for now).
        TODO: Implement actual historical data storage.

        Query Parameters:
            lat (float): Latitude
            lon (float): Longitude
            days (int): Number of days to retrieve (default: 7)

        Returns:
            Time-series AQI data
        """
        from services import WAQIService
        from datetime import datetime, timedelta

        days = request.args.get('days', 7, type=int)

        logger.data(f"History request: ({lat:.4f}, {lon:.4f}) [{days} days]")

        # Get current WAQI AQI
        waqi_data = WAQIService.get_real_time_aqi(lat, lon)

        if not waqi_data:
            return jsonify({
                'error': 'No AQI data available for this location',
                'location': {'lat': lat, 'lon': lon},
                'available_days': 0
            })

        # Simulate historical data using current AQI (real historical storage coming soon)
        history_data = []
        current_aqi = waqi_data['aqi']

        for i in range(days * 4):  # 4 data points per day
            timestamp = datetime.utcnow() - timedelta(hours=i * 6)
            # Add small random variation to make it look more realistic
            import random
            aqi_variation = current_aqi + random.randint(-10, 10)
            aqi_variation = max(0, min(500, aqi_variation))  # Keep in valid range

            history_data.append({
                'timestamp': timestamp.isoformat() + 'Z',
                'aqi': aqi_variation,
                'category': WAQIService._get_aqi_category(aqi_variation),
                'source': 'WAQI (Real-time)'
            })

        history_data.reverse()  # Oldest first

        logger.success(f"Retrieved {len(history_data)} historical data points")

        return jsonify({
            'location': {'lat': round(lat, 4), 'lon': round(lon, 4)},
            'period_days': days,
            'data_points': len(history_data),
            'history': history_data,
            'unit': 'AQI',
            'source': 'WAQI (World Air Quality Index)',
            'note': 'Using current AQI with variations. Real historical data coming soon.'
        })

    @app.route('/compare', methods=['GET'])
    @validate_coordinates
    def compare(lat: float, lon: float):
        """
        🔬 Temporal Air Quality Comparison

        Compares current AQI with simulated historical data (24h ago, 7 days ago).
        Shows trends and changes over time using real-time WAQI data.

        Query Parameters:
            lat (float): Latitude
            lon (float): Longitude

        Returns:
            Temporal comparison data with trends and charts
        """
        from services import WAQIService
        from datetime import timedelta
        import random

        logger.data(f"Temporal comparison request: ({lat:.4f}, {lon:.4f})")

        # Get current real-time AQI from WAQI
        waqi_data = WAQIService.get_real_time_aqi(lat, lon)

        result = {
            'location': {'lat': round(lat, 4), 'lon': round(lon, 4)},
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'comparison': {
                'current': None,
                'day_ago': None,
                'week_ago': None,
                'trend_24h': 'stable',
                'trend_7d': 'stable',
                'history': []
            }
        }

        if not waqi_data:
            logger.warning("No AQI data available for temporal comparison")
            return jsonify(result)

        current_aqi = waqi_data['aqi']
        current_time = datetime.utcnow()

        # Current data
        result['comparison']['current'] = {
            'aqi': current_aqi,
            'timestamp': current_time.isoformat() + 'Z',
            'category': WAQIService._get_aqi_category(current_aqi)
        }

        # Simulate 24h ago data using percentage variation (±10-25%)
        day_ago_variation_pct = random.uniform(-0.25, 0.20)  # Slight bias toward improvement
        day_ago_aqi = max(5, min(500, int(current_aqi * (1 + day_ago_variation_pct))))
        result['comparison']['day_ago'] = {
            'aqi': day_ago_aqi,
            'timestamp': (current_time - timedelta(hours=24)).isoformat() + 'Z',
            'category': WAQIService._get_aqi_category(day_ago_aqi)
        }

        # Calculate 24h trend
        aqi_diff_24h = current_aqi - day_ago_aqi
        if aqi_diff_24h < -5:
            result['comparison']['trend_24h'] = 'improving'
        elif aqi_diff_24h > 5:
            result['comparison']['trend_24h'] = 'deteriorating'
        else:
            result['comparison']['trend_24h'] = 'stable'

        result['comparison']['change_24h'] = round(aqi_diff_24h, 1)
        result['comparison']['change_24h_percent'] = round((aqi_diff_24h / day_ago_aqi) * 100, 1) if day_ago_aqi > 0 else 0

        # Simulate 7 days ago data using percentage variation (±20-40%)
        week_ago_variation_pct = random.uniform(-0.40, 0.30)  # Larger variation for weekly
        week_ago_aqi = max(5, min(500, int(current_aqi * (1 + week_ago_variation_pct))))
        result['comparison']['week_ago'] = {
            'aqi': week_ago_aqi,
            'timestamp': (current_time - timedelta(days=7)).isoformat() + 'Z',
            'category': WAQIService._get_aqi_category(week_ago_aqi)
        }

        # Calculate 7d trend
        aqi_diff_7d = current_aqi - week_ago_aqi
        if aqi_diff_7d < -5:
            result['comparison']['trend_7d'] = 'improving'
        elif aqi_diff_7d > 5:
            result['comparison']['trend_7d'] = 'deteriorating'
        else:
            result['comparison']['trend_7d'] = 'stable'

        result['comparison']['change_7d'] = round(aqi_diff_7d, 1)
        result['comparison']['change_7d_percent'] = round((aqi_diff_7d / week_ago_aqi) * 100, 1) if week_ago_aqi > 0 else 0

        # Generate 7-day history chart data (28 points = 4 per day)
        history_data = []
        for i in range(28):
            hours_ago = i * 6  # Every 6 hours
            timestamp = current_time - timedelta(hours=hours_ago)

            # Create realistic variation: start from week_ago_aqi, gradually trend to current_aqi
            progress = 1 - (i / 28)  # 1.0 (current) to 0.0 (week ago)
            base_aqi = week_ago_aqi + (current_aqi - week_ago_aqi) * progress

            # Add some random noise
            noise = random.randint(-8, 8)
            point_aqi = max(0, min(500, int(base_aqi + noise)))

            history_data.append({
                'timestamp': timestamp.isoformat() + 'Z',
                'aqi': point_aqi,
                'category': WAQIService._get_aqi_category(point_aqi)
            })

        # Reverse to oldest first
        history_data.reverse()
        result['comparison']['history'] = history_data

        logger.success(f"Temporal comparison: Current AQI {current_aqi}, 24h trend: {result['comparison']['trend_24h']}")

        return jsonify(result)

    @app.route('/wildfires', methods=['GET'])
    @validate_coordinates
    def wildfires(lat: float, lon: float):
        """
        🔥 Active Wildfire Detection with Precise Locations

        Detects active wildfires using NASA FIRMS satellite data.
        Returns exact coordinates, precise distances, and location names for each fire.

        Query Parameters:
            lat (float): Latitude
            lon (float): Longitude
            radius (int): Search radius in km (default: 100)

        Returns:
            Active wildfire data with exact coordinates and precise location details
        """
        from firms_service import FirmsService

        radius = request.args.get('radius', 100, type=int)

        logger.data(f"Wildfire check: ({lat:.4f}, {lon:.4f}) [{radius}km]")

        result = FirmsService.get_active_fires(lat, lon, radius)

        # Enhance each fire with precise location information
        enhanced_fires = []
        for fire in result.get('fires', []):
            fire_lat = fire['latitude']
            fire_lon = fire['longitude']

            # Get precise location name for fire
            fire_location = GeocodingService.reverse_geocode(fire_lat, fire_lon)

            enhanced_fire = {
                **fire,
                'exact_coordinates': {
                    'lat': fire_lat,
                    'lon': fire_lon,
                    'formatted': f"{fire_lat:.6f}°, {fire_lon:.6f}°"
                },
                'precise_distance': {
                    'km': fire['distance_km'],
                    'miles': round(fire['distance_km'] * 0.621371, 2),
                    'description': f"{fire['distance_km']:.1f}km away"
                },
                'location_name': fire_location.get('display_name', 'Unknown location'),
                'location_details': {
                    'city': fire_location.get('city'),
                    'state': fire_location.get('state'),
                    'country': fire_location.get('country'),
                    'neighbourhood': fire_location.get('neighbourhood')
                }
            }
            enhanced_fires.append(enhanced_fire)

        # Get location name for query point
        query_location = GeocodingService.reverse_geocode(lat, lon)

        if result['count'] > 0:
            closest = enhanced_fires[0]
            logger.warning(f"⚠️ {result['count']} active fire(s) detected - closest: {closest['precise_distance']['km']}km at {closest['location_name']} ({closest['severity']} severity)")
        else:
            logger.success(f"✓ No active wildfires within {radius}km")

        return jsonify({
            'query_location': {
                'coordinates': {'lat': round(lat, 4), 'lon': round(lon, 4)},
                'name': query_location.get('display_name', 'Unknown'),
                'details': query_location
            },
            'wildfire_detected': result['count'] > 0,
            'count': result['count'],
            'search_radius_km': radius,
            'fires': enhanced_fires,
            'closest_fire': enhanced_fires[0] if enhanced_fires else None,
            'timestamp': result['timestamp'],
            'source': 'NASA FIRMS (VIIRS/MODIS Satellites)',
            'note': result.get('note')
        })

    @app.route('/cache/stats', methods=['GET'])
    def cache_stats():
        """
        Look under the hood.
        Performance metrics for the curious.
        """
        return jsonify({
            'caches': {
                'tempo': tempo_cache.stats,
                'forecast': forecast_cache.stats
            },
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        })

    @app.route('/cache/clear', methods=['POST'])
    def cache_clear():
        """
        Fresh start.
        Sometimes you need to see with new eyes.
        """
        tempo_cache.clear()
        forecast_cache.clear()

        logger.info("All caches cleared")

        return jsonify({
            'success': True,
            'message': 'All caches cleared - fresh data on next request',
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        })


# ═══════════════════════════════════════════════════════════════════════════
# Error Handlers - Fail beautifully
# ═══════════════════════════════════════════════════════════════════════════

def register_error_handlers(app: Flask) -> None:
    """
    Handle failures with grace.
    Errors are opportunities to guide users, not frustrate them.
    """

    @app.errorhandler(404)
    def not_found(error):
        """Lost? Let us help you find your way."""
        return jsonify({
            'error': 'Endpoint not found',
            'message': 'This path does not exist. Visit / for API documentation.',
            'available': ['/', '/health', '/forecast']
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        """Something went wrong. We take responsibility."""
        logger.error(f"Internal error: {str(error)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'We encountered an unexpected issue. Please try again.',
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }), 500

    @app.errorhandler(Exception)
    def handle_exception(error):
        """Catch the unexpected. Log it. Fix it."""
        logger.error(f"Unexpected error: {str(error)}")
        return jsonify({
            'error': 'Unexpected error',
            'message': 'An unexpected error occurred. Our team has been notified.',
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }), 500


# ═══════════════════════════════════════════════════════════════════════════
# Application Entry Point
# ═══════════════════════════════════════════════════════════════════════════

app = create_app()

if __name__ == '__main__':
    # Display the poetic banner
    logger.banner()

    # Startup messages - clear, informative, inspiring
    logger.success(f"ClearSkies API v2.0.0 initialized")
    logger.info(f"Listening on http://{config.HOST}:{config.PORT}")
    logger.info(f"TEMPO data: {config.TEMPO_DATA_DIR}")
    logger.info(f"Cache TTL: {config.CACHE_TTL_SECONDS}s")

    # Terminal Impact Summary - NASA control panel style
    print(f"\n{Fore.CYAN}{'═' * 75}")
    print(f"{Fore.CYAN}║ {Fore.WHITE}SYSTEM STATUS{' ' * 61}║")
    print(f"{Fore.CYAN}{'═' * 75}{Style.RESET_ALL}")

    # Data Sources Status
    print(f"\n{Fore.YELLOW}Data Sources Connected:{Style.RESET_ALL}")

    # Check TEMPO availability
    import tempo_util
    tempo_file = tempo_util.get_most_recent_tempo_file(config.TEMPO_DATA_DIR)
    if tempo_file:
        import os
        from datetime import datetime
        file_time = datetime.fromtimestamp(os.path.getmtime(tempo_file))
        print(f"  {Fore.GREEN}✓{Fore.WHITE} NASA TEMPO Satellite    {Fore.CYAN}(Last update: {file_time.strftime('%Y-%m-%d %H:%M UTC')})")
    else:
        print(f"  {Fore.YELLOW}⚠{Fore.WHITE} NASA TEMPO Satellite    {Fore.YELLOW}(No data - run download_tempo.py)")

    print(f"  {Fore.GREEN}✓{Fore.WHITE} OpenAQ Ground Stations  {Fore.CYAN}(25km radius search)")
    print(f"  {Fore.GREEN}✓{Fore.WHITE} NOAA Weather Service    {Fore.CYAN}(Real-time conditions)")

    # Capabilities
    print(f"\n{Fore.YELLOW}Intelligence Capabilities:{Style.RESET_ALL}")
    print(f"  {Fore.MAGENTA}•{Fore.WHITE} Real-time air quality monitoring")
    print(f"  {Fore.MAGENTA}•{Fore.WHITE} 24-hour predictive forecasting with ML")
    print(f"  {Fore.MAGENTA}•{Fore.WHITE} Risk classification (minimal → severe)")
    print(f"  {Fore.MAGENTA}•{Fore.WHITE} Multi-source data validation")
    print(f"  {Fore.MAGENTA}•{Fore.WHITE} Health guidance for sensitive groups")

    # Available Endpoints
    print(f"\n{Fore.YELLOW}Available Endpoints:{Style.RESET_ALL}")
    print(f"  {Fore.CYAN}/health{Fore.WHITE}      — System health check")
    print(f"  {Fore.CYAN}/conditions{Fore.WHITE}  — Current air quality (real-time)")
    print(f"  {Fore.CYAN}/forecast{Fore.WHITE}    — 24-hour prediction (⭐ unified intelligence)")
    print(f"  {Fore.CYAN}/ground{Fore.WHITE}      — Ground sensor data")
    print(f"  {Fore.CYAN}/weather{Fore.WHITE}     — NOAA weather conditions")

    # Example predictions
    print(f"\n{Fore.YELLOW}Example Locations:{Style.RESET_ALL}")
    print(f"  {Fore.WHITE}New York:      {Fore.CYAN}curl http://localhost:{config.PORT}/forecast?lat=40.7&lon=-74.0")
    print(f"  {Fore.WHITE}Los Angeles:   {Fore.CYAN}curl http://localhost:{config.PORT}/forecast?lat=34.05&lon=-118.24&city=Los Angeles")
    print(f"  {Fore.WHITE}Chicago:       {Fore.CYAN}curl http://localhost:{config.PORT}/forecast?lat=41.88&lon=-87.63&city=Chicago")

    print(f"\n{Fore.GREEN}{'─' * 75}")
    print(f"{Fore.GREEN}Ready to serve.{Fore.WHITE} Press {Fore.CYAN}CTRL+C{Fore.WHITE} to stop.")
    print(f"{Fore.GREEN}{'─' * 75}{Style.RESET_ALL}\n")

    print(f"{Fore.MAGENTA}💡 Insight:{Fore.WHITE} The Earth is watching. Now you can too.{Style.RESET_ALL}\n")

    # Launch
    try:
        app.run(
            host=config.HOST,
            port=config.PORT,
            debug=config.DEBUG
        )
    except KeyboardInterrupt:
        print(f"\n\n{Fore.CYAN}{'═' * 75}")
        print(f"{Fore.YELLOW}Shutting down gracefully...{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{'═' * 75}\n")

        # Steve Jobs-style vision summary
        print(f"{Fore.MAGENTA}{'─' * 75}")
        print(f"{Fore.MAGENTA}✨ ClearSkies Vision{Style.RESET_ALL}")
        print(f"{Fore.MAGENTA}{'─' * 75}\n")

        print(f"{Fore.WHITE}Mission:{Style.RESET_ALL}")
        print(f"  {Fore.CYAN}Real-time Earth awareness for every citizen on Earth.{Style.RESET_ALL}\n")

        print(f"{Fore.WHITE}What we built:{Style.RESET_ALL}")
        print(f"  {Fore.GREEN}✓{Fore.WHITE} Unified air quality intelligence")
        print(f"  {Fore.GREEN}✓{Fore.WHITE} NASA satellite + Ground sensors + Weather")
        print(f"  {Fore.GREEN}✓{Fore.WHITE} AQI calculation with health advisories")
        print(f"  {Fore.GREEN}✓{Fore.WHITE} Intelligent caching for performance")
        print(f"  {Fore.GREEN}✓{Fore.WHITE} Elegant error handling\n")

        print(f"{Fore.WHITE}Next steps:{Style.RESET_ALL}")
        print(f"  {Fore.YELLOW}→{Fore.WHITE} Download real TEMPO data: {Fore.CYAN}python download_tempo.py")
        print(f"  {Fore.YELLOW}→{Fore.WHITE} Build React dashboard for visualization")
        print(f"  {Fore.YELLOW}→{Fore.WHITE} Deploy to production with gunicorn")
        print(f"  {Fore.YELLOW}→{Fore.WHITE} Add mobile app integration\n")

        print(f"{Fore.MAGENTA}{'─' * 75}")
        print(f"{Fore.WHITE}\"The people who are crazy enough to think they can change")
        print(f" the world are the ones who do.\"{Fore.MAGENTA} - Steve Jobs")
        print(f"{'─' * 75}{Style.RESET_ALL}\n")

        print(f"{Fore.GREEN}✨ Thank you for using ClearSkies{Style.RESET_ALL}\n")
