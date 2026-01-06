# Chapter 5: Routes and API Endpoints 🛣️

## What are Routes?

**Simple Analogy:**
- Your application is like a **hotel**
- Routes are **room numbers**
- Each room (route) has a specific purpose

```
Hotel (Your API):
  /api/departments  → Room 101 (Department information desk)
  /api/matches      → Room 102 (Match scheduling desk)
  /api/leaderboard  → Room 103 (Scoreboard room)
```

---

## 🌐 RESTful API Design

**REST = Representational State Transfer**

It's a **standard way** to design APIs using HTTP methods.

### HTTP Methods (Verbs)

```javascript
GET     → Retrieve data    (Read)
POST    → Create data      (Create)
PUT     → Update data      (Update/Replace)
PATCH   → Partial update   (Modify)
DELETE  → Remove data      (Delete)
```

**Analogy:**
```
Library:
GET    → Browse books (just looking)
POST   → Add new book to collection
PUT    → Replace entire book
PATCH  → Fix typos in book
DELETE → Remove book from collection
```

---

## 📋 RESTful Route Patterns

### Standard CRUD Routes

```javascript
// DEPARTMENTS RESOURCE

GET    /api/departments           // Get all departments
GET    /api/departments/:id       // Get one department by ID
POST   /api/departments           // Create new department
PUT    /api/departments/:id       // Update department
DELETE /api/departments/:id       // Delete department

// MATCHES RESOURCE

GET    /api/matches               // Get all matches
GET    /api/matches/:id           // Get specific match
POST   /api/matches/create        // Create new match
PUT    /api/matches/:id           // Update match
DELETE /api/matches/:id           // Delete match
```

---

## 🏗️ Creating Routes in Your Project

### Step 1: Define Routes File

**File:** `server/routes/departmentRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const {
    getDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');

// Import auth middleware
const { protect } = require('../middleware/authMiddleware');

// ============================================
// ROUTES
// ============================================

// @route   GET /api/departments
// @desc    Get all departments
// @access  Public
router.get('/', getDepartments);

// @route   GET /api/departments/:id
// @desc    Get department by ID
// @access  Public
router.get('/:id', getDepartmentById);

// @route   POST /api/departments
// @desc    Create new department
// @access  Private (Admin only)
router.post('/', protect, createDepartment);

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (Admin only)
router.put('/:id', protect, updateDepartment);

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Private (Admin only)
router.delete('/:id', protect, deleteDepartment);

module.exports = router;
```

### Line-by-Line Breakdown

```javascript
// 1. Import Express
const express = require('express');

// 2. Create router (mini-application)
const router = express.Router();
// Router handles routes for one resource (departments)

// 3. Import controller functions
const {
    getDepartments,        // Handler for GET all
    getDepartmentById,     // Handler for GET one
    createDepartment,      // Handler for POST (create)
    updateDepartment,      // Handler for PUT (update)
    deleteDepartment       // Handler for DELETE
} = require('../controllers/departmentController');
// Destructuring: extract specific functions from module

// 4. Import middleware
const { protect } = require('../middleware/authMiddleware');
// protect = Check if user is logged in

// 5. Define routes
router.get('/', getDepartments);
//     └─ HTTP method
//         └─ Path (relative to /api/departments)
//              └─ Handler function

// 6. Route with middleware
router.post('/', protect, createDepartment);
//              └─ Middleware (runs first)
//                       └─ Handler (runs if middleware passes)

// 7. Route with parameter
router.get('/:id', getDepartmentById);
//          └─ :id is a parameter
//             Available in handler as: req.params.id

// 8. Export router
module.exports = router;
// Make available for use in server.js
```

---

### Step 2: Register Routes in Server

**File:** `server/server.js`

```javascript
// Import routes
const departmentRoutes = require('./routes/departmentRoutes');
const matchRoutes = require('./routes/matchRoutes');

// Register routes
app.use('/api/departments', departmentRoutes);
app.use('/api/matches', matchRoutes);

// HOW IT WORKS:
// Request: GET /api/departments
//   ↓
// Express matches: /api/departments
//   ↓
// Forwards to: departmentRoutes
//   ↓
// departmentRoutes finds: GET /
//   ↓
// Calls: getDepartments()
```

