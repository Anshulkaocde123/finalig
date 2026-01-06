# Chapter 2: Project Structure & Files 📁

## Understanding Your Project's Organization

Think of your project like a library:
- **Root folder** = The library building
- **server/** = Reference section (backend)
- **client/** = Reading room (frontend)
- **Config files** = Library rules and catalog

---

## 🏗️ Root Level Structure

```
vnit-ig-app/
├── client/                 # Frontend React application
├── server/                 # Backend Node.js/Express application
├── package.json           # Root project configuration
├── .gitignore            # Files to ignore in git
├── README.md             # Project documentation
├── Procfile              # Railway deployment configuration
└── railway.toml          # Railway settings
```

---

## 📄 Root Level Files Explained

### 1. `package.json` (Root)

**Purpose:** Manages the entire project (both frontend and backend together)

```json
{
  "name": "vnit-ig-app",
  "version": "1.0.0",
  "scripts": {
    "start": "concurrently \"npm run server --prefix server\" \"npm run dev --prefix client\""
  },
  "devDependencies": {
    "concurrently": "^9.2.1"
  }
}
```

**Breaking it down:**

```javascript
// Line 1-3: Basic information
{
  "name": "vnit-ig-app",        // Project name
  "version": "1.0.0",            // Version number (semantic versioning)
  
// Line 4-6: Scripts (commands you can run)
  "scripts": {
    // When you run: npm start
    // It runs BOTH server AND client at same time
    "start": "concurrently \"npm run server --prefix server\" \"npm run dev --prefix client\""
    //        └─ Tool name  └─ Server command ─┘  └─ Client command ─┘
  },
  
// Line 7-9: Development dependencies
  "devDependencies": {
    "concurrently": "^9.2.1"    // Runs multiple commands simultaneously
    //               └─ Version (^ means compatible versions allowed)
  }
}
```

**Why this matters:**
- ONE command (`npm start`) starts everything
- You don't need to open two terminals
- Easier for other developers to run your project

---

### 2. `.gitignore`

**Purpose:** Tell Git which files NOT to track/upload

```
node_modules/
.env
dist/
build/
*.log
```

**Why each line exists:**

```bash
node_modules/          # HUGE folder with dependencies
                       # Don't upload (others run: npm install)
                       
.env                   # Contains SECRETS (passwords, API keys)
                       # NEVER upload to GitHub!
                       
dist/                  # Built/compiled files
build/                 # Can be regenerated anytime
                       
*.log                  # Log files (debugging info)
                       # Not needed by others
```

**Real-world analogy:**
- Uploading code = Sharing a recipe
- node_modules = The grocery store (others can shop there too)
- .env = Your credit card number (NEVER share!)

---

### 3. `README.md`

**Purpose:** Documentation - explains what the project is

```markdown
# VNIT IG App

Sports event management system for VNIT

## How to Run
1. npm install
2. npm start
```

**Why it's important:**
- First file people read on GitHub
- Instructions for setup
- Explains project purpose

---

### 4. `Procfile` (Deployment File)

**Purpose:** Tells Railway/Heroku how to start your app

```
web: node server/start.js
```

**Breaking it down:**
```
web:                    # This is a web process
     node               # Use Node.js
          server/start.js  # Run this file
```

**When this runs:**
- You deploy to Railway
- Railway reads this file
- Railway executes the command
- Your app starts!

---

## 🖥️ Server Folder Structure

```
server/
├── config/              # Configuration files
│   └── db.js           # Database connection
├── controllers/         # Business logic
│   ├── matchController.js
│   ├── departmentController.js
│   └── ...
├── middleware/          # Functions that run before routes
│   ├── authMiddleware.js
│   └── uploadMiddleware.js
├── models/             # Database schemas
│   ├── Match.js
│   ├── Department.js
│   └── ...
├── routes/             # API endpoints definitions
│   ├── matchRoutes.js
│   ├── departmentRoutes.js
│   └── ...
├── scripts/            # Utility scripts
│   └── seedDepartments.js
├── uploads/            # User uploaded files
├── server.js           # Main server file
├── start.js            # Production starter
└── package.json        # Server dependencies
```

### Why This Organization?

**MVC Pattern (Model-View-Controller):**
```
Request
   ↓
ROUTE (matchRoutes.js)        ← "I need match data"
   ↓
CONTROLLER (matchController.js) ← "Let me process that"
   ↓
MODEL (Match.js)              ← "I'll get data from database"
   ↓
Response (JSON data)
```

---

## 📂 Server Folders Deep Dive

### 1. `config/` Folder

**Purpose:** Configuration and setup files

#### `db.js` - Database Connection

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not set');
        }
        
        console.log('🔄 Attempting MongoDB connection...');
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        });
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        return null;
    }
};

module.exports = connectDB;
```

**Line-by-Line Breakdown:**

```javascript
// Line 1: Import mongoose (MongoDB library)
const mongoose = require('mongoose');

// Line 3: Create async function (async = can use 'await')
const connectDB = async () => {

    // Line 4: try-catch (handle errors gracefully)
    try {
        // Line 5-7: Check if connection string exists
        if (!process.env.MONGODB_URI) {
            // If not, throw error (stop execution)
            throw new Error('MONGODB_URI environment variable is not set');
        }
        
        // Line 9: Log message (user sees this in terminal)
        console.log('🔄 Attempting MongoDB connection...');
        
        // Line 11-15: Actually connect to MongoDB
        const conn = await mongoose.connect(
            process.env.MONGODB_URI,    // Connection string from .env
            {
                serverSelectionTimeoutMS: 10000,  // Wait 10 seconds max
                socketTimeoutMS: 45000,           // Keep connection open 45s
                connectTimeoutMS: 10000,          // Initial connection timeout
            }
        );
        
        // Line 17: Success message
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;  // Return connection object
        
    // Line 18: If anything fails
    } catch (error) {
        // Line 19: Log the error
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        return null;  // Return null (no connection)
    }
};

// Line 23: Export so other files can use it
module.exports = connectDB;

```

**Key Concepts Here:**

1. **async/await:**
   ```javascript
   // Without async/await (messy)
   mongoose.connect(uri).then(conn => {
     console.log('Connected');
   }).catch(err => {
     console.log('Error');
   });

   // With async/await (clean)
   try {
     const conn = await mongoose.connect(uri);
     console.log('Connected');
   } catch (err) {
     console.log('Error');
   }
   ```

2. **Environment Variables:**
   ```javascript
   process.env.MONGODB_URI  // Gets value from .env file
   // Instead of hardcoding:
   // "mongodb://localhost:27017/mydb"  ❌ Don't do this!
   ```

3. **Error Handling:**
   ```javascript
   try {
     // Try this code
   } catch (error) {
     // If error happens, run this
   }
   ```

---

### 2. `models/` Folder

**Purpose:** Define the structure of your data (Database Schemas)

#### Example: `Department.js`

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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
```

**Line-by-Line Breakdown:**

```javascript
// Line 1: Import mongoose
const mongoose = require('mongoose');

// Line 3: Create a schema (blueprint for data)
const departmentSchema = new mongoose.Schema({
    
    // Field 1: name
    name: {
        type: String,        // Must be text
        required: true,      // Cannot be empty
        unique: true         // No duplicates allowed
    },
    
    // Field 2: shortCode
    shortCode: {
        type: String,        // Must be text
        required: true,      // Cannot be empty
        unique: true         // No duplicates (CSE can only exist once)
    },
    
    // Field 3: logo
    logo: {
        type: String,        // URL to image
        default: ''          // If not provided, use empty string
    }
    
}, {
    // Options object
    timestamps: true         // Auto-create createdAt & updatedAt fields
});

// Line 23: Create and export the model
module.exports = mongoose.model('Department', departmentSchema);
//                                 └─ Model name
//                                             └─ Schema to use
```

**What this creates in MongoDB:**

```javascript
// When you create a department:
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),  // Auto-generated
  "name": "Computer Science",
  "shortCode": "CSE",
  "logo": "/uploads/cse.png",
  "createdAt": "2025-01-15T10:00:00.000Z",      // Auto (timestamps: true)
  "updatedAt": "2025-01-15T10:00:00.000Z"       // Auto (timestamps: true)
}
```

**Model vs Schema:**
- **Schema** = Blueprint (defines structure)
- **Model** = Factory (creates actual documents)

```javascript
const schema = new Schema({...});     // Blueprint
const Model = mongoose.model('Name', schema);  // Factory

// Using the factory:
const newDoc = new Model({ name: 'CS' });  // Create document
await newDoc.save();                        // Save to database
```

---

### 3. `routes/` Folder

**Purpose:** Define API endpoints (URLs)

#### Example: `departmentRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');

// GET /api/departments - Get all departments
router.get('/', getDepartments);

// POST /api/departments - Create new department
router.post('/', createDepartment);

// PUT /api/departments/:id - Update department
router.put('/:id', updateDepartment);

// DELETE /api/departments/:id - Delete department
router.delete('/:id', deleteDepartment);

module.exports = router;
```

**Line-by-Line Breakdown:**

```javascript
// Line 1-2: Setup
const express = require('express');
const router = express.Router();  // Create router object
                                   // Router = mini-app for specific routes

// Line 3-8: Import controller functions
const {
    getDepartments,          // Function to get all departments
    createDepartment,        // Function to create department
    updateDepartment,        // Function to update department
    deleteDepartment         // Function to delete department
} = require('../controllers/departmentController');
//   └─ Destructuring: import specific functions

// Line 10-11: Define GET route
router.get('/', getDepartments);
//     └─ HTTP Method
//          └─ URL path (/ means base path)
//               └─ Function to run

// Line 13-14: Define POST route
router.post('/', createDepartment);
//     └─ POST method (for creating data)

// Line 16-17: Define PUT route with parameter
router.put('/:id', updateDepartment);
//          └─ :id is a URL parameter
//              Example: /api/departments/12345
//              req.params.id = '12345'

// Line 19-20: Define DELETE route
router.delete('/:id', deleteDepartment);

// Line 22: Export router
module.exports = router;
```

**HTTP Methods Explained:**

```javascript
// GET - Retrieve data (read-only)
GET /api/departments        → Get all departments
GET /api/departments/123    → Get department with ID 123

// POST - Create new data
POST /api/departments       → Create new department
Body: { name: "CSE", shortCode: "CSE" }

// PUT - Update existing data
PUT /api/departments/123    → Update department 123
Body: { name: "Computer Science" }

// DELETE - Remove data
DELETE /api/departments/123 → Delete department 123
```

**Route Parameters:**

```javascript
// Route definition
router.get('/match/:id', getMatch);

// When user visits: /api/match/12345
// In controller:
const id = req.params.id;  // '12345'

// Multiple parameters
router.get('/match/:matchId/team/:teamId', getTeam);
// /api/match/111/team/222
// req.params.matchId = '111'
// req.params.teamId = '222'
```

---

### 4. `controllers/` Folder

**Purpose:** Business logic (what actually happens)

#### Example: `departmentController.js` (Simplified)

```javascript
const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private
const createDepartment = async (req, res) => {
    try {
        const { name, shortCode, logo } = req.body;
        
        const department = new Department({
            name,
            shortCode,
            logo
        });
        
        const savedDepartment = await department.save();
        res.status(201).json(savedDepartment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getDepartments,
    createDepartment
};
```

**Line-by-Line Breakdown:**

```javascript
// Line 1: Import the Department model
const Department = require('../models/Department');

// Line 3-5: Comments explaining the function
// @desc = Description
// @route = Which route calls this
// @access = Who can access (Public/Private)

// Line 6: Function definition
const getDepartments = async (req, res) => {
//    └─ Function name
//                       └─ async (can use await)
//                             └─ Request object
//                                  └─ Response object

    // Line 7: Error handling
    try {
        // Line 8: Query database
        const departments = await Department.find();
        //                        └─ await (wait for result)
        //                                    └─ find() gets all documents
        
        // Line 9: Send response
        res.json(departments);
        //  └─ Convert to JSON and send to client
        
    // Line 10: If error occurs
    } catch (error) {
        // Line 11: Send error response
        res.status(500).json({ message: error.message });
        //      └─ 500 = Server error status code
    }
};

// Line 18: Create department function
const createDepartment = async (req, res) => {
    try {
        // Line 20: Extract data from request body
        const { name, shortCode, logo } = req.body;
        //      └─ Destructuring: get specific fields
        
        // Line 22-26: Create new document
        const department = new Department({
            name,          // Same as: name: name
            shortCode,     // ES6 shorthand
            logo
        });
        
        // Line 28: Save to database
        const savedDepartment = await department.save();
        
        // Line 29: Send response with 201 (Created) status
        res.status(201).json(savedDepartment);
        
    } catch (error) {
        // Line 31: Send 400 (Bad Request) error
        res.status(400).json({ message: error.message });
    }
};

// Line 35-38: Export both functions
module.exports = {
    getDepartments,
    createDepartment
};
```

**Status Codes Explained:**

```javascript
200 - OK (Success)
201 - Created (Successfully created new resource)
400 - Bad Request (Client sent invalid data)
401 - Unauthorized (Need to login)
403 - Forbidden (Logged in but not allowed)
404 - Not Found (Resource doesn't exist)
500 - Server Error (Something broke on server)
```

---

### 5. `middleware/` Folder

**Purpose:** Functions that run BEFORE route handlers

#### Example: `authMiddleware.js`

```javascript
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized' });
        }
    } else {
        res.status(401).json({ message: 'No token' });
    }
};

module.exports = { protect };
```

**How middleware works:**

```
Request
   ↓
Middleware 1 (Check if logged in) ←  If not, stop here, send error
   ↓ next()
Middleware 2 (Check permissions)   ←  If not allowed, stop, send error
   ↓ next()
Route Handler (Do the actual work)
   ↓
Response
```

**Line-by-Line Breakdown:**

```javascript
// Line 1: Import JWT library
const jwt = require('jsonwebtoken');

// Line 3: Middleware function
const protect = async (req, res, next) => {
//                                  └─ next() = move to next middleware/route
    
    // Line 4: Declare variable
    let token;
    
    // Line 6-7: Check if authorization header exists
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
        // Header format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        
        try {
            // Line 9: Extract token
            token = req.headers.authorization.split(' ')[1];
            //      "Bearer TOKEN"  → ['Bearer', 'TOKEN']
            //                                    └─ [1] gets second element
            
            // Line 10: Verify token is valid
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            //                           └─ Token to verify
            //                                      └─ Secret key to verify with
            
            // Line 11: Add user info to request object
            req.user = decoded;
            // Now other functions can access req.user
            
            // Line 12: Continue to next middleware/route
            next();
            
        } catch (error) {
            // Line 14: Token is invalid
            res.status(401).json({ message: 'Not authorized' });
            // Don't call next() - stop here!
        }
    } else {
        // Line 17: No token provided
        res.status(401).json({ message: 'No token' });
    }
};

// Line 21: Export
module.exports = { protect };
```

**Using middleware in routes:**

```javascript
const { protect } = require('../middleware/authMiddleware');

// Public route (no middleware)
router.get('/public', getPublicData);

// Protected route (with middleware)
router.post('/create', protect, createData);
//                      └─ Middleware runs first
//                                └─ Then this function
```

---

## 🎨 Client Folder Structure

```
client/
├── public/              # Static files (images, icons)
├── src/                 # Source code
│   ├── api/            # API configuration
│   │   ├── axios.js
│   │   └── axiosConfig.js
│   ├── assets/         # Images, fonts
│   ├── components/     # Reusable UI components
│   │   ├── AdminLayout.jsx
│   │   ├── MatchCard.jsx
│   │   └── ...
│   ├── pages/          # Full page components
│   │   ├── admin/
│   │   ├── auth/
│   │   └── public/
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── socket.js       # Socket.io client
├── index.html          # HTML template
├── package.json        # Frontend dependencies
├── vite.config.js      # Build configuration
└── tailwind.config.js  # Styling configuration
```

---

### Key Client Files

#### 1. `main.jsx` - Entry Point

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**What happens:**
1. Import React and App
2. Find HTML element with id="root"
3. Render App component inside it

#### 2. `App.jsx` - Main Component

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

**What happens:**
1. Setup routing
2. Map URLs to components
3. When user visits "/", show Home
4. When user visits "/leaderboard", show Leaderboard

#### 3. `api/axiosConfig.js` - API Setup

```javascript
import axios from 'axios';

const apiUrl = import.meta.env.MODE === 'production'
    ? ''  // Production: same domain
    : 'http://localhost:5000';  // Development: local server

const axiosInstance = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosInstance;
```

**What this does:**
- Creates axios instance with base URL
- Production: Uses same domain (no CORS issues)
- Development: Points to local server

---

## 🔄 How Files Connect

### Example Flow: Getting Departments

```
1. USER OPENS BROWSER
   → Types: http://localhost:3000/leaderboard

2. REACT ROUTER (App.jsx)
   → Sees /leaderboard route
   → Renders Leaderboard component

3. LEADERBOARD COMPONENT
   → useEffect runs when component loads
   → Makes API call: axios.get('/api/departments')

4. AXIOS CONFIG (axiosConfig.js)
   → Adds base URL: http://localhost:5000/api/departments
   → Sends HTTP GET request

5. EXPRESS SERVER (server.js)
   → Receives request at /api/departments
   → Looks in routes: app.use('/api/departments', departmentRoutes)

6. DEPARTMENT ROUTES (departmentRoutes.js)
   → Matches GET / route
   → Calls: getDepartments controller

7. DEPARTMENT CONTROLLER (departmentController.js)
   → Runs: Department.find()
   → Gets data from MongoDB

8. MONGODB
   → Returns department documents 

9. CONTROLLER
   → Sends JSON response 

10. AXIOS
    → Receives response
    → Returns to React component

11. REACT COMPONENT
    → Updates state
    → Re-renders with new data

12. USER SEES
    → Leaderboard with department data!
```

---

## 📦 package.json Files

### Root `package.json`

```json
{
  "scripts": {
    "start": "concurrently \"npm run server --prefix server\" \"npm run dev --prefix client\""
  },
  "devDependencies": {
    "concurrently": "^9.2.1"
  }
}
```

- **concurrently**: Runs multiple npm scripts at once
- **--prefix**: Run command in specific folder

### Server `package.json`

```json
{
  "scripts": {
    "start": "node start.js",
    "server": "nodemon server.js"
  },
  "dependencies": {
    "express": "^5.2.1",
    "mongoose": "^8.0.0"
  }
}
```

- **start**: Production (node)
- **server**: Development (nodemon - auto-restart)

### Client `package.json`

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^19.2.0",
    "axios": "^1.13.2"
  }
}
```

- **dev**: Development server (Vite)
- **build**: Create production build
- **type: "module"**: Use ES6 imports

---

## ✅ Key Takeaways

1. **Separation of Concerns**
   - Frontend (client/) and Backend (server/) are separate
   - Each has its own dependencies and configuration

2. **MVC Pattern**
   - Models: Data structure (models/)
   - Views: Frontend React components
   - Controllers: Business logic (controllers/)

3. **Routes → Controllers → Models**
   - Routes define endpoints
   - Controllers handle logic
   - Models interact with database

4. **Configuration Files**
   - package.json: Dependencies and scripts
   - .env: Secret variables
   - config/: Setup files

---

## 🚀 Next Chapter

Now that you understand the structure, let's dive deep into the backend!

**Next:** [Chapter 3: Backend Deep Dive](./03-BACKEND-DEEP-DIVE.md)

---

*Remember: Organization is key to maintainable code!*
