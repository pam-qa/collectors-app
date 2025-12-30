# Vercel Deployment Guide

## ⚠️ Important: Why No Cards Appear

**Vercel only deploys the frontend!** Your backend API needs to be deployed separately. Here's what's happening:

1. ✅ Frontend is deployed to Vercel
2. ❌ Backend API is NOT deployed (still on localhost)
3. ❌ Frontend tries to call `/api` which doesn't exist on Vercel
4. ❌ No cards appear because API calls fail

## Solution: Deploy Backend + Configure Frontend

### Step 1: Deploy Backend to Railway or Render

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

**Quick steps:**
1. Go to [railway.app](https://railway.app) or [render.com](https://render.com)
2. Deploy from GitHub, set root directory to `server`
3. Add environment variables (DATABASE_URL, JWT_SECRET, etc.)
4. Get your backend URL (e.g., `https://your-app.railway.app`)

### Step 2: Configure Frontend API URL

In Vercel project settings → **Environment Variables**, add:

```
VITE_API_URL=https://your-app.railway.app/api
```

Replace with your actual backend URL.

### Step 3: Redeploy Frontend

After adding the environment variable, Vercel will automatically redeploy.

### Step 4: Verify

1. Visit your Vercel site
2. Open browser console (F12)
3. Check Network tab - API calls should go to your backend URL
4. Cards should now load!

## Build Settings for Vercel

- **Framework Preset**: Vite (or Other)
- **Root Directory**: `client` (set in Vercel dashboard)
- **Build Command**: (auto-detected)
- **Output Directory**: `dist`
- **Install Command**: (auto-detected)

The `vercel.json` file is configured but setting Root Directory in dashboard is cleaner.

