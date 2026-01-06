# Chapter 3: Backend Deep Dive 🔧

## What is Backend?

**Simple Analogy:**
- **Frontend** = Restaurant dining area (what customers see)
- **Backend** = Kitchen (where food is prepared)
- **Database** = Storage room (where ingredients are kept)

The backend receives requests, processes them, interacts with the database, and sends responses.

---

## 🏗️ Building a Server from Scratch

### Step 1: Initialize Node.js Project

```bash
mkdir my-server
cd my-server
npm init -y
```

**What happens:**
- Creates `package.json` file
- This file tracks dependencies and scripts

### Step 2: Install Express

```bash
npm install express
```

**What this does:**
- Downloads Express package
- Adds it to `node_modules/` folder
- Updates `package.json` dependencies

### Step 3: Create Basic Server

**File:** `server.js`

```javascript
// Import Express
const express = require('express');

// Create app
const app = express();

// Define a route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

**Run it:**
```bash
node server.js
```

**Test it:**
```
Open browser: http://localhost:5000
You'll see: "Hello World!"
```

---

## 📋 Line-by-Line: Your server.js

Let's break down your actual server file:

**File:** `server/server.js`

```javascript
// ============================================
// IMPORTS (Line 1-8)
// ============================================

const express = require('express');
// Import Express framework
// Allows us to create web server easily

const http = require('http');
// Node.js built-in module for HTTP
// Needed for Socket.io integration

const { Server } = require('socket.io');
// Import Socket.io for real-time features
// Destructuring: get 'Server' class from socket.io

const cors = require('cors');
// Cross-Origin Resource Sharing
// Allows frontend (different domain) to connect

const dotenv = require('dotenv');
// Load environment variables from .env file
// Keeps secrets safe (not in code)

const helmet = require('helmet');
// Security middleware
// Adds various HTTP headers for protection

const morgan = require('morgan');
// Logging middleware
// Shows request details in console (for debugging)

const connectDB = require('./config/db');
// Import our custom database connection function
```

### Understanding `require()`

```javascript
// THREE types of require:

// 1. Built-in Node.js modules (no npm install needed)
const http = require('http');
const path = require('path');

// 2. External packages (from npm)
const express = require('express');  // From node_modules/express
const cors = require('cors');        // From node_modules/cors

// 3. Your own files (relative path)
const connectDB = require('./config/db');     // Same folder
const routes = require('../routes/match');    // Parent folder
```

---

```javascript
// ============================================
// ROUTE IMPORTS (Line 10-17)
// ============================================

const matchRoutes = require('./routes/matchRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const seasonRoutes = require('./routes/seasonRoutes');
const scoringPresetRoutes = require('./routes/scoringPresetRoutes');
const studentCouncilRoutes = require('./routes/studentCouncilRoutes');
const aboutRoutes = require('./routes/aboutRoutes');

// WHY import routes here?
// Later we'll tell Express to use these routes
// Example: app.use('/api/matches', matchRoutes)
```

---

```javascript
// ============================================
// ENVIRONMENT VARIABLES (Line 19-20)
// ============================================

dotenv.config();
// This ONE line loads .env file
// After this, you can use: process.env.VARIABLE_NAME

console.log('🔄 Starting VNIT IG App Server...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Example .env file:
// NODE_ENV=production
// MONGODB_URI=mongodb://...
// JWT_SECRET=mysecretkey

// After dotenv.config():
// process.env.NODE_ENV = 'production'
// process.env.MONGODB_URI = 'mongodb://...'
```

### What is `process.env`?

```javascript
// process.env is an object with environment variables

// Without .env file (hardcoded - BAD):
const dbUrl = "mongodb://user:password@host";  // ❌ Exposed!

// With .env file (GOOD):
const dbUrl = process.env.MONGODB_URI;  // ✅ Secret stays in .env

// .env is in .gitignore, so it's never uploaded to GitHub
```

---

```javascript
// ============================================
// DATABASE CONNECTION (Line 25-30)
// ============================================

console.log('🔄 Connecting to MongoDB...');
connectDB().then(() => {
    console.log('✅ MongoDB connection completed');
}).catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    // Continue anyway - app can work without DB for now
});

// BREAKDOWN:

