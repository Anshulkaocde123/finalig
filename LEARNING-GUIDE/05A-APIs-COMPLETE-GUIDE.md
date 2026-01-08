# Chapter 5A: APIs Explained from Zero to Hero 🌐

## What You'll Learn

By the end of this chapter, you'll understand:
- What an API actually is
- How APIs work (request-response cycle)
- HTTP methods (GET, POST, PUT, DELETE)
- Status codes and what they mean
- Headers, body, and query parameters
- RESTful API design
- Building APIs with Express.js
- Testing APIs with Postman

---

## Part 1: What is an API?

### **The Restaurant Analogy**

```
YOU (Frontend) want food
  ↓
You tell WAITER (API) your order
  ↓
Waiter tells KITCHEN (Backend/Database)
  ↓
Kitchen prepares food
  ↓
Waiter brings food back to YOU
  ↓
You eat! (Display data)
```

**In Programming Terms:**

```
FRONTEND needs data
  ↓
Makes API REQUEST to backend
  ↓
BACKEND processes request (database query, calculations)
  ↓
BACKEND sends RESPONSE back to frontend
  ↓
FRONTEND displays data to user
```

### **API Definition**

**API** = **A**pplication **P**rogramming **I**nterface

**Simple Explanation:**  
A way for two programs to talk to each other.

**Real-World Examples:**

1. **Weather App:**
   ```
   Your Phone App → Weather API → Weather Server
   Request: "What's the weather in Mumbai?"
   Response: "28°C, Sunny"
   ```

2. **Google Maps:**
   ```
   Your Website → Google Maps API → Google Servers
   Request: "Show map of VNIT"
   Response: Map data + images
   ```

3. **Payment Gateway:**
   ```
   Shopping Site → Payment API → Bank Server
   Request: "Process ₹500 payment"
   Response: "Success! Transaction ID: 12345"
   ```

### **Our Sports App Example**

```
React Frontend → API → Express Backend → MongoDB

Example: Get all matches
Frontend: "Give me all football matches"
API: Processes request
Backend: Queries database
API: Returns match data
Frontend: Displays matches
```

---

## Part 2: How APIs Work - Request & Response

### **The Request-Response Cycle**

```
┌──────────────────────────────────────────────────────────┐
│                      CLIENT                               │
│                  (React Frontend)                         │
│                                                           │
│  User clicks "View Matches" button                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ 1. CREATE REQUEST
                     │    Method: GET
                     │    URL: http://localhost:5000/api/matches
                     │    Headers: { Authorization: "Bearer token123" }
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│                    THE INTERNET                           │
│                  (HTTP Protocol)                          │
│                                                           │
│  Request travels across network...                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│                      SERVER                               │
│                  (Express Backend)                        │
│                                                           │
│  2. RECEIVE REQUEST                                      │
│     - Check authorization header                         │
│     - Route to correct controller                        │
│                                                           │
│  3. PROCESS REQUEST                                      │
│     - Validate user token                                │
│     - Query database: Match.find()                       │
│     - Get all matches                                    │
│                                                           │
│  4. CREATE RESPONSE                                      │
│     Status: 200 OK                                       │
│     Body: { success: true, data: [...matches] }         │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│                    THE INTERNET                           │
│                  (HTTP Protocol)                          │
│                                                           │
│  Response travels back...                                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│                      CLIENT                               │
│                  (React Frontend)                         │
│                                                           │
│  5. RECEIVE RESPONSE                                     │
│     - Parse JSON data                                    │
│     - Update React state                                 │
│     - Render matches on screen                           │
│                                                           │
│  User sees matches! ✨                                   │
└──────────────────────────────────────────────────────────┘
```

### **Parts of a Request**

```javascript
// Example API Request
const response = await fetch('http://localhost:5000/api/matches/football', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
});
```

**Let's break down EVERY part:**

#### **1. URL (Uniform Resource Locator)**