---

## 🎯 Route Parameters

### 1. URL Parameters (`:param`)

```javascript
// Route definition
router.get('/match/:id', getMatchById);

// When user visits: /api/match/12345
// In controller:
const getMatchById = (req, res) => {
    const id = req.params.id;  // '12345'
    // Use id to fetch match from database
};

// Multiple parameters
router.get('/match/:matchId/team/:teamId', getTeamInMatch);
// /api/match/111/team/222
// req.params.matchId = '111'
// req.params.teamId = '222'
```

### 2. Query Parameters (`?key=value`)

```javascript
// Route definition (no change needed)
router.get('/matches', getAllMatches);

// When user visits: /api/matches?sport=CRICKET&status=LIVE
// In controller:
const getAllMatches = (req, res) => {
    const sport = req.query.sport;    // 'CRICKET'
    const status = req.query.status;  // 'LIVE'
    
    // Use in database query
    const matches = await Match.find({ sport, status });
};

// Multiple query params:
// /api/matches?sport=CRICKET&status=LIVE&limit=10
// req.query = {
//     sport: 'CRICKET',
//     status: 'LIVE',
//     limit: '10'
// }
```

### 3. Request Body (POST/PUT data)

```javascript
// Route definition
router.post('/matches', createMatch);

// Client sends:
POST /api/matches
Body: {
    "sport": "CRICKET",
    "teamA": "cseId",
    "teamB": "ceId"
}

// In controller:
const createMatch = (req, res) => {
    const { sport, teamA, teamB } = req.body;
    // sport = 'CRICKET'
    // teamA = 'cseId'
    // teamB = 'ceId'
    
    const match = await Match.create({ sport, teamA, teamB });
    res.status(201).json(match);
};
```

---

## 🔧 Advanced Routing: Match Routes

**File:** `server/routes/matchRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const cricketController = require('../controllers/sports/cricketController');

// ============================================
// GENERIC MATCH ROUTES
// ============================================

// Get all matches (with filters)
router.get('/', matchController.getAllMatches);
// Example: /api/matches?sport=CRICKET&status=LIVE

// Get match by ID
router.get('/:id', matchController.getMatchById);
// Example: /api/matches/507f1f77bcf86cd799439011

// ============================================
// SPORT-SPECIFIC ROUTES
// ============================================

// Cricket match creation
router.post('/cricket/create', cricketController.createMatch);

// Update cricket score
router.post('/cricket/:matchId/score', cricketController.updateScore);

// Add run
router.post('/cricket/:matchId/run', cricketController.addRun);

// Add wicket
router.post('/cricket/:matchId/wicket', cricketController.addWicket);

module.exports = router;
```

### Dynamic Sport Routing

```javascript
// Map sports to controllers
const SPORT_CONTROLLER_MAP = {
    'cricket': cricketController,
    'badminton': setController,
    'football': scoreController
};

// Middleware to validate sport
const validateSport = (req, res, next) => {
    const sport = req.params.sport.toLowerCase();
    const controller = SPORT_CONTROLLER_MAP[sport];
    
    if (!controller) {
        return res.status(400).json({ 
            message: `Invalid sport: ${sport}` 
        });
    }
    
    req.sportController = controller;
    next();
};

// Dynamic routes
router.post('/:sport/create', validateSport, (req, res) => {
    req.sportController.createMatch(req, res);
});

// USAGE:
// POST /api/matches/cricket/create  → Uses cricketController
// POST /api/matches/football/create → Uses scoreController
```

---

## 🎭 Route Middleware

Middleware runs **before** your route handler.

```javascript
// Example: Authentication middleware
const protect = (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Verify token...
    req.user = decodedUser;
    next();  // Continue to route handler
};

// Apply to specific routes
router.post('/create', protect, createMatch);
//                      └─ Middleware
//                               └─ Handler

// Apply to all routes in this file
router.use(protect);  // All routes below this need auth

// EXECUTION ORDER:
// Request
//   ↓
// protect middleware
//   ↓ (if token valid)
// createMatch handler
//   ↓
// Response
```

