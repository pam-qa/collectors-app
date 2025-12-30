# Deployment Guide

## Architecture

This is a full-stack application that requires **two separate deployments**:

1. **Frontend (Client)** → Deploy to Vercel
2. **Backend (Server)** → Deploy to Railway, Render, or similar Node.js hosting

## Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set **Root Directory** to `client` in Vercel project settings
3. Framework will auto-detect as Vite

### Step 2: Configure Environment Variables

In Vercel project settings → **Environment Variables**, add:

```
VITE_API_URL=https://your-backend-api-url.railway.app/api
```

Replace `your-backend-api-url.railway.app` with your actual backend URL.

### Step 3: Deploy

Vercel will automatically build and deploy your frontend.

---

## Backend Deployment (Railway/Render)

### Option 1: Railway (Recommended)

1. Go to [railway.app](https://railway.app) and sign up
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Set **Root Directory** to `server`
5. Railway will auto-detect Node.js

### Environment Variables (Railway)

In Railway project settings → **Variables**, add:

```env
DATABASE_URL=postgresql://... (from Supabase)
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
```

### Build & Start Commands

Railway should auto-detect, but you can set:

- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start`

### Step 3: Get Your API URL

After deployment, Railway will provide a URL like:
`https://your-app.railway.app`

Your API will be accessible at: `https://your-app.railway.app/api`

**Important:** Use this URL in your Vercel `VITE_API_URL` environment variable.

---

## Option 2: Render

1. Go to [render.com](https://render.com) and sign up
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

5. Add environment variables (same as Railway)
6. Deploy and copy the URL
7. Use this URL in Vercel `VITE_API_URL`

---

## Database Setup

Make sure your Supabase database has:

1. Schema pushed: `npx prisma db push` (or migrations)
2. Data seeded: `npm run prisma:seed` (creates default users)
3. Cards added: Run the scraper or bulk import to add cards

---

## Troubleshooting

### "No cards showing"

1. **Check API URL**: Make sure `VITE_API_URL` in Vercel points to your backend
2. **Check Backend**: Visit `https://your-api.railway.app/api/health` - should return success
3. **Check Database**: Verify cards exist in your Supabase database
4. **Check CORS**: Backend should allow requests from your Vercel domain

### CORS Issues

If you see CORS errors, update `server/src/index.ts`:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
```

Add `FRONTEND_URL` environment variable in Railway/Render with your Vercel URL.

### API Connection Issues

1. Check browser console for errors
2. Verify `VITE_API_URL` is set correctly in Vercel
3. Make sure backend is running and accessible
4. Check backend logs in Railway/Render dashboard

---

## Quick Checklist

- [ ] Backend deployed to Railway/Render
- [ ] Database connected and schema pushed
- [ ] Cards seeded/imported to database
- [ ] Backend URL copied (e.g., `https://xxx.railway.app`)
- [ ] Frontend deployed to Vercel
- [ ] `VITE_API_URL` environment variable set in Vercel
- [ ] CORS configured in backend to allow Vercel domain
- [ ] Test API endpoint: `https://your-api.railway.app/api/health`

