# 🚀 DEPLOY LIGHTHOUSE NOW - Simple 3-Step Guide

Everything is ready! Follow these exact steps to get Lighthouse live.

---

## ⏱️ Step 1: Deploy Backend (10 minutes)

### 1.1 Go to Render
👉 **https://render.com** → Sign in with GitHub

### 1.2 Create Web Service
- Click **"New +"** → **"Web Service"**
- Select repo: **`bblackheart013/lighthouse`**
- Click **"Connect"**

### 1.3 Fill in Settings (EXACT VALUES):

```
Name: lighthouse-api
Region: Oregon (US West)
Branch: master
Root Directory: flask_api
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
Instance Type: Free
```

### 1.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

**Add these 3 variables:**

1. **GEMINI_API_KEY**
   - Get free key: https://ai.google.dev/
   - Click "Get API key" → Create new key
   - Copy and paste here

2. **FIRMS_MAP_KEY**
   - Get free key: https://firms.modaps.eosdis.nasa.gov/
   - Sign up → Get map key
   - Copy and paste here

3. **WAQI_API_TOKEN**
   - Use: `demo` (or get your own from https://aqicn.org/data-platform/token/)

### 1.5 Deploy!
- Click **"Create Web Service"**
- Wait 5-10 minutes
- **COPY YOUR API URL** (looks like: `https://lighthouse-api-abc123.onrender.com`)
- **⚠️ SAVE THIS URL - YOU NEED IT FOR STEP 2!**

---

## 🎨 Step 2: Configure Vercel (5 minutes)

You already have Vercel connected! Now configure it:

### 2.1 Go to Your Vercel Project
👉 **https://vercel.com/bblackheart013s-projects**
- Find your **lighthouse** project
- Click on it

### 2.2 Go to Settings
- Click **"Settings"** tab at top
- Click **"General"** in left sidebar

### 2.3 Set Build Settings

Scroll to **"Build & Development Settings"**

**Set these EXACT values:**

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 18.x
```

Click **"Save"**

### 2.4 Set Environment Variable

- Click **"Environment Variables"** in left sidebar
- Click **"Add New"**

**Add this:**
```
Key: VITE_API_URL
Value: [PASTE YOUR RENDER URL FROM STEP 1.5 HERE]
```
Example: `https://lighthouse-api-abc123.onrender.com`

- Select: **Production**, **Preview**, **Development** (all 3)
- Click **"Save"**

---

## 🎉 Step 3: Deploy! (2 minutes)

### 3.1 Trigger Deployment
- Go to **"Deployments"** tab
- Click **"Redeploy"** button
- Select "Use existing Build Cache" → **Redeploy**

### 3.2 Wait for Build
- Wait 2-3 minutes
- Status should change to **"Ready"**

### 3.3 Visit Your Live Website!
- Click **"Visit"** button
- Or go to the URL shown (e.g., `https://lighthouse-xyz.vercel.app`)

---

## ✅ Testing Your Live Website

Your website should show:
- ✅ Dashboard loads
- ✅ Map displays
- ✅ Location search works
- ✅ Data appears (first load takes 30-60 sec as backend wakes up)

---

## 🆘 Troubleshooting

### Frontend shows "Failed to fetch"
**Solution**: Check that `VITE_API_URL` in Vercel matches your Render URL exactly (no trailing slash)

### Backend shows "Application error"
**Solution**: Check Render logs:
- Render → Your service → **"Logs"** tab
- Look for error messages
- Usually means missing API keys

### Map not showing
**Solution**: Check browser console (F12) for errors

---

## 🎯 API Keys Reference

If you need to get the API keys:

1. **Google Gemini API** (Free)
   - https://ai.google.dev/
   - Sign in with Google
   - Click "Get API key"
   - Create new key

2. **NASA FIRMS** (Free)
   - https://firms.modaps.eosdis.nasa.gov/
   - Sign up
   - Request map key
   - Check email for key

3. **WAQI** (Optional - use "demo")
   - https://aqicn.org/data-platform/token/
   - Request token
   - Or just use `demo`

---

## 📝 Your Deployment URLs

After completing steps 1-3, fill this in:

- **Backend API**: `https://lighthouse-api-______.onrender.com`
- **Frontend**: `https://lighthouse-______.vercel.app`
- **GitHub**: `https://github.com/bblackheart013/lighthouse`

---

## 🎊 YOU'RE DONE!

Once deployed, share your links:
- Update your GitHub repo description with the live URL
- Add the URL to your LinkedIn post
- Share with NASA Space Apps judges

**Total Time**: ~15 minutes
**Total Cost**: $0 (completely free!)

---

**Built by Team Interstellar Frontiers** 🚀
