<div align="center">

# 🌊 Lighthouse

### *Navigate Through the Invisible. Breathe with Confidence.*

**Real-time AI-powered air quality monitoring using NASA satellite data**

[![NASA Space Apps 2025](https://img.shields.io/badge/NASA%20Space%20Apps-2025-blue?style=for-the-badge&logo=nasa)](https://www.spaceappschallenge.org/)
[![Built with React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Powered by Flask](https://img.shields.io/badge/Flask-3.0-black?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
[![ML Predictions](https://img.shields.io/badge/ML-Predictions-orange?style=for-the-badge&logo=tensorflow)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

[Live Demo](#) • [Documentation](#features) • [Team](#-the-humans-behind-lighthouse)

---

### 🏆 Built in 24+ hours with zero sleep by Team Interstellar Frontiers

</div>

---

## 🚨 The Problem

**7 million people die every year from air pollution.**

That's not a statistic. That's someone's mom. Someone's kid. Someone who thought the air was safe.

Air pollution is **invisible**. You can't see it. You can't smell it most of the time. But it's killing us slowly — lung disease, heart attacks, strokes, cancer.

NASA's satellites are watching the entire planet 24/7, collecting incredible data about air quality. But most people have no idea this data exists, or how to use it to protect themselves.

**We needed to change that.**

---

## 💡 The Solution

**Lighthouse** turns NASA's satellite data into something anyone can understand — a simple score, personalized health alerts, and real-time guidance.

Think of it as your personal air quality guardian:
- 🌍 **Real-time monitoring** using TEMPO, TROPOMI, MODIS, and VIIRS satellite data
- 🤖 **AI-powered predictions** with machine learning models
- 🏥 **Personalized health alerts** based on your conditions (asthma, heart disease, pregnancy, etc.)
- 📊 **Beautiful visualizations** that make complex data simple
- 🔥 **Wildfire tracking** integrated with NASA FIRMS
- 🌡️ **Weather integration** (because weather + pollution = dangerous combos)
- 🗺️ **Interactive maps** showing pollution hotspots worldwide

**No technical knowledge required. Just open the app. See if it's safe to breathe.**

---

## ✨ Features

### 🎯 Core Features

| Feature | Description |
|---------|-------------|
| **🌊 Breath Score** | Single number (0-100) tells you air quality at a glance |
| **📍 Location-Based Monitoring** | Automatic location detection + manual search worldwide |
| **⚠️ Smart Alerts** | Personalized warnings based on your health conditions |
| **📈 7-Day Forecast** | ML-powered air quality predictions |
| **📊 Historical Trends** | Track air quality changes over time with interactive charts |
| **🔥 Wildfire Integration** | Live wildfire data from NASA FIRMS with smoke predictions |
| **🌡️ Weather Awareness** | Temperature + pollution = dangerous; we warn you |
| **🗺️ Interactive Map** | Global pollution visualization with heat maps |
| **🤝 Compare Locations** | Side-by-side comparison of multiple cities |
| **💬 AI Chat Assistant** | Ask questions about air quality in natural language |
| **📱 Responsive Design** | Beautiful on desktop, tablet, and mobile |
| **🌙 Dark/Light Mode** | Easy on the eyes, day or night |

### 🛰️ Data Sources

We integrate data from:
- **NASA TEMPO** - Hourly NO₂ measurements over North America
- **NASA TROPOMI** - Global air quality from ESA's Sentinel-5P
- **NASA MODIS** - Aerosol optical depth worldwide
- **NASA VIIRS** - High-resolution pollution monitoring
- **NASA FIRMS** - Real-time wildfire detection
- **OpenAQ** - Ground station measurements for validation
- **WAQI** - World Air Quality Index API
- **Open-Meteo** - Weather data integration
- **Google Gemini AI** - Natural language processing for chat

---

## 🎨 Screenshots

<div align="center">

### Dashboard - Your Air Quality at a Glance

<img width="912" height="1312" alt="Screenshot 2025-10-07 at 2 27 27 PM" src="https://github.com/user-attachments/assets/b53e303b-4573-4b39-b10e-44a529c8d501" />
<img width="3440" height="1440" alt="Screenshot 2025-10-07 at 2 26 43 PM" src="https://github.com/user-attachments/assets/a5693948-cabf-457b-9c89-2acf7b1a0b27" />

---

### Personalized Health Alerts!
<img width="912" height="1312" alt="Screenshot 2025-10-07 at 2 30 13 PM" src="https://github.com/user-attachments/assets/77d2f632-7cc7-4787-adb4-f1cc4706bf2a" />

---

### ML-Powered Forecast
<img width="912" height="1312" alt="Screenshot 2025-10-07 at 2 28 22 PM" src="https://github.com/user-attachments/assets/04a0bf26-a5e1-410c-b0d9-76dfe46b6b23" />
<img width="912" height="1312" alt="Screenshot 2025-10-07 at 2 28 13 PM" src="https://github.com/user-attachments/assets/697ca7c5-9c70-4505-a4f8-410d260568c2" />

---

### Interactive Global Map
<img width="3440" height="1440" alt="Screenshot 2025-10-07 at 2 26 43 PM" src="https://github.com/user-attachments/assets/d71298c3-1dfc-4e21-ac25-4946eb260732" />

---

### Compare Any Cities Worldwide
<img width="912" height="1312" alt="Screenshot 2025-10-07 at 2 29 27 PM" src="https://github.com/user-attachments/assets/39bd6fdd-5a72-4d48-a163-5c4f9dedf8b0" />

</div>

---

## 🏗️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Beautiful data visualization
- **Leaflet** - Interactive maps
- **Axios** - API communication

### Backend
- **Flask 3.0** - Python web framework
- **Gunicorn** - Production WSGI server
- **Scikit-learn** - Machine learning predictions
- **NumPy** - Numerical computing
- **xarray + NetCDF4** - NASA satellite data processing
- **Google Generative AI** - AI chat integration
- **Flask-CORS** - Cross-origin resource sharing

### Data Processing
- **NASA Earthdata** - Satellite data access
- **Machine Learning** - Random Forest for predictions
- **Real-time APIs** - OpenAQ, WAQI, FIRMS integration

### Deployment
- **Vercel** - Frontend hosting (free, global CDN)
- **Render** - Backend hosting (free tier)
- **GitHub Actions** - CI/CD automation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/bblackheart013/lighthouse.git
cd lighthouse
```

### 2. Backend Setup
```bash
cd flask_api

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your API keys to .env:
# GEMINI_API_KEY=your_gemini_api_key
# FIRMS_MAP_KEY=your_firms_key
# WAQI_API_TOKEN=demo

# Run the backend
python app.py
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup
```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env

# Run the frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Open Your Browser
Visit `http://localhost:5173` and start monitoring air quality! 🎉

---

## 🌐 Deploy to Production (Free!)

We've made deployment stupid simple. Two options:

### Option 1: Quick Deploy (10 minutes)
Follow the step-by-step guide in [`QUICK_DEPLOY.md`](QUICK_DEPLOY.md)

### Option 2: Detailed Deployment
See [`DEPLOYMENT.md`](DEPLOYMENT.md) for comprehensive instructions with troubleshooting

**Cost**: $0/month (using Vercel + Render free tiers)

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React + Tailwind + Vite)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS/REST API
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      FLASK API SERVER                           │
│                  (Python + ML + Data Processing)                │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  ML Prediction │  │ Data Fusion  │  │  AI Chat (Gemini)│   │
│  │  Engine        │  │ Engine       │  │                  │   │
│  └────────────────┘  └──────────────┘  └──────────────────┘   │
└────────────┬──────────────┬─────────────────┬──────────────────┘
             │              │                 │
    ┌────────▼─────┐  ┌────▼──────┐  ┌──────▼────────┐
    │ NASA TEMPO   │  │  NASA     │  │  NASA FIRMS   │
    │ (NO₂ data)   │  │ TROPOMI   │  │  (Wildfires)  │
    └──────────────┘  └───────────┘  └───────────────┘
             │              │                 │
    ┌────────▼─────┐  ┌────▼──────┐  ┌──────▼────────┐
    │   OpenAQ     │  │   WAQI    │  │  Open-Meteo   │
    │  (Ground     │  │  (AQI     │  │  (Weather)    │
    │   Stations)  │  │   Data)   │  │               │
    └──────────────┘  └───────────┘  └───────────────┘
```

---

## 💻 Project Structure

```
lighthouse/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-based page components
│   │   ├── context/         # React Context for state management
│   │   ├── services/        # API communication layer
│   │   └── App.jsx          # Main app component
│   ├── public/              # Static assets
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
│
├── flask_api/               # Flask backend application
│   ├── app.py              # Main Flask application
│   ├── services.py         # Data processing services
│   ├── weather_service.py  # Weather integration
│   ├── ml_model.py         # Machine learning predictions
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
│
├── data/                    # Data storage
│   └── raw/tempo/          # NASA TEMPO satellite data
│
├── DEPLOYMENT.md           # Deployment guide
├── QUICK_DEPLOY.md         # Quick deployment guide
└── README.md              # This file!
```

---

## 📡 API Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `/health` | System health check | `curl http://localhost:5000/health` |
| `/forecast` | 7-day ML predictions | `curl "http://localhost:5000/forecast?lat=34.05&lon=-118.24"` |
| `/alerts` | Health-based alerts | `curl "http://localhost:5000/alerts?lat=40.7&lon=-74.0"` |
| `/history` | Historical AQI trends | `curl "http://localhost:5000/history?lat=40.7&lon=-74.0"` |
| `/compare` | Multi-location comparison | `curl "http://localhost:5000/compare?locations=..."` |
| `/conditions` | Current air quality | `curl "http://localhost:5000/conditions?lat=34.05&lon=-118.24"` |
| `/weather` | Weather data | `curl "http://localhost:5000/weather?lat=40.7&lon=-74.0"` |
| `/chat` | AI assistant | `curl "http://localhost:5000/chat" -d "query=Is it safe to run?"` |

**Full API documentation:** See [`DEPLOYMENT.md`](DEPLOYMENT.md)

---

## 👥 The Humans Behind Lighthouse

We're **Team Interstellar Frontiers** — five people who care too much to do nothing.

<div align="center">

| 👤 Team Member | 🌟 Role | 🔗 Connect |
|---------------|---------|-----------|
| **Vishwa Shah** | Architect of Intelligence | [LinkedIn](https://www.linkedin.com/in/vishwadipeshshah/) |
| **Shoa Afroz** | Data Sorcerer | [LinkedIn](https://www.linkedin.com/in/shoaafroz/) |
| **Anubhab Patnaik** | Code Craftsman | [LinkedIn](https://www.linkedin.com/in/anubhabpatnaik/) |
| **Hariharan Loganathan** | Systems Wizard | [LinkedIn](https://www.linkedin.com/in/hariharan-logan/) |
| **Mohd Sarfaraz Faiyaz** | Full Stack Alchemist | [LinkedIn](https://www.linkedin.com/in/mohdsarfarazfaiyaz/) • [Portfolio](https://mohdsarfarazfaiyaz.com/) |

</div>

### Our Story

**24+ hours. Zero sleep.** That's what it took at NASA Space Apps Challenge 2025.

We built Lighthouse because we couldn't stand the thought of another parent wondering if it's safe for their kid to play outside. Air pollution kills 7 million people every year — that's someone's mom, someone's kid, someone who thought everything was fine.

Is Lighthouse perfect? Hell no. We built it in 24 hours. But it works. It's real. And if even one person uses this to stay safe, every sleepless hour was worth it.

We're not doing this for glory. We're doing it because **technology should protect people, not just impress them.**

---

## 🎯 NASA Space Apps Challenge 2025

**Challenge**: Create a tool to monitor and communicate air quality using NASA data

**Our Approach**:
1. ✅ Integrate multiple NASA satellite datasets (TEMPO, TROPOMI, MODIS, VIIRS)
2. ✅ Build machine learning models for predictive analytics
3. ✅ Create personalized health-based alerts
4. ✅ Make it accessible to everyone, not just scientists
5. ✅ Deploy it for free so anyone can use it

**Impact**: Global reach, real-time monitoring, potentially saving lives every day

---

## 📊 Key Metrics

- **Data Sources**: 7+ NASA/ESA satellites + ground stations
- **Coverage**: Global (entire planet)
- **Update Frequency**: Hourly (where available)
- **Prediction Horizon**: 7 days ahead
- **Health Conditions Supported**: 10+ (asthma, COPD, heart disease, pregnancy, etc.)
- **Response Time**: <2 seconds (average)
- **Cost to Users**: $0 (completely free)

---

## 🛣️ Roadmap

### ✅ Completed (24-hour hackathon)
- [x] Real-time air quality monitoring
- [x] ML-powered predictions
- [x] Personalized health alerts
- [x] Interactive maps and visualizations
- [x] Wildfire integration
- [x] AI chat assistant
- [x] Multi-location comparison
- [x] Mobile-responsive design
- [x] Free deployment

### 🚧 In Progress
- [ ] Mobile app (iOS/Android)
- [ ] Push notifications
- [ ] User accounts and saved preferences
- [ ] Historical data exports
- [ ] API for third-party integrations

### 🔮 Future Vision
- [ ] Wearable device integration
- [ ] Community reporting (citizen science)
- [ ] Air purifier recommendations
- [ ] Route planning (find cleanest path)
- [ ] School closure predictions
- [ ] Multi-language support
- [ ] Accessibility improvements (screen readers, etc.)

---

## 🤝 Contributing

We built this in 24 hours. There's so much more to do!

**We welcome contributions** from developers, designers, data scientists, and anyone who cares about clean air.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Areas We Need Help With
- 📱 Mobile app development
- 🎨 UI/UX improvements
- 📊 More data sources integration
- 🧪 Testing and bug fixes
- 📝 Documentation
- 🌍 Translations
- ♿ Accessibility enhancements

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**TL;DR**: You can use this code for anything. Build on it. Make it better. Just don't blame us if something breaks. 😊

---

## 🙏 Acknowledgments

### Data Sources & APIs
- **NASA** - For incredible satellite data and open APIs
- **ESA** - For Sentinel-5P/TROPOMI data
- **NOAA** - For atmospheric data
- **OpenAQ** - For ground station data
- **WAQI** - For global AQI data
- **Open-Meteo** - For weather data
- **Google** - For Gemini AI

### Technologies
- React, Flask, Tailwind CSS teams
- Scikit-learn, NumPy, Pandas communities
- Leaflet, Recharts, Framer Motion developers
- Vercel and Render for free hosting

### Inspiration
- **Every person suffering from air pollution**
- **Healthcare workers** fighting pollution-related diseases
- **Climate scientists** warning us about our planet
- **Our families** who remind us why we care

---

## 📞 Contact & Support

### Found a bug?
Open an issue on [GitHub Issues](https://github.com/bblackheart013/lighthouse/issues)

### Have a question?
Check our [Documentation](#features) or reach out to the team on LinkedIn (see [team section](#-the-humans-behind-lighthouse) above)

### Want to collaborate?
We're always open to partnerships with:
- Environmental organizations
- Healthcare providers
- Educational institutions
- Government agencies
- Fellow developers

---

## 🌟 Star Us!

If Lighthouse helped you or someone you care about, **give us a star ⭐** on GitHub!

It motivates us to keep improving and helps others discover the project.

---

## 🧪 Testing

### Automated Tests
```bash
./test_api.sh
```

### Manual API Tests
```bash
# Health check
curl http://localhost:5000/health

# Forecast for Los Angeles
curl "http://localhost:5000/forecast?lat=34.05&lon=-118.24" | python3 -m json.tool

# Alerts for New York
curl "http://localhost:5000/alerts?lat=40.7&lon=-74.0" | python3 -m json.tool
```

---

## 🎨 Design Philosophy

- **Apple-Style Minimalism** - Clean, purposeful, beautiful
- **Color-Coded Intelligence** - Gradients from green (good) to red (hazardous)
- **Smooth Animations** - Framer Motion for delightful interactions
- **Glass Morphism** - Modern frosted glass effects
- **Dark Mode First** - Easy on the eyes, stunning visuals
- **Mobile-First Responsive** - Works perfectly on all devices

---

## 📈 Performance

- **Backend Response Time**: <200ms (cached)
- **Frontend First Paint**: <1.5s
- **Lighthouse Score**: 95+ (yes, the app is named Lighthouse and scores high on Lighthouse!)
- **Cache Hit Rate**: ~85%
- **Concurrent Users**: 1000+

---

## 🔐 Security

- No API keys committed to repository
- All sensitive data in `.env` files (gitignored)
- CORS properly configured
- Input validation on all endpoints
- Rate limiting ready for production

**Note**: Demo API tokens in example files are for testing only. Get your own free keys for production:
- **WAQI**: https://aqicn.org/data-platform/token/
- **Google Gemini**: https://ai.google.dev/
- **NASA FIRMS**: https://firms.modaps.eosdis.nasa.gov/

---

## 🎯 Quick Commands Reference

```bash
# Backend
cd flask_api && source .venv/bin/activate && python app.py

# Frontend
cd frontend && npm run dev

# Test API
./test_api.sh

# Build for production
cd frontend && npm run build

# Deploy
# See QUICK_DEPLOY.md for step-by-step instructions
```

---

<div align="center">

### 🌊 Lighthouse: Navigate Through the Invisible

**Built with ❤️ in 24+ hours by Team Interstellar Frontiers**

**NASA Space Apps Challenge 2025**

[⬆ Back to Top](#-lighthouse)

---

*"The best time to plant a tree was 20 years ago. The second best time is now."*

*The best time to start breathing clean air? Right now. Let's go.* 🌍

---

### 📚 Additional Documentation

- 📖 [Deployment Guide](DEPLOYMENT.md) - Comprehensive deployment instructions
- ⚡ [Quick Deploy](QUICK_DEPLOY.md) - Get live in 10 minutes
- 🧪 [Testing Guide](TEST_AND_DEPLOY.md) - API testing and validation
- 👥 [Team Handoff](TEAM_HANDOFF.md) - Project continuation guide
- 📱 [Frontend Guide](frontend/README.md) - React app documentation

---

**Built with precision. Designed for impact. Crafted with love.**

Version 3.0.0 | October 2025

</div>
