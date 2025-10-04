# 🌤️ ClearSkies v3 - Frontend

> **"The future of air isn't just predicted — it's understood."**

A cinematic, Apple-style air quality intelligence dashboard powered by NASA TEMPO satellite data.

---

## 🎨 Built With

- **React 18.3** - UI library
- **Vite 5.4** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first styling
- **Framer Motion 11** - Smooth animations
- **Recharts 2.13** - Beautiful data visualizations
- **Axios 1.7** - HTTP client
- **React Router 6** - Client-side routing
- **Lucide React** - Clean iconography

---

## 🚀 Quick Start

### **1. Install Dependencies**

```bash
npm install
```

### **2. Configure Environment**

The `.env` file is already configured to connect to your local Flask backend:

```bash
VITE_API_URL=http://127.0.0.1:5001
VITE_DEFAULT_LAT=34.05
VITE_DEFAULT_LON=-118.24
VITE_DEFAULT_CITY=Los Angeles
```

### **3. Start Development Server**

```bash
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

**Backend must be running at:** `http://127.0.0.1:5001`

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx       # Navigation with mobile menu
│   │   ├── Footer.jsx       # NASA attribution
│   │   ├── AQICard.jsx      # Color-coded AQI display
│   │   └── LoadingSpinner.jsx  # Loading states
│   │
│   ├── pages/               # Route pages
│   │   ├── Dashboard.jsx    # Current AQI + weather
│   │   ├── Forecast.jsx     # 24-hour predictions
│   │   ├── History.jsx      # 7-day trends
│   │   ├── Compare.jsx      # Satellite vs ground
│   │   ├── Alerts.jsx       # Health alerts
│   │   └── About.jsx        # Mission statement
│   │
│   ├── services/
│   │   └── api.js           # Backend API integration
│   │
│   ├── utils/
│   │   └── aqi.js           # AQI color & category logic
│   │
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
│
├── public/                  # Static assets
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind setup
└── package.json            # Dependencies
```

---

## 🌐 Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Live AQI with health recommendations |
| `/forecast` | Forecast | 24-hour ML prediction chart |
| `/history` | History | 7-day trend analysis |
| `/compare` | Compare | Satellite vs ground validation |
| `/alerts` | Alerts | Proactive health alerts |
| `/about` | About | NASA Space Apps mission |

---

## 🎨 Design System

### **Color Palette**

```javascript
// AQI Colors (EPA Standard)
Good: #38ef7d              // 0-50
Moderate: #fddb3a          // 51-100
Unhealthy: #ff7b54         // 101-150
Very Unhealthy: #d63447    // 151-200
Hazardous: #4a0e0e         // 201+
```

### **Typography**

- **Font Family:** Inter, SF Pro Display
- **Hero AQI:** 4-10rem, bold, responsive
- **Headings:** 1.5-3rem, semibold
- **Body:** 1rem, regular

### **Animations**

- **Fade In:** 0.5s ease-out (Framer Motion)
- **Slide Up:** 0.5s ease-out
- **Hover Lift:** translateY(-4px)
- **Gradient Shift:** Smooth color transitions

---

## 🔌 API Integration

The frontend connects to the Flask backend using `src/services/api.js`:

```javascript
import apiService from './services/api';

// Get 24-hour forecast
const data = await apiService.getForecast(34.05, -118.24, 'Los Angeles');

// Get health alerts
const alerts = await apiService.getAlerts(34.05, -118.24, 100);

// Get 7-day history
const history = await apiService.getHistory(34.05, -118.24, 7);
```

All endpoints are documented in `../TEST_AND_DEPLOY.md`

---

## 📊 Key Features

### **Dashboard**
- Real-time AQI with color-coded gradient background
- Current weather conditions from NOAA
- Health recommendations for general public & sensitive groups
- Auto-refresh every 60 seconds

### **Forecast**
- Interactive LineChart showing 24-hour AQI prediction
- Confidence score (R² value) from ML model
- Risk level classification (minimal → severe)
- Data source indicators (satellite, ground, weather)

### **History**
- 7-day trend AreaChart
- Satellite vs ground comparison
- Trend direction indicators (improving/deteriorating)
- Historical data table

### **Compare**
- Side-by-side satellite vs ground measurements
- Correlation percentage
- Visual deviation indicators
- Data quality metrics

### **Alerts**
- Dynamic alert generation when AQI > threshold
- Severity badges (minimal → severe)
- Expandable action items
- Cause analysis (pollution sources + weather)

### **About**
- NASA Space Apps Challenge 2025 context
- Mission statement
- Data source attribution (TEMPO, OpenAQ, NOAA)
- Team information

---

## 🛠️ Development

### **Available Scripts**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### **Environment Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://127.0.0.1:5001` |
| `VITE_DEFAULT_LAT` | Default latitude | `34.05` |
| `VITE_DEFAULT_LON` | Default longitude | `-118.24` |
| `VITE_DEFAULT_CITY` | Default city name | `Los Angeles` |

---

## 🚢 Deployment

### **Build for Production**

```bash
npm run build
```

Output: `dist/` directory (optimized, minified)

### **Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables in Vercel:**
```
VITE_API_URL=https://your-backend.onrender.com
```

### **Deploy to Netlify**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

Build command: `npm run build`
Publish directory: `dist`

---

## 📱 Responsive Design

- **Mobile:** < 768px - Single column, touch-friendly
- **Tablet:** 768px - 1024px - 2-column grid
- **Desktop:** > 1024px - Multi-column layouts

Tested on:
- iOS Safari
- Chrome Mobile
- Chrome Desktop
- Firefox Desktop

---

## ♿ Accessibility

- Semantic HTML5 elements
- ARIA labels for screen readers
- Keyboard navigation support
- Color contrast WCAG AA compliant
- Focus indicators on all interactive elements

---

## 🐛 Troubleshooting

### **Frontend won't start**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **API connection errors**

1. Verify backend is running: `curl http://127.0.0.1:5001/health`
2. Check `.env` has correct `VITE_API_URL`
3. Ensure CORS is enabled in Flask backend

### **Charts not displaying**

- Verify Recharts is installed: `npm list recharts`
- Check browser console for errors
- Ensure data is being fetched from API

### **Tailwind styles not working**

```bash
# Rebuild Tailwind
npm run build
```

---

## 📈 Performance

- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Lighthouse Score:** 95+
- **Bundle Size:** < 500KB (gzipped)

---

## 🙏 Attribution

**Data Sources:**
- **NASA TEMPO** - Satellite NO₂ observations
- **OpenAQ** - Ground sensor network
- **NOAA** - Weather data

**Built for NASA Space Apps Challenge 2025**

---

## 📧 Support

**Repository:** [github.com/anubhavpgit/SpaceAppFlask](https://github.com/anubhavpgit/SpaceAppFlask)

**Documentation:**
- API Reference: `../README_V3.md`
- Testing Guide: `../TEST_AND_DEPLOY.md`
- Team Handoff: `../TEAM_HANDOFF.md`

---

## 🎯 Quick Commands

```bash
# Complete setup
npm install && npm run dev

# Build and preview
npm run build && npm run preview

# Deploy to Vercel
vercel --prod
```

---

**"The Earth is watching. Now you can too."** 🌍✨
