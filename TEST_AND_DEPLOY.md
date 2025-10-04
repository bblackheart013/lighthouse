# 🧪 ClearSkies v3 - Testing & Deployment Guide

> **For the team building tomorrow's air quality intelligence platform**

---

## ✅ What's Done

### **Backend API (Flask) - 100% Complete**
- ✅ `/health` - System health check
- ✅ `/forecast` - 24-hour ML-powered AQI predictions
- ✅ `/alerts` - Proactive health alerts with cause analysis
- ✅ `/history` - 7-day historical AQI trends
- ✅ `/compare` - Satellite vs ground sensor validation
- ✅ `/conditions` - Current air quality data
- ✅ `/ground` - OpenAQ ground station data
- ✅ `/weather` - NOAA weather conditions
- ✅ CORS enabled for frontend integration
- ✅ Intelligent caching with TTL
- ✅ Multi-source data fusion (TEMPO + OpenAQ + NOAA)

### **Frontend Specifications - Ready for Implementation**
- ✅ Complete React component specifications in `FRONTEND_MOBILE_GUIDE.md`
- ✅ API service integration code
- ✅ AQI color system and utilities
- ✅ Framer Motion animation patterns
- ✅ Tailwind configuration
- ✅ `package.json` with all dependencies
- ✅ `.env.example` for configuration

### **Mobile Specifications - Ready for Implementation**
- ✅ React Native + Expo setup in `FRONTEND_MOBILE_GUIDE.md`
- ✅ Dashboard screen with location detection
- ✅ Notification service setup
- ✅ Complete project structure

---

## 🧪 Test the Backend (5 Minutes)

### **Step 1: Start the Flask Server**

```bash
# Navigate to backend directory
cd flask_api

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Start server
python app.py
```

**Expected output:**
```
🌤️  ClearSkies v3 API - "The Earth is Watching"
🚀 Server running at http://127.0.0.1:5001
```

---

### **Step 2: Run the Sanity Test Script**

Open a **new terminal** and run:

```bash
# Health check
curl http://127.0.0.1:5001/health

# Expected: {"status":"healthy","version":"3.0.0","timestamp":"..."}
```

```bash
# Test forecast for Los Angeles
curl "http://127.0.0.1:5001/forecast?lat=34.05&lon=-118.24&city=Los%20Angeles" | python3 -m json.tool

# Expected: JSON with prediction.aqi, health_guidance, data_sources
```

```bash
# Test alerts for New York
curl "http://127.0.0.1:5001/alerts?lat=40.7&lon=-74.0&threshold=100" | python3 -m json.tool

# Expected: JSON with alert_active (true/false) and alert details
```

```bash
# Test historical trends
curl "http://127.0.0.1:5001/history?lat=40.7&lon=-74.0&days=7" | python3 -m json.tool

# Expected: JSON array of historical AQI data with timestamps
```

```bash
# Test satellite vs ground comparison
curl "http://127.0.0.1:5001/compare?lat=40.7&lon=-74.0" | python3 -m json.tool

# Expected: JSON with satellite and ground_sensors data + correlation
```

---

### **Step 3: Automated Test Script**

Create `test_api.sh` in the project root:

```bash
#!/bin/bash

echo "🧪 ClearSkies v3 API Test Suite"
echo "================================"
echo ""

API_URL="http://127.0.0.1:5001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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
        ((FAIL++))
    fi
}

# Run tests
test_endpoint "Health Check" "$API_URL/health" "healthy"
test_endpoint "Forecast (LA)" "$API_URL/forecast?lat=34.05&lon=-118.24&city=Los%20Angeles" "prediction"
test_endpoint "Alerts (NY)" "$API_URL/alerts?lat=40.7&lon=-74.0&threshold=100" "alert_active"
test_endpoint "History (NY)" "$API_URL/history?lat=40.7&lon=-74.0&days=7" "history"
test_endpoint "Compare (NY)" "$API_URL/compare?lat=40.7&lon=-74.0" "comparison"
test_endpoint "Conditions (LA)" "$API_URL/conditions?lat=34.05&lon=-118.24" "current"
test_endpoint "Weather (NY)" "$API_URL/weather?lat=40.7&lon=-74.0" "temperature"

echo ""
echo "================================"
echo -e "Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Backend is ready.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Check the Flask server logs.${NC}"
    exit 1
fi
```

