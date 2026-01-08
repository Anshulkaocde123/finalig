# Chapter 3: Backend Deep Dive - Complete server.js Line-by-Line Explanation 🔧

This guide provides an EXHAUSTIVE explanation of every single line in your `server/server.js` file.

## 📖 Quick Navigation

1. **Lines 1-9**: Imports & Dependencies  
2. **Lines 11-16**: Environment Setup  
3. **Lines 18-36**: Database Connection  
4. **Lines 38-61**: Express & Socket.io Setup  
5. **Lines 64-126**: Middleware Configuration  
6. **Lines 129-172**: Socket.io Event Handling  
7. **Lines 175-238**: API Route Mounting  
8. **Lines 241-275**: Error Handling & SPA Fallback  
9. **Lines 278-326**: Server Startup & Process Handlers  

---

## 🔷 SECTION 1: IMPORTS & DEPENDENCIES (Lines 1-9)

These lines import all the packages and modules your server needs to function.

### Line 1: Express Framework
```javascript
const express = require('express');
```

**Explanation:**
- **What:** Imports the Express.js framework
- **Why:** Express simplifies web server creation
- **Without Express:** Would need 100+ lines of raw Node.js HTTP code
- **With Express:** Same functionality in 10-20 lines

**What Express provides:**
- Routing (mapping URLs to functions)
- Middleware (request processing pipeline)
- Request/Response helpers
- Template engine support

---

### Line 2: HTTP Module
```javascript
const http = require('http');
```

**Explanation:**
- **What:** Node.js built-in HTTP server module
- **Why:** Required to wrap Express for Socket.io integration
- **Type:** Core Node.js module (no npm install needed)

**How it's used:**
```javascript
// Instead of:
app.listen(5000);

// We do:
const server = http.createServer(app);
server.listen(5000);
```

---

### Line 3: Socket.io Server
```javascript
const { Server } = require('socket.io');
```

**Explanation:**
- **What:** Real-time bidirectional communication library
- **Syntax:** `{ Server }` uses ES6 destructuring to extract only the Server class
- **Why:** Enables instant updates without page refresh

**Real-time communication comparison:**
```
Traditional HTTP:
Client → Server: "Give me data"
Server → Client: "Here's data"
(Client must keep asking for updates)

Socket.io WebSocket:
Client ←→ Server: Persistent connection
Server → Client: "Data changed!" (instant push)
```

---

### Line 4: CORS Middleware
```javascript
const cors = require('cors');
```

**Explanation:**
- **What:** Cross-Origin Resource Sharing middleware
- **Why:** Allows frontend (different domain/port) to access backend API
- **Problem it solves:** Browser security blocks cross-origin requests by default

**Example scenario:**
```
Frontend:  http://localhost:5173 (Vite dev server)
Backend:   http://localhost:5000 (Express server)
Different ports = Different origins = Blocked by browser
CORS middleware = Allows these requests
```

**Without CORS:**
```
Error: Access to XMLHttpRequest blocked by CORS policy
```

---

### Line 5: dotenv for Environment Variables
```javascript
const dotenv = require('dotenv');
```

**Explanation:**
- **What:** Loads environment variables from `.env` file
- **Why:** Keeps secrets (passwords, API keys) out of code
- **Security:** `.env` files are in `.gitignore` so they never reach GitHub

**Bad practice (hardcoded secrets):**
```javascript
const dbPassword = "mySecretPass123";  // ❌ Exposed in code!
```

**Good practice (environment variables):**
```javascript
const dbPassword = process.env.DB_PASSWORD;  // ✅ Safe in .env file
```

**.env file example:**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=super_secret_key_xyz_123
PORT=5000
NODE_ENV=production
```

---

### Line 6: Path Utilities
```javascript
const path = require('path');
```

**Explanation:**
- **What:** Node.js built-in path manipulation utilities
- **Why:** Cross-platform file path handling
- **Problem:** Windows uses `\`, Linux/Mac use `/`

**Useful path methods:**
```javascript
path.join(__dirname, 'uploads', 'logo.png')
// Result: /home/user/project/server/uploads/logo.png

