# Booking System with Google Calendar Integration

Complete booking system with Google Calendar integration, real-time conflict detection, and Auth0 authentication.

## ✨ Features

### Core Functionality

- ✅ **User Authentication**: Secure login with Auth0 + Google
- ✅ **Booking Management**: Create, edit, view, and cancel bookings
- ✅ **Conflict Detection**: Prevents conflicts with existing system bookings
- ✅ **Google Calendar Integration**: Bidirectional Google Calendar connection
- ✅ **Real-time Validation**: Instant conflict verification
- ✅ **Auto Calendar Events**: Automatically creates events in Google Calendar

### Technical Features

- ✅ **Docker Support**: Containerized PostgreSQL database
- ✅ **JWT Authentication**: Secure tokens for API calls
- ✅ **Real-time Updates**: Instantly updated UI
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Error Handling**: Robust error handling and validations

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** (App Router)
- **Material-UI** for components
- **Auth0 React SDK** for authentication
- **TypeScript** for type safety

### Backend

- **NestJS** with TypeScript
- **PostgreSQL** with Prisma ORM
- **Google Calendar API** for integration
- **JWT** for authentication
- **Swagger** for documentation

### Infrastructure

- **Docker & Docker Compose** for database
- **Prisma** for migrations and database management

---

## 🚀 Installation and Setup

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Google Cloud Platform account (for Google Calendar API)
- Auth0 account

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd booking-system

# Install project dependencies
npm install
npm run install:all
```

### 2. Auth0 Configuration

1. Create an application in [Auth0 Dashboard](https://manage.auth0.com/)
2. Configure allowed URLs:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`

### 3. Google Cloud Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Google Calendar API
3. Create OAuth 2.0 credentials:
   - **Authorized redirect URIs**:
     - `https://dev-xxxxxxxx.us.auth0.com/login/callback` (for Auth0)
     - `http://localhost:3000/api/google-calendar/callback` (for the system)

### 4. Environment Variables

#### Backend (.env) at root level

```env
# Database
DB_USER=bookinguser
DB_PASSWORD=bookingpass
DB_NAME=bookingdb
DATABASE_URL="postgresql://bookinguser:bookingpass@localhost:5432/bookingdb?schema=public"

# Auth0
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_AUDIENCE=https://booking-system-api
AUTH0_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Google Calendar API
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback

NODE_ENV=development
```

#### Frontend (frontend/.env.local)

```env
# Auth0 Configuration
AUTH0_SECRET=your-long-random-string-32-chars-min
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Database Setup

```bash
# Start PostgreSQL with Docker
npm run db:up

# Apply migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 6. Start the System

```bash
# Option 1: Start everything together
npm run dev

# Option 2: Start separately
npm run dev:backend  # Port 3001
npm run dev:frontend # Port 3000
```

### 7. Access the System

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api
- **Prisma Studio**: http://localhost:5555

---

## 📚 API Documentation

### Authentication

All endpoints (except callbacks) require JWT token in header:

```
Authorization: Bearer <jwt-token>
```

### Bookings Endpoints

| Method | Endpoint                    | Description                   | Parameters                                 |
| ------ | --------------------------- | ----------------------------- | ------------------------------------------ |
| GET    | `/bookings`                 | List all user bookings        | -                                          |
| POST   | `/bookings`                 | Create a new booking          | `{ title, startTime, endTime }`            |
| PUT    | `/bookings/:id`             | Update an existing booking    | `{ title?, startTime?, endTime? }`         |
| DELETE | `/bookings/:id`             | Delete a booking              | -                                          |
| GET    | `/bookings/check-conflicts` | Check conflicts in time range | `?startTime=...&endTime=...&excludeId=...` |

### Google Calendar Endpoints

| Method | Endpoint                           | Description                          |
| ------ | ---------------------------------- | ------------------------------------ |
| GET    | `/google-calendar/auth-url`        | Get URL to connect Google Calendar   |
| GET    | `/google-calendar/callback`        | Handle Google OAuth callback         |
| DELETE | `/google-calendar/disconnect`      | Disconnect Google Calendar           |
| GET    | `/google-calendar/check-conflicts` | Check conflicts with Google Calendar |

> 📖 **Complete interactive documentation**: [http://localhost:3001/api](http://localhost:3001/api)

---

## 🧪 Development and Testing

### Useful Commands

```bash
# Database
npm run db:up           # Start PostgreSQL
npm run db:down         # Stop PostgreSQL
npm run db:logs         # View database logs
npm run prisma:studio   # Open Prisma Studio
npm run prisma:migrate  # Apply migrations

# Development
npm run dev             # Start entire system
npm run dev:backend     # Backend only
npm run dev:frontend    # Frontend only

# Build and production
npm run build           # Build both projects
npm run start           # Start in production mode
```

### Testing Endpoints

1. **With Swagger**: Go to http://localhost:3001/api
2. **Debugging**: Check backend console logs

---

## 🔧 Troubleshooting

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker ps

# Restart container
npm run db:down && npm run db:up
```

### Auth0 Error

- Verify callback URLs are correctly configured
- Confirm environment variables are correct
- Check that Auth0 domain is accessible

### Google Calendar Error

- Verify Google Calendar API is enabled
- Confirm redirect URIs are configured
- Check OAuth scopes are correct

### 401 Error on Endpoints

- Verify JWT token is valid
- Confirm user is authenticated
- Check Auth0 configuration

---

## 🚀 Deployment

### Production Environment Variables

```env
# Change for production
AUTH0_BASE_URL=https://your-domain.com
GOOGLE_REDIRECT_URI=https://your-domain.com/api/google-calendar/callback
DATABASE_URL=postgresql://user:pass@prod-db:5432/booking
```

### Docker Build

```bash
# Backend build
cd backend && docker build -t booking-backend .

# Frontend build
cd frontend && docker build -t booking-frontend .
```

---

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for more details.

---

## 🎯 Challenge Requirements Completed

### "The Easy One" ✅

- ✅ Users login using Google (Auth0)
- ✅ Users can book time slots (Name, start time, end time)
- ✅ Users can view their booked slots and cancel them
- ✅ Users cannot book if conflicts with existing booking in system
- ✅ Users cannot book if conflicts with Google Calendar event
- ✅ Users can connect their Google Calendar
- ✅ System checks Google Calendar before confirming booking

### "The Real Challenge" ✅

- ✅ Docker configuration for deployment (PostgreSQL)
- ✅ PostgreSQL instead of SQLite
- ✅ Auth0 for authentication

### Bonus Features ✅

- ✅ Edit booking functionality
- ✅ Real-time conflict validation
- ✅ Bidirectional Google Calendar sync
- ✅ Responsive Material-UI design
- ✅ Comprehensive error handling
- ✅ Complete API documentation
