# 🚀 Lighthouse Deployment Guide

Deploy Lighthouse for **FREE** in minutes! No credit card required.

## 📦 What You'll Deploy

- **Frontend**: React app on Vercel (free forever)
- **Backend**: Flask API on Render (free tier - 750 hours/month)

---

## 🎯 Step 1: Deploy Backend (Flask API) on Render

### 1.1 Push Code to GitHub (if not already done)

```bash
cd /Users/mohdsarfarazfaiyaz/signsense/clearskies/clearskies
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 1.2 Deploy on Render

1. Go to **[render.com](https://render.com)** and sign up (free, use GitHub account)

2. Click **"New +"** → **"Web Service"**

3. Connect your GitHub repository: `clearskies`

4. Configure:
   - **Name**: `lighthouse-api`
   - **Root Directory**: `flask_api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: `Free`

5. **Add Environment Variables** (click "Advanced"):
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   FIRMS_MAP_KEY=your_firms_key_here
   WAQI_API_TOKEN=demo (or your token)
   PYTHON_VERSION=3.11.6
   ```

6. Click **"Create Web Service"**

7. **Copy your API URL** (will be like: `https://lighthouse-api.onrender.com`)

⏳ Wait 5-10 minutes for first deployment.

---

## 🎨 Step 2: Deploy Frontend (React) on Vercel

### 2.1 Update API URL

1. Create `.env.production` in the `frontend` folder:

```bash
cd /Users/mohdsarfarazfaiyaz/signsense/clearskies/clearskies/frontend
cat > .env.production << 'EOF'
VITE_API_URL=https://lighthouse-api.onrender.com
EOF
```

Replace `https://lighthouse-api.onrender.com` with YOUR actual Render API URL from Step 1.7.

2. Commit the changes:

```bash
git add .env.production
git commit -m "Add production API URL"
git push origin main
```

### 2.2 Deploy on Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign up (free, use GitHub account)

2. Click **"Add New..."** → **"Project"**

3. Import your GitHub repository: `clearskies`

4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables**: Add this:
   ```
   VITE_API_URL=https://lighthouse-api.onrender.com
   ```
   (Replace with your actual Render API URL)

6. Click **"Deploy"**

7. **🎉 Your app is now live!** Copy the URL (like `https://lighthouse-xyz.vercel.app`)

⏳ Wait 2-3 minutes for deployment.

---

## ✅ Step 3: Test Your Deployment

1. Open your Vercel URL (e.g., `https://lighthouse-xyz.vercel.app`)

2. Test that the app loads and data appears

3. If you see errors, check:
   - Backend logs on Render dashboard
   - Frontend build logs on Vercel dashboard
   - Environment variables are set correctly

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: API returns 502/503 errors

**Solution**:
- Check Render logs for errors
- Verify environment variables are set
- Render free tier spins down after 15 min of inactivity (first request takes 30-60 seconds)

**Problem**: TEMPO data not loading

**Solution**:
- The `/data/raw/tempo` folder needs to be on the server
- For production, you may need to download TEMPO files or use cloud storage
- Or remove TEMPO features and rely on WAQI data only

### Frontend Issues

**Problem**: "Failed to fetch" errors

**Solution**:
- Check `VITE_API_URL` is set correctly in Vercel
- Verify CORS is enabled in Flask (it should be)
- Check Render API is running

**Problem**: Map not loading

**Solution**:
- Add Mapbox token to Vercel environment variables if using Mapbox

---

## 🎯 Free Tier Limits

### Render (Backend)
- ✅ 750 hours/month (plenty for one service)
- ✅ Spins down after 15 min inactivity (free tier)
- ✅ Auto-deploys from GitHub
- ⚠️ First request after spindown takes 30-60 seconds

### Vercel (Frontend)
- ✅ Unlimited bandwidth for personal projects
- ✅ 100 deployments/day
- ✅ Auto-deploys from GitHub
- ✅ Global CDN (super fast)
- ✅ Free SSL certificate

---

## 🚀 Continuous Deployment

Once set up, any `git push` automatically deploys:
- Push to GitHub → Vercel rebuilds frontend
- Push to GitHub → Render rebuilds backend

**You're done! Your app is live and free forever!** 🎉

---

## 📝 Notes for NASA Space Apps Judges

- **Live Demo**: [Your Vercel URL]
- **API Endpoint**: [Your Render URL]
- **Source Code**: [Your GitHub repo]
- **Deployment**: Fully automated, free, production-ready
- **Built in**: 24+ hours with zero sleep by Team Interstellar Frontiers

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Contact Team**: Check About page for LinkedIn profiles

---

**Built with ❤️ by Team Interstellar Frontiers**