// connectDB() returns a Promise
// Promise = "I'll do this task, but it takes time"

// .then() = What to do if successful
// .catch() = What to do if error

// Same code with async/await:
try {
    await connectDB();
    console.log('✅ MongoDB connection completed');
} catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
}
```

### Understanding Promises

```javascript
// ANALOGY: Ordering food

// Synchronous (blocking) - BAD for servers:
const food = makeFood();  // Wait here until food is ready (5 minutes)
console.log('Food ready!');
// Server is frozen for 5 minutes!

// Asynchronous (non-blocking) - GOOD:
makeFood().then(food => {
    console.log('Food ready!');
});
console.log('Taking other orders...');
// Server continues working while food is being made

// ACTUAL CODE EXAMPLE:

// Without Promise:
// const conn = mongoose.connect(uri);  // Wait until connected (10 seconds)
// console.log('Connected');  // Runs after 10 seconds

// With Promise:
mongoose.connect(uri).then(conn => {
    console.log('Connected');  // Runs when ready
});
console.log('Server starting...');  // Runs immediately
```

---

```javascript
// ============================================
// CREATE EXPRESS APP (Line 32)
// ============================================

const app = express();

// This creates your web application
// Think of it as creating a restaurant
// Now we need to:
// 1. Set up tables (routes)
// 2. Hire staff (middleware)
// 3. Open for business (listen on port)
```

---

```javascript
// ============================================
// CREATE HTTP SERVER & SOCKET.IO (Line 34-51)
// ============================================

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Why http.createServer(app)?
// Express app needs to be wrapped for Socket.io
// Normal: app.listen(3000)
// With Socket.io: server.listen(3000)

// Initialize Socket.io with CORS and connection settings
const io = new Server(server, {
    cors: {
        origin: '*',                    // Allow any origin (frontend domain)
        methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed HTTP methods
        credentials: true               // Allow cookies
    },
    transports: ['websocket', 'polling'],  // Connection methods
    connectTimeout: 45000,              // 45 seconds to connect
    pingInterval: 25000,                // Ping every 25 seconds (keep alive)
    pingTimeout: 60000,                 // 60 seconds without response = disconnect
});

// Make io accessible to routes/controllers
app.set('io', io);

// WHY make io accessible?
// Controllers can emit real-time updates:
// req.app.get('io').emit('matchUpdate', data);
```

### What is Socket.io?

```javascript
// HTTP (Normal requests):
Client → Server: "Give me data"
Server → Client: "Here's the data"
// Client must keep asking for updates

// WebSocket (Socket.io):
Client ←→ Server: Always connected
// Server can push updates WITHOUT client asking

// Example:
// Match score changes
// HTTP: Frontend asks every 2 seconds "What's the score?"
// Socket.io: Backend sends update immediately when score changes

// Real-time flow:
// 1. Client connects
io.on('connection', (socket) => {
    console.log('Client connected');
    
    // 2. Server sends update
    socket.emit('scoreUpdate', { runs: 50, wickets: 2 });
    
    // 3. Client receives instantly (no request needed)
});
```

---

```javascript
// ============================================
// MIDDLEWARE (Line 54-75)
// ============================================

// Test route (before middleware)
app.get('/alive', (req, res) => {
    res.json({ status: 'alive' });
});
// Used for health checks (Railway pings this to verify server is running)

// CORS middleware
app.use(cors());
// Allows frontend (http://localhost:3000) to connect to backend (http://localhost:5000)
// Without this: "CORS error" - browser blocks the request

// Body parser middleware
app.use(express.json());
// Parses JSON in request body
// Without this: req.body = undefined

app.use(express.urlencoded({ extended: true }));
// Parses URL-encoded data (form submissions)

// Serve static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Makes uploads folder accessible via URL
// Example: http://localhost:5000/uploads/logo.png

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '../client/dist');
    app.use(express.static(clientBuildPath));
}
// In production, Express serves the built React app

// Logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}
// Logs each request:
// GET /api/matches 200 150ms
```

### Middleware Flow Diagram

```
Request: GET /api/matches
    ↓
┌─────────────────────────┐
│ app.use(cors())         │ ← Check origin allowed
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ app.use(express.json()) │ ← Parse JSON body
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ app.use(morgan('dev'))  │ ← Log request
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Route Handler           │ ← Your code
│ matchRoutes             │
└─────────────────────────┘
    ↓
