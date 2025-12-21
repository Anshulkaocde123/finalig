# VNIT IG App - Complete Project Analysis

## Project Overview
**VNIT IG App** is a comprehensive web-based sports management and leaderboard system for VNIT (Visvesvaraya National Institute of Technology) Inter-General (IG) championships. It provides real-time match scoring, department leaderboards, and admin controls for managing sporting events across multiple sports.

---

## Architecture Overview

### Tech Stack
- **Frontend**: React 19.2 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js 5
- **Database**: MongoDB Atlas (Mongoose)
- **Real-time**: Socket.io 4.8.1
- **Authentication**: JWT + bcryptjs
- **HTTP Client**: Axios

### Project Structure
```
vnit-ig-app/
├── package.json (root - uses concurrently for dev mode)
├── client/ (React Frontend)
│   ├── src/
│   │   ├── pages/ (Route components)
│   │   ├── components/ (Reusable UI components)
│   │   ├── api/ (Axios setup)
│   │   ├── App.jsx (Main router)
│   │   └── socket.js (Socket.io setup)
│   └── vite.config.js
└── server/ (Express Backend)
    ├── models/ (MongoDB schemas)
    ├── controllers/ (Business logic)
    ├── routes/ (API endpoints)
    ├── middleware/ (Auth, file upload)
    ├── config/ (Database connection)
    ├── scripts/ (Seeding & testing)
    └── server.js (Main entry)
```

---

## Database Models

### 1. **Admin**
```javascript
{
  username: String (unique),
  password: String (hashed with bcrypt),
  timestamps: true
}
```
- Single admin authentication model
- Used for login verification
- Default admin: `admin` / `admin123` (set via `/api/auth/seed`)

### 2. **Department**
```javascript
{
  name: String (unique),
  shortCode: String (unique),
  logo: String (URL/path),
  timestamps: true
}
```
- Represents VNIT departments/teams
- Includes logo support for UI display
- Referenced by Match and PointLog

### 3. **Match** (Polymorphic via Mongoose Discriminators)
```javascript
Base Schema:
{
  sport: ENUM ['CRICKET', 'BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL', 
               'FOOTBALL', 'BASKETBALL', 'KHOKHO', 'KABADDI', 'CHESS'],
  teamA: ObjectId (Department),
  teamB: ObjectId (Department),
  winner: ObjectId (Department, optional),
  status: ENUM ['SCHEDULED', 'LIVE', 'COMPLETED'],
  scheduledAt: Date,
  venue: String,
  timestamps: true
}
```

**Discriminators (Sport-specific schemas):**

- **CricketMatch**: `scoreA/scoreB` with `{runs, wickets, overs}`, `totalOvers`
- **SetMatch** (Badminton, TT, Volleyball): `scoreA/scoreB` (sets won), `setDetails`, `currentSet`
- **GoalMatch** (Football, Basketball, KhoKho, Kabaddi): `scoreA/scoreB` (goals), `period`, `maxPeriods`
- **SimpleMatch** (Chess): `resultType` (CHECKMATE, RESIGNATION, STALEMATE, etc.)

### 4. **PointLog**
```javascript
{
  department: ObjectId (Department),
  eventName: String,
  category: ENUM ['Sports', 'Cultural', 'Literary', 'Arts', 'Other'],
  position: String (optional - e.g., "1st", "2nd"),
  points: Number,
  description: String (optional),
  awardedAt: Date (default: now),
  timestamps: true
}
```
- Tracks all point awards to departments
- Aggregated for leaderboard standings

---

## API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/login` | Public | Admin login (returns JWT token) |
| POST | `/seed` | Public | Create default admin (dev only) |

### Match Routes (`/api/matches`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/:sport/create` | Private | Create new match |
| PUT | `/:sport/update` | Private | Update match score/result |
| GET | `/:sport/:id` | Public | Get match details |
| GET | `/` | Public | List all matches |

**Sport Mapping:**
- Cricket → CricketMatch
- Badminton, Table Tennis, Volleyball → SetMatch
- Football, Basketball, KhoKho, Kabaddi → GoalMatch
- Chess → SimpleMatch

### Department Routes (`/api/departments`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | Get all departments |
| PUT | `/:id` | Private | Update department (upload logo) |

### Leaderboard Routes (`/api/leaderboard`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/award` | Private | Award points to department |
| GET | `/` | Public | Get standings with point history |

---

## Frontend Routes

### Public Routes
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home | Display all matches with filters |
| `/leaderboard` | Leaderboard | Show department standings |
| `/match/:id` | MatchDetail | View match details |
| `/login` | Login | Admin authentication |

