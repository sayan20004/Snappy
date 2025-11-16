# 🚀 Quick Deployment Guide

Get Snappy Todo running in 5 minutes!

## Option 1: Local with Docker (Recommended)

```bash
# Clone the repo
git clone https://github.com/sayan20004/Snappy.git
cd Snappy

# Copy environment file
cp .env.example .env

# Start everything
docker-compose up -d

# Access the app
open http://localhost
```

That's it! 🎉

---

## Option 2: Production VPS

```bash
# On your server
git clone https://github.com/sayan20004/Snappy.git
cd Snappy

# Configure
cp .env.example .env
nano .env  # Update with your settings

# Deploy
chmod +x deploy.sh
./deploy.sh v1.0.0
```

---

## Option 3: One-Click Deploy

[![Deploy on Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

---

## What You Get

- ⚡ Frontend: `http://localhost`
- 🔌 Backend API: `http://localhost:5001`
- 🗄️ MongoDB: `localhost:27017`

---

## Environment Variables

Only 3 required:
```env
MONGO_ROOT_PASSWORD=your-secure-password
JWT_SECRET=your-32-char-secret-key
FRONTEND_URL=http://localhost:3000
```

---

## Troubleshooting

**Port already in use?**
```bash
docker-compose down
docker-compose up -d
```

**Need to reset?**
```bash
docker-compose down -v
docker-compose up -d
```

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