Response: JSON data
```

---

```javascript
// ============================================
// SOCKET.IO CONNECTION HANDLING (Line 85-98)
// ============================================

io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    
    // socket.id = unique identifier for this connection
    // Example: "Abc123XyZ"

    socket.on('disconnect', (reason) => {
        console.log('❌ Client disconnected:', socket.id, `(${reason})`);
    });
    // Reasons: 'transport close', 'client namespace disconnect', etc.

    socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
    });
});

// COMPLETE SOCKET.IO EXAMPLE:

// SERVER
io.on('connection', (socket) => {
    console.log('Client connected');
    
    // Listen for event from client
    socket.on('updateScore', (data) => {
        console.log('Received:', data);
        // Broadcast to ALL clients
        io.emit('scoreChanged', data);
    });
});

// CLIENT (React)
import io from 'socket.io-client';
const socket = io('http://localhost:5000');

// Send event to server
socket.emit('updateScore', { runs: 50 });

// Listen for events from server
socket.on('scoreChanged', (data) => {
    console.log('Score updated:', data);
    setScore(data.runs);
});
```

---

```javascript
// ============================================
// API ROUTES (Line 100-120)
// ============================================

app.use('/api/matches', matchRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/scoring-presets', scoringPresetRoutes);
app.use('/api/student-council', studentCouncilRoutes);
app.use('/api/about', aboutRoutes);

// WHAT THIS MEANS:
// All routes in matchRoutes.js are prefixed with /api/matches

// Example:
// matchRoutes.js:
router.get('/', getAllMatches);           // Actual route: /api/matches/
router.get('/:id', getMatchById);         // Actual route: /api/matches/:id
router.post('/create', createMatch);      // Actual route: /api/matches/create

// WHY prefix?
// 1. Organization (all API routes under /api)
// 2. Versioning (can have /api/v1, /api/v2)
// 3. Clarity (easy to see it's an API endpoint)
```

---

```javascript
// ============================================
// FRONTEND CATCH-ALL (Line 125-135)
// ============================================

if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(
            path.join(__dirname, '../client/dist', 'index.html')
        );
    });
}

// WHAT THIS DOES:
// In production, ALL unmatched routes serve React's index.html

// Example flow:
// User types: myapp.com/leaderboard
//   ↓
// Express: Not /api/... route
//   ↓
// Send index.html (React app)
//   ↓
// React Router: Sees /leaderboard
//   ↓
// Shows Leaderboard component

// WHY?
// Single Page Application (SPA)
// React handles routing on frontend
// Backend only handles /api routes
```

---

```javascript
// ============================================
// ERROR HANDLING (Line 137-170)
// ============================================

// Not found middleware
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// Generic error handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

// ERROR HANDLING FLOW:

// 1. User requests: /api/invalid-route

// 2. No route matches

// 3. Not found middleware runs:
const error = new Error('Not Found - /api/invalid-route');
res.status(404);  // Set status to 404
next(error);      // Pass to error handler

// 4. Error handler runs:
res.status(404).json({
    message: 'Not Found - /api/invalid-route',
    stack: '...'  // Only in development
});

// 5. Client receives:
{
    "message": "Not Found - /api/invalid-route"
}
```

### Custom Error Handling

```javascript
// In controller:
const getMatch = async (req, res) => {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
        res.status(404);
        throw new Error('Match not found');
        // Error handler catches this
    }
    
    res.json(match);
};

// Error handler sends:
{
    "message": "Match not found"
}
```

---

```javascript
// ============================================
// START SERVER (Line 172-250)
// ============================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});

// BREAKDOWN:

const PORT = process.env.PORT || 5000;
// Use PORT from environment, or default to 5000
// Railway/Heroku provide PORT automatically

server.listen(PORT, '0.0.0.0', () => {
//            └─ Port     └─ Host (0.0.0.0 = all network interfaces)
//                              └─ Callback (runs when server starts)
    console.log(`Server running on port ${PORT}`);
});

