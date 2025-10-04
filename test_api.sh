#!/bin/bash

echo "🧪 ClearSkies v3 API Test Suite"
echo "================================"
echo ""

API_URL="http://127.0.0.1:5001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3

    echo -n "Testing $name... "

    response=$(curl -s "$url")
    status=$?

    if [ $status -eq 0 ] && echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo -e "${YELLOW}  Response: $response${NC}"
        ((FAIL++))
    fi
}

echo -e "${BLUE}Running Backend API Tests...${NC}"
echo ""

# Run tests
test_endpoint "Health Check" "$API_URL/health" "operational"
test_endpoint "Forecast (Los Angeles)" "$API_URL/forecast?lat=34.05&lon=-118.24&city=Los%20Angeles" "prediction"
test_endpoint "Alerts (New York)" "$API_URL/alerts?lat=40.7&lon=-74.0&threshold=100" "alert_active"
test_endpoint "History (New York)" "$API_URL/history?lat=40.7&lon=-74.0&days=7" "history"
test_endpoint "Compare (New York)" "$API_URL/compare?lat=40.7&lon=-74.0" "comparison"
test_endpoint "Conditions (Los Angeles)" "$API_URL/conditions?lat=34.05&lon=-118.24" "air_quality_index"
test_endpoint "Weather (New York)" "$API_URL/weather?lat=40.7&lon=-74.0" "temperature"
test_endpoint "Ground Sensors (NY)" "$API_URL/ground?lat=40.7&lon=-74.0" "location"

echo ""
echo "================================"
echo -e "Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Backend is ready for production.${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Frontend team can start integrating with API"
    echo "  2. Deploy backend to Render: https://render.com"
    echo "  3. Update CORS origins with production URL"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Check the Flask server logs.${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "  1. Is Flask server running? (cd flask_api && python app.py)"
    echo "  2. Check server output for errors"
    echo "  3. Verify TEMPO data exists in flask_api/tempo_data/"
    echo ""
    exit 1
fi