path.basename('/path/to/file.txt')    // 'file.txt'
path.dirname('/path/to/file.txt')     // '/path/to'
path.extname('document.pdf')          // '.pdf'
```

---

### Line 7: Helmet Security
```javascript
const helmet = require('helmet');
```

**Explanation:**
- **What:** Security middleware that sets HTTP headers
- **Why:** Protects against common web vulnerabilities

**Headers it sets:**
- `X-Content-Type-Options: nosniff` (prevents MIME sniffing attacks)
- `X-Frame-Options: DENY` (prevents clickjacking)
- `Strict-Transport-Security` (enforces HTTPS)
- And 11 more security headers

**Note:** Currently commented out in your code for debugging

---

### Line 8: Morgan Logger
```javascript
const morgan = require('morgan');
```

**Explanation:**
- **What:** HTTP request logger middleware
- **Why:** See what requests are hitting your API (debugging/monitoring)

**Example output:**
```
GET /api/matches 200 156ms - 1542 bytes
POST /api/matches/create 201 89ms - 234 bytes
GET /api/leaderboard 304 12ms
```

**Log formats:**
```javascript
morgan('dev')       // Colorful, detailed (development)
morgan('tiny')      // Minimal
morgan('combined')  // Apache standard (production)
```

---

### Line 9: Compression
```javascript
const compression = require('compression');
```

**Explanation:**
- **What:** Compresses HTTP responses (gzip/deflate)
- **Why:** Reduces data transfer by ~70%
- **Result:** Faster page loads, less bandwidth

**Example:**
```
Without compression: 500KB JSON response
With compression:    150KB compressed response
```

---

## 🔷 SECTION 2: ENVIRONMENT CONFIGURATION (Lines 11-16)

### Line 12: Load Environment Variables
```javascript
dotenv.config({ path: path.join(__dirname, '.env') });
```

**Explanation:**
- **What:** Loads variables from `.env` file into `process.env`
- **Path:** `__dirname` + `.env` = current directory's .env file

**What is `__dirname`?**
- Global variable in Node.js
- Contains absolute path to current file's directory
- Example: `/home/user/vnit-app/server`

**After this line:**
```javascript
// Values from .env are now available:
process.env.MONGODB_URI    // "mongodb+srv://..."
process.env.JWT_SECRET     // "my_secret_key"
process.env.PORT           // "5000"
```

---

### Lines 14-16: Startup Logging
```javascript
console.log('🔄 Starting VNIT IG App Server...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 MongoDB URI: ${process.env.MONGODB_URI ? 'SET' : 'NOT SET'}`);
```

**Line 14 Explanation:**
- Simple startup message with emoji for visibility

**Line 15 Explanation - Template Literals:**
```javascript
`Environment: ${process.env.NODE_ENV || 'development'}`
  └─ Backticks allow embedded expressions with ${...}

process.env.NODE_ENV || 'development'
  └─ If NODE_ENV exists, use it; otherwise use 'development'
```

**Line 16 Explanation - Ternary Operator:**
```javascript
process.env.MONGODB_URI ? 'SET' : 'NOT SET'
  └─ If MONGODB_URI exists, print 'SET'
  └─ If undefined/null, print 'NOT SET'
```

---

## 🔷 SECTION 3: DATABASE & ROUTES (Lines 18-36)

### Line 18: Import Database Connection
```javascript
const connectDB = require('./config/db');
```

**Explanation:**
- **What:** Imports your custom MongoDB connection function
- **Location:** `./config/db.js` file

**What's in config/db.js:**
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`);
        return null;
    }
};

