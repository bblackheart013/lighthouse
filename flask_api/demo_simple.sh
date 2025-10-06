#!/bin/bash
# Lighthouse Unified Intelligence Demo
# NASA Space Apps Challenge 2024

API_BASE="http://127.0.0.1:5001"

echo ""
echo "======================================================================"
echo "  Lighthouse - Unified Air Quality Intelligence"
echo "======================================================================"
echo ""
echo "  Merging three worlds of data:"
echo "    - NASA TEMPO Satellite (22,000 miles above)"
echo "    - OpenAQ Ground Stations (where we breathe)"
echo "    - NOAA Weather Service (the atmosphere's pulse)"
echo ""
echo "======================================================================"
echo ""

# 1. System Health
echo "1. System Health Check"
echo "   GET /health"
echo ""
curl -s "$API_BASE/health" | python3 -m json.tool
echo ""
echo ""

# 2. Unified Forecast - Los Angeles
echo "2. UNIFIED 24-HOUR FORECAST - Los Angeles"
echo "   GET /forecast?lat=34.05&lon=-118.24&city=Los Angeles"
echo ""
curl -s "$API_BASE/forecast?lat=34.05&lon=-118.24&city=Los%20Angeles" | python3 -m json.tool
echo ""
echo ""

# 3. Current Conditions
echo "3. Current Air Quality - New York City"
echo "   GET /conditions?lat=40.7&lon=-74.0"
echo ""
curl -s "$API_BASE/conditions?lat=40.7&lon=-74.0" | python3 -m json.tool | head -20
echo ""
echo ""

# 4. Weather
echo "4. Weather Conditions - New York"
echo "   GET /weather?lat=40.7&lon=-74.0"
echo ""
curl -s "$API_BASE/weather?lat=40.7&lon=-74.0" | python3 -m json.tool
echo ""
echo ""

# 5. Cache Stats
echo "5. Cache Performance Metrics"
echo "   GET /cache/stats"
echo ""
curl -s "$API_BASE/cache/stats" | python3 -m json.tool
echo ""
echo ""

echo "======================================================================"
echo ""
echo "  Demo Complete"
echo ""
echo "  The Earth is watching. Now you can too."
echo ""
echo "  Built for NASA Space Apps Challenge 2024"
echo "  \"Real-time Earth awareness for every citizen on Earth\""
echo ""
echo "======================================================================"
echo ""
