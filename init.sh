#!/bin/bash

echo "🚀 Starting Booking System..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please copy .env.example and configure it."
    exit 1
fi

# Start services
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
docker exec booking-backend npx prisma migrate dev --name init

echo "✅ Backend is ready at http://localhost:3001"
echo "📚 API Documentation at http://localhost:3001/api"
