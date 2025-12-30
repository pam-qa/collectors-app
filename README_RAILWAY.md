# Railway Deployment Guide

## Quick Setup

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click **New Project** → **Deploy from GitHub repo**
   - Select your repository

2. **Set Root Directory**
   - In Railway project → **Settings** → **Root Directory**
   - Set to: `server`
   - This tells Railway to use the server folder as the project root

3. **Add Environment Variables**
   In Railway project → **Variables**, add:
   ```env
   DATABASE_URL=postgresql://... (from Supabase)
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=7d
   PORT=3001
   NODE_ENV=production
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```

4. **Deploy**
   - Railway will automatically detect Node.js
   - It will run: `npm install` (which runs `prisma generate` postinstall)
   - Then: `npm run build` (if needed)
   - Then: `npm start` (starts the server)

5. **Get Your API URL**
   - Railway provides a URL like: `https://collectors-app-production.up.railway.app`
   - Your API will be accessible at that URL

6. **Update Vercel**
   - Add to Vercel environment variables: `VITE_API_URL=https://your-railway-url.railway.app/api`

## Important Notes

- **Root Directory MUST be set to `server`** in Railway settings
- **Puppeteer is in devDependencies** - It's only needed for local scraping scripts, not for the production API server. This prevents Railway from downloading Chromium (300MB+) during production builds.
- The `postinstall` script in package.json automatically generates Prisma client
- Server listens on `0.0.0.0` to work with Railway's port binding
- Railway will skip devDependencies in production builds (faster deployment)

## Troubleshooting

### "No start command found"

**Solution:** Set Root Directory to `server` in Railway dashboard settings.

### Port Issues

The server is configured to listen on `0.0.0.0` which works with Railway's port binding.

### Database Connection

Make sure your `DATABASE_URL` is correct. For Supabase, use the connection string from:
- Supabase Dashboard → Settings → Database → Connection String (URI)
