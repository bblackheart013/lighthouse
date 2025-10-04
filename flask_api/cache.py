"""
Intelligent Caching Layer
Location-aware cache with automatic expiration - because satellite data evolves.
"""
from cachetools import TTLCache
from functools import wraps
import hashlib
import json
from typing import Any, Callable
from config import config


class LocationCache:
    """
    Geographic-aware cache with time-to-live.
    Optimized for lat/lon queries where precision matters.
    """

    def __init__(self, ttl: int = None, max_size: int = None):
        """
        Initialize the location-based cache.

        Args:
            ttl: Time-to-live in seconds (default from config)
            max_size: Maximum number of cached entries (default from config)
        """
        self.ttl = ttl or config.CACHE_TTL_SECONDS
        self.max_size = max_size or config.CACHE_MAX_SIZE
        self._cache = TTLCache(maxsize=self.max_size, ttl=self.ttl)

    def _make_key(self, lat: float, lon: float, **kwargs) -> str:
        """
        Create a unique cache key from coordinates and parameters.
        Rounds to 3 decimal places (~100m precision) for cache efficiency.

        Args:
            lat: Latitude
            lon: Longitude
            **kwargs: Additional parameters to include in key

        Returns:
            Hashed cache key
        """
        # Round coordinates to 3 decimals for sensible cache hits
        rounded_lat = round(lat, 3)
        rounded_lon = round(lon, 3)

        # Create deterministic key from all parameters
        key_data = {
            'lat': rounded_lat,
            'lon': rounded_lon,
            **kwargs
        }

        # Hash for compact, collision-resistant keys
        key_string = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_string.encode()).hexdigest()

    def get(self, lat: float, lon: float, **kwargs) -> Any:
        """Retrieve cached data for location."""
        key = self._make_key(lat, lon, **kwargs)
        return self._cache.get(key)

    def set(self, lat: float, lon: float, value: Any, **kwargs) -> None:
        """Store data in cache for location."""
        key = self._make_key(lat, lon, **kwargs)
        self._cache[key] = value

    def clear(self) -> None:
        """Clear all cached entries."""
        self._cache.clear()

    @property
    def stats(self) -> dict:
        """Return cache statistics."""
        return {
            'size': len(self._cache),
            'max_size': self.max_size,
            'ttl_seconds': self.ttl,
            'hit_rate': getattr(self._cache, 'hit_rate', 'N/A')
        }


# Global cache instances
tempo_cache = LocationCache()
forecast_cache = LocationCache(ttl=1800)  # 30 min for forecast data


def cached(cache_instance: LocationCache):
    """
    Decorator for caching function results based on lat/lon arguments.

    Usage:
        @cached(tempo_cache)
        def get_pollution_data(lat, lon):
            # expensive operation
            return data
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(lat: float, lon: float, *args, **kwargs):
            # Try to get from cache
            cached_result = cache_instance.get(lat, lon, **kwargs)
            if cached_result is not None:
                return cached_result

            # Cache miss - execute function
            result = func(lat, lon, *args, **kwargs)

            # Store in cache if result is valid
            if result is not None:
                cache_instance.set(lat, lon, result, **kwargs)

            return result

        return wrapper
    return decorator
