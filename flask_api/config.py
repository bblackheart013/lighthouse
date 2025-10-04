"""
ClearSkies API Configuration
Elegant, production-ready settings for air quality intelligence.
"""
import os
from datetime import timedelta


class Config:
    """Base configuration - crafted for clarity and extensibility."""

    # API Metadata
    API_TITLE = "ClearSkies API"
    API_VERSION = "1.0.0"
    API_DESCRIPTION = "NASA TEMPO satellite data meets ground truth"

    # Server Configuration
    HOST = "0.0.0.0"
    PORT = 5001
    DEBUG = True

    # Data Sources
    TEMPO_DATA_DIR = "../data/raw/tempo"

    # Cache Configuration (30-minute TTL for satellite data)
    CACHE_TTL_SECONDS = 1800
    CACHE_MAX_SIZE = 1000

    # API Rate Limits (requests per minute)
    RATE_LIMIT_PER_MINUTE = 60

    # External API Endpoints
    OPENAQ_API = "https://api.openaq.org/v2"
    NOAA_WEATHER_API = "https://api.weather.gov"

    # Default Coordinates (New York City)
    DEFAULT_LATITUDE = 40.7128
    DEFAULT_LONGITUDE = -74.0060

    # Geographic Bounds (North America - TEMPO coverage)
    MIN_LATITUDE = 17.0
    MAX_LATITUDE = 64.0
    MIN_LONGITUDE = -140.0
    MAX_LONGITUDE = -50.0

    # Response Format
    JSON_SORT_KEYS = False  # Preserve logical ordering
    JSON_COMPACT = False    # Human-readable formatting

    @classmethod
    def validate_coordinates(cls, lat: float, lon: float) -> tuple[bool, str]:
        """
        Validate if coordinates fall within TEMPO satellite coverage.

        Args:
            lat: Latitude in degrees
            lon: Longitude in degrees

        Returns:
            (valid, error_message) tuple
        """
        if not (cls.MIN_LATITUDE <= lat <= cls.MAX_LATITUDE):
            return False, f"Latitude must be between {cls.MIN_LATITUDE}° and {cls.MAX_LATITUDE}°"

        if not (cls.MIN_LONGITUDE <= lon <= cls.MAX_LONGITUDE):
            return False, f"Longitude must be between {cls.MIN_LONGITUDE}° and {cls.MAX_LONGITUDE}°"

        return True, ""


class ProductionConfig(Config):
    """Production environment settings."""
    DEBUG = False
    CACHE_TTL_SECONDS = 3600  # 1 hour cache in production


class DevelopmentConfig(Config):
    """Development environment settings."""
    DEBUG = True
    CACHE_TTL_SECONDS = 300  # 5 minutes for faster iteration


# Export the active configuration
config = DevelopmentConfig()
