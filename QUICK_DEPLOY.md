# ⚡ QUICK DEPLOY - Get Lighthouse Live in 10 Minutes!

## 🎯 You Need (One-Time Setup):
1. GitHub account (free)
2. Vercel account (free - use GitHub to sign up)
3. Render account (free - use GitHub to sign up)

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### 📤 Step 1: Push to GitHub (2 minutes)

```bash
cd /Users/mohdsarfarazfaiyaz/signsense/clearskies/clearskies

# Initialize git if not already done
git init
git add .
git commit -m "Team Interstellar Frontiers - Lighthouse for NASA Space Apps 2025"

# Create a new repo on GitHub.com called "lighthouse" then:
git remote add origin https://github.com/YOUR_USERNAME/lighthouse.git
git branch -M main
git push -u origin main
```

---

### 🔧 Step 2: Deploy Backend API on Render (3 minutes)

1. Go to **https://render.com** → Sign up with GitHub

2. Click **"New +"** → **"Web Service"**

3. Connect GitHub → Select your `lighthouse` repo

4. Fill in:
   ```
   Name: lighthouse-api
   Root Directory: flask_api
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   Instance Type: Free
   ```

5. Click **"Advanced"** → Add Environment Variables:
   ```
   GEMINI_API_KEY = your_actual_gemini_key
   FIRMS_MAP_KEY = your_actual_firms_key
   WAQI_API_TOKEN = demo
   ```

6. Click **"Create Web Service"**

7. ⏳ Wait 5 minutes... then **COPY YOUR API URL**
   (looks like: `https://lighthouse-api-abc123.onrender.com`)

---

### 🎨 Step 3: Deploy Frontend on Vercel (3 minutes)

First, update the API URL:

```bash
cd /Users/mohdsarfarazfaiyaz/signsense/clearskies/clearskies/frontend

# Create production config with YOUR Render API URL
echo "VITE_API_URL=https://lighthouse-api-abc123.onrender.com" > .env.production

# Replace the URL above with your ACTUAL Render URL from Step 2!

# Commit it
git add .env.production
git commit -m "Add production API URL"
git push origin main
```

Then deploy:

1. Go to **https://vercel.com** → Sign up with GitHub

2. Click **"Add New..."** → **"Project"**

3. Import your `lighthouse` repo

4. Configure:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

5. Environment Variables:
   ```
   VITE_API_URL = https://lighthouse-api-abc123.onrender.com
   ```
   (Paste YOUR Render URL!)

6. Click **"Deploy"**

7. ⏳ Wait 2 minutes... then **YOUR APP IS LIVE!** 🎉

---

## ✅ Step 4: Test It!

Click your Vercel URL (e.g., `https://lighthouse-xyz.vercel.app`)

You should see:
- ✅ Dashboard loads
- ✅ Map shows up
- ✅ Data appears (might take 30-60 sec on first load - Render free tier spins up)

---

## 🎉 DONE! Share Your Links:

**Frontend**: https://your-app.vercel.app
**API**: https://your-api.onrender.com
**GitHub**: https://github.com/YOUR_USERNAME/lighthouse

---

## 💡 Pro Tips:

1. **Custom Domain** (optional):
   - Vercel lets you add a custom domain for free
   - Go to Project Settings → Domains

2. **Faster Backend** (optional):
   - Render free tier sleeps after 15 min
   - Upgrade to $7/month for always-on
   - Or use https://fly.io which has better free tier

3. **Auto-Deploy**:
   - Every `git push` automatically deploys
   - Vercel = instant (30 sec)
   - Render = 2-3 minutes

---

## 🆘 Something Not Working?

### Backend Issues:

**"Application failed to respond"**
- Wait 60 seconds and refresh (free tier wakes up)
- Check Render logs for errors

**"Module not found"**
- Check `requirements.txt` is in `flask_api` folder
- Verify Build Command is correct

### Frontend Issues:

**"Failed to fetch"**
- Wrong API URL in `.env.production`
- CORS issue (should be fine, but check Render logs)

**"404 on page refresh"**
- Fixed by `vercel.json` rewrites (already added)

---

## 📊 Free Tier Limits:

**Render**:
- 750 hours/month (one service = plenty)
- Sleeps after 15 min (wakes in 30-60 sec)

**Vercel**:
- Unlimited personal projects
- 100GB bandwidth/month
- No sleep/spindown

Both auto-deploy from GitHub ✨

---

**That's it! Lighthouse is now live and accessible to anyone worldwide! 🌍**

Built in 24+ hours with zero sleep by **Team Interstellar Frontiers** 🚀