module.exports = connectDB;
```

---

### Lines 20-29: Import Route Files
```javascript
const matchRoutes = require('./routes/matchRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
// ... etc
```

**Explanation:**
- **What:** Imports route handlers from separate files
- **Why:** Organizes code by feature (matches, departments, etc.)
- **Pattern:** Each feature gets its own route file

**How routes are structured:**
```javascript
// routes/matchRoutes.js
const router = require('express').Router();
const { getAllMatches, createMatch } = require('../controllers/matchController');

router.get('/', getAllMatches);           // GET /api/matches
router.get('/:id', getMatchById);         // GET /api/matches/:id  
router.post('/create', createMatch);      // POST /api/matches/create

module.exports = router;
```

**Used later with:**
```javascript
app.use('/api/matches', matchRoutes);
// All routes in matchRoutes.js get /api/matches prefix
```

---

### Lines 32-36: Connect to MongoDB Asynchronously
```javascript
console.log('🔄 Initiating MongoDB connection in background...');
connectDB()
    .then(() => console.log('✅ MongoDB connection completed'))
    .catch((err) => console.error('❌ MongoDB connection error:', err.message));
```

**Critical Understanding - WHY Async:**

**BLOCKING approach (BAD):**
```javascript
await connectDB();  // Wait 10 seconds for database
server.listen(5000);  // Server starts AFTER database connects
// Problem: If DB is slow, server doesn't start!
```

**NON-BLOCKING approach (GOOD - what we use):**
```javascript
connectDB().then(...);  // Start connecting in background
server.listen(5000);  // Server starts IMMEDIATELY
// Database connects while server is already running
```

**Promise chain explained:**
```javascript
connectDB()                     // Returns a Promise
    .then(() => {               // Executes if successful
        console.log('✅ Connected');
    })
    .catch((err) => {           // Executes if error
        console.error('❌ Error:', err.message);
    });
```

---

## 🔷 SECTION 4: EXPRESS APP & SOCKET.IO (Lines 38-61)

### Line 38: Create Express Application
```javascript
const app = express();
```

**Explanation:**
- **What:** Creates an Express application instance
- **Analogy:** Building a restaurant - `app` is your restaurant

**What you can do with `app`:**
```javascript
app.get('/route', handler);      // Define GET route
app.post('/route', handler);     // Define POST route
app.use(middleware);             // Add middleware
app.set('key', value);           // Set configuration
app.listen(5000);                // Start server
```

---

### Line 41: Create HTTP Server
```javascript
const server = http.createServer(app);
```

**Explanation:**
- **What:** Wraps Express app in HTTP server
- **Why:** Socket.io requires HTTP server, not just Express app

**Comparison:**
```javascript
// Normal Express (no Socket.io):
app.listen(5000);

// With Socket.io (what we use):
const server = http.createServer(app);
const io = new Server(server);
server.listen(5000);
```

---

### Lines 44-58: Initialize Socket.io
```javascript
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    connectTimeout: 45000,
    pingInterval: 25000,
    pingTimeout: 60000,
    upgradeSide: ['server'],
    perMessageDeflate: false,
    allowUpgrades: true
});
```

**Line-by-line breakdown:**

**`new Server(server, { ... })`**
- Creates Socket.io instance attached to HTTP server

**`cors: { origin: '*' }`**
- Allows connections from any origin
- Production: Set to specific frontend domain

**`methods: ['GET', 'POST', ...]`**
- HTTP methods allowed for CORS preflight

**`credentials: true`**
- Allows cookies and auth headers

**`transports: ['websocket', 'polling']`**
- **websocket**: Fast, bidirectional (preferred)
- **polling**: HTTP fallback if WebSocket blocked

**`connectTimeout: 45000`**
- 45 seconds to establish connection
- After this, connection attempt fails

**`pingInterval: 25000`**
- Server pings client every 25 seconds
- Keeps connection alive, detects dead connections

**`pingTimeout: 60000`**
- If no ping response in 60 seconds → disconnect
- Cleans up dead connections

**`upgradeSide: ['server']`**
- Server controls connection upgrades
- Starts with polling, upgrades to WebSocket

**`perMessageDeflate: false`**
- Disables per-message compression
- Better performance for small messages

**`allowUpgrades: true`**
- Allows upgrading from polling to WebSocket

---

### Line 61: Make Socket.io Accessible
```javascript
app.set('io', io);
```

**Explanation:**
- **What:** Stores `io` instance in Express app settings
- **Why:** Makes Socket.io accessible in routes/controllers
- **Pattern:** Avoids importing `io` in every file

**How to use later:**
```javascript
// In any controller:
const io = req.app.get('io');
io.emit('matchUpdate', matchData);
// Broadcasts update to all connected clients
```

---

## 🔷 SECTION 5: MIDDLEWARE & ROUTES (Lines 64-126)

### Lines 64-66: Health Check Route
```javascript
app.get('/alive', (req, res) => {
    res.json({ status: 'alive' });
});
```

**Explanation:**
- **What:** Simple health check endpoint
- **Why:** Deployment platforms (Render, Railway) ping this to verify server is running
- **Response:** Instant, no database or processing

**Testing:**
```bash
curl http://localhost:5000/alive
# Response: {"status":"alive"}
```

---

### Lines 69-82: Socket Status Endpoint  
```javascript
app.get('/api/socket-status', (req, res) => {
    const clients = [];
    for (const [socketId, data] of connectedClients.entries()) {
        clients.push({
            socketId,
            connectedAt: data.connectedAt,
            transport: data.transport,
            connectedFor: Math.floor((new Date() - data.connectedAt) / 1000) + 's'
        });
    }
    res.json({
        totalClients: connectedClients.size,
        clients,
        serverTime: new Date()
    });
});
```

**Explanation:**
- **What:** Debugging endpoint showing all connected Socket.io clients
- **Returns:** List of clients with connection details

**`for (const [socketId, data] of connectedClients.entries())`**
- Loops through Map entries
- Destructures each into `socketId` and `data`

**`Math.floor((new Date() - data.connectedAt) / 1000)`**
- Current time - connection time = milliseconds
- Divide by 1000 = seconds

**Example response:**
```json
{
  "totalClients": 3,
  "clients": [
    {
      "socketId": "abc123",
      "connectedAt": "2026-01-08T10:00:00.000Z",
      "transport": "websocket",
      "connectedFor": "145s"
    }
  ],
  "serverTime": "2026-01-08T10:02:25.000Z"
}
```

---

### Lines 90-93: CORS Middleware
```javascript
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
```

**Explanation:**
- **What:** Enables Cross-Origin Resource Sharing
- **Why:** Allows frontend (different port) to access backend

**`origin: process.env.CORS_ORIGIN || '*'`**
- Production: Use specific domain from env
- Development: Allow all origins (`*`)

**`credentials: true`**
- Allows cookies and authorization headers

---

### Line 96: Compression
```javascript
app.use(compression());
```

**Explanation:**
- Compresses all HTTP responses
- Reduces payload size by ~70%

---

### Lines 99-100: Body Parsers
```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

