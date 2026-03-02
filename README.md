# 🏏 VNIT Inter-Department Games

> Full-stack sports management system for inter-department tournaments at VNIT Nagpur.  
> Real-time scoring, leaderboard, admin dashboard — production-hardened.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green) ![React](https://img.shields.io/badge/React-19-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![Express](https://img.shields.io/badge/Express-5.2-lightgrey) ![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black)

---

## ⚡ Quick Start (For Teammates)

```bash
# 1. Clone
git clone https://github.com/Anshulkaocde123/finalig.git
cd finalig

# 2. One-command setup (installs deps + creates .env + seeds admin)
chmod +x setup-team.sh && ./setup-team.sh

# 3. Run
npm start
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
npm start
```

---

## 🎯 Features

### Public
- 📺 **Live Match Tracking** — real-time scores via Socket.io
- 🏆 **Department Leaderboard** — auto-aggregated standings
- 📅 **Match Schedule** — upcoming & past matches
- ℹ️ **About / Student Council** pages

### Admin Dashboard
- ⚽ **Match Management** — create, update scores, delete
- 🏅 **Leaderboard Control** — award / undo points, reset
- 🏢 **Department Management** — logos, details
- 📆 **Season Management** — create, archive
- 👥 **Admin Management** — CRUD with role-based access (super_admin, admin, moderator, viewer)
- 🔒 **Audit Log** — point history tracking

### Supported Sports (10)
Cricket · Badminton · Table Tennis · Volleyball · Football · Hockey · Basketball · Kho-Kho · Kabaddi · Chess

---

## 🛡️ Security & Production Hardening

| Feature | Detail |
|---------|--------|
| **Helmet** | Security headers (HSTS, nosniff, frame-options, etc.) |
| **Rate Limiting** | Auth: 20 req/15min · API: 120 req/min |
| **NoSQL Injection Guard** | Type-checking on all auth inputs |
| **JWT Auth** | 30-day tokens, no hardcoded fallbacks |
| **Password Hashing** | bcryptjs with 10 salt rounds |
| **Input Validation** | Whitelist fields, regex sanitization, limit clamping |
| **Optimistic Concurrency** | `_expectedVersion` on match updates |
| **Cursor Pagination** | Efficient page tokens for match listing |
| **Compound Indexes** | Optimized DB queries |
| **Error Boundaries** | React ErrorBoundary + Express error handler |

---

## 📁 Project Structure

```
finalig/
├── client/                  # React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages (public + admin)
│   │   ├── api/             # Axios config
│   │   ├── context/         # React context providers
│   │   └── utils/           # Helper functions
│   ├── .env.example         # ← Copy to .env.local
│   └── package.json
│
├── server/                  # Express 5.2 + Mongoose + Socket.io
│   ├── controllers/         # Route handlers
│   │   └── sports/          # Sport-specific controllers
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API route definitions
│   ├── middleware/           # Auth, upload, error handlers
│   ├── tests/               # Jest unit + smoke tests
│   ├── scripts/             # Utility scripts (seed, check)
│   ├── .env.example         # ← Copy to .env
│   └── server.js            # Main entry point
│
├── .github/workflows/       # CI/CD pipeline
├── docker-compose.yml       # Docker orchestration
├── setup-team.sh            # One-command team onboarding
└── package.json             # Root (concurrently runs both)
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
| POST | `/api/leaderboard/award` | ✅ | Award points |
| POST | `/api/leaderboard/undo-last` | ✅ | Undo last award |
| DELETE | `/api/leaderboard/department/:id` | ✅ | Clear dept points |
| POST | `/api/leaderboard/reset` | 🔒 | Reset all (super_admin) |

### Departments · Seasons · Admins · About · Council · Players · Highlights · Presets
> All follow REST conventions. See route files under `server/routes/`.

---

## 🧪 Testing

```bash
# Unit tests (Jest + mongodb-memory-server)
cd server && npm test

# Live smoke test (requires running server)
cd server && node tests/smoke-test.js

# Results: 69/69 checks — auth, CRUD, delete, leaderboard,
#          Helmet, rate-limits, NoSQL injection, pagination
```

---

## 🐳 Docker

```bash
# Build & run everything
docker-compose up --build

# Just the backend
docker build -t ig-server ./server
docker run -p 5000:5000 --env-file server/.env ig-server
```

---

## 🚀 Deployment (Railway)

1. Push to GitHub
2. Connect repo in [Railway](https://railway.app)
3. Set environment variables (see `server/.env.example`)
4. Deploy — Railway auto-detects `npm start`

---

## 🔐 Environment Variables

### Server (`server/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Random 64+ char secret for JWT signing |
| `PORT` | — | Server port (default: 5000) |
| `NODE_ENV` | — | `development` or `production` |
| `GOOGLE_CLIENT_ID` | — | For Google OAuth |
| `CORS_ORIGIN` | — | Allowed frontend origins |

### Client (`client/.env.local`)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API URL |
| `VITE_SOCKET_URL` | ✅ | Backend Socket.io URL |
| `VITE_GOOGLE_CLIENT_ID` | — | Google OAuth client ID |

---

## 👥 Team

- **Anshul Jain** — Lead Developer
- **VNIT Sports Committee** — Requirements & Feedback

---

## 📜 License

MIT — see [LICENSE](LICENSE) for details.

---

**Made for VNIT Inter-Department Games** · Status: Production Ready · Version: 2.0.0