---

## 📡 Complete API Examples

### Example 1: Get All Matches with Filters

**Route:**
```javascript
router.get('/', getAllMatches);
```

**Controller:**
```javascript
const getAllMatches = async (req, res) => {
    const { sport, status, limit = 50, page = 1 } = req.query;
    
    const query = {};
    
    if (sport) query.sport = sport.toUpperCase();
    if (status) query.status = status.toUpperCase();
    
    const matches = await Match.find(query)
        .populate('teamA', 'name shortCode')
        .populate('teamB', 'name shortCode')
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .sort({ scheduledAt: -1 });
    
    const total = await Match.countDocuments(query);
    
    res.json({
        success: true,
        data: matches,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
    });
};
```

**API Call:**
```
GET /api/matches?sport=CRICKET&status=LIVE&page=1&limit=10
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "...",
            "sport": "CRICKET",
            "status": "LIVE",
            "teamA": {
                "name": "Computer Science",
                "shortCode": "CSE"
            },
            "teamB": {
                "name": "Civil Engineering",
                "shortCode": "CE"
            }
        }
    ],
    "page": 1,
    "pages": 3,
    "total": 25
}
```

---

### Example 2: Create Match

**Route:**
```javascript
router.post('/cricket/create', protect, createCricketMatch);
```

**Controller:**
```javascript
const createCricketMatch = async (req, res) => {
    const { teamA, teamB, scheduledAt, venue, totalOvers } = req.body;
    
    // Validation
    if (!teamA || !teamB) {
        return res.status(400).json({ 
            message: 'Teams are required' 
        });
    }
    
    // Create match
    const match = await CricketMatch.create({
        sport: 'CRICKET',
        teamA,
        teamB,
        scheduledAt,
        venue,
        totalOvers: totalOvers || 20,
        status: 'SCHEDULED',
        scoreA: { runs: 0, wickets: 0, overs: 0 },
        scoreB: { runs: 0, wickets: 0, overs: 0 }
    });
    
    res.status(201).json({
        success: true,
        data: match
    });
};
```

**API Call:**
```
POST /api/matches/cricket/create
Headers: {
    "Authorization": "Bearer eyJhbGc...",
    "Content-Type": "application/json"
}
Body: {
    "teamA": "507f1f77bcf86cd799439011",
    "teamB": "507f1f77bcf86cd799439012",
    "scheduledAt": "2025-01-20T10:00:00Z",
    "venue": "Main Ground",
    "totalOvers": 20
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "507f1f77bcf86cd799439013",
        "sport": "CRICKET",
        "teamA": "507f1f77bcf86cd799439011",
        "teamB": "507f1f77bcf86cd799439012",
        "status": "SCHEDULED",
        "scoreA": { "runs": 0, "wickets": 0, "overs": 0 },
        "scoreB": { "runs": 0, "wickets": 0, "overs": 0 },
        "totalOvers": 20
    }
}
```

---

### Example 3: Update Match Score (Real-time)

**Route:**
```javascript
router.post('/cricket/:matchId/run', protect, addRun);
```

**Controller:**
```javascript
const addRun = async (req, res) => {
    const { matchId } = req.params;
    const { team, runs } = req.body;
    
    const match = await CricketMatch.findById(matchId);
    
    if (!match) {
        return res.status(404).json({ message: 'Match not found' });
    }
    
    // Update score
    if (team === 'A') {
        match.scoreA.runs += runs;
    } else {
        match.scoreB.runs += runs;
    }
    
    match.status = 'LIVE';
    await match.save();
    
    // Emit socket event for real-time update
    req.app.get('io').emit('matchUpdate', match);
    
    res.json({
        success: true,
        data: match
    });
};
```