```
http://localhost:5000/api/matches/football?status=live&limit=10
│      │           │    │              │      │                │
│      │           │    │              │      └─ Query params
│      │           │    │              └─ Path parameter
│      │           │    └─ Endpoint/Route
│      │           └─ Port
│      └─ Domain/Host
└─ Protocol
```

**Breaking it down:**

```javascript
// PROTOCOL
http://
// What is it? HyperText Transfer Protocol
// Why? Defines how data is sent across web
// Types:
//   - http:// = Not secure (dev only!)
//   - https:// = Secure with encryption (production!)

// DOMAIN/HOST
localhost
// What is it? Server address
// Examples:
//   - localhost = Your own computer
//   - vnit-ig.onrender.com = Production server
//   - 192.168.1.5 = Local network IP

// PORT
:5000
// What is it? Door number on the server
// Why? One server can run multiple apps
// Common ports:
//   - 5000: Backend development
//   - 5173: Vite frontend
//   - 3000: React/Node apps
//   - 80: Default HTTP
//   - 443: Default HTTPS

// BASE PATH
/api
// What is it? Prefix for all API routes
// Why? Organize routes, separate from web pages
// Example:
//   - /api/matches = API endpoint
//   - /about = Web page

// ENDPOINT
/matches/football
// What is it? Specific resource path
// Represents: Football matches collection

// PATH PARAMETER
/football
// What is it? Variable part of URL
// Example:
//   - /matches/football → Get football matches
//   - /matches/cricket → Get cricket matches
//   - /matches/64abc123 → Get match with ID 64abc123

// QUERY PARAMETERS
?status=live&limit=10
// What is it? Extra filters/options
// Format: ?key1=value1&key2=value2
// Examples:
//   - status=live → Only live matches
//   - limit=10 → Maximum 10 results
//   - page=2 → Second page of results
```

#### **2. HTTP Method (Verb)**

```javascript
// HTTP METHODS tell the server what action to perform
```

**GET** - Retrieve data (Read)

```javascript
// Example: Get all matches
fetch('/api/matches', {
    method: 'GET'
});

// What it does:
// - Reads data from server
// - Does NOT modify anything
// - Safe to repeat multiple times
// - Can be bookmarked

// Real-world analogy:
// Looking at a menu (doesn't change the menu)
```

**POST** - Create new data

```javascript
// Example: Create new match
fetch('/api/matches', {
    method: 'POST',
    body: JSON.stringify({
        sport: 'football',
        teamA: 'CSE',
        teamB: 'ECE',
        date: '2024-01-15'
    })
});

// What it does:
// - Creates NEW resource
// - Sends data in request body
// - NOT safe to repeat (creates duplicate!)

// Real-world analogy:
// Placing an order (creates new order)
```

**PUT** - Update existing data (Replace)

```javascript
// Example: Update entire match
fetch('/api/matches/64abc123', {
    method: 'PUT',
    body: JSON.stringify({
        sport: 'football',
        teamA: { score: 2 },
        teamB: { score: 1 },
        status: 'completed'
    })
});

// What it does:
// - REPLACES entire resource
// - Must send ALL fields
// - Updates existing record

// Real-world analogy:
// Rewriting entire document
```

**PATCH** - Update existing data (Modify)

```javascript
// Example: Update only score
fetch('/api/matches/64abc123', {
    method: 'PATCH',
    body: JSON.stringify({
        teamA: { score: 2 }
    })
});

// What it does:
// - Updates SPECIFIC fields only
// - Don't need to send all fields
// - More efficient than PUT

// Real-world analogy:
// Editing one word in document (not rewriting whole thing)
```

**DELETE** - Remove data

```javascript
// Example: Delete match
fetch('/api/matches/64abc123', {
    method: 'DELETE'
});

// What it does:
// - Removes resource
// - Usually no body needed
// - Can't be undone (usually)

// Real-world analogy:
// Throwing away paper (permanent)
```

**Quick Reference Table:**

