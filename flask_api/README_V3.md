# 🌤️ ClearSkies v3 - Full Stack Air Quality Intelligence

> *"The Earth is Watching. Now you can too."*

---

## 🎯 What is ClearSkies v3?

ClearSkies v3 is a **production-grade, full-stack web application** that transforms NASA TEMPO satellite data into actionable air quality insights. Built with scientific precision and Apple-level design, it merges data from space, earth, and sky into one elegant experience.

### **The Vision**
Real-time Earth awareness for every citizen on Earth.

---

## 🚀 Quick Start

### **Backend (Flask API)**

```bash
# Navigate to flask_api directory
cd flask_api

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API
python app.py
```

API will be available at `http://localhost:5001`

### **Frontend (React - Coming Soon)**

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 📡 API Endpoints

### **Core Intelligence**

#### **1. GET /forecast** ⭐ Flagship Endpoint
24-hour predictive air quality forecast with ML-powered predictions.

**Request:**
```bash
curl "http://localhost:5001/forecast?lat=34.05&lon=-118.24&city=Los Angeles"
```

**Response:**
```json
{
  "location": {
    "city": "Los Angeles",
    "lat": 34.05,
    "lon": -118.24
  },
  "forecast_time": "2025-10-05T13:07:30Z",
  "prediction": {
    "aqi": 191,
    "category": "Unhealthy",
    "confidence": "low",
    "risk_level": "high",
    "no2_molecules_cm2": 3.006e+16
  },
  "health_guidance": {
    "general_public": "Reduce outdoor activities tomorrow",
    "sensitive_groups": "Should avoid all outdoor activities",
    "outdoor_activities": "Move activities indoors if possible"
  },
  "data_sources": {
    "satellite": {
      "available": true,
      "data_points": 6,
      "r_squared": 0.193
    },
    "ground_sensors": {"available": false},
    "weather": {
      "available": true,
      "conditions": "Patchy Fog then Mostly Sunny",
      "temperature": "77°F"
    }
  },
  "model": "Linear Regression"
}
```

---

#### **2. GET /alerts** ⚠️ Proactive Alerts
Generates dynamic alerts when AQI exceeds safe thresholds.

**Request:**
```bash
curl "http://localhost:5001/alerts?lat=34.05&lon=-118.24&threshold=100"
```

**Response:**
```json
{
  "alert_active": true,
  "current_aqi": 191,
  "threshold": 100,
  "category": "Unhealthy",
  "alert": {
    "severity": "high",
    "headline": "Air Quality Alert: Unhealthy",
    "message": "AQI is predicted to reach 191 tomorrow due to elevated nitrogen dioxide levels from vehicle emissions.",
    "health_guidance": "Reduce outdoor activities tomorrow",
    "actions": [
      "Check AQI before going outside",
      "Keep windows closed during peak pollution hours",
      "Wear an N95 mask outdoors",
      "Avoid outdoor exercise",
      "Use air purifiers indoors"
    ],
    "forecast_trend": "deteriorating"
  }
}
```

---

#### **3. GET /history** 📈 Historical Trends
Returns past 7 days of AQI data for trend analysis.

**Request:**
```bash
curl "http://localhost:5001/history?lat=40.7&lon=-74.0&days=7"
```

**Response:**
```json
{
  "location": {"lat": 40.7, "lon": -74.0},
  "period_days": 7,
  "data_points": 6,
  "history": [
    {
      "timestamp": "2025-10-04T12:25:56Z",
      "aqi": 90,
      "category": "Moderate",
      "no2_value": 4.553e+15
    },
    {
      "timestamp": "2025-10-04T13:07:30Z",
      "aqi": 104,
      "category": "Unhealthy for Sensitive Groups",
      "no2_value": 5.999e+15
    }
  ],
  "unit": "AQI",
  "source": "NASA TEMPO Satellite"
}
```

---

#### **4. GET /compare** 🔬 Satellite vs Ground
Compares NASA TEMPO satellite readings with OpenAQ ground sensors.

**Request:**
```bash
curl "http://localhost:5001/compare?lat=40.7&lon=-74.0"
```

**Response:**
```json
{
  "comparison": {
    "satellite": {
      "aqi": 111,
      "no2_molecules_cm2": 7.802e+15,
      "source": "NASA TEMPO"
    },
    "ground": {
      "no2_ppb": 155.2,
      "unit": "ppb",
      "source": "OpenAQ Ground Stations"
    },
    "correlation": "good",
    "deviation_percent": 12.4,
    "satellite_ppb": 156.04,
    "ground_ppb": 155.2
  }
}
```

---

### **Supporting Endpoints**

- **GET /conditions** - Current real-time air quality
- **GET /ground** - Ground sensor data
- **GET /weather** - NOAA weather conditions
- **GET /health** - System health check
- **GET /cache/stats** - Performance metrics
- **POST /cache/clear** - Clear caches

---

## 🛠️ Technology Stack

### **Backend**
- **Flask 3.x** - Web framework
- **NumPy** - Numerical computing
- **xarray + netCDF4** - NASA TEMPO data processing
- **scikit-learn** - Machine learning forecasting
- **cachetools** - Intelligent caching
- **flask-cors** - Frontend integration
- **colorama** - Beautiful terminal output