**API Call:**
```
POST /api/matches/cricket/507f1f77bcf86cd799439013/run
Headers: { "Authorization": "Bearer ..." }
Body: {
    "team": "A",
    "runs": 4
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "507f1f77bcf86cd799439013",
        "scoreA": { "runs": 54, "wickets": 2, "overs": 8.3 },
        "scoreB": { "runs": 0, "wickets": 0, "overs": 0 },
        "status": "LIVE"
    }
}
```

**Socket.io emits to all connected clients:**
```javascript
// All clients receive:
socket.on('matchUpdate', (match) => {
    // Update UI with new score
    updateMatchDisplay(match);
});
```

---

## 🔗 Route Organization Best Practices

### 1. Group Related Routes

```javascript
// ❌ BAD: All in server.js
app.get('/api/departments', getDepartments);
app.post('/api/departments', createDepartment);
app.get('/api/matches', getMatches);
app.post('/api/matches', createMatch);
// 100+ routes → messy!

// ✅ GOOD: Separate files
// server.js
app.use('/api/departments', departmentRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
```

### 2. Use Consistent Naming

```javascript
// ✅ GOOD: RESTful patterns
GET    /api/matches
GET    /api/matches/:id
POST   /api/matches
PUT    /api/matches/:id
DELETE /api/matches/:id

// ❌ BAD: Inconsistent
GET    /api/get-matches
GET    /api/match-by-id/:id
POST   /api/create-new-match
PUT    /api/update-match/:id
DELETE /api/remove-match/:id
```

### 3. Versioning

```javascript
// Future-proof API
app.use('/api/v1/matches', matchRoutesV1);
app.use('/api/v2/matches', matchRoutesV2);

// When you need to change API structure:
// v1 still works for old clients
// v2 has new features
```

### 4. Nested Resources

```javascript
// Get matches for a specific department
GET /api/departments/:deptId/matches

// Get comments for a match
GET /api/matches/:matchId/comments

// Implementation:
router.get('/:deptId/matches', getDepartmentMatches);

const getDepartmentMatches = async (req, res) => {
    const { deptId } = req.params;
    const matches = await Match.find({
        $or: [
            { teamA: deptId },
            { teamB: deptId }
        ]
    });
    res.json(matches);
};
```

---

## 🎯 Testing Routes

### Using Postman

1. **GET Request**
   ```
   Method: GET
   URL: http://localhost:5000/api/matches
   ```

2. **POST Request**
   ```
   Method: POST
   URL: http://localhost:5000/api/matches/cricket/create
   Headers:
     Content-Type: application/json
     Authorization: Bearer <token>
   Body (raw JSON):
   {
       "teamA": "507f1f77bcf86cd799439011",
       "teamB": "507f1f77bcf86cd799439012"
   }
   ```

3. **Query Parameters**
   ```
   URL: http://localhost:5000/api/matches?sport=CRICKET&status=LIVE
   ```

### Using cURL (Command Line)

```bash
# GET request
curl http://localhost:5000/api/matches

# GET with query params
curl "http://localhost:5000/api/matches?sport=CRICKET"

# POST request
curl -X POST http://localhost:5000/api/matches/cricket/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"teamA":"507f1f77bcf86cd799439011","teamB":"507f1f77bcf86cd799439012"}'
```

---

## ✅ Key Takeaways

1. **Routes define API endpoints**
   - Map URLs to controller functions
   - Use HTTP methods (GET, POST, PUT, DELETE)

2. **RESTful design**
   - Standard patterns for CRUD operations
   - Predictable and easy to understand

3. **Parameters**
   - URL params: `/api/match/:id`
   - Query params: `/api/matches?sport=CRICKET`
   - Body data: POST/PUT requests

4. **Middleware**
   - Runs before route handlers
   - Authentication, validation, logging

5. **Organization**
   - Separate files for different resources
   - Register in server.js

---

## 🚀 Next Chapter

Let's explore React and how the frontend works!

**Next:** [Chapter 6: React Frontend Fundamentals](./06-REACT-FUNDAMENTALS.md)

---

*Remember: Good routes = Easy-to-use API!*
