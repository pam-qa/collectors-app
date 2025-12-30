# Database Setup & Population Guide

This guide will help you set up and populate your database with sample data.

## Step 1: Choose Your Database Option

### Option A: Docker (Easiest - Recommended for Development)

**Prerequisites:** Docker Desktop installed

1. Start PostgreSQL container:
   ```bash
   docker-compose up -d
   ```

2. This creates a PostgreSQL database at `localhost:5432` with:
   - Database: `tcg_collection`
   - Username: `postgres`
   - Password: `postgres`

3. Copy environment file:
   ```bash
   cd server
   cp .env.example .env
   ```

   The `.env` file should already have the Docker DATABASE_URL configured.

---

### Option B: Local PostgreSQL

**Prerequisites:** PostgreSQL installed locally

1. Create database:
   ```sql
   CREATE DATABASE tcg_collection;
   ```

2. Copy and configure environment:
   ```bash
   cd server
   cp .env.example .env
   ```

3. Edit `.env` and set:
   ```env
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/tcg_collection?schema=public
   ```

---

### Option C: Supabase (Cloud - Free Tier)

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string (URI format)
5. Create `.env` file:
   ```bash
   cd server
   cp .env.example .env
   ```
6. Paste your Supabase connection string in `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
   ```

---

## Step 2: Set Up JWT Secret

Edit `server/.env` and set a secure JWT secret:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Generate a secure random string:
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Step 3: Initialize Database Schema

Run Prisma to create tables:

```bash
cd server
npx prisma generate
npx prisma db push
```

This will:
- Generate Prisma Client
- Create all database tables based on your schema

---

## Step 4: Seed the Database

Populate with sample data:

```bash
cd server
npm run prisma:seed
```

**What gets seeded:**
- ✅ **Admin user**: `admin` / `admin`
- ✅ **Test user**: `user001` / `user001`
- ✅ **Sample pack**: "Legend of Blue Eyes White Dragon" (LOB)
- ✅ **3 sample cards**: 
  - Blue-Eyes White Dragon
  - Dark Magician
  - Red-Eyes Black Dragon
- ✅ **Sample collection** (for user001)
- ✅ **Sample deck** (for user001)

---

## Step 5: Verify Database

Check that data was created:

```bash
cd server
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can:
- Browse all tables
- View the seeded data
- Manually add/edit records

---

## Adding More Cards

### Method 1: Bulk Import (Recommended)

Use the bulk import API endpoint (see `docs/BULK_UPLOAD.md`):

```bash
# Using JSON file
curl -X POST http://localhost:3001/api/admin/cards/bulk-import \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@examples/cards-bulk-import.json" \
  -F "pack_id=YOUR_PACK_ID"
```

### Method 2: Single Card API

```bash
curl -X POST http://localhost:3001/api/admin/cards \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "card_number": "LOB-EN004",
    "name": "Dark Magician Girl",
    "card_type": "MONSTER",
    "frame_color": "EFFECT",
    "attribute": "DARK",
    "monster_type": "Spellcaster",
    "level": 6,
    "atk": "2000",
    "def": "1700",
    "rarity": "SUPER_RARE",
    "pack_id": "YOUR_PACK_ID"
  }'
```

### Method 3: Prisma Studio (Manual)

1. Run `npx prisma studio`
2. Navigate to Cards table
3. Click "Add record"
4. Fill in the fields manually

---

## Troubleshooting

### "Environment variable not found: DATABASE_URL"

- Make sure `.env` file exists in `server/` directory
- Check that DATABASE_URL is set correctly
- Restart your server after changing `.env`

### "Connection refused" or "Can't reach database server"

**Docker option:**
```bash
docker-compose ps  # Check if container is running
docker-compose logs  # Check for errors
docker-compose restart  # Restart container
```

**Local PostgreSQL:**
- Make sure PostgreSQL service is running
- Check connection string is correct
- Verify port 5432 is not blocked

**Supabase:**
- Check your connection string
- Verify project is active
- Check if IP is allowed (Settings > Database > Connection Pooling)

### "Schema already exists" errors

Reset database (⚠️ **WARNING: Deletes all data**):
```bash
cd server
npx prisma migrate reset
npm run prisma:seed
```

### Port already in use

If port 5432 is taken:
1. Change Docker port in `docker-compose.yml`
2. Update DATABASE_URL in `.env` accordingly

---

## Quick Start Commands

```bash
# Full setup from scratch (Docker)
docker-compose up -d
cd server
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed

# Then start servers
cd ..
npm run dev
```

---

## Next Steps

Once your database is populated:
1. Start your servers: `npm run dev`
2. Visit `http://localhost:5173`
3. Login with `admin` / `admin` to access admin features
4. Browse cards at `/cards`
5. Import more cards using bulk upload feature

