# iCollect

A full-stack web application for managing Trading Card Game collections with multi-source price tracking.

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma

## Project Structure

```
tcg-deck/
├── client/          # React frontend (Vite)
├── server/          # Express backend
│   └── prisma/      # Database schema & migrations
├── docs/            # Documentation
└── docker-compose.yml
```

## Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (local via Docker or Supabase cloud)

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/tcg-deck.git
cd tcg-deck

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Database Setup

#### Option A: Supabase (Recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings > Database > Connection String (URI)
3. Copy the connection string

#### Option B: Local PostgreSQL

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database URL
# For Supabase: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
# For local: postgresql://postgres:postgres@localhost:5432/tcg_collection
```

### 4. Initialize Database

```bash
cd server

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed default users
npx prisma db seed
```

### 5. Run Development Servers

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Default Accounts

| Username | Password | Role  | Description |
|----------|----------|-------|-------------|
| admin    | admin    | Admin | Full system access |
| user001  | user001  | User  | Standard access |

## Available Scripts

### Server

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Client

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Prisma

```bash
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema to database
npx prisma db seed     # Seed default data
npx prisma studio      # Open Prisma Studio GUI
```

## API Endpoints

### Public
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/cards` - List cards
- `GET /api/packs` - List packs

### Protected (User)
- `GET /api/collections` - User collections
- `GET /api/decks` - User decks
- `GET /api/wishlist` - User wishlist

### Admin Only
- `POST /api/admin/packs` - Create pack
- `POST /api/admin/cards` - Create card
- `GET /api/admin/users` - Manage users

## License

MIT

