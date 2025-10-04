# 🚀 ClearSkies v3 - Quick Start Guide

> **Get up and running in 5 minutes**

---

## ✅ What's Complete

### **Backend (Flask API) - Ready for Production** ✓
- 8 production endpoints (forecast, alerts, history, compare, etc.)
- Machine learning forecasting engine
- Multi-source data integration (NASA TEMPO + OpenAQ + NOAA)
- CORS configured for frontend

### **Frontend Specifications - Ready to Build** ✓
- Complete React component code in `FRONTEND_MOBILE_GUIDE.md`
- `package.json` with all dependencies
- API integration examples
- Tailwind + Framer Motion setup

---

## ⚡️ Test Backend (2 Minutes)

```bash
# 1. Start Flask server
cd flask_api
source .venv/bin/activate
python app.py

# 2. In a new terminal, run tests
cd ..
./test_api.sh
```

**Expected:** `🎉 All tests passed! Backend is ready for production.`

---

## 📋 Manual Test (Optional)

```bash
# Health check
curl http://127.0.0.1:5001/health

# Get forecast for Los Angeles
curl "http://127.0.0.1:5001/forecast?lat=34.05&lon=-118.24&city=Los%20Angeles" | python3 -m json.tool

# Get alerts for New York
curl "http://127.0.0.1:5001/alerts?lat=40.7&lon=-74.0&threshold=100" | python3 -m json.tool
```

---

## 🌐 Push to GitHub

### First Time Setup

```bash
git init
git add .
git commit -m "🌍 ClearSkies v3 - NASA Space Apps 2024"
git branch -M main
git remote add origin https://github.com/anubhavpgit/SpaceAppFlask.git
git push -u origin main
```

### Update Existing Repo

```bash
git add .
git commit -m "✨ Add v3 backend + frontend specs"
git push origin main
```

---

## 🎨 Frontend Setup (For Anubhav)

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Create environment file
cp .env.example .env

# 3. Start dev server
npm run dev
```

**View at:** `http://localhost:5173`

---

## 📡 Connect Frontend to Backend

Create `frontend/src/services/api.js`:

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

export const apiService = {
  getForecast: async (lat, lon, city) => {
    const { data } = await axios.get(`${API_URL}/forecast`, {
      params: { lat, lon, city }
    });
    return data;
  },

  getAlerts: async (lat, lon, threshold = 100) => {
    const { data } = await axios.get(`${API_URL}/alerts`, {
      params: { lat, lon, threshold }
    });
    return data;
  }
};
```

**Complete component code:** See `FRONTEND_MOBILE_GUIDE.md`

---

## 🚀 Deploy

### Backend → Render

1. Add `Procfile` in `flask_api/`:
   ```
   web: gunicorn app:app
   ```

2. Add gunicorn to requirements:
   ```bash
   cd flask_api
   pip install gunicorn
   pip freeze > requirements.txt
   ```

3. Deploy on Render.com:
   - Connect GitHub repo
   - Build: `cd flask_api && pip install -r requirements.txt`
   - Start: `cd flask_api && gunicorn app:app`

### Frontend → Vercel

```bash
cd frontend
npm run build
vercel --prod
```

Set environment variable:
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## 📚 Documentation

- **Testing & Deployment:** `TEST_AND_DEPLOY.md`
- **Frontend/Mobile Guide:** `FRONTEND_MOBILE_GUIDE.md` (16,000+ words)
- **API Reference:** `README_V3.md`
- **Project Overview:** `README.md`

---

## 🆘 Need Help?

```bash
# Backend won't start?
cd flask_api
lsof -ti:5001 | xargs kill -9  # Kill process on port 5001
python app.py

# Tests failing?
./test_api.sh  # Run test suite

# Check Flask logs
# Server outputs detailed logs in terminal
```

---

**Built for NASA Space Apps Challenge 2024**
*The Earth is Watching. Now you can too.* 🌍
