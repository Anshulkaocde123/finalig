# Chapter 9: Building the Project From Scratch 🏗️

## Complete Step-by-Step Build Guide

This chapter shows you **exactly** how to build this project from scratch, in the sequence it was built.

---

## 📋 Phase 1: Project Setup & Planning

### Step 1: Plan Your Application

**Before writing code, plan:**

```
What are we building?
└── Sports event management system

Who are the users?
├── Students (view matches, leaderboard)
└── Admin (manage matches, update scores)

What features?
├── Match scheduling
├── Live score updates
├── Department leaderboard
└── Student council information

What technology?
└── MERN Stack (MongoDB, Express, React, Node.js)
```

### Step 2: Create Project Structure

```bash
# Create main folder
mkdir vnit-ig-app
cd vnit-ig-app

# Initialize git
git init
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore

# Create folders
mkdir server
mkdir client

# Initialize root package.json
npm init -y
```

**Root `package.json`:**
```json
{
  "name": "vnit-ig-app",
  "scripts": {
    "start": "concurrently \"npm run server --prefix server\" \"npm run dev --prefix client\""
  },
  "devDependencies": {
    "concurrently": "^9.2.1"
  }
}
```

```bash
# Install concurrently (run both servers simultaneously)
npm install --save-dev concurrently
```

---

## 🔧 Phase 2: Backend Setup

### Step 1: Initialize Backend

```bash
cd server
npm init -y
```

### Step 2: Install Backend Dependencies

```bash
# Core dependencies
npm install express mongoose dotenv cors

# Authentication
npm install bcryptjs jsonwebtoken

# Utilities
npm install express-async-handler helmet

# Development
npm install --save-dev nodemon morgan
```

**What each package does:**
```
express              - Web framework
mongoose             - MongoDB library
dotenv               - Environment variables
cors                 - Cross-origin requests
bcryptjs             - Password hashing
jsonwebtoken         - Authentication tokens
express-async-handler- Async error handling
helmet               - Security headers
nodemon              - Auto-restart server
morgan               - Request logging
```

### Step 3: Configure package.json Scripts

**File:** `server/package.json`

```json
{
  "scripts": {
    "start": "node server.js",
    "server": "nodemon server.js"
  }
}
```

### Step 4: Create .env File

**File:** `server/.env`

```bash
MONGODB_URI=mongodb://localhost:27017/vnit-ig-app
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here
```

### Step 5: Create Database Configuration

**File:** `server/config/db.js`

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
```

### Step 6: Create Basic Server

**File:** `server/server.js`

```javascript
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

**Test it:**
```bash
npm run server

# Visit: http://localhost:5000/api/test
# Should see: {"message": "API is working!"}
```

---

## 📊 Phase 3: Database Models

### Step 1: Create Department Model

**File:** `server/models/Department.js`

```javascript
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    shortCode: {
        type: String,
        required: true,
        unique: true
    },
    logo: {
        type: String,
        default: ''
    },
    points: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
```

### Step 2: Create Match Model

**File:** `server/models/Match.js`

```javascript
const mongoose = require('mongoose');

const baseMatchSchema = new mongoose.Schema({
    sport: {
        type: String,
        required: true,
        enum: ['CRICKET', 'FOOTBALL', 'BASKETBALL', 'VOLLEYBALL']
    },
    teamA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    teamB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    status: {
        type: String,
        enum: ['SCHEDULED', 'LIVE', 'COMPLETED'],
        default: 'SCHEDULED'
    },
    scheduledAt: {
        type: Date,
        default: null
    },
    venue: String
}, {
    timestamps: true
});

const Match = mongoose.model('Match', baseMatchSchema);

module.exports = { Match };
```

---

## 🛣️ Phase 4: Routes and Controllers

### Step 1: Create Department Controller

**File:** `server/controllers/departmentController.js`

```javascript
const Department = require('../models/Department');
const asyncHandler = require('express-async-handler');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
const getDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find().sort({ points: -1 });
    res.json({
        success: true,
        data: departments
    });
});

// @desc    Create department
// @route   POST /api/departments
// @access  Private
const createDepartment = asyncHandler(async (req, res) => {
    const { name, shortCode, logo } = req.body;
    
    const department = await Department.create({
        name,
        shortCode,
        logo
    });
    
    res.status(201).json({
        success: true,
        data: department
    });
});

module.exports = {
    getDepartments,
    createDepartment
};
```

### Step 2: Create Department Routes

**File:** `server/routes/departmentRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const {
    getDepartments,
    createDepartment
} = require('../controllers/departmentController');

router.get('/', getDepartments);
router.post('/', createDepartment);

module.exports = router;
```

### Step 3: Register Routes in Server

**File:** `server/server.js` (add after middleware)

```javascript
// Import routes
const departmentRoutes = require('./routes/departmentRoutes');

// Register routes
app.use('/api/departments', departmentRoutes);
```

**Test it:**
```bash
# GET departments
curl http://localhost:5000/api/departments

# POST create department
curl -X POST http://localhost:5000/api/departments \
  -H "Content-Type: application/json" \
  -d '{"name":"Computer Science","shortCode":"CSE"}'
```

---

## 🎨 Phase 5: Frontend Setup

### Step 1: Create React App with Vite

```bash
cd ..  # Back to root
npm create vite@latest client -- --template react
cd client
npm install
```

### Step 2: Install Frontend Dependencies

```bash
# Core
npm install react-router-dom axios

# UI
npm install tailwindcss postcss autoprefixer
npm install lucide-react
npm install react-hot-toast

# Real-time
npm install socket.io-client
```

### Step 3: Setup Tailwind CSS

```bash
npx tailwindcss init -p
```

