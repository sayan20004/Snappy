# Snappy Todo — MERN Stack

> Ultra-snappy todo web app with micro-interactions, focus modes, and real-time collaboration.

## 🚀 Features

- **Sub-second interactions** — Optimistic UI with <120ms micro-animations
- **Keyboard-first UX** — Quick add (`/`), instant complete, inline edit
- **Focus Sessions** — Distraction-free mode with timers
- **Smart prioritization** — Auto-surface important tasks
- **Real-time sync** — WebSocket updates across devices
- **Collaboration-lite** — Shared lists with presence indicators

## 🛠 Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io (real-time)
- JWT authentication
- bcrypt for password hashing

**Frontend:**
- React 18 + Vite
- Zustand (state management)
- TanStack Query (server state)
- Socket.io-client
- Tailwind CSS
- Framer Motion (animations)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm 9+
- MongoDB (local or Atlas)

### Setup

1. **Clone and install:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. **Start MongoDB** (if running locally):
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or with Docker
docker run -d -p 27017:27017 --name mongo mongo:latest
```

4. **Run development servers:**
```bash
npm run dev
```

This starts:
- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests only
npm run test --workspace=backend

# Frontend tests only
npm run test --workspace=frontend
```

## 📁 Project Structure

```
snappy-todo/
├── backend/              # Express API + Socket.io
│   ├── src/
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # REST API endpoints
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── controllers/  # Business logic
│   │   ├── config/       # DB, JWT config
│   │   ├── socket/       # WebSocket handlers
│   │   └── server.js     # Entry point
│   └── package.json
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── store/        # Zustand stores
│   │   ├── api/          # API client + React Query
│   │   ├── utils/        # Helpers
│   │   └── App.jsx       # Root component
│   └── package.json
└── package.json          # Root workspace config
```

## 🎯 Development Workflow

### Quick Commands

```bash
# Install dependencies
npm run install:all

# Development (both servers)
npm run dev

# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# Build for production
npm run build
```

### API Endpoints

**Auth:**
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Get JWT token
- `GET /api/auth/me` — Get current user

**Todos:**
- `GET /api/todos` — List todos (query: listId, tag, status)
- `POST /api/todos` — Create todo
- `PATCH /api/todos/:id` — Update todo
- `DELETE /api/todos/:id` — Delete/archive todo

**Lists:**
- `GET /api/lists` — Get user's lists
- `POST /api/lists` — Create list
- `POST /api/lists/:id/invite` — Invite collaborator

**WebSocket Events:**
- `todo:created`, `todo:updated`, `todo:deleted`
- `presence:update`

## 🚢 Deployment

### Backend (Render/Heroku)

1. Set environment variables in hosting platform
2. Update `MONGODB_URI` to Atlas connection string
3. Deploy from `backend/` directory

### Frontend (Vercel)

1. Connect your GitHub repo
2. Set root directory to `frontend/`
3. Add environment variable: `VITE_API_URL=your-backend-url`

### MongoDB Atlas

1. Create cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Whitelist IP addresses
3. Copy connection string to `MONGODB_URI`

## 📊 Milestones

- [x] **MVP** — Core CRUD, auth, optimistic UI
- [ ] **v1** — Tags, due dates, virtualized lists
- [ ] **v2** — Real-time collaboration, focus mode
- [ ] **Polish** — Analytics, performance, E2E tests

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🎨 Design Principles

- **Speed first** — Every interaction should feel instant
- **Keyboard-driven** — Mouse is optional
- **Minimal chrome** — Focus on content, not UI
- **Forgiving** — Easy undo, graceful errors
- **Accessible** — WCAG 2.1 AA compliant

---


