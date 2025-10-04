#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# ClearSkies Unified Intelligence Demo
# NASA Space Apps Challenge 2024
# ═══════════════════════════════════════════════════════════════════════════

API_BASE="http://127.0.0.1:5001"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🌤️  ClearSkies - Unified Air Quality Intelligence"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Merging three worlds of data:"
echo "    🛰️  NASA TEMPO Satellite (22,000 miles above)"
echo "    🌍 OpenAQ Ground Stations (where we breathe)"
echo "    🌤️  NOAA Weather Service (the atmosphere's pulse)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# 1. System Health
# ═══════════════════════════════════════════════════════════════════════════

echo "1️⃣  System Health Check"
echo "   GET /health"
echo ""
curl -s "$API_BASE/health" | python3 -m json.tool | head -5
echo ""
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# 2. ⭐ Unified Forecast - Los Angeles
# ═══════════════════════════════════════════════════════════════════════════

echo "2️⃣  ⭐ Unified 24-Hour Forecast - Los Angeles ⭐"
echo "   GET /forecast?lat=34.05&lon=-118.24&city=Los Angeles"
echo ""
echo "   Merges satellite predictions + ground validation + weather impact"
echo ""

curl -s "$API_BASE/forecast?lat=34.05&lon=-118.24&city=Los%20Angeles" | python3 -c "
import sys, json
from datetime import datetime

data = json.load(sys.stdin)

if 'prediction' in data:
    p = data['prediction']
    loc = data['location']
    health = data['health_guidance']
    sources = data['data_sources']

    print(f'   📍 Location: {loc[\"city\"]}')
    print(f'   📅 Forecast Time: {data[\"forecast_time\"][:19]}')
    print('')
    print(f'   🔮 PREDICTION:')
    print(f'      AQI: {p[\"aqi\"]} ({p[\"category\"]})')
    print(f'      Risk Level: {p[\"risk_level\"].upper()}')
    print(f'      Confidence: {p[\"confidence\"]}')
    print('')
    print(f'   💡 HEALTH GUIDANCE:')
    print(f'      General: {health[\"general_public\"]}')
    print(f'      Sensitive Groups: {health[\"sensitive_groups\"]}')
    print(f'      Activities: {health[\"outdoor_activities\"]}')
    print('')
    print(f'   📊 DATA SOURCES:')
    print(f'      🛰️  Satellite: {'✓ Available' if sources['satellite']['available'] else '✗ Unavailable'}')
    if sources['satellite']['available']:
        print(f'         Data Points: {sources[\"satellite\"][\"data_points\"]}')
        print(f'         R²: {sources[\"satellite\"][\"r_squared\"]}')
    print(f'      🌍 Ground: {'✓ Available' if sources['ground_sensors']['available'] else '✗ No stations nearby'}')
    print(f'      🌤️  Weather: {'✓ Available' if sources['weather']['available'] else '✗ Unavailable'}')
    if sources['weather']['available']:
        print(f'         Conditions: {sources[\"weather\"][\"conditions\"]}')
        print(f'         Temperature: {sources[\"weather\"][\"temperature\"]}')
else:
    print(f'   ✗ {data.get(\"message\", \"Prediction unavailable\")}')
"
echo ""
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# 3. Current Conditions - New York
# ═══════════════════════════════════════════════════════════════════════════

echo "3️⃣  Current Air Quality - New York City"
echo "   GET /conditions?lat=40.7&lon=-74.0"
echo ""

curl -s "$API_BASE/conditions?lat=40.7&lon=-74.0" | python3 -c "
import sys, json

data = json.load(sys.stdin)

if data.get('air_quality_index'):
    aqi = data['air_quality_index']
    print(f'   AQI: {aqi}')
    print(f'   Advisory: {data[\"advisory\"]}')

    if data['pollutants']:
        print(f'   Pollutants:')
        for name, info in data['pollutants'].items():
            print(f'      {name}: {info[\"value\"]} {info[\"unit\"]} ({info[\"source\"]})')

    if data['weather']:
        w = data['weather']
        print(f'   Weather: {w.get(\"temp\", \"--\")}°{w.get(\"temp_unit\", \"\")} - {w.get(\"conditions\", \"Unknown\")}')
else:
    print('   Limited data available')
"
echo ""
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# 4. Ground Sensors
# ═══════════════════════════════════════════════════════════════════════════

echo "4️⃣  Ground Station Data - New York"
echo "   GET /ground?lat=40.7&lon=-74.0&radius=25"
echo ""

curl -s "$API_BASE/ground?lat=40.7&lon=-74.0&radius=25" | python3 -c "
import sys, json

data = json.load(sys.stdin)

if data['data']:
    print(f'   Found {len(data[\"data\"])} pollutant types within {data[\"radius_km\"]}km')
    for pollutant, info in data['data'].items():
        print(f'      {pollutant}: {info[\"value\"]} {info[\"unit\"]}')
else:
    print(f'   No ground stations within {data[\"radius_km\"]}km')
    print('   (OpenAQ API may be unavailable)')
"
echo ""
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# 5. Weather Conditions
# ═══════════════════════════════════════════════════════════════════════════

echo "5️⃣  Weather Conditions - New York"
echo "   GET /weather?lat=40.7&lon=-74.0"
echo ""

curl -s "$API_BASE/weather?lat=40.7&lon=-74.0" | python3 -c "
import sys, json

data = json.load(sys.stdin)

if data['weather']:
    w = data['weather']
    print(f'   Temperature: {w[\"temperature\"]}°{w[\"temperature_unit\"]}')
    print(f'   Conditions: {w[\"conditions\"]}')
    print(f'   Wind: {w[\"wind_speed\"]} {w[\"wind_direction\"]}')
else:
    print('   Weather data unavailable')
"
echo ""
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# 6. Cache Performance
# ═══════════════════════════════════════════════════════════════════════════

echo "6️⃣  Cache Performance Metrics"
echo "   GET /cache/stats"
echo ""

curl -s "$API_BASE/cache/stats" | python3 -c "
import sys, json

data = json.load(sys.stdin)

for cache_name, stats in data['caches'].items():
    print(f'   {cache_name.capitalize()}: {stats[\"size\"]}/{stats[\"max_size\"]} entries, {stats[\"ttl_seconds\"]}s TTL')
    print(f'      Hits: {stats[\"hits\"]} | Misses: {stats[\"misses\"]}')
"
echo ""
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# Closing
# ═══════════════════════════════════════════════════════════════════════════

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ✨ Demo Complete"
echo ""
echo "  💡 The Earth is watching. Now you can too."
echo ""
echo "  🚀 Built for NASA Space Apps Challenge 2024"
echo "     \"Real-time Earth awareness for every citizen on Earth\""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