```
┌────────┬─────────┬──────────────┬─────────────┐
│ Method │ Action  │ Has Body?    │ Idempotent? │
├────────┼─────────┼──────────────┼─────────────┤
│ GET    │ Read    │ No           │ Yes         │
│ POST   │ Create  │ Yes          │ No          │
│ PUT    │ Replace │ Yes          │ Yes         │
│ PATCH  │ Update  │ Yes          │ No          │
│ DELETE │ Remove  │ No (usually) │ Yes         │
└────────┴─────────┴──────────────┴─────────────┘

Idempotent = Safe to repeat (same result)
```

#### **3. Headers**

**Definition:** Metadata about the request

```javascript
headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123',
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0...'
}
```

**Common Headers Explained:**

```javascript
// ════════════════════════════════════════════════
// Content-Type
// ════════════════════════════════════════════════
'Content-Type': 'application/json'

// What it means:
// "I'm sending JSON data in the body"

// Other values:
'Content-Type': 'multipart/form-data'  // Uploading files
'Content-Type': 'text/html'            // HTML content
'Content-Type': 'application/x-www-form-urlencoded'  // Form data

// ════════════════════════════════════════════════
// Authorization
// ════════════════════════════════════════════════
'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// What it means:
// "Here's my authentication token to prove who I am"

// Format:
// Bearer <token>
// - Bearer: Authentication scheme
// - <token>: JWT token (your identity proof)

// ════════════════════════════════════════════════
// Accept
// ════════════════════════════════════════════════
'Accept': 'application/json'

// What it means:
// "I want response in JSON format"

// Other values:
'Accept': 'text/html'      // Want HTML
'Accept': 'image/png'      // Want image
'Accept': '*/*'            // Accept anything

// ════════════════════════════════════════════════
// User-Agent
// ════════════════════════════════════════════════
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'

// What it means:
// "I'm using Chrome browser on Windows"

// Automatically sent by browser
// Helps server identify client type
```

#### **4. Body**

**Definition:** Data being sent to server

```javascript
// ONLY for POST, PUT, PATCH (not GET/DELETE)

// Example 1: JSON Body
body: JSON.stringify({
    sport: 'football',
    teamA: 'CSE',
    teamB: 'ECE'
})

// JSON.stringify() converts JavaScript object to JSON string
// Before: { sport: 'football' }
// After: '{"sport":"football"}'
// Why? HTTP can only send text, not objects

// Example 2: Form Data (for file uploads)
const formData = new FormData();
formData.append('logo', fileInput.files[0]);
formData.append('name', 'Computer Science');

body: formData
// Don't use JSON.stringify with FormData!
```

### **Parts of a Response**

```javascript
// Example Response
HTTP/1.1 200 OK
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
    "success": true,
    "data": {
        "_id": "64abc123",
        "sport": "football",
        "teamA": {
            "department": "CSE",
            "score": 2
        },
        "teamB": {
            "department": "ECE",
            "score": 1
        }
    }
}
```

**Breaking it down:**

#### **1. Status Line**

```javascript
HTTP/1.1 200 OK
│        │   │
│        │   └─ Status Text
│        └─ Status Code
└─ Protocol Version
```

#### **2. Status Code**

**Definition:** Number indicating request result

**Categories:**