Run it:
```bash
chmod +x test_api.sh
./test_api.sh
```

---

## 📦 GitHub Setup & Push

### **Option 1: New Repository (First Time)**

```bash
# Navigate to project root
cd /Users/mohdsarfarazfaiyaz/signsense/clearskies/clearskies

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "🌍 ClearSkies v3 - NASA Space Apps 2025

- Complete Flask backend with ML forecasting
- Multi-source data integration (TEMPO + OpenAQ + NOAA)
- 8 production-ready API endpoints
- Frontend and mobile specifications ready
- Apple-style design system
- Comprehensive documentation

Built for NASA Space Apps Challenge 2025
The Earth is Watching. Now you can too."

# Add remote repository
git remote add origin https://github.com/anubhavpgit/SpaceAppFlask.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

### **Option 2: Existing Repository (Update)**

```bash
# Navigate to project root
cd /Users/mohdsarfarazfaiyaz/signsense/clearskies/clearskies

# Pull latest changes
git pull origin main

# Add your changes
git add .

# Commit with descriptive message
git commit -m "✨ Add v3 endpoints: alerts, history, compare

- ML-powered 24-hour forecasting
- Proactive health alerts with cause analysis
- 7-day historical AQI trends
- Satellite vs ground validation
- Complete frontend/mobile specs in FRONTEND_MOBILE_GUIDE.md"

# Push to GitHub
git push origin main
```

---

## 🎨 Frontend Integration (For Anubhav)

### **Setup React + Vite Frontend**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Verify .env contains:
# VITE_API_URL=http://127.0.0.1:5001
```

---

### **Connect to Backend API**

Create `frontend/src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Get 24-hour forecast
  getForecast: async (lat, lon, city = null) => {
    const params = { lat, lon };
    if (city) params.city = city;
    const response = await api.get('/forecast', { params });
    return response.data;
  },

  // Get air quality alerts
  getAlerts: async (lat, lon, threshold = 100) => {
    const response = await api.get('/alerts', {
      params: { lat, lon, threshold }
    });
    return response.data;
  },

  // Get 7-day historical data
  getHistory: async (lat, lon, days = 7) => {
    const response = await api.get('/history', {
      params: { lat, lon, days }
    });
    return response.data;
  },

  // Compare satellite vs ground data
  getComparison: async (lat, lon) => {
    const response = await api.get('/compare', {
      params: { lat, lon }
    });
    return response.data;
  },

  // Get current conditions
  getCurrentConditions: async (lat, lon) => {
    const response = await api.get('/conditions', {
      params: { lat, lon }
    });
    return response.data;
  },

  // Get weather data
  getWeather: async (lat, lon) => {
    const response = await api.get('/weather', {
      params: { lat, lon }
    });
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default apiService;
```

---

### **Example: Forecast Component**

```jsx
// frontend/src/pages/Forecast.jsx
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { getAQIColor, getAQIGradient } from '../utils/aqi';

export default function Forecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    try {
      const data = await apiService.getForecast(34.05, -118.24, 'Los Angeles');
      setForecast(data);
    } catch (error) {
      console.error('Error fetching forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!forecast) return <div>No data available</div>;

  const { prediction, health_guidance } = forecast;

  return (
    <div className="min-h-screen p-8">
      <div
        className="rounded-3xl p-12 text-white"
        style={{ background: getAQIGradient(prediction.aqi) }}
      >
        <h1 className="text-9xl font-bold">{prediction.aqi}</h1>
        <p className="text-3xl">{prediction.category}</p>
        <p className="mt-4 text-lg">{health_guidance.general_public}</p>
      </div>
    </div>
  );
}
```

---

### **Start Frontend Development**

```bash
# In the frontend directory
npm run dev

# Open browser at http://localhost:5173
```

**All component code is in `FRONTEND_MOBILE_GUIDE.md`** - copy/paste and customize as needed!

---

## 🚀 Deployment

### **Backend Deployment (Render.com)**

1. **Create `Procfile` in `flask_api/`:**
   ```
   web: gunicorn app:app
   ```

2. **Install gunicorn:**
   ```bash
   cd flask_api
   pip install gunicorn
   pip freeze > requirements.txt
   ```

