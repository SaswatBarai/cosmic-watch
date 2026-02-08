#!/bin/bash

# Perilux Docker Stop Script

echo "🛑 Stopping Perilux services..."
docker-compose down

echo ""
echo "✅ All services stopped!"
echo ""
echo "To remove all data (including database):"
echo "  docker-compose down -v"
echo ""
echo "To restart services:"
echo "  ./start.sh"
echo "  or"
echo "  docker-compose up -d"