```javascript
// ════════════════════════════════════════════════
// 1xx - Informational (rare)
// ════════════════════════════════════════════════
100 Continue
// Server received request headers, send body

// ════════════════════════════════════════════════
// 2xx - Success ✅
// ════════════════════════════════════════════════
200 OK
// Request succeeded
// Example: GET request returned data

201 Created
// New resource created successfully
// Example: POST request created new match

204 No Content
// Request succeeded but no data to return
// Example: DELETE request successful

// ════════════════════════════════════════════════
// 3xx - Redirection
// ════════════════════════════════════════════════
301 Moved Permanently
// Resource moved to new URL forever

302 Found (Temporary Redirect)
// Resource temporarily at different URL

304 Not Modified
// Cached version still valid

// ════════════════════════════════════════════════
// 4xx - Client Error (YOUR mistake) ❌
// ════════════════════════════════════════════════
400 Bad Request
// Invalid request format
// Example: Missing required field

401 Unauthorized
// Not authenticated (no/invalid token)
// Example: Token expired or missing

403 Forbidden
// Authenticated but not allowed
// Example: Regular user trying admin action

404 Not Found
// Resource doesn't exist
// Example: Match ID doesn't exist in database

409 Conflict
// Request conflicts with current state
// Example: Creating match that already exists

422 Unprocessable Entity
// Request format correct but data invalid
// Example: Invalid email format

// ════════════════════════════════════════════════
// 5xx - Server Error (SERVER'S mistake) 💥
// ════════════════════════════════════════════════
500 Internal Server Error
// Something broke on server
// Example: Database connection failed

502 Bad Gateway
// Server got invalid response from another server

503 Service Unavailable
// Server temporarily down
// Example: Maintenance mode

504 Gateway Timeout
// Server didn't respond in time
```

**Remembering Status Codes:**

```
2xx = "Success! ✅"
4xx = "You messed up 🤦"
5xx = "We messed up 💥"
```

#### **3. Response Headers**

```javascript
// Similar to request headers, but sent by server

'Content-Type': 'application/json'
// Response is in JSON format

'Content-Length': '2048'
// Response body is 2048 bytes

'Set-Cookie': 'sessionId=abc123; HttpOnly'
// Server wants to set a cookie

'Cache-Control': 'max-age=3600'
// Browser can cache for 1 hour
```

#### **4. Response Body**

```javascript
// Data returned by server

// Success Response
{
    "success": true,
    "data": {
        "matches": [...]
    },
    "message": "Matches retrieved successfully"
}

// Error Response
{
    "success": false,
    "message": "Match not found",
    "error": "No match with ID 64abc123"
}
```

---

## Part 3: RESTful API Design

### **What is REST?**

**REST** = **RE**presentational **S**tate **T**ransfer

**Simple Explanation:**  
A set of rules for designing clean, predictable APIs.

### **REST Principles**

#### **1. Resource-Based URLs**

```javascript
// ✅ GOOD (RESTful)
GET    /api/matches           // Get all matches
GET    /api/matches/64abc123  // Get one match
POST   /api/matches           // Create match
PUT    /api/matches/64abc123  // Update match
DELETE /api/matches/64abc123  // Delete match

// ❌ BAD (Not RESTful)
GET    /api/getAllMatches
GET    /api/getMatchById?id=64abc123
POST   /api/createNewMatch
POST   /api/updateMatch
POST   /api/deleteMatch
```

**Rules:**

1. Use **nouns**, not verbs in URLs
   ```javascript
   ✅ /api/matches
   ❌ /api/getMatches
   ```

2. Use **plurals** for collections
   ```javascript
   ✅ /api/matches (collection)
   ✅ /api/matches/123 (single item)
   ❌ /api/match
   ```

3. Use **HTTP methods** for actions
   ```javascript
   ✅ GET /api/matches (read)
   ✅ POST /api/matches (create)
   ❌ GET /api/createMatch
   ```

#### **2. Nested Resources**

```javascript
// Get players in a match
GET /api/matches/64abc123/players

// Get goals in a match
GET /api/matches/64abc123/goals

// Get matches of a department
GET /api/departments/CSE/matches

// Breakdown:
// /api/matches/64abc123/players
//      │       │        └─ Sub-resource
//      │       └─ Parent ID
//      └─ Parent resource
```

#### **3. Query Parameters for Filtering**

```javascript
// Filter by status
GET /api/matches?status=live

// Filter by sport
GET /api/matches?sport=football

// Multiple filters
GET /api/matches?sport=football&status=live

// Pagination
GET /api/matches?page=2&limit=10

// Sorting
GET /api/matches?sort=date&order=desc
```

