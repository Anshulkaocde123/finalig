# Chapter 12: Step-by-Step Backend Building Guide 🏗️

## Complete Backend Setup with Commands & Explanations

A comprehensive guide to building the entire backend from scratch with every command explained.

---

## Table of Contents
1. [Project Setup](#project-setup)
2. [Installing Dependencies](#installing-dependencies)
3. [Creating Project Structure](#creating-project-structure)
4. [Database Configuration](#database-configuration)
5. [Creating Models](#creating-models)
6. [Creating Routes](#creating-routes)
7. [Creating Controllers](#creating-controllers)
8. [Middleware](#middleware)
9. [Server Configuration](#server-configuration)
10. [Running the Backend](#running-the-backend)
11. [Testing with Postman](#testing-with-postman)

---

## Project Setup

### Step 1: Create Project Folder

```bash
# Create a new folder for your project
mkdir vnit-ig-backend
cd vnit-ig-backend

# What this does:
# mkdir   = make directory (create folder)
# cd      = change directory (enter folder)
```

### Step 2: Initialize Node.js Project

```bash
npm init -y

# What this does:
# npm init -y = Create package.json with default settings
# -y = Say "yes" to all questions automatically

# Creates file: package.json
# package.json is like the "recipe" file for your project
# It lists:
# - Project name and version
# - All dependencies (libraries you use)
# - Scripts to run your project
```

### Step 3: View Initial Structure

```bash
ls -la

# Output:
# package.json    ← Configuration file created

# package.json content (initially):
{
  "name": "vnit-ig-backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

---

## Installing Dependencies

### What are Dependencies?

Dependencies are **libraries/packages** that your project uses.

```
Think of it like:
├── Your Project
├── Dependency: Express (for server)
├── Dependency: MongoDB (for database)
├── Dependency: Mongoose (for data modeling)
└── Dependency: dotenv (for environment variables)
```

### Step 1: Install Express

```bash
npm install express

# What this does:
# npm install = Download and add package
# express     = Name of the package (web server framework)

# Behind the scenes:
# 1. npm connects to npmjs.com registry
# 2. Downloads Express package
# 3. Installs in node_modules/ folder
# 4. Updates package.json with dependency
# 5. Creates package-lock.json (locks specific versions)

# Files created/modified:
# - node_modules/         ← Downloaded package
# - package.json          ← Updated with "express": "^4.18.0"
# - package-lock.json     ← Version lock file
```

**package.json after install:**
```json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

### Step 2: Install Mongoose

```bash
npm install mongoose

# mongoose = MongoDB object data modeling (ODM)
# Provides schema validation, relationships, methods
```

### Step 3: Install dotenv

```bash
npm install dotenv

# dotenv = Load environment variables from .env file
# Used for: API keys, database URLs, port numbers
```

### Step 4: Install Other Essential Packages

```bash
npm install cors

# CORS = Cross-Origin Resource Sharing
# Allows frontend (different domain) to access backend APIs

npm install bcryptjs

# bcryptjs = Password hashing and security
# Converts passwords to secure hash before storing

npm install jsonwebtoken

# jsonwebtoken = JWT authentication
# Create secure tokens for user authentication

npm install socket.io

# socket.io = Real-time communication
# Enables live updates without page refresh
```

### Step 5: Install Development Dependencies

```bash
npm install --save-dev nodemon

# --save-dev = Install as development dependency
# Only used during development, not in production

# nodemon = Auto-restart server when code changes
# Without nodemon, you'd restart server manually after each change
```

**Final package.json:**
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0",
    "dotenv": "^16.0.0",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "socket.io": "^4.5.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

---

## Creating Project Structure

### Step 1: Create Folder Structure

```bash
# Create all necessary folders

mkdir -p server/config
mkdir -p server/controllers
mkdir -p server/models
mkdir -p server/routes
mkdir -p server/middleware

# What this creates:
mkdir -p = Create directory and any parent directories
server/
  ├── config/         ← Database configuration
  ├── controllers/    ← Business logic
  ├── models/         ← Database schemas
  ├── routes/         ← API endpoints
  └── middleware/     ← Authentication, validation
```

### Step 2: Create Important Files

```bash
# Create main server file
touch server.js

# Create environment file
touch .env

# Create .gitignore (files to ignore in git)
touch .gitignore

# What these do:
# server.js  = Main entry point, starts the server
# .env       = Stores secret environment variables
# .gitignore = Lists files to not commit to git
```

### Final Structure

```
vnit-ig-backend/
├── server.js                 ← Main file (run this)
├── .env                      ← Environment variables (SECRET)
├── .gitignore                ← Git ignore rules
├── package.json              ← Dependencies
├── package-lock.json         ← Version lock
├── node_modules/             ← Downloaded packages (DON'T COMMIT)
└── server/
    ├── config/
    │   └── db.js             ← MongoDB connection
    ├── models/
    │   ├── Department.js      ← Department schema
    │   ├── Match.js           ← Match schema
    │   └── User.js            ← User schema
    ├── controllers/
    │   ├── departmentController.js
    │   ├── matchController.js
    │   └── userController.js
    ├── routes/
    │   ├── departmentRoutes.js
    │   ├── matchRoutes.js
    │   └── userRoutes.js
    └── middleware/
        ├── authMiddleware.js
        └── errorHandler.js
```

---

## Database Configuration

### Step 1: Create .env File

**File: `.env`**

```bash
# Environment Variables (NEVER commit this!)

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vnit-ig-app

# Server Port
PORT=5000

# JWT Secret (random string for token encryption)
JWT_SECRET=your_super_secret_jwt_key_12345

# Node Environment
NODE_ENV=development
```

**What each variable does:**
```
MONGODB_URI    = Where to connect to MongoDB
               = Format: mongodb+srv://user:pass@host/database
               
PORT           = Which port server listens on (5000)
               
JWT_SECRET     = Secret key for encrypting tokens
               = Create random string, keep it secret!
               
NODE_ENV       = Tells code if it's development or production
```

### Step 2: Create Database Configuration

**File: `server/config/db.js`**

```javascript
const mongoose = require('mongoose');

// MongoDB Connection Function
const connectDB = async () => {
    try {
        // Connect to MongoDB using URI from .env
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        // Log success message
        console.log(`MongoDB connected: ${conn.connection.host}`);
        
        return conn;
    } catch (error) {
        // Log error and exit process if connection fails
        console.error(`Error: ${error.message}`);
        process.exit(1);
        // process.exit(1) = Stop the server (code 1 = error)
    }
};

// Export function so server.js can use it
module.exports = connectDB;

// How it works:
// 1. mongoose.connect() = Connect to MongoDB
// 2. await = Wait for connection to complete
// 3. If success, log message
// 4. If fail, log error and stop server
```

**Explanation:**
```javascript
process.env.MONGODB_URI
// "env" = environment
// Reads MONGODB_URI from .env file

useNewUrlParser: true
// Tell mongoose to use new URL parser
// Old parser deprecated, so we use new one

useUnifiedTopology: true
// Use new connection management engine

conn.connection.host
// Get the host name from connection
// Example: "cluster.mongodb.net"
```

---

## Creating Models

### Step 1: Create Department Model

**File: `server/models/Department.js`**

```javascript
const mongoose = require('mongoose');

// Define schema (blueprint)
const departmentSchema = new mongoose.Schema({
    // Field 1: Department Name
    name: {
        type: String,
        required: [true, 'Department name is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    
    // Field 2: Short Code (CSE, EE, etc)
    shortCode: {
        type: String,
        required: [true, 'Short code is required'],
        unique: true,
        uppercase: true,
        maxlength: [10, 'Code cannot exceed 10 characters']
    },
    
    // Field 3: Logo URL
    logo: {
        type: String,
        default: ''
    }
}, {
    timestamps: true  // Automatically add createdAt & updatedAt
});

// Create model from schema
// Mongoose automatically creates "departments" collection (lowercase, plural)
const Department = mongoose.model('Department', departmentSchema);

// Export so other files can use this model
module.exports = Department;

// When you create a department:
// const dept = new Department({
//     name: "Computer Science",
//     shortCode: "CSE"
// });
// await dept.save();
// MongoDB creates document like:
// {
//     _id: ObjectId("..."),
//     name: "Computer Science",
//     shortCode: "CSE",
//     logo: "",
//     createdAt: Date,
//     updatedAt: Date
// }
```

### Step 2: Create User Model

**File: `server/models/User.js`**

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Email
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/.+\@.+\..+/, 'Please provide valid email']
    },
    
    // Password (will be hashed)
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false  // Don't return password by default
    },
    
    // User type (admin or user)
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

// Middleware: Hash password before saving
// This runs BEFORE save() is called
userSchema.pre('save', async function(next) {
    // If password hasn't changed, skip hashing
    if (!this.isModified('password')) {
        return next();
    }
    
    // Hash the password with bcrypt
    const salt = await bcrypt.genSalt(10);  // Generate salt (10 rounds)
    this.password = await bcrypt.hash(this.password, salt);
    
    // Continue with save
    next();
});

// Instance method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

// When you create user:
// const user = new User({
//     email: "admin@vnit.edu.in",
//     password: "password123"
// });
// await user.save();
// The pre('save') middleware:
// 1. Hashes password using bcrypt
// 2. Stores hashed version in database
// 3. Original password never stored (security!)
```

---

## Creating Controllers

### Step 1: Create Department Controller

**File: `server/controllers/departmentController.js`**

```javascript
const Department = require('../models/Department');

// GET all departments
// Route: GET /api/departments
// Query params: ?limit=10&page=1
exports.getAllDepartments = async (req, res) => {
    try {
        // Get query parameters
        const { limit = 10, page = 1 } = req.query;
        
        // Parse to integers
        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);
        
        // Calculate skip (how many documents to skip)
        const skip = (pageNum - 1) * limitNum;
        
        // Query database
        const departments = await Department
            .find()                 // Get all departments
            .limit(limitNum)        // Limit results
            .skip(skip);            // Skip N documents
        
        // Count total documents
        const total = await Department.countDocuments();
        
        // Send response
        res.status(200).json({
            success: true,
            count: departments.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: departments
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET single department by ID
// Route: GET /api/departments/:id
exports.getDepartmentById = async (req, res) => {
    try {
        // Get ID from URL parameters
        const { id } = req.params;
        
        // Query database by ID
        const department = await Department.findById(id);
        
        // Check if found
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: department
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// CREATE new department
// Route: POST /api/departments
// Body: { name, shortCode, logo }
exports.createDepartment = async (req, res) => {
    try {
        // Get data from request body
        const { name, shortCode, logo } = req.body;
        
        // Create new department document
        const department = new Department({
            name,
            shortCode,
            logo
        });
        
        // Save to database
        await department.save();
        
        // Return with 201 Created status
        res.status(201).json({
            success: true,
            data: department
        });
        
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE department
// Route: PATCH /api/departments/:id
// Body: { fields to update }
exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Find and update, return new document
        const department = await Department.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: department
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE department
// Route: DELETE /api/departments/:id
exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find and delete
        const department = await Department.findByIdAndDelete(id);
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Department deleted successfully'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
```

**Explanation:**
```javascript
exports.getAllDepartments = async (req, res) => {
// exports = Make function available to other files
// async = Function is asynchronous (uses await)
// req = Request from client
// res = Response to send back

const { limit = 10, page = 1 } = req.query;
// Destructure query parameters
// If not provided, use defaults (limit=10, page=1)

const skip = (pageNum - 1) * limitNum;
// Pagination formula:
// Page 1: skip 0 documents
// Page 2: skip 10 documents
// Page 3: skip 20 documents

res.status(200).json({ ... });
// status(200) = HTTP 200 OK
// .json() = Send JSON response
```

---

## Creating Routes

### Step 1: Create Department Routes

**File: `server/routes/departmentRoutes.js`**

```javascript
const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');

// Import middleware for authentication
const { protect } = require('../middleware/authMiddleware');

// Routes (map HTTP requests to controller functions)

// GET all departments (public, no auth needed)
router.get('/', getAllDepartments);
// When user makes: GET /api/departments
// Execute: getAllDepartments function

// GET single department by ID
router.get('/:id', getDepartmentById);
// When user makes: GET /api/departments/645abc...
// :id = parameter, accessible as req.params.id

// CREATE department (protected, needs auth)
router.post('/', protect, createDepartment);
// protect middleware checks authentication first
// If authenticated, execute createDepartment
// If not authenticated, return 401 error

// UPDATE department
router.patch('/:id', protect, updateDepartment);
// PATCH = Update specific fields

// DELETE department
router.delete('/:id', protect, deleteDepartment);

// Export router so server.js can use it
module.exports = router;

// Usage in server.js:
// const departmentRoutes = require('./routes/departmentRoutes');
// app.use('/api/departments', departmentRoutes);
// 
// This creates endpoints:
// GET    /api/departments
// GET    /api/departments/:id
// POST   /api/departments
// PATCH  /api/departments/:id
// DELETE /api/departments/:id
```

---

## Middleware

### Step 1: Create Authentication Middleware

**File: `server/middleware/authMiddleware.js`**

```javascript
const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
exports.protect = async (req, res, next) => {
    try {
        // Get token from headers
        const token = req.headers.authorization?.split(' ')[1];
        // "Bearer token123" → split by space → get [1] = "token123"
        
        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authorization token provided'
            });
        }
        
        // Verify token using JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // If valid, decoded contains user info
        // If invalid, jwt.verify throws error
        
        // Attach user info to request
        req.user = decoded;
        // Now controller can access: req.user.id, req.user.role
        
        // Continue to next middleware/controller
        next();
        
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Middleware to check if user is admin
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Check if user role is in allowed roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        
        next();
    };
};

// Usage in routes:
// router.post('/', protect, authorize('admin'), createDepartment);
// This means:
// 1. User must be authenticated (protect)
// 2. User must be admin (authorize('admin'))
// 3. Then execute createDepartment
```

---

## Server Configuration

### Step 1: Create Main Server File

**File: `server.js`**

```javascript
// Load environment variables from .env file
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Create Express app
const app = express();

// Import database connection
const connectDB = require('./server/config/db');

// Import routes
const departmentRoutes = require('./server/routes/departmentRoutes');

// ============================================
// MIDDLEWARE
// ============================================

// Parse incoming JSON requests
app.use(express.json());
// Now req.body contains parsed JSON from request

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Enable CORS (allow frontend to access backend)
app.use(cors());
// Without CORS, frontend (different domain) can't access API

// ============================================
// ROUTES
// ============================================

// Test route
app.get('/', (req, res) => {
    res.send('Backend API is running!');
});

// API routes
app.use('/api/departments', departmentRoutes);
// All department routes start with /api/departments

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler (route not found)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({
        success: false,
        message: 'Server error'
    });
});

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        
        // Get port from .env or use 5000
        const PORT = process.env.PORT || 5000;
        
        // Start listening on port
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

// Call function to start server
startServer();
```

**Explanation:**
```javascript
require('dotenv').config();
// Load .env variables into process.env
// Now can access: process.env.PORT, process.env.JWT_SECRET

const app = express();
// Create Express application
// app = web server that handles HTTP requests

app.use(express.json());
// Middleware: parse JSON from requests
// Without this, req.body would be undefined

app.use('/api/departments', departmentRoutes);
// Mount routes
// GET /api/departments → departmentRoutes.js handles it

app.listen(PORT, () => {
// Start server on port 5000
// Now server is running and accepting requests
```

---

## Running the Backend

### Step 1: Update package.json Scripts

**File: `package.json`**

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**What these do:**
```bash
npm start
# Run: node server.js
# Start server normally (no auto-restart on code changes)
# Used in production

npm run dev
# Run: nodemon server.js
# Start server with nodemon (auto-restarts on changes)
# Used during development
```

### Step 2: Run the Server

```bash
# Development (with auto-restart)
npm run dev

# Output:
# [nodemon] 2.0.20
# [nodemon] watching path(s): *.*
# [nodemon] watching extensions: js,json
# [nodemon] starting `node server.js`
# MongoDB connected: cluster.mongodb.net
# Server running on http://localhost:5000

# ✅ Server is now running!
# Visit: http://localhost:5000
# Should see: "Backend API is running!"
```

### Step 3: Stop the Server

```bash
# Press Ctrl + C in terminal to stop
^C
# Server stops
```

---

## Testing with Postman

### Test 1: Test Server is Running

```
Method: GET
URL: http://localhost:5000/

Response: "Backend API is running!"
```

### Test 2: Get All Departments

```
Method: GET
URL: http://localhost:5000/api/departments

Expected Response (200):
{
  "success": true,
  "count": 0,
  "total": 0,
  "page": 1,
  "pages": 0,
  "data": []
}

// Empty initially (no departments created yet)
```

### Test 3: Create a Department

```
Method: POST
URL: http://localhost:5000/api/departments

Headers:
  Content-Type: application/json
  Authorization: Bearer token123 (for protected routes)

Body (JSON):
{
  "name": "Computer Science",
  "shortCode": "CSE",
  "logo": "/uploads/cse.png"
}

Expected Response (201):
{
  "success": true,
  "data": {
    "_id": "645abc...",
    "name": "Computer Science",
    "shortCode": "CSE",
    "logo": "/uploads/cse.png",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

### Test 4: Get Departments Again

```
Method: GET
URL: http://localhost:5000/api/departments?limit=10&page=1

Expected Response (200):
{
  "success": true,
  "count": 1,
  "total": 1,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "645abc...",
      "name": "Computer Science",
      "shortCode": "CSE",
      "logo": "/uploads/cse.png",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ]
}

// Now we have 1 department!
```

### Test 5: Update Department

```
Method: PATCH
URL: http://localhost:5000/api/departments/645abc...

Body:
{
  "logo": "/uploads/cse-updated.png"
}

Expected Response (200):
{
  "success": true,
  "data": {
    "_id": "645abc...",
    "name": "Computer Science",
    "shortCode": "CSE",
    "logo": "/uploads/cse-updated.png",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:15:00Z"  // Updated!
  }
}
```

### Test 6: Delete Department

```
Method: DELETE
URL: http://localhost:5000/api/departments/645abc...

Expected Response (200):
{
  "success": true,
  "message": "Department deleted successfully"
}
```

---

## Common Issues & Solutions

### Issue 1: "Cannot find module 'express'"

**Problem:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# You probably didn't install dependencies
npm install express

# Or install all dependencies:
npm install
```

### Issue 2: "MongoDB connection failed"

**Problem:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
1. MongoDB server not running
   ```bash
   # On Windows: Start MongoDB from Services
   # On Mac: brew services start mongodb-community
   # On Linux: sudo systemctl start mongod
   ```

2. Wrong connection string in .env
   ```bash
   # Check MONGODB_URI is correct format:
   # mongodb+srv://username:password@cluster.mongodb.net/database
   # OR (local):
   # mongodb://localhost:27017/vnit-ig-app
   ```

### Issue 3: "Port 5000 already in use"

**Problem:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Option 1: Kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>

# Option 2: Use different port
# In .env, change PORT=5001
```

### Issue 4: "CORS error from frontend"

**Problem:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
```javascript
// In server.js, ensure CORS is enabled:
const cors = require('cors');
app.use(cors());

// Or allow specific origins:
app.use(cors({
    origin: 'http://localhost:3000'
}));
```

---

## Summary Checklist

```bash
✅ npm init -y                          # Create package.json
✅ npm install express mongoose...      # Install dependencies
✅ Create folder structure              # server/, routes/, models/, etc
✅ Create .env file                     # Environment variables
✅ Create db.js                         # Database connection
✅ Create Models                        # Department.js, User.js, etc
✅ Create Controllers                   # departmentController.js, etc
✅ Create Routes                        # departmentRoutes.js, etc
✅ Create Middleware                    # authMiddleware.js, etc
✅ Create server.js                     # Main entry point
✅ npm run dev                          # Start server
✅ Test with Postman                    # Test endpoints
```

---

## Next Steps

- 👉 Learn about authentication in [Chapter 6: React & Frontend](./06-REACT-FUNDAMENTALS.md)
- 👉 Test APIs with [Chapter 11: Postman Guide](./11-POSTMAN-API-TESTING.md)
- 👉 Deep dive into [Chapter 3: Backend Deep Dive](./03-BACKEND-DEEP-DIVE.md)
- 👉 Understand databases in [Chapter 4: Database Concepts](./04-DATABASE-CONCEPTS.md)
