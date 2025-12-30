# Quick Start - Populate Database

## Easiest Method: Using Docker

### Step 1: Start Database

```bash
docker-compose up -d
```

This starts PostgreSQL at `localhost:5432`

### Step 2: Configure Environment

```bash
cd server
copy .env.example .env
```

The `.env` file should already have the correct DATABASE_URL for Docker.

### Step 3: Set Up Database Schema

```bash
cd server
npx prisma generate
npx prisma db push
```

### Step 4: Seed Database with Sample Data

```bash
npm run prisma:seed
```

**Done!** Your database now has:
- 2 users (admin/admin, user001/user001)
- 1 pack (Legend of Blue Eyes White Dragon)
- 3 sample cards
- 1 sample collection
- 1 sample deck

---

## Verify It Worked

Open Prisma Studio to view your data:

```bash
cd server
npx prisma studio
```

Visit `http://localhost:5555` in your browser.

---

## Add More Cards

### Option 1: Bulk Import (Fastest)

Login as admin and use the bulk import feature:
- See `docs/BULK_UPLOAD.md` for details
- Use `examples/cards-bulk-import.json` as a template

### Option 2: Via API

```bash
# Get admin token first
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Then add cards using the token
```

---

## Troubleshooting

**Database connection failed?**
- Make sure Docker is running: `docker-compose ps`
- Check logs: `docker-compose logs`

**Need to reset database?**
```bash
cd server
npx prisma migrate reset
npm run prisma:seed
```