#### **4. Consistent Response Format**

```javascript
// ✅ GOOD (Consistent)

// Success
{
    "success": true,
    "data": { ... },
    "message": "Operation successful"
}

// Error
{
    "success": false,
    "message": "Error description",
    "error": "Detailed error info"
}

// ❌ BAD (Inconsistent)

// Sometimes
{ "result": [...] }

// Other times
{ "data": [...] }

// Other times
{ "matches": [...] }
```

---

## Part 4: Building APIs with Express.js

### **Express.js - Line by Line**

**File:** `server/routes/matchRoutes.js`

```javascript
// ════════════════════════════════════════════════
// Import required modules
// ════════════════════════════════════════════════

const express = require('express');
// What is express?
// - Web framework for Node.js
// - Makes building APIs easy
// - Handles routing, middleware, etc.

const router = express.Router();
// What is Router?
// - Mini Express app
// - Handles specific group of routes
// - Keeps code organized

// Why use Router?
// Instead of putting all routes in server.js:
// server.js → 1000 lines ❌
// Better approach:
// matchRoutes.js → 100 lines ✅
// playerRoutes.js → 100 lines ✅
// departmentRoutes.js → 100 lines ✅

const { protect, authorize } = require('../middleware/authMiddleware');
// Import middleware functions
// protect: Checks if user is logged in
// authorize: Checks if user has specific role

const {
    getAllMatches,
    getMatchById,
    createMatch,
    updateMatch,
    deleteMatch,
    updateScore
} = require('../controllers/matchController');
// Import controller functions
// Controllers contain the actual logic

// ════════════════════════════════════════════════
// Define Routes
// ════════════════════════════════════════════════

// ────────────────────────────────────────────────
// GET /api/matches - Get all matches
// ────────────────────────────────────────────────
router.get('/', getAllMatches);

// Breaking it down:
// ──────────────────────────────────────────────

// router.get
// - Define a GET route
// - Responds to GET requests only

// '/'
// - Path relative to base
// - Base is /api/matches (set in server.js)
// - Full path: /api/matches + / = /api/matches

// getAllMatches
// - Controller function to run
// - Defined in matchController.js
// - Gets called when route is hit

// Equivalent to:
router.get('/', function(req, res) {
    getAllMatches(req, res);
});

// ────────────────────────────────────────────────
// POST /api/matches - Create new match
// ────────────────────────────────────────────────
router.post('/', 
    protect,                    // Middleware 1: Check auth
    authorize('admin'),         // Middleware 2: Check role
    createMatch                 // Controller: Create match
);

// How this works:
// ──────────────────────────────────────────────

// 1. Request comes in: POST /api/matches
// 2. Runs protect middleware
//    - Checks JWT token
//    - If invalid → 401 Unauthorized
//    - If valid → Continue to next middleware
// 3. Runs authorize('admin') middleware
//    - Checks user role
//    - If not admin → 403 Forbidden
//    - If admin → Continue to controller
// 4. Runs createMatch controller
//    - Creates match in database
//    - Returns response

// Middleware chain:
// Request → protect → authorize → createMatch → Response

// ────────────────────────────────────────────────
// GET /api/matches/:id - Get one match
// ────────────────────────────────────────────────
router.get('/:id', getMatchById);

// :id is a URL parameter
// Examples:
// - GET /api/matches/64abc123 → id = "64abc123"
// - GET /api/matches/xyz789 → id = "xyz789"

// Access in controller:
// const matchId = req.params.id;

// ────────────────────────────────────────────────
// PUT /api/matches/:id - Update entire match
// ────────────────────────────────────────────────
router.put('/:id', 
    protect, 
    authorize('admin'), 
    updateMatch
);

// Full path: PUT /api/matches/64abc123
// Protected: Only admins can update

// ────────────────────────────────────────────────
// PATCH /api/matches/:id/score - Update score only
// ────────────────────────────────────────────────
router.patch('/:id/score', 
    protect, 
    authorize('admin'), 
    updateScore
);

// Full path: PATCH /api/matches/64abc123/score
// More specific than PUT (only updates score)

// ────────────────────────────────────────────────
// DELETE /api/matches/:id - Delete match
// ────────────────────────────────────────────────
router.delete('/:id', 
    protect, 
    authorize('super_admin'),   // Only super admin!
    deleteMatch
);

// Full path: DELETE /api/matches/64abc123
// Most restrictive: Only super_admin can delete

// ════════════════════════════════════════════════
// Export Router
// ════════════════════════════════════════════════
module.exports = router;

// Now this router can be imported in server.js:
// const matchRoutes = require('./routes/matchRoutes');
// app.use('/api/matches', matchRoutes);
```

