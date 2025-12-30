# Supabase Setup Guide

Complete step-by-step guide to set up your database with Supabase.

## Step 1: Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with GitHub, Google, or email
4. Once logged in, click **"New Project"**
5. Fill in project details:
   - **Organization**: Create new or select existing
   - **Project Name**: `tcg-collection` (or your choice)
   - **Database Password**: ⚠️ **Choose a strong password and SAVE IT!**
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (more than enough to start)

6. Click **"Create new project"**
7. Wait 2-3 minutes for setup to complete

---

## Step 2: Get Your Database Connection String

1. Once project is ready, go to **Settings** (gear icon in left sidebar)
2. Click **"Database"** in the settings menu
3. Scroll down to **"Connection string"** section
4. **IMPORTANT**: If you see "Not IPv4 compatible" warning:
   - Click **"Pooler settings"** button
   - OR change **"Method"** dropdown to **"Session mode"** 
   - Copy the Session Pooler connection string instead
5. Otherwise, use **"URI"** tab with **"Direct connection"** method
6. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
   
   **For Session Pooler** (recommended for IPv4):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

⚠️ **Important**: 
- Replace `[YOUR-PASSWORD]` with the password you created in Step 1!
- If you see IPv4 warning, use Session Pooler connection string instead

---

## Step 3: Configure Your Project

1. Navigate to your project folder:
   ```bash
   cd server
   ```

2. Create `.env` file if it doesn't exist:
   ```bash
   copy .env.example .env
   ```
   (On Mac/Linux: `cp .env.example .env`)

3. Open `server/.env` in your editor

4. Update the `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
   ```

5. Generate a JWT secret (optional but recommended):
   ```bash
   # Windows PowerShell:
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   
   # Mac/Linux:
   openssl rand -base64 32
   ```
   
   Add it to `.env`:
   ```env
   JWT_SECRET=your-generated-secret-here
   ```

---

## Step 4: Initialize Database

1. Make sure you're in the `server` directory:
   ```bash
   cd server
   ```

2. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

3. Push database schema (creates all tables):
   ```bash
   npx prisma db push
   ```

   ✅ You should see: "All migrations have been successfully applied"

---

## Step 5: Seed Database with Sample Data

1. Run the seed script:
   ```bash
   npm run prisma:seed
   ```

   ✅ You should see:
   ```
   🌱 Starting seed...
   ✅ Admin user created: admin (admin@tcgapp.local)
   ✅ Test user created: user001 (user001@tcgapp.local)
   ✅ Sample pack created: Legend of Blue Eyes White Dragon
   ✅ Sample card created: Blue-Eyes White Dragon
   ✅ Sample card created: Dark Magician
   ✅ Sample card created: Red-Eyes Black Dragon
   ✅ Sample collection created: My First Collection
   ✅ Sample deck created: Blue-Eyes Deck
   🎉 Seed completed successfully!
   ```

---

## Step 6: Verify Everything Works

### Option A: Prisma Studio (Visual Browser)

```bash
cd server
npx prisma studio
```

Opens at `http://localhost:5555` - you can browse all your data!

### Option B: Start Your App

```bash
# From project root
npm run dev
```

Visit `http://localhost:5173` and you should see your cards!

---

## Step 7: Test Login

1. Go to `http://localhost:5173/login` (when auth page is ready)
2. Login with:
   - **Username**: `admin`
   - **Password**: `admin`

Or use the API:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

---

## Troubleshooting

### "Connection refused" or "timeout"

- Check your `DATABASE_URL` is correct
- Make sure `[YOUR-PASSWORD]` is replaced with actual password
- Verify project is active in Supabase dashboard
- Check if your IP is allowed (Settings > Database > Connection Pooling)

### "Password authentication failed"

- Double-check password in connection string matches the one you set
- Try resetting password in Supabase: Settings > Database > Database password

### "Schema already exists" errors

Reset your database (⚠️ **WARNING: Deletes all data**):
```bash
cd server
npx prisma migrate reset
npm run prisma:seed
```

### Environment variable not found

- Make sure `.env` file exists in `server/` directory
- Check file is named exactly `.env` (not `.env.txt`)
- Restart your server after changing `.env`

---

## Next Steps

✅ Database is ready! Now you can:

1. **Add more cards**: Use bulk import (see `docs/BULK_UPLOAD.md`)
2. **Set up image storage**: Enable Supabase Storage for card images (future step)
3. **Start building**: Your database is ready for development!

---

## Your Default Accounts

| Username | Password | Role | Email |
|----------|----------|------|-------|
| `admin` | `admin` | ADMIN | admin@tcgapp.local |
| `user001` | `user001` | USER | user001@tcgapp.local |

**⚠️ Change these passwords in production!**

