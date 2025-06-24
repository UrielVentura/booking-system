# 📅 Booking System

A full-stack booking application that allows users to schedule appointments without conflicts, integrating with Google Calendar for comprehensive availability checking.

## 🚀 Features

- **Google Authentication** via Auth0
- **Conflict-free Booking** system
- **Google Calendar Integration** for real-time availability
- **Modern UI** with Next.js and TailwindCSS
- **RESTful API** with NestJS
- **PostgreSQL Database** with Prisma ORM
- **Docker** containerization for easy deployment

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Auth0 Account
- Google Cloud Console Account (for Calendar API)

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Auth0** - Authentication
- **React Query** - Data fetching
- **FullCalendar** - Calendar UI

### Backend

- **NestJS** - Node.js framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Auth0** - JWT validation
- **Google Calendar API** - Calendar integration
- **Swagger** - API documentation

## 🏃‍♂️ Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/booking-system.git
cd booking-system
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your Auth0 and Google credentials
```

### 3. Auth0 Configuration

1. Create an Auth0 account at [auth0.com](https://auth0.com)
2. Create a new application (Single Page Application)
3. Create an API in Auth0
4. Configure callback URLs:
   - Callback: `http://localhost:3000/api/auth/callback`
   - Logout: `http://localhost:3000`
5. Enable Google social connection

### 4. Google Calendar API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/auth/google/callback`

### 5. Run with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Run database migrations
docker exec booking-backend npx prisma migrate dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api

## 📁 Project Structure

```
booking-system/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── bookings/       # Booking CRUD operations
│   │   ├── users/          # User management
│   │   ├── google/         # Google Calendar integration
│   │   └── common/         # Shared resources
│   └── prisma/             # Database schema
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities and API client
│   │   └── hooks/        # Custom React hooks
├── docker-compose.yml      # Docker orchestration
└── docs/                   # Additional documentation
```

## 🔧 Development

### Backend Development

```bash
cd backend
npm install
npm run start:dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Database Commands

```bash
# Generate Prisma client
docker exec booking-backend npx prisma generate

# Create migration
docker exec booking-backend npx prisma migrate dev --name migration_name

# View database
docker exec booking-backend npx prisma studio
```

## 📚 API Documentation

Once the backend is running, visit http://localhost:3001/api for Swagger documentation.

### Main Endpoints

- `POST /auth/login` - Authenticate user
- `GET /bookings` - Get user bookings
- `POST /bookings` - Create new booking
- `DELETE /bookings/:id` - Cancel booking
- `POST /auth/google/connect` - Connect Google Calendar
- `GET /availability` - Check availability

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 📦 Deployment

The application is containerized and ready for deployment. For production:

1. Update environment variables
2. Build production images:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```
3. Deploy to your preferred cloud provider

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for commit conventions and development guidelines.

## 📄 License

This project is licensed under the MIT License.

## 👥 Author

Your Name - [your.email@example.com](mailto:your.email@example.com)

---

Built with ❤️ for Designli's technical assessment