### **Frontend (Architecture)**
- **React 18+** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Leaflet.js** - Map visualization
- **Axios** - API client

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Dashboard   │  │  Map View    │  │  Alerts      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────┐
│                    Flask Backend                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Routes (app.py)                                 │  │
│  └─────────────────┬────────────────────────────────┘  │
│  ┌─────────────────▼────────────────────────────────┐  │
│  │  Services Layer                                  │  │
│  │  • TempoService  • OpenAQService  • NOAA        │  │
│  └─────────────────┬────────────────────────────────┘  │
│  ┌─────────────────▼────────────────────────────────┐  │
│  │  ML Prediction Engine (predictor.py)            │  │
│  └─────────────────┬────────────────────────────────┘  │
│  ┌─────────────────▼────────────────────────────────┐  │
│  │  Cache Layer (TTL-based)                        │  │
│  └──────────────────────────────────────────────────┘  │
└───────────┬────────────┬────────────┬────────────────────┘
            │            │            │
   ┌────────▼───┐  ┌────▼────┐  ┌───▼──────┐
   │ NASA TEMPO │  │ OpenAQ  │  │   NOAA   │
   │ Satellite  │  │ Sensors │  │  Weather │
   └────────────┘  └─────────┘  └──────────┘
```

---

## 🎨 Frontend Design Spec

### **Dashboard Layout**

```
┌────────────────────────────────────────────────────────┐
│  Header: "ClearSkies — The Earth is Watching"         │
│  Search: [Enter city or coordinates...]         🔍    │
├────────────────────────────────────────────────────────┤
│                                                        │
│   ┌──────────────────────────────────────────────┐   │
│   │         Hero AQI Display                     │   │
│   │                                              │   │
│   │              191                             │   │
│   │           Unhealthy                          │   │
│   │              🌍                              │   │
│   │                                              │   │
│   │   Background: Gradient (#ff7b54 → #d63447) │   │
│   └──────────────────────────────────────────────┘   │
│                                                        │
│   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│   │ NO₂  │  │  O₃  │  │ PM₂.₅│  │ Temp │           │
│   │  156 │  │  32  │  │  45  │  │ 77°F │           │
│   └──────┘  └──────┘  └──────┘  └──────┘           │
│                                                        │
│   Risk Banner: "High risk — limit outdoor activity"   │
│                                                        │
├────────────────────────────────────────────────────────┤
│                   Map Visualization                    │
│   [Interactive Leaflet map with AQI overlay]          │
├────────────────────────────────────────────────────────┤
│              24-Hour Forecast Graph                    │
│   [Recharts line chart with AQI predictions]          │
├────────────────────────────────────────────────────────┤
│  Footer: "The people who are crazy enough to think    │
│  they can change the world are the ones who do."      │
│  — Steve Jobs                                          │
└────────────────────────────────────────────────────────┘
```

### **Color Palette**

```javascript
const aqiColors = {
  good: '#38ef7d',           // 0-50
  moderate: '#fddb3a',       // 51-100
  unhealthy: '#ff7b54',      // 101-150
  veryUnhealthy: '#d63447',  // 151-200
  hazardous: '#4a0e0e'       // 201+
}
```

---

## 📦 Deployment

### **Backend Deployment (Render/Railway)**

1. **Create `requirements.txt`:**
```txt
Flask==3.1.2
flask-cors==6.0.1
numpy==1.24.3
xarray==2023.5.0
netCDF4==1.6.4
h5netcdf==1.2.0
scikit-learn==1.3.0
cachetools==5.3.1
requests==2.31.0
colorama==0.4.6
earthaccess==0.9.0
```

2. **Create `Procfile`:**
```
web: gunicorn app:app
```

3. **Install gunicorn:**
```bash
pip install gunicorn
```

4. **Deploy:**
```bash
git push heroku main
# or use Render/Railway GUI
```

### **Frontend Deployment (Vercel/Netlify)**

1. **Build for production:**
```bash
npm run build
```

2. **Environment variables:**
```
VITE_API_URL=https://your-backend.onrender.com
```

3. **Deploy:**
```bash
vercel --prod
# or netlify deploy --prod
```

---

## 🧪 Example API Responses

### **Alert Response (AQI > 100)**
```json
{
  "alert_active": true,
  "severity": "high",
  "headline": "Air Quality Alert: Unhealthy",
  "actions": [
    "Check AQI before going outside",
    "Wear an N95 mask outdoors",
    "Use air purifiers indoors"
  ]
}
```

### **Historical Trend (Past Week)**
```json
{
  "history": [
    {"timestamp": "2025-10-01T12:00:00Z", "aqi": 85},
    {"timestamp": "2025-10-02T12:00:00Z", "aqi": 92},
    {"timestamp": "2025-10-03T12:00:00Z", "aqi": 104},
    {"timestamp": "2025-10-04T12:00:00Z", "aqi": 117}
  ]
}
```

---

## 🌍 Impact

### **What This Enables**

1. **Citizens** can make informed decisions about outdoor activities
2. **Health Officials** can issue proactive air quality alerts
3. **Researchers** can study satellite vs ground sensor correlations
4. **Educators** can demonstrate real-world space technology applications

### **Scalability**
- Covers North America (TEMPO satellite footprint)
- Extensible to other pollutants (O₃, HCHO, SO₂)
- Ready for global deployment with additional satellites

---

## 🔮 Future Enhancements

- [ ] WebSocket real-time updates
- [ ] Historical trend analysis (30 days)
- [ ] Multi-pollutant correlation heatmaps
- [ ] Mobile app (React Native)
- [ ] Push notifications for alerts
- [ ] Social media integration
- [ ] Public API with authentication

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **NASA Earthdata** for TEMPO satellite data
- **OpenAQ** for global ground station network
- **NOAA** for weather data API
- **The Python & React Communities**

---

## 🌎 The Earth's Whisper

*"The future of air isn't just predicted — it's understood."*

---

**Created for:** NASA Space Apps Challenge 2024
**Team:** ClearSkies
**Version:** 3.0.0
**Contact:** [Your Contact Information]

---

*Built with precision. Designed for impact. Crafted with love.*
