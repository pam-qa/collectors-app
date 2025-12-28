# TCG Collection Web App — Complete Project Plan

## Overview

A full-stack web application for managing Trading Card Game collections with multi-source price tracking.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite + React + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Authentication | JWT |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Client   │────▶│  Express API    │────▶│   PostgreSQL    │
│  (Vite)         │     │  (Node.js)      │     │   (Supabase)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
     :5173                   :3001                  Cloud/Docker
```

---

## Default Accounts

| Username | Password | Email | Role | Description |
|----------|----------|-------|------|-------------|
| admin | admin | admin@tcgapp.local | ADMIN | System administrator - full access |
| user001 | user001 | user001@tcgapp.local | USER | Default test user - standard access |

---

## User Roles & Permissions

### Role Definitions

| Role | Code | Access Level |
|------|------|--------------|
| Administrator | ADMIN | Full system access |
| Standard User | USER | Collections, decks, search only |

### Permission Matrix

| Feature | ADMIN | USER |
|---------|-------|------|
| View cards | ✅ | ✅ |
| Search cards | ✅ | ✅ |
| Create collection | ✅ | ✅ |
| Create deck | ✅ | ✅ |
| View prices | ✅ | ✅ |
| Create/Edit packs | ✅ | ❌ |
| Create/Edit cards | ✅ | ❌ |
| Manage users | ✅ | ❌ |
| System settings | ✅ | ❌ |
| View logs | ✅ | ❌ |
| Bulk import | ✅ | ❌ |

---

## Price Sources

| Source | Region | Currency | API Type |
|--------|--------|----------|----------|
| yuyu-tei.jp | Japan | JPY | Scraping |
| cardmarket.com | Europe | EUR | Official API |
| tcgplayer.com | USA | USD | Official API |

---

## Image Storage Strategy

### Overview

Card images are **NOT stored in the database** (which would cause bloat and slow queries). Instead, we use external cloud storage with URLs stored in the database for optimal performance.

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Admin Upload   │────▶│  Supabase       │────▶│  CDN Edge       │
│  (Card Images)  │     │  Storage        │     │  (Global Cache) │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  PostgreSQL     │
                        │  (URLs only)    │
                        └─────────────────┘
```

### Storage Options

| Provider | Tier | Storage | Bandwidth | Best For |
|----------|------|---------|-----------|----------|
| **Supabase Storage** | Free | 1GB | 2GB/month | Recommended (integrated) |
| Cloudinary | Free | 25GB | 25GB/month | Image transformations |
| AWS S3 + CloudFront | Pay-as-go | Unlimited | Unlimited | Large scale |

### Image Sizes (Per Card)

| Size | Dimensions | Purpose | Field |
|------|------------|---------|-------|
| Thumbnail | 168x246 px | Lists, search results | `image_url_small` |
| Standard | 421x614 px | Card detail view | `image_url` |
| High-Res | 813x1185 px | Zoom, print | `image_url_high` (optional) |

### Database Fields (Card Model)

```prisma
// Images stored as CDN URLs (NOT binary data)
image_url         String?    // Standard resolution ~50KB
image_url_small   String?    // Thumbnail ~10KB  
image_url_high    String?    // High-res ~150KB (optional)
image_blurhash    String?    // Blur placeholder ~50 bytes
```

### Performance Optimizations

1. **URL-Only Storage**: Database stays small and fast
2. **CDN Caching**: Images served from edge locations globally
3. **Multiple Sizes**: Load appropriate size for context (thumbnail vs detail)
4. **Blurhash Placeholders**: Instant visual feedback while images load
5. **Lazy Loading**: Images load only when entering viewport
6. **WebP Format**: 30% smaller than JPEG with same quality

### Upload Flow (Admin)

1. Admin uploads image via dashboard
2. Server processes and creates multiple sizes
3. Images uploaded to Supabase Storage
4. CDN URLs stored in Card record
5. Blurhash generated and stored for instant placeholders

### Frontend Implementation

```tsx
// Optimized image loading with placeholder
<CardImage 
  src={card.image_url}
  thumbnail={card.image_url_small}
  blurhash={card.image_blurhash}
  loading="lazy"
/>
```

---

## API Routes