**File:** `client/tailwind.config.js`

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**File:** `client/src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 4: Configure Axios

**File:** `client/src/api/axiosConfig.js`

```javascript
import axios from 'axios';

const apiUrl = import.meta.env.MODE === 'production'
    ? ''
    : 'http://localhost:5000';

const axiosInstance = axios.create({
    baseURL: `${apiUrl}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosInstance;
```

---

## ⚛️ Phase 6: Building React Components

### Step 1: Setup Routing

**File:** `client/src/App.jsx`

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/public/Home';
import Leaderboard from './pages/public/Leaderboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}

export default App;
```

### Step 2: Create Home Page

**File:** `client/src/pages/public/Home.jsx`

```jsx
import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

function Home() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchMatches();
    }, []);
    
    const fetchMatches = async () => {
        try {
            const response = await api.get('/matches');
            setMatches(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Matches</h1>
            <div className="grid gap-4">
                {matches.map(match => (
                    <div key={match._id} className="border p-4 rounded">
                        <p className="font-bold">{match.sport}</p>
                        <p>{match.status}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
```

### Step 3: Create Leaderboard Page

**File:** `client/src/pages/public/Leaderboard.jsx`

```jsx
import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

function Leaderboard() {
    const [departments, setDepartments] = useState([]);
    
    useEffect(() => {
        fetchDepartments();
    }, []);
    
    const fetchDepartments = async () => {
        const response = await api.get('/departments');
        setDepartments(response.data.data);
    };
    
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
            <table className="w-full">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Department</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {departments.map((dept, index) => (
                        <tr key={dept._id}>
                            <td>{index + 1}</td>
                            <td>{dept.name}</td>
                            <td>{dept.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Leaderboard;
```

---

## 🔐 Phase 7: Adding Authentication

### Step 1: Create Admin Model

**File:** `server/models/Admin.js`

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
adminSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
```

### Step 2: Create Auth Controller

**File:** `server/controllers/authController.js`

```javascript
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({ username });
    
    if (admin && (await admin.comparePassword(password))) {
        res.json({
            success: true,
            token: generateToken(admin._id),
            admin: {
                id: admin._id,
                username: admin.username
            }
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

module.exports = { login };
```

### Step 3: Create Auth Middleware

**File:** `server/middleware/authMiddleware.js`

```javascript
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization?.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await Admin.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized');
        }
    } else {
        res.status(401);
        throw new Error('No token');
    }
};

module.exports = { protect };
```

### Step 4: Create Auth Routes

**File:** `server/routes/authRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

router.post('/login', login);

module.exports = router;
```

### Step 5: Register Auth Routes

**File:** `server/server.js`

```javascript
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
```

---

## 🔴 Phase 8: Real-Time Features with Socket.io

### Step 1: Install Socket.io

```bash
# Backend
cd server
npm install socket.io

# Frontend
cd ../client
npm install socket.io-client
```

### Step 2: Setup Socket.io Server

**File:** `server/server.js`

```javascript
const http = require('http');
const { Server } = require('socket.io');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Make io accessible
app.set('io', io);

// Socket.io connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Use server.listen instead of app.listen
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Step 3: Setup Socket.io Client

**File:** `client/src/socket.js`

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
    autoConnect: true
});

export default socket;
```

### Step 4: Use Socket.io in Components

**File:** `client/src/pages/public/Home.jsx`

```jsx
import socket from '../../socket';

function Home() {
    useEffect(() => {
        // Listen for match updates
        socket.on('matchUpdate', (updatedMatch) => {
            setMatches(prev => 
                prev.map(m => m._id === updatedMatch._id ? updatedMatch : m)
            );
        });
        
        // Cleanup
        return () => {
            socket.off('matchUpdate');
        };
    }, []);
}
```

### Step 5: Emit Events from Backend

**File:** `server/controllers/matchController.js`

```javascript
const updateScore = async (req, res) => {
    const match = await Match.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    
    // Emit to all connected clients
    req.app.get('io').emit('matchUpdate', match);
    
    res.json({ success: true, data: match });
};
```

---

## ✅ Phase 9: Testing and Debugging

### Step 1: Test Backend Endpoints

```bash
# Using curl
curl http://localhost:5000/api/departments

# Using Postman
# Create requests for each endpoint
# Test GET, POST, PUT, DELETE
```

### Step 2: Test Frontend

```bash
npm run dev

# Check console for errors
# Test navigation
# Test API calls
# Test real-time updates
```

---

## 🚀 Phase 10: Deployment

### Step 1: Prepare for Production

**Update package.json:**
```json
{
  "scripts": {
    "build": "npm run build --prefix client",
    "start": "node server/server.js"
  }
}
```

### Step 2: Build Frontend

```bash
cd client
npm run build
# Creates client/dist folder
```

### Step 3: Serve Frontend from Backend

**File:** `server/server.js`

```javascript
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, '../client/dist')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
    });
}
```

### Step 4: Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

---

## ✅ Final Checklist

- ✅ Backend running
- ✅ Database connected
- ✅ All routes working
- ✅ Frontend running
- ✅ API calls successful
- ✅ Authentication working
- ✅ Socket.io connected
- ✅ Production build successful
- ✅ Deployed successfully

---

## 🎯 What You've Built

```
MERN Stack Application:
├── Backend (Express + MongoDB)
│   ├── User authentication
│   ├── RESTful API
│   ├── Database models
│   └── Real-time updates
├── Frontend (React)
│   ├── Multiple pages
│   ├── API integration
│   ├── Real-time UI updates
│   └── Responsive design
└── Deployment Ready
```

---

## 🚀 Next Chapter

Learn about common challenges and solutions!

**Next:** [Chapter 10: Challenges & Solutions](./10-CHALLENGES-AND-SOLUTIONS.md)

---

*Remember: Build incrementally, test often!*
