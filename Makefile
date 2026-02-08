.PHONY: help build up down restart logs clean ps

# Default target
help:
	@echo "Perilux Docker Commands"
	@echo "======================="
	@echo "make build       - Build all Docker images"
	@echo "make up          - Start all services"
	@echo "make down        - Stop all services"
	@echo "make restart     - Restart all services"
	@echo "make logs        - View logs from all services"
	@echo "make logs-f      - Follow logs from all services"
	@echo "make ps          - List running containers"
	@echo "make clean       - Stop and remove containers, networks, and volumes"
	@echo "make clean-all   - Complete cleanup including images"
	@echo ""
	@echo "Service-specific commands:"
	@echo "make backend-logs    - View backend logs"
	@echo "make frontend-logs   - View frontend logs"
	@echo "make nginx-logs      - View nginx logs"
	@echo "make mongodb-logs    - View mongodb logs"
	@echo ""
	@echo "make backend-shell   - Access backend shell"
	@echo "make frontend-shell  - Access frontend shell"
	@echo "make mongodb-shell   - Access MongoDB shell"

# Build all images
build:
	docker-compose build --no-cache

# Start services
up:
	docker-compose up -d

# Start with build
up-build:
	docker-compose up -d --build

# Stop services
down:
	docker-compose down

# Restart services
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs

# Follow logs
logs-f:
	docker-compose logs -f

# Service-specific logs
backend-logs:
	docker-compose logs -f backend

frontend-logs:
	docker-compose logs -f frontend

nginx-logs:
	docker-compose logs -f nginx

mongodb-logs:
	docker-compose logs -f mongodb

# List containers
ps:
	docker-compose ps

# Access shells
backend-shell:
	docker exec -it perilux-backend sh

frontend-shell:
	docker exec -it perilux-frontend sh

mongodb-shell:
	docker exec -it perilux-mongodb mongosh -u admin -p admin123

# Clean up
clean:
	docker-compose down -v

# Complete cleanup
clean-all:
	docker-compose down -v --rmi all --remove-orphans

# Check health
health:
	@echo "Checking service health..."
	@curl -s http://localhost/health || echo "Nginx: DOWN"
	@curl -s http://localhost:5000/ || echo "Backend: DOWN"
	@curl -s http://localhost:3000/health || echo "Frontend: DOWN"

# Database backup
backup:
	@echo "Backing up MongoDB..."
	docker exec perilux-mongodb mongodump -u admin -p admin123 --authenticationDatabase admin -o /backup
	docker cp perilux-mongodb:/backup ./backup-$(shell date +%Y%m%d-%H%M%S)
	@echo "Backup completed!"

# View resource usage
stats:
	docker stats