### **Controller - Line by Line**

**File:** `server/controllers/matchController.js`

```javascript
const Match = require('../models/Match');
// Import Match model (Mongoose schema)

// ════════════════════════════════════════════════
// Get All Matches
// ════════════════════════════════════════════════
const getAllMatches = async (req, res) => {
    // Why async?
    // - Database operations are asynchronous
    // - Need to wait for results
    // - async allows us to use await
    
    try {
        // ────────────────────────────────────────────
        // STEP 1: Extract query parameters
        // ────────────────────────────────────────────
        const { sport, status, page = 1, limit = 10 } = req.query;
        
        // What is req.query?
        // - Object containing URL query parameters
        // - URL: /api/matches?sport=football&status=live
        // - req.query = { sport: 'football', status: 'live' }
        
        // Destructuring with defaults:
        // - page = 1: If no page param, default to 1
        // - limit = 10: If no limit param, default to 10
        
        // ────────────────────────────────────────────
        // STEP 2: Build filter object
        // ────────────────────────────────────────────
        const filter = {};
        
        if (sport) {
            filter.sport = sport;
        }
        // If sport param exists, add to filter
        // filter becomes { sport: 'football' }
        
        if (status) {
            filter.status = status;
        }
        // If status param exists, add to filter
        // filter becomes { sport: 'football', status: 'live' }
        
        // ────────────────────────────────────────────
        // STEP 3: Calculate pagination
        // ────────────────────────────────────────────
        const skip = (page - 1) * limit;
        
        // How pagination works:
        // Page 1: skip 0, show items 0-9
        // Page 2: skip 10, show items 10-19
        // Page 3: skip 20, show items 20-29
        
        // Formula: skip = (page - 1) * limit
        // Example: page=2, limit=10
        // skip = (2-1) * 10 = 10
        
        // ────────────────────────────────────────────
        // STEP 4: Query database
        // ────────────────────────────────────────────
        const matches = await Match.find(filter)
            .populate('teamA.department', 'name shortCode logo')
            .populate('teamB.department', 'name shortCode logo')
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        // Let's break down EACH method:
        // ──────────────────────────────────────────
        
        // Match.find(filter)
        // - Mongoose method to query database
        // - filter: { sport: 'football', status: 'live' }
        // - Returns: Array of matching documents
        // - SQL equivalent: SELECT * FROM matches WHERE sport='football' AND status='live'
        
        // .populate('teamA.department', 'name shortCode logo')
        // - Replace department ID with actual department data
        // - Before: teamA.department = "64xyz789"
        // - After: teamA.department = { name: "CSE", shortCode: "CS", logo: "..." }
        // - Second param: Which fields to include
        // - Why? Department is referenced by ID (MongoDB reference)
        
        // .sort({ date: -1 })
        // - Sort results by date field
        // - -1: Descending (newest first)
        // - 1: Ascending (oldest first)
        // - SQL equivalent: ORDER BY date DESC
        
        // .skip(skip)
        // - Skip first N results
        // - Used for pagination
        // - Example: skip(10) = Skip first 10 results
        // - SQL equivalent: OFFSET 10
        
        // .limit(parseInt(limit))
        // - Return max N results
        // - parseInt: Convert string to number
        // - Example: limit(10) = Return max 10 results
        // - SQL equivalent: LIMIT 10
        
        // ────────────────────────────────────────────
        // STEP 5: Get total count (for pagination)
        // ────────────────────────────────────────────
        const total = await Match.countDocuments(filter);
        
        // What does countDocuments do?
        // - Counts matching documents
        // - Doesn't return documents (faster!)
        // - Used to calculate total pages
        
        // ────────────────────────────────────────────
        // STEP 6: Send response
        // ────────────────────────────────────────────
        res.status(200).json({
            success: true,
            count: matches.length,
            total: total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: matches
        });
        
        // Breaking down the response:
        // ──────────────────────────────────────────
        
        // res.status(200)
        // - Set HTTP status code to 200 (OK)
        // - Indicates success
        
        // .json({ ... })
        // - Send JSON response
        // - Automatically sets Content-Type header
        // - Converts object to JSON string
        
        // success: true
        // - Custom field
        // - Frontend can check if request succeeded
        
        // count: matches.length
        // - Number of results in THIS page
        // - Example: 10 (showing 10 matches)
        
        // total: total
        // - Total number of matching matches in database
        // - Example: 45 (45 total football matches)
        
        // page: parseInt(page)
        // - Current page number
        // - Example: 2
        
        // pages: Math.ceil(total / limit)
        // - Total number of pages
        // - Math.ceil rounds up
        // - Example: total=45, limit=10 → pages=5
        // - Calculation: 45/10 = 4.5 → Math.ceil(4.5) = 5
        
        // data: matches
        // - Actual match documents
        
    } catch (error) {
        // Something went wrong
        
        console.error('Error getting matches:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error retrieving matches',
            error: error.message
        });
        
        // 500 = Internal Server Error
        // Our code broke (not client's fault)
    }
};

// ════════════════════════════════════════════════
// Create Match
// ════════════════════════════════════════════════
const createMatch = async (req, res) => {
    try {
        // ────────────────────────────────────────────
        // STEP 1: Get data from request body
        // ────────────────────────────────────────────
        const { sport, teamA, teamB, date, venue } = req.body;
        
        // What is req.body?
        // - Data sent by client in request body
        // - Parsed by express.json() middleware
        // - Example:
        //   {
        //     sport: 'football',
        //     teamA: { department: '64abc123' },
        //     teamB: { department: '64xyz789' },
        //     date: '2024-01-15',
        //     venue: 'Main Ground'
        //   }
        
        // ────────────────────────────────────────────
        // STEP 2: Validate required fields
        // ────────────────────────────────────────────
        if (!sport || !teamA || !teamB || !date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }
        
        // Why validate?
        // - Prevent creating incomplete documents
        // - Give helpful error messages
        // - Better than cryptic database errors
        
        // 400 = Bad Request
        // Client sent invalid/incomplete data
        
        // ────────────────────────────────────────────
        // STEP 3: Create new match document
        // ────────────────────────────────────────────
        const match = await Match.create({
            sport,
            teamA: {
                department: teamA.department,
                score: 0
            },
            teamB: {
                department: teamB.department,
                score: 0
            },
            date,
            venue,
            status: 'scheduled',
            createdBy: req.user._id
        });
        
        // What is Match.create()?
        // - Mongoose method
        // - Creates AND saves new document
        // - Returns created document
        // - Equivalent to:
        //   const match = new Match({ ... });
        //   await match.save();
        
        // score: 0
        // - Initialize scores to 0
        
        // status: 'scheduled'
        // - New matches start as scheduled
        
        // createdBy: req.user._id
        // - Who created this match?
        // - req.user set by protect middleware
        // - Useful for audit trails
        
        // ────────────────────────────────────────────
        // STEP 4: Send success response
        // ────────────────────────────────────────────
        res.status(201).json({
            success: true,
            message: 'Match created successfully',
            data: match
        });
        
        // 201 = Created
        // New resource created successfully
        
    } catch (error) {
        console.error('Error creating match:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error creating match',
            error: error.message
        });
    }
};

// ════════════════════════════════════════════════
// Export Controllers
// ════════════════════════════════════════════════
module.exports = {
    getAllMatches,
    createMatch,
    // ... other controllers
};
```