**`express.json()`**
- Parses JSON request bodies
- Makes data available in `req.body`

**Example:**
```javascript
// Frontend sends:
axios.post('/api/matches', { teamA: 'CSE', teamB: 'ECE' });

// Backend receives:
req.body = { teamA: 'CSE', teamB: 'ECE' }
```

**`express.urlencoded({ extended: true })`**
- Parses form data
- `extended: true` allows nested objects

---

### Line 103: Serve Static Files
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

**Explanation:**
- **What:** Serves files from `uploads` folder
- **URL:** Files accessible at `/uploads/...`

**Example:**
```
File: server/uploads/departments/cse-logo.png
URL:  http://localhost:5000/uploads/departments/cse-logo.png
```

---

### Lines 106-121: Serve Production Frontend
```javascript
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '../client/dist');
    console.log('📁 Serving static files from:', clientBuildPath);
    
    const fs = require('fs');
    if (fs.existsSync(clientBuildPath)) {
        console.log('✅ Client build directory exists');
        const files = fs.readdirSync(clientBuildPath);
        console.log('📂 Files in dist:', files.slice(0, 5).join(', '));
    } else {
        console.log('❌ Client build directory NOT found');
    }
    
    app.use(express.static(clientBuildPath));
}
```

**Explanation:**
- **What:** In production, serves React build files
- **When:** Only when `NODE_ENV=production`
- **Path:** Goes up one level from server to client/dist

**Path construction:**
```
__dirname              = /home/user/project/server
..                     = go up one level = /home/user/project
client/dist           = /home/user/project/client/dist
```

---

### Lines 124-126: Development Logging
```javascript
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}
```

**Explanation:**
- Only logs requests in development
- Keeps production logs clean

---

## 🔷 SECTION 6: SOCKET.IO HANDLING (Lines 129-172)

### Line 129: Connected Clients Map
```javascript
const connectedClients = new Map();
```

**Explanation:**
- **What:** Tracks all connected Socket.io clients
- **Why Map vs Object:** Better performance for frequent add/remove operations