### Public Routes

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/cards
GET    /api/cards/:id
GET    /api/cards/search
GET    /api/packs
GET    /api/packs/:id
```

### Protected Routes (User)

```
GET    /api/me
PUT    /api/me
GET    /api/collections
POST   /api/collections
GET    /api/collections/:id
PUT    /api/collections/:id
DELETE /api/collections/:id
POST   /api/collections/:id/cards
DELETE /api/collections/:id/cards/:cardId
GET    /api/decks
POST   /api/decks
GET    /api/decks/:id
PUT    /api/decks/:id
DELETE /api/decks/:id
POST   /api/decks/:id/cards
DELETE /api/decks/:id/cards/:cardId
GET    /api/wishlist
POST   /api/wishlist
DELETE /api/wishlist/:cardId
```

### Admin Routes

```
GET    /api/admin/dashboard
GET    /api/admin/users
PUT    /api/admin/users/:id/role
DELETE /api/admin/users/:id
POST   /api/admin/packs
PUT    /api/admin/packs/:id
DELETE /api/admin/packs/:id
POST   /api/admin/cards
PUT    /api/admin/cards/:id
DELETE /api/admin/cards/:id
POST   /api/admin/cards/bulk-import
GET    /api/admin/settings
PUT    /api/admin/settings
GET    /api/admin/logs
```

---

## Database Schema

### Core Models

- **User** - Authentication and role management
- **Pack** - Card set/expansion info with cover images (CDN URLs + blurhash)
- **Card** - Individual card data with multiple image sizes (thumbnail, standard, high-res) stored as CDN URLs
- **Collection** - User card collections
- **CollectionCard** - Cards within a collection (with condition, quantity)
- **Deck** - User deck builds
- **DeckCard** - Cards within a deck (main/extra/side)
- **Wishlist** - User wishlist with price alerts
- **PriceHistory** - Historical price tracking

### Image Fields (Optimized)

Images are stored as **CDN URLs only** (not binary blobs) for optimal database performance:

| Model | Fields | Sizes |
|-------|--------|-------|
| Card | `image_url`, `image_url_small`, `image_url_high`, `image_blurhash` | 168x246, 421x614, 813x1185 |
| Pack | `cover_image`, `cover_image_small`, `cover_blurhash` | Standard, Thumbnail |

### Key Enums

- **Role**: ADMIN, USER
- **CardType**: MONSTER, SPELL, TRAP
- **FrameColor**: NORMAL, EFFECT, RITUAL, FUSION, SYNCHRO, XYZ, PENDULUM, LINK, TOKEN, SPELL, TRAP
- **Attribute**: DARK, LIGHT, EARTH, WATER, FIRE, WIND, DIVINE
- **Rarity**: COMMON, RARE, SUPER_RARE, ULTRA_RARE, SECRET_RARE, etc.
- **BanStatus**: UNLIMITED, SEMI_LIMITED, LIMITED, FORBIDDEN
- **Condition**: MINT, NEAR_MINT, LIGHTLY_PLAYED, MODERATELY_PLAYED, HEAVILY_PLAYED, DAMAGED
- **DeckZone**: MAIN, EXTRA, SIDE
- **Language**: EN, JP, CN, KOR
- **SetType**: BOOSTER, STRUCTURE_DECK, STARTER_DECK, etc.

---

## Development Phases

### Phase 0: Pre-Dev Setup ✅

- [x] Create project structure
- [x] Set up configuration files
- [x] Configure Prisma schema
- [x] Create seed scripts
- [x] Set up client and server

### Phase 1: Core MVP

- [ ] Authentication system (JWT)
- [ ] User seeding (admin + user001)
- [ ] Admin: Pack CRUD
- [ ] Admin: Card CRUD (all fields)
- [ ] User: Card search/browse
- [ ] User: Collection CRUD
- [ ] User: Deck builder (basic)
- [ ] Basic UI with role-based navigation

### Phase 2: Price Integration

- [ ] TCGPlayer API integration
- [ ] Cardmarket API integration
- [ ] Yuyu-tei scraper
- [ ] Price caching system
- [ ] Currency conversion
- [ ] Price comparison UI

### Phase 3: Advanced Features

- [ ] Price history tracking
- [ ] Wishlist with price alerts
- [ ] Import/Export (CSV, YDK)
- [ ] Deck validation (ban list)
- [ ] Sample hand simulator
- [ ] Collection statistics

### Phase 4: Polish & Scale

- [ ] Mobile responsive / PWA
- [ ] Bulk card import (admin)
- [ ] Advanced analytics dashboard
- [ ] Social features (share decks)
- [ ] API documentation
- [ ] Performance optimization

---

## Environment Variables

```env
# Application
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173

# Database (Supabase)
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Image Storage (Supabase Storage - same project as database)
SUPABASE_URL=https://PROJECT.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
STORAGE_BUCKET=card-images

# Price APIs (Future)
TCGPLAYER_API_KEY=
TCGPLAYER_API_SECRET=
CARDMARKET_APP_TOKEN=
CARDMARKET_APP_SECRET=
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (Supabase or Docker)

### Installation

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL

# Initialize database
cd server
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development servers
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
```

### Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Prisma Studio: `npx prisma studio`

---

## Deployment

### Frontend (Vercel)

1. Connect GitHub repository
2. Set root directory to `client`
3. Add environment variables
4. Deploy

### Backend (Railway/Render)

1. Connect GitHub repository
2. Set root directory to `server`
3. Add environment variables
4. Deploy

### Database (Supabase)

1. Create project at supabase.com
2. Copy connection string
3. Run migrations

