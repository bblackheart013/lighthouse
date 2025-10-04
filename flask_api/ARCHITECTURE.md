# ClearSkies API Architecture

> *"Simplicity is the ultimate sophistication."* — Leonardo da Vinci

## Design Philosophy

This API embodies the principles that made Apple products legendary:

1. **Elegance** - Every line serves a purpose
2. **Performance** - Fast by design, not by accident
3. **Reliability** - Graceful degradation, never catastrophic failure
4. **Extensibility** - Built to evolve
5. **Clarity** - Code that reads like prose

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Client Layer                            │
│              (React, Mobile App, CLI, etc.)                    │
└────────────────────┬───────────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼───────────────────────────────────────────┐
│                     Flask Application                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Routes (app.py)                                         │ │
│  │  • Input validation via decorators                      │ │
│  │  • Error handling with helpful messages                 │ │
│  │  • Logging for observability                            │ │
│  └────────────┬─────────────────────────────────────────────┘ │
│               │                                                 │
│  ┌────────────▼─────────────────────────────────────────────┐ │
│  │  Services Layer (services.py)                           │ │
│  │  • TempoService     - Satellite data orchestration      │ │
│  │  • OpenAQService    - Ground truth integration          │ │
│  │  • NOAAService      - Weather context                   │ │
│  │  • ForecastService  - Unified intelligence              │ │
│  └────────────┬─────────────────────────────────────────────┘ │
│               │                                                 │
│  ┌────────────▼─────────────────────────────────────────────┐ │
│  │  Cache Layer (cache.py)                                 │ │
│  │  • Location-aware TTL cache                             │ │
│  │  • ~100m spatial precision                              │ │
│  │  • Decorator-based caching                              │ │
│  └────────────┬─────────────────────────────────────────────┘ │
└───────────────┼─────────────────────────────────────────────────┘
                │
    ┌───────────┴─────────────┬──────────────┬──────────────┐
    │                         │              │              │
┌───▼────────┐    ┌──────────▼───┐  ┌──────▼──────┐  ┌───▼──────┐
│   TEMPO    │    │    OpenAQ    │  │    NOAA     │  │  Local   │
│ Satellite  │    │   Ground     │  │   Weather   │  │  NetCDF  │
│   (NASA)   │    │   Stations   │  │     API     │  │   Cache  │
└────────────┘    └──────────────┘  └─────────────┘  └──────────┘
```

---

## Data Flow

### Request Lifecycle

1. **Client Request**
   ```
   GET /forecast?lat=40.7&lon=-74.0
   ```

2. **Input Validation** (`@validate_coordinates`)
   - Parse and type-check parameters
   - Validate geographic bounds
   - Return helpful errors if invalid

3. **Cache Check** (`@cached`)
   - Generate location-based cache key
   - Return cached data if fresh (TTL not expired)
   - Proceed to data fetch if cache miss

4. **Parallel Data Gathering**
   ```python
   # Non-blocking, concurrent requests
   satellite_data = TempoService.get_pollutant_data(lat, lon)
   ground_data = OpenAQService.get_measurements(lat, lon)
   weather_data = NOAAService.get_conditions(lat, lon)
   ```

5. **Data Synthesis**
   - Merge all data sources
   - Generate air quality summary
   - Add confidence metrics

6. **Response**
   - Format as clean JSON
   - Cache for future requests
   - Return to client

---

## Module Breakdown

### `app.py` - The Conductor
**Lines of Code:** ~280
**Responsibilities:**
- Application factory pattern
- Route registration
- Input validation decorators
- Error handling
- Logging configuration

**Key Patterns:**
- **Decorator-based validation** - Clean separation of concerns
- **Error handlers** - User-friendly messages, no stack traces
- **RESTful design** - Predictable, standards-compliant endpoints

### `config.py` - The Brain
**Lines of Code:** ~70
**Responsibilities:**
- Centralized configuration
- Environment-specific settings
- Coordinate validation logic
- API endpoints and limits

**Design Decision:**
Class-based config enables easy environment switching and testing.

### `cache.py` - The Memory
**Lines of Code:** ~120
**Responsibilities:**
- TTL-based caching
- Location-aware key generation
- Decorator for transparent caching
- Cache statistics

**Why Spatial Rounding?**
Coordinates rounded to 3 decimals (~100m precision) maximize cache hits while maintaining accuracy for air quality data.

### `services.py` - The Intelligence
**Lines of Code:** ~280
**Responsibilities:**
- TEMPO satellite data retrieval
- OpenAQ ground station queries
- NOAA weather integration
- Unified forecast synthesis
- Air quality assessment logic

**Design Pattern: Service Layer**
- Each service is independent and testable
- Graceful degradation if a service fails
- Consistent response format across all services

### `tempo_util.py` - The Specialist
**Lines of Code:** ~180
**Responsibilities:**
- NetCDF file discovery
- Variable auto-detection
- Coordinate system normalization
- Nearest-neighbor interpolation

**NASA Engineer Mentality:**
- Robust error handling
- Support for multiple TEMPO products (NO₂, O₃, HCHO)
- Handles longitude wrap-around (0-360 ↔ -180-180)

---

## Caching Strategy

### Why Cache?

1. **Satellite data updates hourly** - No need to re-read NetCDF files every second
2. **API rate limits** - OpenAQ and NOAA have request limits
3. **User experience** - Sub-100ms responses vs. multi-second fetches

### Cache Implementation

```python
@cached(tempo_cache)
def get_pollutant_data(lat, lon):
    # Expensive NetCDF read
    ...
