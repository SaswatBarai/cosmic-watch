#!/bin/bash

# Perilux Docker Quick Start Script
# This script helps you quickly start the Perilux application using Docker

set -e

echo "🚀 Perilux Docker Setup"
echo "======================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed."
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed."
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Creating .env from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please edit it with your credentials."
        echo ""
        echo "You need to set:"
        echo "  - JWT_SECRET (generate a strong random string)"
        echo "  - NASA_API_KEY (get from https://api.nasa.gov/)"
        echo "  - EMAIL_USER and EMAIL_PASS (for email alerts)"
        echo ""
        read -p "Press Enter to continue or Ctrl+C to exit and edit .env first..."
    else
        echo "❌ Error: .env.example not found!"
        exit 1
    fi
fi

echo "🔨 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Perilux is starting up!"
echo ""
echo "Access the application at:"
echo "  🌐 Main Application: http://localhost"
echo "  🔧 Backend API:      http://localhost/api"
echo "  📊 Direct Backend:   http://localhost:5000"
echo "  🎨 Direct Frontend:  http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  📋 View logs:        docker-compose logs -f"
echo "  🛑 Stop services:    docker-compose down"
echo "  🔄 Restart:          docker-compose restart"
echo "  💾 See all commands: make help"
echo ""
echo "View logs:"
docker-compose logs --tail=50

echo ""
echo "Press Ctrl+C to stop viewing logs (services will keep running)"
docker-compose logs -f
