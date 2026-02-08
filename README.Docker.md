# 🐳 Perilux - Docker Quick Start Guide

This is a simplified guide to get Perilux running with Docker quickly.

## 🎯 Quick Start (3 Steps)

### 1️⃣ Configure Environment

```bash
# Copy and edit the environment file
cp .env.example .env
nano .env  # or use your favorite editor
```

**Required settings in `.env`:**
- `JWT_SECRET` - Generate a strong random string
- `NASA_API_KEY` - Get yours at https://api.nasa.gov/
- `EMAIL_USER` & `EMAIL_PASS` - For email alerts (optional)

### 2️⃣ Start the Application

**Option A: Using the startup script (Recommended)**
```bash
./start.sh
```

**Option B: Using docker-compose directly**
```bash
docker-compose up -d --build
```

**Option C: Using make**
```bash
make up-build
```

### 3️⃣ Access the Application

Open your browser and go to:
- **Main Application**: http://localhost
- **Backend API**: http://localhost/api
- **Health Check**: http://localhost/health

## 🎛️ Common Commands

### Using Scripts

```bash
./start.sh      # Start all services
./stop.sh       # Stop all services
```

### Using Make

```bash
make help           # Show all available commands
make up-build       # Build and start
make down           # Stop services
make logs-f         # Follow logs
make backend-logs   # View backend logs only
make ps             # List running containers
make clean          # Stop and remove everything
```

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# View status
docker-compose ps
```

## 📦 What's Running?

The setup includes 4 services:

1. **Nginx** (Port 80) - Reverse proxy and load balancer
2. **Frontend** (Port 3000) - React application
3. **Backend** (Port 5000) - Node.js API server
4. **MongoDB** (Port 27017) - Database

## 🔍 Checking Service Health

```bash
# Check all services
make health

# Or manually check each service
curl http://localhost/health           # Nginx
curl http://localhost:5000/            # Backend
curl http://localhost:3000/health      # Frontend
```

## 📊 Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
docker-compose logs -f mongodb
```

## 🐛 Troubleshooting

### Services won't start

1. Check if ports are available:
   ```bash
   sudo lsof -i :80
   sudo lsof -i :5000
   sudo lsof -i :3000
   ```

2. Check Docker is running:
   ```bash
   docker ps
   ```

3. View service logs:
   ```bash
   docker-compose logs
   ```

### Database connection issues

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Access MongoDB shell
docker exec -it perilux-mongodb mongosh -u admin -p admin123
```

### Backend/Frontend not connecting

1. Check all services are healthy:
   ```bash
   docker-compose ps
   ```

2. Restart services:
   ```bash
   docker-compose restart
   ```

3. Check nginx logs:
   ```bash
   docker-compose logs nginx
   ```

## 🧹 Cleanup

### Stop services (keep data)
```bash
./stop.sh
# or
docker-compose down
```

### Remove everything (including database)
```bash
docker-compose down -v
# or
make clean
```

### Complete cleanup (including images)
```bash
docker-compose down -v --rmi all
# or
make clean-all
```

## 🔧 Development Mode

If you want to develop with hot-reload:

1. Stop Docker services:
   ```bash
   ./stop.sh
   ```

2. Start services individually:
   ```bash
   # Terminal 1 - MongoDB
   docker-compose up mongodb
   
   # Terminal 2 - Backend (with hot reload)
   cd server && pnpm dev
   
   # Terminal 3 - Frontend (with hot reload)
   cd client && pnpm dev
   ```

## 📚 More Information

For detailed documentation, see:
- **DOCKER.md** - Comprehensive Docker guide
- **README.md** - Project documentation

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Review environment variables: `cat .env`
4. Check Docker resources: `docker stats`
5. Read detailed troubleshooting in `DOCKER.md`

## 📝 Quick Reference

| Command | Description |
|---------|-------------|
| `./start.sh` | Start all services |
| `./stop.sh` | Stop all services |
| `make help` | Show all make commands |
| `docker-compose logs -f` | View logs |
| `docker-compose ps` | List containers |
| `docker-compose restart` | Restart services |

---

**Need more details?** Check out `DOCKER.md` for comprehensive documentation!