**Map advantages:**
```javascript
// Object:
clients[socketId] = data;
delete clients[socketId];

// Map (better):
clients.set(socketId, data);
clients.delete(socketId);
clients.size  // Instant count
```

---

### Lines 131-163: Connection Handler
```javascript
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    connectedClients.set(socket.id, {
        connectedAt: new Date(),
        transport: socket.conn.transport.name
    });
    console.log('📊 Total connected clients:', connectedClients.size);

    socket.emit('connected', {
        socketId: socket.id,
        timestamp: new Date()
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ Client disconnected:', socket.id, `(${reason})`);
        connectedClients.delete(socket.id);
        console.log('📊 Total connected clients:', connectedClients.size);
    });

    socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
    });

    socket.on('error', (error) => {
        console.error('❌ Socket error:', socket.id, error);
    });

    socket.on('ping', () => {
        socket.emit('pong');
    });
});
```

**Complete breakdown:**

**`io.on('connection', (socket) => { })`**
- Fires when any client connects
- `socket` = individual connection object

**`socket.id`**
- Unique ID for this connection (e.g., "abc123XyZ")
- Changes if client reconnects

**`socket.emit('connected', data)`**
- Sends event to THIS client only
- Different from `io.emit()` which broadcasts to ALL

**`socket.on('disconnect', (reason))`**
- Fires when client disconnects
- Common reasons:
  - `'transport close'` - Connection lost
  - `'client namespace disconnect'` - Client called disconnect()
  - `'ping timeout'` - No ping response

**`connectedClients.delete(socket.id)`**
- Removes from tracking
- Prevents memory leaks

---

## 🔷 SECTION 7: API ROUTES (Lines 175-238)

### Lines 216-238: Mount All Routes
```javascript
console.log('📍 Mounting API routes...');
app.use('/api/auth', require('./routes/authRoutes'));
console.log('📍 Auth routes mounted');
app.use('/api/matches', matchRoutes);
console.log('📍 Matches routes mounted');
// ... etc
```

**How route mounting works:**

**`app.use('/api/matches', matchRoutes)`**
```javascript
// In matchRoutes.js:
router.get('/', getAllMatches);
router.get('/:id', getMatchById);
router.post('/create', createMatch);

// After mounting at /api/matches:
// GET  /api/matches          → getAllMatches
// GET  /api/matches/:id      → getMatchById
// POST /api/matches/create   → createMatch
```

**Why prefix with /api?**
1. Organization - all API routes grouped
2. Versioning - could have /api/v1, /api/v2
3. Clarity - easy to see it's an API endpoint

---

## 🔷 SECTION 8: ERROR HANDLING & SPA (Lines 241-275)

### Lines 241-249: Error Handler
```javascript
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});
```

**Explanation:**
- **What:** Global error handler for all routes
- **Signature:** 4 parameters (err, req, res, next) identifies it as error middleware

**Status code logic:**
```javascript
// If status is still 200 (default), use 500
// Otherwise keep the already-set status
const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
```

**Stack trace logic:**
```javascript
// Development: Show full error stack (helpful)
// Production: Hide stack (security)
stack: process.env.NODE_ENV === 'production' ? null : err.stack
```

---

### Lines 252-275: SPA Fallback
```javascript
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '../client/dist');
    const fs = require('fs');
    const indexPath = path.join(clientBuildPath, 'index.html');
    
    app.use((req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            return next();
        }
        
        console.log('🔄 SPA fallback for:', req.path);
        res.sendFile(indexPath, (err) => {
            if (err) {
                console.error('❌ Error sending file:', err.message);
                res.status(500).send('Error loading application');
            }
        });
    });
}
```

**Why needed - Single Page Application routing:**

**Problem:**
```
User visits: https://myapp.com/leaderboard
Browser requests /leaderboard from server
Server has no /leaderboard route
Server: 404 Not Found ❌
```

**Solution:**
```
User visits: /leaderboard
Server sends index.html (React app)
React loads and checks URL
React Router shows Leaderboard component ✅
```

**Skip for API routes:**
```javascript
if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();  // Let API handlers process these
}
```

---

## 🔷 SECTION 9: SERVER STARTUP (Lines 278-326)

