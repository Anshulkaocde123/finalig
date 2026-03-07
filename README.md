# 🏏 VNIT Inter-Department Games (IG App)

> Full-stack sports management system for the 10-day inter-department tournament at VNIT Nagpur.  
> Real-time scoring, leaderboard, admin dashboard — production-hardened and deployed.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-green) ![React](https://img.shields.io/badge/React-19-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![Express](https://img.shields.io/badge/Express-5.2-lightgrey) ![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black) ![Vercel](https://img.shields.io/badge/Frontend-Vercel-black) ![Render](https://img.shields.io/badge/Backend-Render-46E3B7)

---

## 🌐 Live Deployment

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | https://client-eight-rouge.vercel.app |
| **Backend API (Render)** | https://finalig-1.onrender.com |
| **Health Check** | https://finalig-1.onrender.com/api/health |

> **Note**: The Render free tier spins down after ~15 min of inactivity. The first visit after idle takes ~30s to cold-start, then it's fast.

---

## ⚡ Quick Start (Local Development)

```bash
# 1. Clone
git clone https://github.com/Anshulkaocde123/finalig.git
cd finalig

# 2. One-command setup (installs deps + creates .env + seeds admin)
chmod +x setup-team.sh && ./setup-team.sh

# 3. Run dev servers (frontend + backend concurrently)
npm run dev
```

| Service   | URL                           |
|-----------|-------------------------------|
| Frontend  | http://localhost:5173          |
| Backend   | http://localhost:5000          |
| Admin     | http://localhost:5173/login    |

**Default Admin Login** → `admin` / `admin123`

> **MongoDB IP Whitelist**: If you get a connection error, ask Anshul to add your IP in [MongoDB Atlas → Network Access](https://cloud.mongodb.com).

---

## 🏗️ Manual Setup (Alternative)

```bash
# Install all dependencies
npm install && cd server && npm install && cd ../client && npm install && cd ..

# Create env files from examples
cp server/.env.example server/.env
cp client/.env.example client/.env.local
# Then edit them with real values (ask Anshul for DB credentials)

# Start dev servers
npm run dev
```

---

## 🎯 Features

### Public
- 📺 **Live Match Tracking** — real-time scores via Socket.io WebSockets
- 🏆 **Department Leaderboard** — auto-aggregated standings with stable tie-breaking
- 📅 **Match Schedule** — upcoming & past matches with filtering
- 📰 **Article of the Day** — daily highlights section
- ℹ️ **About / Student Council** pages

### Admin Dashboard
- ⚽ **Match Management** — create, update scores, delete with optimistic concurrency
- 🏅 **Leaderboard Control** — award / undo points, reset (idempotent point-award)
- 🏢 **Department Management** — logos, details
- 📆 **Season Management** — create, archive
- 👥 **Admin Management** — CRUD with role-based access (super_admin, admin, moderator, viewer)
- 🔒 **Audit Log** — PointLog history tracking with department indexes
- ⭐ **Highlights** — manage featured match highlights
- 🎯 **Scoring Presets** — configurable point templates per sport

### Supported Sports (10)
Cricket · Badminton · Table Tennis · Volleyball · Football · Hockey · Basketball · Kho-Kho · Kabaddi · Chess

---

## 🛡️ Security & Production Hardening

| Feature | Detail |
|---------|--------|
| **Helmet** | Security headers (HSTS, nosniff, frame-options, etc.) |
| **Rate Limiting** | Auth: 20 req/15min · API: 600 req/min (campus NAT-aware) |
| **Trust Proxy** | `app.set('trust proxy', 1)` for correct IP behind Render/Railway |
| **NoSQL Injection Guard** | Type-checking on all auth inputs |
| **JWT Auth** | 30-day tokens, no hardcoded fallbacks |
| **Password Hashing** | bcryptjs with 10 salt rounds |
| **Input Validation** | Whitelist fields, regex sanitization, limit clamping |
| **Optimistic Concurrency** | `_expectedVersion` on match updates |
| **Idempotent Points** | `pointsAwarded` flag prevents double point-award |
| **Cursor Pagination** | Efficient page tokens for match listing |
| **Compound Indexes** | PointLog department indexes, optimized DB queries |
| **N+1 Elimination** | Aggregation pipelines in `getDetailedStandings` |
| **Error Boundaries** | React ErrorBoundary + Express error handler |
| **Stable Tie-Breaking** | Department name as final sort key |

**Deployment Readiness Score**: 9.5/10 — 47/47 tests passing.

---

## 📁 Project Structure

```
finalig/
├── client/                  # React 19 + Vite 5 + Tailwind CSS + DaisyUI
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages (public + admin)
│   │   ├── api/             # Axios config (axiosConfig.js)
│   │   ├── context/         # React context providers
│   │   ├── socket.js        # Socket.io client connection
│   │   └── utils/           # Helper functions
│   ├── vercel.json          # Vercel deploy config (SPA rewrites, cache headers)
│   ├── .env.example         # ← Copy to .env.local
│   └── package.json
│
├── server/                  # Express 5.2 + Mongoose 8 + Socket.io
│   ├── controllers/         # Route handlers
│   │   └── sports/          # Sport-specific controllers
│   ├── models/              # MongoDB schemas (Match, Department, PointLog, etc.)
│   ├── routes/              # API route definitions
│   ├── middleware/           # Auth, upload, error handlers
│   ├── tests/               # Jest unit + smoke tests (47 passing)
│   ├── scripts/             # Utility scripts (seedDepartments, createSuperAdmin)
│   ├── config/db.js         # MongoDB connection
│   ├── start.js             # Production entry point (loads dotenv → server.js)
│   ├── server.js            # Express app + Socket.io + route mounting
│   ├── .env.example         # ← Copy to .env
│   └── package.json
│
├── render.yaml              # Render deployment config (backend)
├── railway.toml             # Railway deployment config (alternative)
├── docker-compose.yml       # Docker orchestration
├── setup-team.sh            # One-command team onboarding
└── package.json             # Root scripts (dev, build, serve)
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/seed` | — | Create initial super-admin |
| POST | `/api/auth/login` | — | Login (username/email/studentId) |
| GET | `/api/auth/me` | ✅ | Get current user profile |

### Matches
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/matches` | — | List matches (paginated, filterable) |
| GET | `/api/matches/:id` | — | Get single match |
| POST | `/api/matches` | ✅ | Create match |
| PUT | `/api/matches/:id` | ✅ | Update match / scores |
| DELETE | `/api/matches/:id` | ✅ | Delete match |

### Leaderboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/leaderboard` | — | Current standings |
| GET | `/api/leaderboard/detailed` | — | Detailed with history |
| POST | `/api/leaderboard/award` | ✅ | Award points (idempotent) |
| POST | `/api/leaderboard/undo-last` | ✅ | Undo last award |
| DELETE | `/api/leaderboard/department/:id` | ✅ | Clear dept points |
| POST | `/api/leaderboard/reset` | 🔒 | Reset all (super_admin) |

### Other Resources
| Resource | Endpoints |
|----------|-----------|
| Departments | `/api/departments` — CRUD + cached 5min |
| Seasons | `/api/seasons` — CRUD + cached 5min |
| Players | `/api/players` — CRUD |
| Highlights | `/api/highlights` — CRUD |
| Scoring Presets | `/api/scoring-presets` — CRUD |
| Admins | `/api/admin` — CRUD (role-based) |
| About | `/api/about` — CRUD + cached 5min |
| Student Council | `/api/student-council` — CRUD + cached 5min |
| Health | `/api/health` — Server health check |

---

## 🧪 Testing

```bash
# Unit tests (Jest + mongodb-memory-server) — 47/47 passing
cd server && npm test

# Live smoke test (requires running server)
cd server && node tests/smoke-test.js

# Individual test suites
cd server && npm run test:backend
cd server && npm run test:database
cd server && npm run test:api
```

---

## 🚀 Deployment

### Current Production Setup

**Frontend → Vercel** | **Backend → Render**

```
┌─────────────────────┐       ┌──────────────────────────┐
│   Vercel (Frontend)  │──────▶│   Render (Backend)       │
│   React 19 + Vite 5  │  API  │   Express 5 + Socket.io  │
│   Static SPA hosting │◀──────│   Node.js 20             │
│                       │  WS   │   MongoDB Atlas          │
└─────────────────────┘       └──────────────────────────┘
```

### Deploy the Backend (Render)

1. Go to [Render Dashboard](https://dashboard.render.com) → **New → Web Service**
2. Connect the GitHub repo: `Anshulkaocde123/finalig`
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Name** | `vnit-ig-backend` |
   | **Branch** | `main` |
   | **Build Command** | `npm run build` |
   | **Start Command** | `cd server && node start.js` |
   | **Instance Type** | Free |
4. Add environment variables (see table below)
5. Deploy — Render builds automatically on every push to `main`

### Deploy the Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Authenticate
vercel login

# Deploy from the client directory
cd client
VITE_API_URL="https://your-backend.onrender.com/api" \
VITE_SOCKET_URL="https://your-backend.onrender.com" \
vercel --prod --yes
```

Also set permanent env vars:
```bash
vercel env add VITE_API_URL production <<< "https://your-backend.onrender.com/api"
vercel env add VITE_SOCKET_URL production <<< "https://your-backend.onrender.com"
```

### Redeployment Commands

```bash
# Backend — auto-deploys on git push, or manual:
git push origin main  # Render picks up the push automatically

# Frontend
cd client && vercel --prod
```

### Alternative: Docker

```bash
docker-compose up --build
```

### Alternative: Railway

```bash
# Install & authenticate
npm i -g @railway/cli && railway login --browserless

# Link & deploy
railway link && railway up
```

---

## 🔐 Environment Variables

### Server (Render Dashboard / `server/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Random 64+ char secret for JWT signing |
| `PORT` | — | Server port (default: 5000) |
| `NODE_ENV` | ✅ | `production` for deploy, `development` for local |
| `CORS_ORIGIN` | ✅ | Comma-separated allowed origins (e.g. `https://your-frontend.vercel.app`) |
| `BASE_URL` | — | Backend public URL |
| `GOOGLE_CLIENT_ID` | — | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | — | For Google OAuth |
| `GOOGLE_CALLBACK_URL` | — | OAuth callback (e.g. `https://your-backend.onrender.com/api/auth/register-oauth`) |

### Client (Vercel Dashboard / `client/.env.local`)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API URL (e.g. `https://your-backend.onrender.com/api`) |
| `VITE_SOCKET_URL` | ✅ | Backend Socket.io URL (e.g. `https://your-backend.onrender.com`) |

> In production with separate domains, both `VITE_API_URL` and `VITE_SOCKET_URL` must point to the Render backend. In local dev, the Vite proxy handles routing automatically.

---

## 🔄 Real-Time Architecture

The app uses Socket.io for real-time updates:

- **Match score updates** — broadcast to all connected clients instantly
- **Leaderboard changes** — reflected live across all open browsers
- **Transport**: WebSocket with polling fallback
- **CORS**: Configured via `CORS_ORIGIN` env var (same config for Express & Socket.io)

```
Client (Browser)                         Server (Render)
    │                                         │
    │──── WebSocket upgrade ─────────────────▶│
    │◀─── score:update ──────────────────────│
    │◀─── leaderboard:update ─────────────────│
    │◀─── match:created ──────────────────────│
```

---

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 5, Tailwind CSS, DaisyUI 5, Framer Motion, Three.js |
| Backend | Express 5.2, Socket.io 4.8, Mongoose 8 |
| Database | MongoDB Atlas (shared cluster) |
| Auth | JWT + bcryptjs, role-based (super_admin / admin / moderator / viewer) |
| Hosting (Frontend) | Vercel (free, global CDN) |
| Hosting (Backend) | Render (free, auto-deploy from GitHub) |
| CI/CD | Auto-deploy on `git push origin main` |

---

## 👥 Team

- **Anshul Jain**
- **Chinmay Sabharwal**
- **Sanvi Yanagandula**

Built for the VNIT Sports Committee

---

## 📜 License

MIT — see [LICENSE](LICENSE) for details.

---

**Made for VNIT Inter-Department Games** · Status: ✅ Live & Deployed · Version: 2.0.0
