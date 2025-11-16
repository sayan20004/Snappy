# 🚀 Snappy Todo - Deployment Guide

Complete guide for deploying Snappy Todo to production.

---

## 📋 Prerequisites

- Docker & Docker Compose installed
- Domain name (optional, for production)
- SSL certificate (for HTTPS)
- Minimum 2GB RAM, 20GB storage

---

## 🏗️ Quick Start (Local Development with Docker)

1. **Clone the repository**
   ```bash
   git clone https://github.com/sayan20004/Snappy.git
   cd Snappy
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:5001
   - MongoDB: localhost:27017

---

## 🌐 Production Deployment

### Option 1: VPS / Cloud Server (DigitalOcean, AWS, Linode)

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Step 2: Deploy Application
```bash
# Clone repository
git clone https://github.com/sayan20004/Snappy.git
cd Snappy

# Configure environment
cp .env.example .env
nano .env  # Update with production values

# Deploy using script
chmod +x deploy.sh
./deploy.sh v1.0.0
```

#### Step 3: Setup SSL (Certbot)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

### Option 2: Docker Hub / GitHub Container Registry

#### Build and Push Images
```bash
# Login to registry
docker login ghcr.io -u YOUR_USERNAME

# Build images
docker build -t ghcr.io/sayan20004/snappy-backend:latest ./backend
docker build -t ghcr.io/sayan20004/snappy-frontend:latest ./frontend

# Push to registry
docker push ghcr.io/sayan20004/snappy-backend:latest
docker push ghcr.io/sayan20004/snappy-frontend:latest
```

#### Deploy on Server
```bash
# Pull images
docker pull ghcr.io/sayan20004/snappy-backend:latest
docker pull ghcr.io/sayan20004/snappy-frontend:latest

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

---

### Option 3: Platform as a Service (Render, Railway, Fly.io)

#### Render.com
1. Create new Web Service for backend
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node src/server.js`
   - Environment: Add all env variables

2. Create new Static Site for frontend
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

#### Railway.app
1. Connect GitHub repository
2. Add MongoDB plugin
3. Deploy backend & frontend services
4. Configure environment variables

---

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://user:pass@host:27017/snappy-todo
JWT_SECRET=your-super-secret-minimum-32-characters-long
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
```

### Frontend (build-time)
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com
```

---

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Backend health
curl http://localhost:5001/health

# Frontend health
curl http://localhost/health

# Check all containers
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Database Backup
```bash
# Create backup
docker exec snappy-mongodb mongodump --out /backup

# Restore backup
docker exec snappy-mongodb mongorestore /backup
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

---

## 🔒 Security Best Practices

1. **Change Default Credentials**
   - Update MongoDB root password
   - Generate strong JWT secret (min 32 chars)

2. **Enable Firewall**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

3. **SSL/TLS Configuration**
   - Use Let's Encrypt for free SSL
   - Enable HTTPS redirect
   - Configure HSTS headers

4. **MongoDB Security**
   - Enable authentication
   - Use strong passwords
   - Restrict network access

5. **Regular Updates**
   ```bash
   # Update Docker images
   docker-compose pull
   docker-compose up -d
   ```

---

## 🎯 Performance Optimization

### Frontend
- Enable Nginx gzip compression ✅
- Cache static assets ✅
- Use CDN for assets (optional)
- Implement service workers

### Backend
- Enable MongoDB indexes
- Implement Redis caching (optional)
- Use PM2 for process management
- Configure rate limiting

### Database
```javascript
// Add indexes in MongoDB
db.todos.createIndex({ owner: 1, status: 1 })
db.todos.createIndex({ listId: 1 })
db.lists.createIndex({ owner: 1 })
db.users.createIndex({ email: 1 }, { unique: true })
```

---

## 📈 Scaling

### Horizontal Scaling
```yaml
# docker-compose.prod.yml
backend:
  deploy:
    replicas: 3
  
frontend:
  deploy:
    replicas: 2
```

### Load Balancer
- Use Nginx or Traefik
- Configure health checks
- Enable sticky sessions

---

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs [service-name]

# Inspect container
docker inspect [container-name]

# Restart service
docker-compose restart [service-name]
```

### Database connection issues
```bash
# Test MongoDB connection
docker exec -it snappy-mongodb mongosh

# Check environment variables
docker-compose config
```

### Port conflicts
```bash
# Check what's using the port
sudo lsof -i :5001
sudo lsof -i :80

# Kill process
sudo kill -9 [PID]
```

---

## 📞 Support & Resources

- **Documentation**: [GitHub Wiki](https://github.com/sayan20004/Snappy/wiki)
- **Issues**: [GitHub Issues](https://github.com/sayan20004/Snappy/issues)
- **Discord**: [Join Community](#)
- **Email**: support@snappy-todo.com

---

## 📝 Deployment Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Database backed up
- [ ] Firewall rules configured
- [ ] Health checks working
- [ ] Monitoring setup
- [ ] Error logging enabled
- [ ] DNS configured
- [ ] CORS settings correct
- [ ] Rate limiting enabled

---

**Made with ⚡ by Sayan Maity**
