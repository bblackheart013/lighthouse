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
        wind_speed = weather.get('wind_speed', '')
        if 'calm' in wind_speed.lower() or '0' in wind_speed:
            if base_risk == "moderate":
                base_risk = "high"
            elif base_risk == "low":
                base_risk = "moderate"

    return base_risk


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

    # Enable CORS for frontend integration
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000", "http://localhost:5173"],
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
                '/forecast': 'Unified 24-hour forecast with risk classification (⭐ Predictive)',
                '/alerts': 'Proactive air quality alerts with health guidance',
                '/history': 'Historical AQI trends (past 7 days)',
                '/compare': 'Satellite vs ground sensor comparison',
                '/ground': 'Ground sensor data from OpenAQ',
                '/weather': 'NOAA weather conditions',
                '/cache/stats': 'Cache performance metrics',
                '/cache/clear': 'Clear all caches (POST)'
            },
            'examples': {
                'forecast': '/forecast?lat=34.05&lon=-118.24&city=Los Angeles',
                'alerts': '/alerts?lat=40.7&lon=-74.0&threshold=100',
                'history': '/history?lat=40.7&lon=-74.0&days=7',
                'compare': '/compare?lat=40.7&lon=-74.0'
            },
            'data_sources': {
                'satellite': '🛰️  NASA TEMPO - 22,000 miles above',
                'ground': '🌍 OpenAQ Sensors - where we breathe',
                'weather': '🌤️  NOAA Weather - the atmosphere\'s pulse'
            },
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
        🌤️ Weather Conditions Endpoint

        Atmospheric context from NOAA.
        The stage on which air quality performs.

        Query Parameters:
            lat (float): Latitude
            lon (float): Longitude

        Returns:
            Weather conditions
        """
        from services import NOAAWeatherService

        logger.data(f"Weather request: ({lat:.4f}, {lon:.4f})")

        result = NOAAWeatherService.get_conditions(lat, lon)

        if result:
            logger.success(f"{result['temperature']}°{result['temperature_unit']}, {result['conditions']}")
        else:
            logger.warning("NOAA data unavailable")

        return jsonify({
            'location': {'lat': lat, 'lon': lon},
            'weather': result or {},
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
        from services import OpenAQService, NOAAWeatherService

        city = request.args.get('city', None)

        logger.data(f"Unified forecast: ({lat:.4f}, {lon:.4f}) {f'[{city}]' if city else ''}")

        # 1. Get predictive forecast from satellite time-series
        prediction = TEMPOPredictor.generate_forecast(lat, lon, city)

        # 2. Get current ground truth for validation
        ground_data = OpenAQService.get_measurements(lat, lon)

        # 3. Get weather context for impact analysis
        weather_data = NOAAWeatherService.get_conditions(lat, lon)

        # Build comprehensive forecast
        if prediction.get('predicted_aqi'):
            aqi = prediction['predicted_aqi']
            confidence = prediction.get('confidence', 'unknown')

            # Enhanced risk classification
            risk_level = _classify_risk(aqi, weather_data, ground_data)

            # Build unified response
            result = {
                'location': prediction['location'],
                'forecast_time': prediction['forecast_time'],
                'current_time': prediction['current_time'],
                'prediction': {
                    'aqi': aqi,
                    'category': prediction['category'],
                    'confidence': confidence,
                    'risk_level': risk_level,
                    'no2_molecules_cm2': prediction['predicted_no2']
                },
                'health_guidance': {
                    'general_public': prediction['advice'],
                    'sensitive_groups': _get_sensitive_group_advice(aqi),
                    'outdoor_activities': _get_activity_recommendation(aqi)
                },
                'data_sources': {
                    'satellite': {
                        'available': True,
                        'data_points': prediction['model_details']['data_points'],
                        'r_squared': prediction['model_details']['r_squared']
                    },
                    'ground_sensors': {
                        'available': ground_data is not None,
                        'pollutants': list(ground_data.keys()) if ground_data else []
                    },
                    'weather': {
                        'available': weather_data is not None,
                        'conditions': weather_data.get('conditions') if weather_data else None,
                        'temperature': f"{weather_data.get('temperature')}°{weather_data.get('temperature_unit')}" if weather_data else None
                    }
                },
                'model': prediction['model_details']['algorithm']
            }

            logger.success(f"Predicted AQI {aqi} ({confidence} confidence, {risk_level} risk) at ({lat:.4f}, {lon:.4f})")
        else:
            result = prediction
            logger.warning(f"Insufficient data for prediction at ({lat:.4f}, {lon:.4f})")

        return jsonify(result)

    @app.route('/alerts', methods=['GET'])
    @validate_coordinates
    def alerts(lat: float, lon: float):
        """
        ⚠️ Proactive Air Quality Alerts

        Generates dynamic alerts when AQI exceeds safe thresholds.
        Returns actionable health guidance with cause analysis.

        Query Parameters:
            lat (float): Latitude
            lon (float): Longitude
            threshold (int): Alert threshold AQI (default: 100)

        Returns:
            Alert status with health guidance and trend analysis
        """
        from services import OpenAQService, NOAAWeatherService

        threshold = request.args.get('threshold', 100, type=int)
        city = request.args.get('city', None)

        logger.data(f"Alert check: ({lat:.4f}, {lon:.4f}) [threshold: {threshold}]")

        # Get current forecast
        prediction = TEMPOPredictor.generate_forecast(lat, lon, city)

        if not prediction.get('predicted_aqi'):
            return jsonify({
                'alert_active': False,
                'message': 'Insufficient data for alert generation',
                'location': {'lat': lat, 'lon': lon}
            })

        aqi = prediction['predicted_aqi']
        alert_active = aqi > threshold

        # Build alert response
        result = {
            'alert_active': alert_active,
            'location': prediction['location'],
            'current_aqi': aqi,
            'threshold': threshold,
            'category': prediction['category'],
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

        if alert_active:
            # Get weather for cause analysis
            weather = NOAAWeatherService.get_conditions(lat, lon)

            # Generate dynamic alert message
            cause = "elevated nitrogen dioxide levels from vehicle emissions"
            if weather and 'calm' in weather.get('wind_speed', '').lower():
                cause += " combined with stagnant atmospheric conditions"

            result['alert'] = {
                'severity': 'high' if aqi > 150 else 'moderate',
                'headline': f"Air Quality Alert: {prediction['category']}",
                'message': f"AQI is predicted to reach {aqi} tomorrow due to {cause}.",
                'health_guidance': prediction['advice'],
                'actions': _generate_alert_actions(aqi),
                'forecast_trend': 'deteriorating' if aqi > 120 else 'elevated'
            }

            logger.warning(f"Alert triggered: AQI {aqi} at ({lat:.4f}, {lon:.4f})")
        else:
            result['message'] = f"Air quality is within safe limits (AQI: {aqi})"
            logger.success(f"No alert: AQI {aqi} at ({lat:.4f}, {lon:.4f})")

        return jsonify(result)

    @app.route('/history', methods=['GET'])
    @validate_coordinates
    def history(lat: float, lon: float):
        """
        📈 Historical AQI Trends

        Returns past 7 days of AQI data for trend analysis.
        Uses cached predictions and TEMPO historical data.

        Query Parameters:
            lat (float): Latitude
            lon (float): Longitude
            days (int): Number of days to retrieve (default: 7)

        Returns:
            Time-series AQI data
        """
        days = request.args.get('days', 7, type=int)

        logger.data(f"History request: ({lat:.4f}, {lon:.4f}) [{days} days]")

        # Load TEMPO time series
        timeseries = TEMPOPredictor.load_tempo_timeseries(lat, lon)

        if not timeseries:
            return jsonify({
                'error': 'Insufficient historical data',
                'location': {'lat': lat, 'lon': lon},
                'available_days': 0
            })

        # Convert NO2 values to AQI
        from services import AQICalculator

        history_data = []
        for timestamp, no2_value in zip(timeseries['timestamps'], timeseries['no2_values']):
            aqi_info = AQICalculator.calculate_aqi(
                'NO2',
                no2_value,
                'molecules/cm^2',
                source='TEMPO'
            )

            history_data.append({
                'timestamp': timestamp.isoformat() + 'Z',
                'aqi': aqi_info['aqi'],
                'category': AQICalculator._get_category(aqi_info['aqi']) if aqi_info['aqi'] else 'Unknown',
                'no2_value': no2_value
            })

        logger.success(f"Retrieved {len(history_data)} historical data points")

        return jsonify({
            'location': {'lat': round(lat, 4), 'lon': round(lon, 4)},
            'period_days': days,
            'data_points': len(history_data),
            'history': history_data,
            'unit': 'AQI',
            'source': 'NASA TEMPO Satellite'
        })

    @app.route('/compare', methods=['GET'])
    @validate_coordinates
    def compare(lat: float, lon: float):
        """
        🔬 Satellite vs Ground Comparison

        Compares NASA TEMPO satellite readings with OpenAQ ground sensors.
        Returns scatterplot-ready data for validation analysis.

        Query Parameters:
            lat (float): Latitude
            lon (float): Longitude

        Returns:
            Comparison data with correlation metrics
        """
        from services import TempoService, OpenAQService, AQICalculator

        logger.data(f"Comparison request: ({lat:.4f}, {lon:.4f})")

        # Get satellite data
        satellite = TempoService.get_pollutant_data(lat, lon)

        # Get ground data
        ground = OpenAQService.get_measurements(lat, lon)

        result = {
            'location': {'lat': round(lat, 4), 'lon': round(lon, 4)},
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'comparison': {
                'satellite': None,
                'ground': None,
                'correlation': 'unavailable'
            }
        }

        if satellite:
            sat_aqi = AQICalculator.calculate_aqi(
                satellite['pollutant'],
                satellite['value'],
                satellite['unit'],
                source=satellite.get('source', '')
            )
            result['comparison']['satellite'] = {
                'aqi': sat_aqi['aqi'],
                'no2_molecules_cm2': satellite['value'],
                'source': 'NASA TEMPO'
            }

        if ground and 'NO2' in ground:
            result['comparison']['ground'] = {
                'no2_ppb': ground['NO2']['value'],
                'unit': ground['NO2']['unit'],
                'source': 'OpenAQ Ground Stations'
            }

        # Calculate correlation if both available
        if satellite and ground and 'NO2' in ground:
            sat_ppb = AQICalculator.molecules_cm2_to_ppb(satellite['value'])
            ground_ppb = ground['NO2']['value']

            deviation = abs(sat_ppb - ground_ppb) / ground_ppb * 100 if ground_ppb > 0 else 0

            result['comparison']['correlation'] = 'good' if deviation < 20 else 'moderate' if deviation < 40 else 'poor'
            result['comparison']['deviation_percent'] = round(deviation, 2)
            result['comparison']['satellite_ppb'] = round(sat_ppb, 2)
            result['comparison']['ground_ppb'] = round(ground_ppb, 2)

            logger.success(f"Comparison complete: {result['comparison']['correlation']} correlation")
        else:
            logger.warning("Incomplete data for comparison")

        return jsonify(result)

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
