# Production Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Application Deployment](#application-deployment)
5. [Performance Optimization](#performance-optimization)
6. [Security Hardening](#security-hardening)
7. [Monitoring & Logging](#monitoring--logging)

## Prerequisites

### Required Software
- Node.js 18+ (LTS version recommended)
- MongoDB 6.0+
- PM2 (Process Manager)
- Nginx (Reverse Proxy)
- SSL Certificate (Let's Encrypt recommended)

### System Requirements
- Minimum 2GB RAM
- 20GB disk space
- Ubuntu 20.04+ or similar Linux distribution

## Environment Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install --production

# Frontend
cd frontend
npm install
npm run build
```

### 2. Configure Environment Variables

Create `.env.production` in backend directory:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-64-character-secret-key
CORS_ORIGIN=https://yourdomain.com
```

## Database Configuration

### MongoDB Atlas (Recommended)

1. Create MongoDB Atlas account
2. Create cluster
3. Whitelist application server IP
4. Create database user
5. Get connection string

### Self-Hosted MongoDB

```bash
# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongo
use snappy-todo
db.createUser({
  user: "todoapp",
  pwd: "secure-password",
  roles: ["readWrite"]
})
```

### Create Indexes

```javascript
// Connect to MongoDB and run:
db.todos.createIndex({ user: 1, createdAt: -1 })
db.todos.createIndex({ user: 1, completed: 1 })
db.todos.createIndex({ user: 1, list: 1 })
db.lists.createIndex({ user: 1, createdAt: -1 })
db.users.createIndex({ email: 1 }, { unique: true })
db.activities.createIndex({ user: 1, createdAt: -1 })
db.templates.createIndex({ user: 1, isPublic: 1 })
```

## Application Deployment

### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start application
cd backend
pm2 start src/server.js --name todo-api -i max

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'todo-api',
    script: './src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
}
```

Start with: `pm2 start ecosystem.config.js --env production`

### Nginx Configuration

Create `/etc/nginx/sites-available/todo-app`:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# Upstream backend
upstream backend {
    least_conn;
    server 127.0.0.1:5000;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    # Frontend (React build)
    root /var/www/todo-app/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/json application/xml+rss;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/todo-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Performance Optimization

### Enable Caching

Install Redis:
```bash
sudo apt-get install redis-server
sudo systemctl enable redis-server
```

### Frontend Optimization

```bash
# Build with optimizations
cd frontend
npm run build

# Verify bundle size
npm run build -- --mode production

# Analyze bundle
npm install -D rollup-plugin-visualizer
```

### Database Optimization

```javascript
// Enable query profiling
db.setProfilingLevel(2)

// Analyze slow queries
db.system.profile.find().limit(5).sort({ ts: -1 })

// Add indexes based on slow queries
```

## Security Hardening

### Firewall Configuration

```bash
# UFW (Uncomplicated Firewall)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Environment Security

```bash
# Secure .env file
chmod 600 .env.production

# Run as non-root user
sudo useradd -r -s /bin/false todoapp
sudo chown -R todoapp:todoapp /var/www/todo-app
```

### Additional Security

- Enable fail2ban for SSH protection
- Regular security updates
- Database access restricted to application server
- Secrets stored in environment variables (never in code)
- Regular security audits with npm audit

## Monitoring & Logging

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs todo-api

# Memory/CPU metrics
pm2 status
```

### Application Monitoring

Install monitoring tools:
- **Sentry**: Error tracking
- **New Relic**: Performance monitoring
- **UptimeRobot**: Uptime monitoring
- **CloudWatch**: AWS monitoring

### Log Management

```bash
# Setup log rotation
sudo nano /etc/logrotate.d/todo-app

# Content:
/var/www/todo-app/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 todoapp todoapp
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Health Checks

### Application Health

```bash
# Check API health
curl https://yourdomain.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "uptime": 123456,
  "environment": "production"
}
```

### Database Health

```javascript
// Check MongoDB connection
mongosh "mongodb://..."
db.adminCommand({ ping: 1 })
```

## Backup Strategy

### Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
mongodump --uri="mongodb://..." --out=/backups/$DATE
find /backups -mtime +7 -delete

# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

### Application Backups

- Version control with Git
- Automated deployment pipelines
- Database snapshots
- Configuration backups

## Rollback Procedure

```bash
# PM2 rollback
pm2 list
pm2 stop todo-api
git checkout previous-stable-tag
npm install --production
pm2 restart todo-api

# Database rollback
mongorestore --uri="mongodb://..." /backups/YYYYMMDD
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Check with `lsof -i :5000`
2. **MongoDB connection failed**: Verify credentials and network
3. **High memory usage**: Check for memory leaks, restart PM2
4. **Slow queries**: Add indexes, optimize queries
5. **SSL certificate expired**: Renew with certbot

### Support

- Check logs: `pm2 logs todo-api`
- Monitor: `pm2 monit`
- Database logs: `/var/log/mongodb/mongod.log`
- Nginx logs: `/var/log/nginx/error.log`
