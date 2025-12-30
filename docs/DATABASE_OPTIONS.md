# Database Options - Choose One

## Option 1: Supabase (Easiest - No Docker Needed) ⭐ RECOMMENDED

**📖 Full detailed guide: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

### Quick Steps:
1. Go to [supabase.com](https://supabase.com) → Sign up → Create new project
2. Go to **Settings > Database** → Copy connection string (URI format)
3. Create `server/.env` file (copy from `.env.example`)
4. Paste connection string, replace `[YOUR-PASSWORD]` with your actual password
5. Run setup commands (see full guide for details)

### Then run:
```bash
cd server
npx prisma generate
npx prisma db push
npm run prisma:seed
```

✅ **Benefits**: Free tier includes database + 1GB storage for images (URL storage)

---

## Option 2: Install Docker Desktop

1. Download: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Install and restart computer
3. Open Docker Desktop
4. Run:
   ```bash
   docker compose up -d
   ```
5. The `.env` file already has Docker config - you're ready!
6. Continue with Step 3-4 from QUICK_START.md

---

## Option 3: Local PostgreSQL

If you have PostgreSQL installed:

1. Create database:
   ```sql
   CREATE DATABASE tcg_collection;
   ```

2. Edit `server/.env`:
   ```env
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/tcg_collection?schema=public
   ```

3. Continue with database setup steps

---

## After Database is Ready

```bash
cd server
npx prisma generate
npx prisma db push
npm run prisma:seed
```

Then start your app:
```bash
npm run dev
```

Visit `http://localhost:5173` and you'll see your cards!