### Admin Routes (Protected)
| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin` | Dashboard | Admin overview (stats) |
| `/admin/departments` | Departments | Manage departments & logos |
| `/admin/schedule` | ScheduleMatch | Create new matches |
| `/admin/live` | LiveConsole | Real-time score updates |
| `/admin/points` | AwardPoints | Award points manually |

---

## Core Components

### Frontend Components

**PublicNavbar**
- Navigation for public pages
- Login link for admin

**AdminLayout**
- Sidebar navigation for admin panel
- Protected route wrapper
- Nested routing for admin subpages

**ProtectedRoute**
- JWT verification wrapper
- Redirects unauthenticated users to login

**MatchCard**
- Displays single match summary
- Shows sport, teams, score, status
- Clickable for match details

**ScoringControls**
- Sport-specific score input UI
- Updates match in real-time
- Socket.io integration for live updates

**ConfirmModal**
- Confirmation dialog for destructive actions

---

## Real-time Features (Socket.io)

### Client Socket Setup
```javascript
// socket.js
const socket = io('http://localhost:5000', {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
```

### Socket Events
- **`connect`** / **`disconnect`**: Connection status
- **`matchUpdate`**: Real-time match score updates
- Broadcasting updates across all connected clients

---

## Authentication Flow

### Login Flow
1. User enters credentials on `/login`
2. POST to `/api/auth/login` with `{username, password}`
3. Server hashes password with bcrypt and compares
4. Returns JWT token (expires in 30 days)
5. Token stored in `localStorage` as `adminToken`
6. Axios interceptor adds token to all subsequent requests

### Protected Routes
- `ProtectedRoute` component checks for valid token
- Sends token in `Authorization: Bearer <token>` header
- Middleware verifies JWT on each protected endpoint
- Redirects to login if unauthorized

---

## Key Features

### 1. Multi-Sport Support
- 9 different sports with customized scoring models
- Polymorphic schema design using Mongoose discriminators
- Sport-specific controllers handle different scoring rules

### 2. Real-time Score Updates
- Socket.io broadcasts match updates to all connected clients
- Live leaderboard updates
- Match status changes reflected instantly

### 3. Leaderboard System
- Aggregates points from multiple sources:
  - Match wins (implied)
  - Manual point awards (cultural, literary events)
- Rankings sorted by total points
- Point history tracking per department

### 4. Admin Dashboard
- Overview of all matches (total, live, completed)
- Quick action buttons for common tasks
- Protected access with JWT authentication

### 5. File Upload Support
- Department logos upload via Multer
- Stores in `server/uploads/` directory
- Served as static files at `/uploads` endpoint

---

## Environment Configuration

### Server (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://[credentials]@[cluster].mongodb.net/vnit-ig-app
JWT_SECRET=secret123 (default if not set)
```

---

## Development Commands

### Root Level
```bash
npm start          # Runs server and client concurrently
```

### Client
```bash
npm run dev       # Vite dev server (port 5173)
npm run build     # Production build
npm run lint      # ESLint check
```

### Server
```bash
npm run server    # Nodemon dev server (port 5000)
```

### Utilities
```bash
# Seed default admin
curl -X POST http://localhost:5000/api/auth/seed

# Seed departments
npm run seedDepartments

# Test sports endpoints
npm run testSports
```

---

## Data Flow Example: Creating a Match

1. Admin goes to `/admin/schedule`
2. Selects sport, team A, team B, date/time
3. Submits form → POST `/api/matches/cricket/create`
4. Server creates CricketMatch document in MongoDB
5. Response includes match ID and initial state
6. Socket.io emits `matchUpdate` to all clients
7. Home page real-time updates match list
8. Match appears with SCHEDULED status

---

## Data Flow Example: Live Scoring

1. Match status changed to LIVE
2. Admin opens `/admin/live`
3. ScoringControls shows sport-specific inputs
4. Admin updates runs/wickets (cricket)
5. Submits → PUT `/api/matches/cricket/update`
6. Server updates CricketMatch score
7. Socket.io broadcasts `matchUpdate` event
8. All connected clients receive update
9. Home page and MatchDetail pages refresh instantly

---

## Security Considerations

✅ **Implemented:**
- Password hashing with bcryptjs
- JWT token-based authentication
- Protected admin routes
- CORS enabled for cross-origin requests
- Helmet.js for HTTP security headers

⚠️ **To Consider:**
- Environment variables should use proper secrets manager
- Protected admin routes should validate ownership
- Rate limiting on auth endpoints
- Input validation on all endpoints
- HTTPS in production

---

## Performance & Scalability

### Current State
- MongoDB Atlas for cloud database
- Socket.io for real-time without polling
- Vite for fast development builds
- Express middleware for efficient routing

### Potential Improvements
- Implement caching for leaderboard queries
- Pagination for match lists
- Compress images before upload
- CDN for static assets
- Database indexing on frequently queried fields

---

## Future Enhancement Opportunities

1. **Team Management**: Create teams dynamically, manage rosters
2. **Statistics**: Detailed player stats, head-to-head records
3. **Notifications**: Send alerts for match status changes
4. **Analytics**: Charts for performance trends
5. **Mobile App**: React Native version
6. **Scheduling Algorithm**: Auto-schedule matches
7. **Image Gallery**: Match photos/videos
8. **Social Features**: Comments, reactions on matches

---

## Deployment Notes

### Frontend
- Build output: `client/dist/`
- Can be deployed to Vercel, Netlify, AWS S3
- Environment: `VITE_API_URL` for backend endpoint

### Backend
- Nodemon restarts on file changes (dev)
- Use PM2 or similar for production
- Health check endpoint: `/api/health`
- MongoDB Atlas connection pooling configured

---

## File Upload Feature

- **Middleware**: Multer configured in `uploadMiddleware.js`
- **Storage**: `server/uploads/` directory
- **Serving**: Static files at `/uploads` route
- **Use Case**: Department logos in leaderboard

---

## Testing Utilities

- `verify_system.js`: System verification script
- `testSports.js`: Test API endpoints for each sport
- `seedDepartments.js`: Populate test departments

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| API Endpoints | 15+ |
| React Components | 8 |
| MongoDB Models | 4 |
| Sport Types | 9 |
| Admin Functions | 5 |
| Public Pages | 4 |
| Socket.io Events | 3+ |

---

## Getting Started

1. **Install dependencies**
   ```bash
   npm install && cd client && npm install && cd ../server && npm install
   ```

2. **Configure environment**
   - Update `server/.env` with MongoDB URI and JWT secret

3. **Seed data**
   ```bash
   cd server
   npm run seedDepartments
   ```

4. **Start application**
   ```bash
   npm start
   ```

5. **Access application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Admin Login: username `admin` / password `admin123`

---

## Project Status
✅ Core features implemented
✅ Real-time updates working
✅ Authentication secured
⚠️ Ready for production optimization
🚀 Scalable architecture in place