// WHY '0.0.0.0'?
// localhost (127.0.0.1) = Only accessible from this computer
// 0.0.0.0 = Accessible from any network interface
// Necessary for deployment (Railway, AWS, etc.)
```

---

## 🎯 Complete Request-Response Cycle

Let's trace a complete example: **Get all matches**

### 1. Client Makes Request

```javascript
// React component
axios.get('/api/matches')
```

### 2. Express Receives Request

```javascript
// server.js
app.use('/api/matches', matchRoutes);
// Forwards to matchRoutes
```

### 3. Router Finds Route

```javascript
// routes/matchRoutes.js
router.get('/', getAllMatches);
// Calls getAllMatches controller
```

### 4. Controller Processes

```javascript
// controllers/matchController.js
const getAllMatches = async (req, res) => {
    // Get data from database
    const matches = await Match.find();
    
    // Send response
    res.json(matches);
};
```

### 5. Database Query

```javascript
// Match.find() queries MongoDB
// Returns array of match documents
```

### 6. Response Sent

```javascript
// res.json(matches) sends:
[
    { _id: '123', sport: 'CRICKET', ... },
    { _id: '456', sport: 'FOOTBALL', ... }
]
```

### 7. Client Receives

```javascript
// React component
.then(response => {
    setMatches(response.data);
    // Update UI with data
});
```

---

## 🔍 Common Backend Patterns

### Pattern 1: Try-Catch for Error Handling

```javascript
const createMatch = async (req, res) => {
    try {
        // Attempt operation
        const match = await Match.create(req.body);
        res.status(201).json(match);
    } catch (error) {
        // Handle error
        res.status(400).json({ message: error.message });
    }
};
```

### Pattern 2: Input Validation

```javascript
const createMatch = async (req, res) => {
    const { teamA, teamB, sport } = req.body;
    
    // Validate input
    if (!teamA || !teamB || !sport) {
        res.status(400);
        throw new Error('Please provide teamA, teamB, and sport');
    }
    
    // Proceed with creation
    const match = await Match.create({ teamA, teamB, sport });
    res.status(201).json(match);
};
```

### Pattern 3: Async Handler Wrapper

```javascript
// Instead of writing try-catch everywhere:
const asyncHandler = require('express-async-handler');

const getAllMatches = asyncHandler(async (req, res) => {
    const matches = await Match.find();
    res.json(matches);
    // No try-catch needed! asyncHandler catches errors
});
```

### Pattern 4: Middleware Chain

```javascript
const { protect, admin } = require('../middleware/authMiddleware');

// Multiple middleware
router.post('/create', 
    protect,      // First: Check if logged in
    admin,        // Second: Check if admin
    createMatch   // Third: Create match
);

// Execution order:
// Request → protect → admin → createMatch → Response
//           └─ If fails, stop here
//                      └─ If fails, stop here
```

---

## 📊 HTTP Status Codes Reference

```javascript
// SUCCESS
200 - OK (General success)
201 - Created (POST request succeeded)
204 - No Content (DELETE succeeded)

// CLIENT ERRORS
400 - Bad Request (Invalid data)
401 - Unauthorized (Need to login)
403 - Forbidden (Logged in but not allowed)
404 - Not Found (Resource doesn't exist)

// SERVER ERRORS
500 - Internal Server Error (Something broke)
503 - Service Unavailable (Server down)

// USAGE EXAMPLES:
res.status(200).json(data);                    // Success
res.status(201).json(newMatch);                // Created
res.status(400).json({ error: 'Invalid' });    // Bad request
res.status(404).json({ error: 'Not found' });  // Not found
res.status(500).json({ error: 'Server error' }); // Server error
```

---

## ✅ Key Takeaways

1. **Express makes servers easy**
   - Routing, middleware, request/response handling

2. **Middleware is powerful**
   - Functions that run before your code
   - CORS, JSON parsing, authentication

3. **Async/await for database operations**
   - Database queries take time
   - Don't block the server

4. **Error handling is crucial**
   - Try-catch blocks
   - Status codes
   - Clear error messages

5. **Environment variables for security**
   - Never hardcode secrets
   - Use .env file

---

## 🚀 Next Chapter

Now let's dive into database concepts and MongoDB!

**Next:** [Chapter 4: Database Concepts](./04-DATABASE-CONCEPTS.md)

---

*Remember: Backend is the brain of your application!*