```

**Cache Key Generation:**
```python
{
  'lat': 40.713,  # Rounded to 3 decimals
  'lon': -74.006, # ~100m spatial precision
}
→ MD5 hash → "a3f5e8b2c1d4..."
```

**TTL (Time To Live):**
- TEMPO cache: 5 minutes (dev) / 1 hour (prod)
- Forecast cache: 30 minutes
- Configurable via `config.py`

---

## Error Handling Philosophy

### Traditional Approach (Bad)
```json
{
  "error": "IndexError: list index out of range",
  "traceback": "File app.py, line 142..."
}
```

### ClearSkies Approach (Good)
```json
{
  "success": false,
  "error": "Latitude must be between 17.0° and 64.0°",
  "coverage": {
    "region": "North America (TEMPO satellite coverage)",
    "latitude": "17.0° to 64.0°",
    "longitude": "-140.0° to -50.0°"
  }
}
```

**Principles:**
1. Never expose internal errors to users
2. Provide actionable guidance
3. Include examples of correct usage
4. Log details server-side for debugging

---

## Performance Optimizations

### 1. Intelligent Caching
- Location-based keys with spatial tolerance
- Separate TTLs for different data freshness needs

### 2. Lazy NetCDF Loading
- Files only opened when cache misses
- Datasets closed immediately after use

### 3. Parallel API Requests
- TEMPO, OpenAQ, and NOAA fetched concurrently
- Failures in one don't block others

### 4. Minimal Dependencies
- Only essential packages installed
- No bloated frameworks

---

## Extensibility Points

### Adding New Pollutants
1. Download new TEMPO product (e.g., `TEMPO_HCHO_L3`)
2. Auto-detection in `tempo_util.py` handles it automatically

### Adding New Data Sources
1. Create new service in `services.py`
2. Add to `ForecastService.get_unified_forecast()`
3. Update API documentation

### Adding New Endpoints
```python
@app.route('/new-endpoint', methods=['GET'])
@validate_coordinates
def new_endpoint(lat, lon):
    result = NewService.get_data(lat, lon)
    return jsonify(result)
```

---

## Testing Strategy

### Manual Testing (Provided)
```bash
# Health check
curl http://localhost:5001/health

# TEMPO satellite data
curl http://localhost:5001/tempo?lat=40.7&lon=-74.0

# Unified forecast
curl http://localhost:5001/forecast?lat=34.05&lon=-118.24

# Cache statistics
curl http://localhost:5001/cache/stats
```

### Automated Testing (Recommended)
```python
# tests/test_api.py
def test_tempo_endpoint():
    response = client.get('/tempo?lat=40.7&lon=-74.0')
    assert response.status_code == 200
    assert 'success' in response.json

def test_invalid_coordinates():
    response = client.get('/tempo?lat=999&lon=-74.0')
    assert response.status_code == 400
```

---

## Production Deployment Checklist

- [ ] Set `FLASK_ENV=production` in environment
- [ ] Use production WSGI server (gunicorn, uWSGI)
- [ ] Enable HTTPS with valid certificates
- [ ] Configure rate limiting (e.g., via nginx)
- [ ] Set up monitoring (logs, metrics, alerts)
- [ ] Download real TEMPO data via `download_tempo.py`
- [ ] Configure backup data sources
- [ ] Set up automated TEMPO data downloads (cron job)

**Example Production Command:**
```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

---

## Code Quality Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Total Lines | ~1000 | < 1500 |
| Files | 7 | < 10 |
| Max Function Length | ~80 lines | < 100 |
| Comment Ratio | ~25% | > 20% |
| External Dependencies | 8 | < 15 |

---

## Future Enhancements

### Phase 2 (Next Quarter)
- [ ] WebSocket support for real-time updates
- [ ] Historical trend analysis endpoint
- [ ] Multi-pollutant correlation analysis
- [ ] GraphQL API layer

### Phase 3 (6 Months)
- [ ] Machine learning air quality predictions
- [ ] Integration with EPA AirNow
- [ ] Mobile push notifications
- [ ] Geographic heatmap generation

---

## Philosophy in Practice

### Steve Jobs Would Approve

1. **"Focus is saying no to 1000 good ideas"**
   We could add 50 more endpoints. We didn't. Each endpoint serves a clear purpose.

2. **"Design is how it works, not just how it looks"**
   Our JSON responses are structured for clarity. Error messages guide users.

3. **"Simplicity is the ultimate sophistication"**
   Complex satellite data → Simple API call → Actionable insight

### NASA Engineer Would Approve

1. **Robustness** - Handles missing data, malformed inputs, API failures
2. **Precision** - Coordinate normalization, unit conversions, spatial interpolation
3. **Observability** - Logging, cache stats, clear error messages
4. **Documentation** - Comments explain *why*, not just *what*

---

*Designed for clarity. Built for scale. Crafted with care.*