3. **Push to GitHub** (if not done):
   ```bash
   git add .
   git commit -m "Add Procfile for deployment"
   git push origin main
   ```

4. **Deploy on Render:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repo: `anubhavpgit/SpaceAppFlask`
   - Settings:
     - **Name:** `clearskies-api`
     - **Environment:** `Python 3`
     - **Build Command:** `cd flask_api && pip install -r requirements.txt`
     - **Start Command:** `cd flask_api && gunicorn app:app`
     - **Plan:** Free
   - Click "Create Web Service"

5. **Set Environment Variables** (in Render dashboard):
   ```
   FLASK_ENV=production
   PORT=5001
   ```

6. **Get your backend URL:**
   ```
   https://clearskies-api.onrender.com
   ```

---

### **Frontend Deployment (Vercel)**

1. **Update `frontend/.env.production`:**
   ```bash
   VITE_API_URL=https://clearskies-api.onrender.com
   ```

2. **Test production build locally:**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

3. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   cd frontend
   vercel --prod
   ```

4. **Or deploy via Vercel Dashboard:**
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import `anubhavpgit/SpaceAppFlask`
   - Settings:
     - **Framework Preset:** Vite
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://clearskies-api.onrender.com
     ```
   - Click "Deploy"

5. **Your live app:**
   ```
   https://clearskies.vercel.app
   ```

---

## 📋 Checklist

### **Before Deployment**
- [ ] Backend tests passing (`./test_api.sh`)
- [ ] Flask server runs without errors
- [ ] CORS configured for production domains
- [ ] Environment variables documented
- [ ] `requirements.txt` up to date
- [ ] `Procfile` created

### **Frontend Integration**
- [ ] `npm install` completes successfully
- [ ] `.env` file created from `.env.example`
- [ ] API service connects to backend
- [ ] AQI colors rendering correctly
- [ ] All pages load without errors

### **Production Launch**
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Production environment variables set
- [ ] CORS allows production frontend URL
- [ ] API endpoints tested in production
- [ ] Screenshots added to README

---

## 🎯 Next Steps for the Team

### **Anubhav (Frontend Developer)**
1. Review `FRONTEND_MOBILE_GUIDE.md` for complete component code
2. Set up React + Vite project in `frontend/`
3. Install dependencies from `package.json`
4. Copy API service code from guide
5. Implement pages: Home, Forecast, Alerts, Trends, Compare
6. Test with local backend at `http://127.0.0.1:5001`
7. Deploy to Vercel

### **Mobile Developer (Optional)**
1. Review mobile specifications in `FRONTEND_MOBILE_GUIDE.md`
2. Initialize Expo project in `mobile/`
3. Set up location permissions
4. Implement dashboard with AQI gradients
5. Add local notifications
6. Test with backend API

### **Documentation**
- All specs in `FRONTEND_MOBILE_GUIDE.md` (16,000+ words)
- API docs in `README_V3.md`
- Main README: `README.md`

---

## 🆘 Troubleshooting

### **Backend won't start**
```bash
# Check if port 5001 is in use
lsof -ti:5001

# Kill process if needed
lsof -ti:5001 | xargs kill -9

# Check Python version
python3 --version  # Should be 3.9+

# Reinstall dependencies
cd flask_api
pip install -r requirements.txt
```

### **API returns 404**
- Verify Flask server is running on port 5001
- Check URL format: `http://127.0.0.1:5001` (not `localhost`)
- Ensure coordinates are decimal format: `lat=34.05&lon=-118.24`

### **CORS errors in frontend**
```python
# In flask_api/app.py, update CORS origins:
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://clearskies.vercel.app"  # Add production URL
        ]
    }
})
```

### **No TEMPO data available**
- Check `flask_api/tempo_data/` directory exists
- Run `python download_tempo.py` to fetch latest data
- TEMPO covers North America only (lat: 20-60°N, lon: -130 to -60°W)

---

## 📧 Support

**Team ClearSkies**
- GitHub: [@anubhavpgit](https://github.com/anubhavpgit)
- Repository: [SpaceAppFlask](https://github.com/anubhavpgit/SpaceAppFlask)

---

**Built for NASA Space Apps Challenge 2025**
*The Earth is Watching. Now you can too.* 🌍✨
