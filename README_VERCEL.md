# Vercel Deployment Guide

To deploy the frontend to Vercel:

## Option 1: Set Root Directory in Vercel Dashboard (Recommended)

1. In your Vercel project settings, go to **Settings** → **General**
2. Set **Root Directory** to `client`
3. Vercel will automatically detect Vite and use the correct build settings

## Option 2: Use vercel.json (Alternative)

The `vercel.json` file is already configured to build from the client directory.

## Environment Variables

Add these environment variables in Vercel:

- `VITE_API_URL` - Your backend API URL (e.g., `https://your-api.railway.app`)

## Build Settings

- **Framework Preset**: Vite (or Other)
- **Root Directory**: `client`
- **Build Command**: (auto-detected or `npm run build`)
- **Output Directory**: `dist`
- **Install Command**: (auto-detected or `npm install`)

## Note

The backend should be deployed separately (e.g., Railway, Render, or another Node.js hosting service).