### Lines 278-287: Configuration & Logging
```javascript
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 VNIT IG App Server Starting');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Binding to: ${HOST}:${PORT}`);
console.log(`🗄️  Database: ${process.env.MONGODB_URI ? 'Configured' : 'NOT SET'}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
```

**`const HOST = '0.0.0.0'`**
- Binds to all network interfaces
- Allows external connections

**`0.0.0.0` vs `localhost`:**
```
localhost (127.0.0.1): Only accessible from this computer
0.0.0.0: Accessible from anywhere (required for deployment)
```

---

### Lines 290-295: Start Server
```javascript
const serverInstance = server.listen(PORT, HOST, () => {
    console.log(`✅ Server successfully listening on ${HOST}:${PORT}`);
    console.log(`🔌 Socket.io ready for connections`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
```

**Explanation:**
- **What:** Starts HTTP server and begins listening
- **Callback:** Runs when server is ready
- **`serverInstance`:** Stored for later configuration

---

### Lines 298-299: Timeout Configuration
```javascript
serverInstance.setTimeout(120000);  // 2 minutes
serverInstance.keepAliveTimeout = 65000;
```

**`setTimeout(120000)`**
- Request timeout: 2 minutes
- Prevents requests from hanging forever

**`keepAliveTimeout = 65000`**
- Keep connection alive for 65 seconds
- Reuses connections instead of opening new ones

---

### Lines 303-326: Process Error Handlers
```javascript
serverInstance.on('error', (err) => {
    console.error('❌ Server Error:', err);
    process.exit(1);
});

serverInstance.on('clientError', (err, socket) => {
    console.error('❌ Client socket error:', err.message);
    if (socket.writable) {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    process.exit(1);
});
```

**Server error handler:**
- Catches server startup errors
- Common: Port already in use

**Client error handler:**
- Handles bad client connections
- Sends 400 Bad Request if possible

**Uncaught exception:**
- Catches errors not caught by try-catch
- Exits process (unstable state)

**Unhandled rejection:**
- Catches Promise rejections without .catch()
- Prevents silent failures

---

## 🎯 COMPLETE REQUEST FLOW EXAMPLE

Let's trace: **GET /api/matches**

**1. Client makes request:**
```javascript
axios.get('http://localhost:5000/api/matches')
```

**2. Server receives:**
```javascript
server.listen(5000)  // Receives request
```

**3. CORS middleware:**
```javascript
app.use(cors())  // Checks origin allowed
```

**4. JSON parser:**
```javascript
app.use(express.json())  // Parses body (none for GET)
```

**5. Morgan logging:**
```javascript
app.use(morgan('dev'))  // Logs: GET /api/matches
```

**6. Route matching:**
```javascript
app.use('/api/matches', matchRoutes)  // Forwards
```

**7. Route handler:**
```javascript
router.get('/', getAllMatches)  // Calls controller
```

**8. Controller:**
```javascript
const getAllMatches = async (req, res) => {
    const matches = await Match.find();
    res.json(matches);
};
```

**9. Response sent:**
```javascript
[
    { _id: '123', sport: 'CRICKET', ... },
    { _id: '456', sport: 'FOOTBALL', ... }
]
```

**10. Client receives:**
```javascript
.then(response => {
    setMatches(response.data);
});
```

---

## ✅ KEY TAKEAWAYS

1. **Middleware = Request Pipeline**
   - Functions that process requests before routes
   - Order matters! CORS before routes, error handler last

2. **Async Operations**
   - Database queries are async (use await)
   - MongoDB connection doesn't block server startup

3. **Socket.io for Real-time**
   - Persistent connection for instant updates
   - Server can push without client asking

4. **Environment Variables**
   - Never hardcode secrets
   - Use .env file and dotenv

5. **Error Handling**
   - Try-catch in async functions
   - Global error middleware
   - Process-level handlers

6. **Production vs Development**
   - Different logging
   - Stack traces only in dev
   - Static file serving in production

---

## 📚 Next Steps

- **Chapter 4:** [Database Concepts](./04-DATABASE-CONCEPTS.md)
- **Chapter 5:** [Routes and APIs](./05-ROUTES-AND-APIs.md)
- **Chapter 9:** [Socket.io Real-Time](./09-SOCKET-IO-REAL-TIME.md)

---

*Every line explained! You now understand your entire server.js file! 🎉*
