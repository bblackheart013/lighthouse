# ClearSkies API

> **Air quality intelligence from space to your fingertips.**

NASA TEMPO satellite observations meet ground truth and weather context in a single, elegant API.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ClearSkies API                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  TEMPO   │  │  OpenAQ  │  │   NOAA   │  │  Cache   │  │
│  │Satellite │  │ Ground   │  │ Weather  │  │  Layer   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│       │             │             │              │         │
│       └─────────────┴─────────────┴──────────────┘         │
│                        │                                    │
│                  ┌─────▼─────┐                             │
│                  │ Services  │                             │
│                  └─────┬─────┘                             │
│                        │                                    │
│                  ┌─────▼─────┐                             │
│                  │   Routes  │                             │
│                  └───────────┘                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Install dependencies
source .venv/bin/activate
pip install Flask requests earthaccess xarray netCDF4 h5netcdf cachetools

# Download TEMPO data (requires NASA Earthdata account)
python download_tempo.py --max-files 5

# Start the API
python app.py
```

## API Endpoints

### `GET /`
API documentation and available endpoints.

### `GET /health`
System health check.

**Response:**
```json
{
  "status": "operational",
  "version": "1.0.0",
  "timestamp": "2024-09-01T12:00:00Z"
}
```

### `GET /tempo?lat={lat}&lon={lon}`
NASA TEMPO satellite pollutant data (NO₂, O₃, HCHO).

**Parameters:**
- `lat` (float): Latitude (default: 40.7128)
- `lon` (float): Longitude (default: -74.0060)

**Example:**
```bash
curl "http://localhost:5001/tempo?lat=40.7&lon=-74.0"
```

**Response:**
```json
{
  "success": true,
  "request": {
    "latitude": 40.7,
    "longitude": -74.0,
    "timestamp": "2024-09-01T12:00:00Z"
  },
  "response": {
    "available": true,
    "source": "NASA TEMPO Satellite",
    "data": {
      "pollutant": "vertical_column_troposphere",
      "value": 4.55e15,
      "unit": "molecules/cm^2",
      "coordinates": {
        "requested": {"lat": 40.7, "lon": -74.0},
        "actual": {"lat": 40.736, "lon": -73.988}
      }
    }
  }
}
```

### `GET /forecast?lat={lat}&lon={lon}`
**Unified air quality forecast** - the flagship endpoint.

Merges:
- 🛰️ NASA TEMPO satellite observations
- 📍 OpenAQ ground station measurements
- 🌤️ NOAA weather conditions

**Example:**
```bash
curl "http://localhost:5001/forecast?lat=34.05&lon=-118.24"
```

**Response:**
```json
{
  "success": true,
  "forecast": {
    "location": {
      "latitude": 34.05,
      "longitude": -118.24,
      "timestamp": "2024-09-01T12:00:00Z"
    },
    "satellite": { ... },
    "ground_stations": { ... },
    "weather": { ... },
    "summary": {
      "air_quality": "moderate",
      "confidence": "very high",
      "notes": [
        "Satellite observation: 3.24e+15 molecules/cm^2",
        "Ground validation: 3 stations nearby",
        "Weather: Clear, wind 5 mph"
      ]
    }
  }
}
```

### `GET /cache/stats`
View cache performance statistics.

### `POST /cache/clear`
Clear all cached data.

## Configuration

Edit `config.py` to customize:

- Cache TTL (time-to-live)
- Data directories
- API endpoints
- Geographic bounds
- Rate limits

## Project Structure

```
flask_api/
├── app.py              # Main application (routes, error handlers)
├── config.py           # Configuration and settings
├── services.py         # Business logic (TEMPO, OpenAQ, NOAA)
├── cache.py            # Intelligent caching layer
├── tempo_util.py       # TEMPO NetCDF file utilities
├── download_tempo.py   # NASA Earthdata download script
└── README.md           # This file
```

## Design Philosophy

**Elegance:** Every line of code serves a purpose. No cruft.

**Performance:** Intelligent caching ensures fast responses without hammering data sources.

**Extensibility:** Clean separation of concerns. Add new data sources effortlessly.

**Reliability:** Production-grade error handling. Failures are graceful, not catastrophic.

**Clarity:** Code reads like prose. Comments explain *why*, not *what*.

## Development

```bash
# Run in development mode (5-minute cache)
export FLASK_ENV=development
python app.py

# Run in production mode (1-hour cache)
export FLASK_ENV=production
python app.py
```

## Credits

Built with:
- **Flask** - Web framework
- **earthaccess** - NASA Earthdata integration
- **xarray** - NetCDF data handling
- **cachetools** - Intelligent caching
- **requests** - HTTP client

Data sources:
- NASA TEMPO satellite (via Earthdata)
- OpenAQ ground stations
- NOAA Weather Service

---

*Designed for clarity. Built for scale. Crafted with care.*
