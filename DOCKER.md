# Docker Setup Guide for Perilux

This document provides instructions for running the Perilux asteroid tracking system using Docker and Docker Compose.

## 🏗️ Architecture

The application consists of 4 services:

1. **MongoDB** - Database for storing asteroids, users, and chat data
2. **Backend** - Node.js/Express API server with Socket.io
3. **Frontend** - React application built with Vite
4. **Nginx** - Reverse proxy for routing requests

## 📋 Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher
- At least 4GB of available RAM
- Ports 80, 443, 3000, 5000, and 27017 available

## 🚀 Quick Start

### 1. Clone and Navigate to Project

```bash
cd /home/saswatbarai/Documents/cosmic-watch
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` and update:
- `JWT_SECRET` - Generate a strong random string
- `NASA_API_KEY` - Get from https://api.nasa.gov/
- `EMAIL_USER` and `EMAIL_PASS` - Your email credentials for alerts

### 3. Build and Start Services

```bash
# Build all images and start containers
docker-compose up -d --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

**Backend API request logging:** Every request to the backend is logged with timestamp, method, URL, status code, and duration. Use `docker-compose logs -f backend` to see lines like:
```
[2025-02-08T...] GET /api/auth/me 401 2ms
[2025-02-08T...] POST /api/auth/login 200 45ms
```
This helps debug 404/400/500 errors and confirm Nginx is proxying correctly.

### 4. Access the Application

- **Main Application**: http://localhost
- **Backend API**: http://localhost/api
- **Direct Backend**: http://localhost:5000 (for debugging)
- **Direct Frontend**: http://localhost:3000 (for debugging)

## 🔧 Common Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart nginx
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mongodb

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Database Management

```bash
# Access MongoDB shell
docker exec -it perilux-mongodb mongosh -u admin -p admin123

# Backup database
docker exec perilux-mongodb mongodump -u admin -p admin123 --authenticationDatabase admin -o /backup

# Restore database
docker exec perilux-mongodb mongorestore -u admin -p admin123 --authenticationDatabase admin /backup
```

### Container Management

```bash
# List running containers
docker-compose ps

# Check container health
docker-compose ps
docker inspect perilux-backend | grep -A 10 Health

# Access container shell
docker exec -it perilux-backend sh
docker exec -it perilux-frontend sh
docker exec -it perilux-mongodb sh

# View container resource usage
docker stats
```

### Rebuild Services

```bash
# Rebuild all services
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache backend
docker-compose build --no-cache frontend

# Rebuild and restart
docker-compose up -d --build
```

## 🔍 Debugging

### Check Service Health

```bash
# Check all container statuses
docker-compose ps

# Check backend health
curl http://localhost:5000/

# Check frontend health
curl http://localhost:3000/health

# Check nginx health
curl http://localhost/health
```

### View Container Logs

```bash
# Real-time logs for all services
docker-compose logs -f

# Backend errors
docker-compose logs backend | grep -i error

# Nginx access logs
docker-compose logs nginx | grep -i "GET\|POST"
```

### Access Container Shell

```bash
# Backend
docker exec -it perilux-backend sh

# Frontend (nginx alpine)
docker exec -it perilux-frontend sh

# MongoDB
docker exec -it perilux-mongodb sh
```

## 🔒 Production Deployment

For production deployment, consider these additional steps:

### 1. SSL/TLS Certificate

Add SSL certificate configuration to `nginx/nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... rest of config
}
```

### 2. Update Environment Variables

- Use strong passwords for MongoDB
- Generate a strong JWT secret
- Set proper CORS origins
- Use production MongoDB URI if using external database

### 3. Enable Production Mode

In `docker-compose.yml`, ensure:

```yaml
backend:
  environment:
    - NODE_ENV=production
```

### 4. Resource Limits

Add resource limits to prevent container abuse:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 80
sudo lsof -i :80
sudo netstat -tulpn | grep :80

# Kill process or change port in docker-compose.yml
```

### MongoDB Connection Issues

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Test MongoDB connection
docker exec -it perilux-mongodb mongosh -u admin -p admin123
```

### Backend Can't Connect to MongoDB

- Ensure MongoDB service is healthy: `docker-compose ps`
- Check network connectivity: `docker network inspect cosmic-watch_perilux-network`
- Verify MONGO_URI in `.env` matches MongoDB credentials

### Frontend API Calls Failing

- Check Nginx logs: `docker-compose logs nginx`
- Verify backend is running: `curl http://localhost:5000/`
- Check CORS configuration in backend

### Container Keeps Restarting

```bash
# Check container logs for errors
docker-compose logs backend

# Check container exit code
docker inspect perilux-backend | grep -A 5 State
```

## 📊 Monitoring

### View Resource Usage

```bash
# Real-time resource usage
docker stats

# Disk usage
docker system df

# Detailed volume info
docker volume ls
docker volume inspect cosmic-watch_mongodb_data
```

### Nginx Logs

```bash
# Access logs
docker exec perilux-nginx tail -f /var/log/nginx/access.log

# Error logs
docker exec perilux-nginx tail -f /var/log/nginx/error.log
```

## 🧹 Cleanup

### Remove Containers and Images

```bash
# Stop and remove containers
docker-compose down

# Remove images
docker-compose down --rmi all

# Remove volumes (WARNING: deletes database)
docker-compose down -v

# Full cleanup
docker-compose down -v --rmi all --remove-orphans
```

### Prune Docker System

```bash
# Remove unused containers, networks, images
docker system prune -a

# Remove unused volumes (WARNING: may delete data)
docker volume prune
```

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | 5000 | No |
| `NODE_ENV` | Node environment | development | No |
| `MONGO_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | Secret for JWT tokens | - | Yes |
| `NASA_API_KEY` | NASA API key | - | Yes |
| `EMAIL_USER` | Email for alerts | - | No |
| `EMAIL_PASS` | Email password | - | No |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost | No |

## 🔗 Useful Links

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [MongoDB Docker](https://hub.docker.com/_/mongo)

## 📞 Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Check environment variables: `docker-compose config`
4. Review this documentation
5. Check container health: `docker inspect <container_name>`
