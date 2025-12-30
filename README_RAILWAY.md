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
   
   **IMPORTANT:** Make sure `NODE_ENV=production` is set! This tells npm to skip devDependencies (including Puppeteer).

4. **Deploy**
   - Railway will automatically detect Node.js
   - It will run: `npm ci` (with NODE_ENV=production, skips devDependencies like Puppeteer)
   - The `postinstall` script runs: `prisma generate` (Prisma CLI is in dependencies)
   - Then: `npm run build` (compiles TypeScript)
   - Then: `npm start` (starts the server)

5. **Get Your API URL**
   - Railway provides a URL like: `https://collectors-app-production.up.railway.app`
   - Your API will be accessible at that URL

6. **Update Vercel**
   - Add to Vercel environment variables: `VITE_API_URL=https://your-railway-url.railway.app/api`

## Important Notes

- **Root Directory MUST be set to `server`** in Railway settings
- **NODE_ENV=production MUST be set** - This tells `npm ci` to skip devDependencies (including Puppeteer)
- **Prisma CLI is in dependencies** - Required for the `postinstall` script to run `prisma generate`
- **Puppeteer is in devDependencies** - Only needed for local scraping scripts, not production. Railway won't install it when NODE_ENV=production
- The `postinstall` script automatically generates Prisma client after npm install
- Server listens on `0.0.0.0` to work with Railway's port binding

## Troubleshooting

### "No start command found"

**Solution:** Set Root Directory to `server` in Railway dashboard settings.

### Port Issues

The server is configured to listen on `0.0.0.0` which works with Railway's port binding.

### Database Connection

Make sure your `DATABASE_URL` is correct. For Supabase, use the connection string from:
- Supabase Dashboard → Settings → Database → Connection String (URI)
