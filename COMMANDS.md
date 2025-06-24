# 🚀 Quick Commands Reference

## Initial Setup (First Time Only)

```bash
# 1. Clone the repository
git clone <repo-url>
cd booking-system

# 2. Copy environment files
cp .env.example .env
cd frontend && cp .env.local.example .env.local && cd ..

# 3. Configure your .env file with:
# - Database credentials
# - Auth0 credentials (domain, client ID, secret, audience)
# - Google Calendar API credentials

# 4. Install dependencies
npm install           # Root dependencies (dotenv-cli, concurrently)
npm run install:all   # Backend and Frontend dependencies

# 5. Start PostgreSQL and run migrations
npm run db:up
npm run prisma:migrate
```

## Daily Development

```bash
# Start everything with one command
npm run dev

# Or run separately:
# Terminal 1: Backend
npm run backend

# Terminal 2: Frontend
npm run frontend
```

## Database Commands

All database commands use the `.env` file from the root directory.

```bash
# Start/Stop PostgreSQL
npm run db:up         # Start PostgreSQL in Docker
npm run db:down       # Stop PostgreSQL
npm run db:logs       # View PostgreSQL logs
npm run db:reset      # ⚠️ Reset database (deletes all data)

# Prisma commands
npm run prisma:migrate          # Run pending migrations
npm run prisma:migrate:create   # Create new migration
npm run prisma:studio           # Open Prisma Studio GUI (http://localhost:5555)
npm run prisma:generate         # Generate Prisma Client
npm run prisma:reset           # ⚠️ Reset database schema
```

## Backend Commands

```bash
# Development
npm run backend       # Start backend with hot-reload

# From backend directory
cd backend
npm run build        # Build for production
npm run start:prod   # Start production build
npm run lint         # Run linting
npm run test         # Run tests
```

## Frontend Commands

```bash
# Development
npm run frontend     # Start frontend with hot-reload

# From frontend directory
cd frontend
npm run build       # Build for production
npm run start       # Start production build
npm run lint        # Run linting
```

## API Testing

```bash
# Check if backend is running
curl http://localhost:3001/api

# Test protected endpoint (should return 401)
curl http://localhost:3001/auth/profile

# Open Swagger UI
open http://localhost:3001/api
```

## Common Workflows

### 1. Start fresh development session

```bash
npm run db:up        # Start PostgreSQL
npm run dev          # Start backend & frontend
```

### 2. Add new database field

```bash
# 1. Edit backend/prisma/schema.prisma
# 2. Create migration
npm run prisma:migrate:create add_field_name
# 3. Generate types
npm run prisma:generate
```

### 3. Debug database issues

```bash
npm run prisma:studio    # Visual database editor
npm run db:logs         # Check PostgreSQL logs
```

### 4. Clean restart

```bash
npm run db:reset        # Reset database
npm run prisma:migrate  # Re-run migrations
npm run dev            # Start fresh
```

## Environment Variables

The project uses a single `.env` file in the root directory:

```env
# Database (PostgreSQL in Docker)
DATABASE_URL="postgresql://bookinguser:bookingpass@localhost:5432/bookingdb?schema=public"

# Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://booking-api.com

# Google Calendar
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```

Frontend uses `.env.local` for Next.js specific variables.

## Ports

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger UI**: http://localhost:3001/api
- **PostgreSQL**: localhost:5432
- **Prisma Studio**: http://localhost:5555

## Troubleshooting

### Backend won't start

```bash
# Check if PostgreSQL is running
docker ps | grep booking-db

# Check backend logs
npm run backend
# Look for connection errors
```

### Database connection issues

```bash
# Verify PostgreSQL is accessible
docker exec booking-db psql -U bookinguser -d bookingdb -c "SELECT 1;"

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Missing environment variables

```bash
# Backend uses dotenv-cli to load from root .env
# If you see "Environment variable not found", check:
cat .env
# Make sure all required variables are set
```