---

## Part 5: Complete API Flow Example

```
┌──────────────────────────────────────────────────────────┐
│ FRONTEND: User clicks "View Football Matches" button    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ React Component: MatchList.jsx                           │
│                                                           │
│ const fetchMatches = async () => {                      │
│     const response = await api.get('/matches', {        │
│         params: { sport: 'football', status: 'live' }   │
│     });                                                  │
│ };                                                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ HTTP GET Request
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Axios (HTTP Client)                                      │
│                                                           │
│ GET http://localhost:5000/api/matches?sport=football&... │
│ Headers:                                                 │
│   - Content-Type: application/json                      │
│   - Authorization: Bearer token123...                   │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ EXPRESS SERVER: server.js                               │
│                                                           │
│ app.use('/api/matches', matchRoutes);                   │
│                                                           │
│ Routes to → matchRoutes                                 │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ ROUTER: routes/matchRoutes.js                           │
│                                                           │
│ router.get('/', getAllMatches);                         │
│                                                           │
│ Calls → getAllMatches controller                        │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ CONTROLLER: controllers/matchController.js              │
│                                                           │
│ const getAllMatches = async (req, res) => {            │
│     const filter = { sport: 'football' };               │
│     const matches = await Match.find(filter);           │
│     res.json({ success: true, data: matches });         │
│ };                                                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ MONGOOSE: Database Query                                │
│                                                           │
│ Match.find({ sport: 'football' })                       │
│                                                           │
│ Queries → MongoDB                                        │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ MONGODB: Database                                        │
│                                                           │
│ Searches matches collection...                          │
│ Returns matching documents                              │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Returns data
                     ↓
┌──────────────────────────────────────────────────────────┐
│ MONGOOSE: Converts to JavaScript objects                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Returns to controller
                     ↓
┌──────────────────────────────────────────────────────────┐
│ CONTROLLER: Sends response                              │
│                                                           │
│ res.json({ success: true, data: [...] })                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ HTTP Response
                     ↓
┌──────────────────────────────────────────────────────────┐
│ AXIOS: Receives response                                │
│                                                           │
│ response.data = { success: true, data: [...] }          │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Returns to component
                     ↓
┌──────────────────────────────────────────────────────────┐
│ REACT COMPONENT: Updates state                          │
│                                                           │
│ setMatches(response.data.data);                         │
│                                                           │
│ UI re-renders with new data! ✨                         │
└──────────────────────────────────────────────────────────┘
```

---

## Summary & Quiz

### **Key Terminology**

✅ **API**: Interface for programs to communicate  
✅ **HTTP**: Protocol for web communication  
✅ **Request**: Message from client to server  
✅ **Response**: Message from server to client  
✅ **Endpoint**: Specific URL path for a resource  
✅ **Method**: HTTP verb (GET, POST, PUT, DELETE)  
✅ **Status Code**: Number indicating request result  
✅ **Header**: Metadata about request/response  
✅ **Body**: Data being sent  
✅ **Query Parameter**: URL filter (?key=value)  
✅ **REST**: Design pattern for APIs  
✅ **Router**: Express component for organizing routes  
✅ **Controller**: Function containing business logic  
✅ **Middleware**: Function that runs before controller  

### **Quiz Questions**

1. What's the difference between PUT and PATCH?
2. What status code means "created successfully"?
3. What's the purpose of query parameters?
4. Why use Router in Express?
5. What does `.populate()` do in Mongoose?

---

**Next Chapter:** Authentication & Authorization Deep Dive →

Learn how login, JWT tokens, and security work!
