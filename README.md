# Snappy Todo — Ultra-Fast Task Management ⚡

> A lightning-fast, brain-first todo app with AI-powered intention detection, collaborative lists, focus modes, and real-time sync.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

---

## 🎯 Why Snappy?

Stop juggling tasks across multiple apps. Snappy is designed for **brain-dump productivity**:

- 🧠 **Brain-Dump Mode** — Tasks extract and organize themselves
- ⚡ **Sub-120ms Interactions** — Faster than your thoughts
- 🎯 **Focus Sessions** — Distraction-free deep work
- 🤝 **Real-time Collaboration** — Work together seamlessly
- 📊 **Smart Views** — Kanban, Matrix, Timeline
- 🎨 **Retro-Snappy UI** — Beautiful & blazing fast

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/sayan20004/Snappy.git
cd Snappy
docker-compose up -d
```

Access at `http://localhost` 🎉

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Start MongoDB
brew services start mongodb-community

# Run development servers
npm run dev
```

**See [QUICKSTART.md](./QUICKSTART.md) for detailed setup.**

---

## ✨ Features

### Core Productivity
- ⚡ **Quick Add** — Brain-dump with `/` key
- ⏱️ **Dynamic Timeboxing** — Auto-fit tasks to schedule
- 🎯 **Focus Mode** — Pomodoro with flow state
- 📋 **Smart Inbox** — AI-powered task sorting
- 🏷️ **Tags & Lists** — Organize your way

### Collaboration
- 👥 **Real-time Sync** — WebSocket updates
- 💬 **Task Comments** — Thread discussions
- 👀 **Presence Indicators** — See who's active
- 🔔 **Mentions** — @tag teammates

### Advanced
- 📊 **Multiple Views** — Kanban, Matrix, Timeline
- 📝 **Task Templates** — Recurring workflows
- 🎙️ **Voice Notes** — Audio attachments
- 📎 **File Uploads** — Attach anything
- 📈 **Activity Timeline** — Track your progress

---

## 🛠 Tech Stack

**Frontend:**
- React 18 + Vite
- Zustand + TanStack Query
- Tailwind CSS + Framer Motion
- Socket.io-client

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io (real-time)
- JWT + bcrypt

**DevOps:**
- Docker + Docker Compose
- Nginx (reverse proxy)
- GitHub Actions (CI/CD ready)

---

## 📦 Project Structure

```
Snappy/
├── frontend/              # React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Zustand stores
│   │   └── api/           # API client
│   ├── Dockerfile
│   └── nginx.conf
├── backend/               # Express API
│   ├── src/
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API endpoints
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth, validation
│   │   └── socket/        # WebSocket handlers
│   └── Dockerfile
├── docker-compose.yml
├── DEPLOYMENT.md          # Production guide
├── SEO_GUIDE.md          # SEO optimization
└── QUICKSTART.md         # Setup instructions
```

---

## 🌐 Deployment

### Quick Deploy

```bash
chmod +x deploy.sh
./deploy.sh v1.0.0
```

### Platform Support
- ✅ Docker / Docker Compose
- ✅ DigitalOcean / AWS / Linode
- ✅ Render / Railway / Fly.io
- ✅ Heroku / Vercel

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide.**

---

## 📊 SEO Optimized

Snappy is built to rank:

- ✅ Semantic HTML5 + Meta tags
- ✅ Open Graph + Twitter Cards
- ✅ JSON-LD structured data
- ✅ Sitemap.xml + Robots.txt
- ✅ PWA manifest
- ✅ Performance optimized (Lighthouse 95+)

**See [SEO_GUIDE.md](./SEO_GUIDE.md) for ranking strategies.**

---

## 🎨 Screenshots

### Dashboard
*Brain-dump your entire life, organize effortlessly*

### Focus Mode
*Distraction-free deep work sessions*

### Kanban Board
*Visualize your workflow*

---

## 🧪 API Documentation

### Authentication
```bash
POST /api/auth/register    # Create account
POST /api/auth/login       # Get JWT token
GET  /api/auth/me          # Current user
```

### Todos
```bash
GET    /api/todos          # List todos
POST   /api/todos          # Create todo
PATCH  /api/todos/:id      # Update todo
DELETE /api/todos/:id      # Delete todo
```

### Real-time Events
```javascript
socket.on('todo:created')
socket.on('todo:updated')
socket.on('presence:update')
```

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License — free for personal and commercial use.

---

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.io](https://socket.io/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/sayan20004/Snappy/wiki)
- **Issues**: [GitHub Issues](https://github.com/sayan20004/Snappy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sayan20004/Snappy/discussions)

---

**Made with ⚡ by [Sayan Maity](https://github.com/sayan20004)**

⭐ Star this repo if you find it useful!

---


