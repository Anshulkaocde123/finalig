# Chapter 8A: Environment Variables & Configuration Explained 🔐

## What You'll Learn

By the end of this chapter, you'll understand:
- What environment variables are
- Why we use them
- How to create .env files
- dotenv library usage
- Security best practices
- Different environments (dev, production)
- Config management
- Secrets management

---

## Part 1: What are Environment Variables?

### **The Secret Note Analogy**

```
REGULAR CODE (Bad):
──────────────────────────────────
// File: config.js
const password = "mySecretPassword123";
const apiKey = "sk_live_abc123def456";

// Problems:
// ❌ Visible in GitHub (everyone can see!)
// ❌ Hard-coded (can't change without editing code)
// ❌ Same values for all environments
// ❌ Security risk!

ENVIRONMENT VARIABLES (Good):
──────────────────────────────────
// File: config.js
const password = process.env.DB_PASSWORD;
const apiKey = process.env.API_KEY;

// File: .env (NOT in GitHub!)
DB_PASSWORD=mySecretPassword123
API_KEY=sk_live_abc123def456

// Benefits:
// ✅ Secrets hidden from code
// ✅ Easy to change (just edit .env)
// ✅ Different values per environment
// ✅ More secure!
```

### **Real-World Analogy**

```
RESTAURANT CHEF:
────────────────────────────────────────────
You give chef a recipe:

❌ BAD RECIPE (hard-coded):
"Add 2 spoons of salt from the blue container
 on the top shelf in the corner"

Problems:
- What if container moves?
- What if it's a different kitchen?
- Too specific!

✅ GOOD RECIPE (environment variables):
"Add 2 spoons of salt"

The chef knows:
- Where salt is in THEIR kitchen
- Uses their environment
- Same recipe works everywhere!

CODE EQUIVALENT:
────────────────────────────────────────────
❌ Hard-coded:
const dbUrl = "mongodb://localhost:27017/mydb";
// Only works on local computer!

✅ Environment variable:
const dbUrl = process.env.MONGODB_URI;
// Works everywhere (each server has its own URI)
```

### **Why Use Environment Variables?**

#### **1. Security** 🔒

```javascript
// ❌ TERRIBLE (Exposed secrets)
const config = {
    jwtSecret: "mySuper SecretKey123",
    mongoUri: "mongodb+srv://admin:password123@cluster.mongodb.net",
    cloudinaryKey: "123456789",
    googleClientSecret: "abc-def-ghi"
};
// Anyone who sees your code can steal these!
// If code is on GitHub → Hackers find it in minutes!

// ✅ SECURE (Hidden secrets)
const config = {
    jwtSecret: process.env.JWT_SECRET,
    mongoUri: process.env.MONGODB_URI,
    cloudinaryKey: process.env.CLOUDINARY_API_KEY,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET
};
// Secrets stored separately
// Never committed to Git
// Each developer/server has their own values
```

#### **2. Flexibility** 🔄

```javascript
// ❌ INFLEXIBLE
const PORT = 5000;
// What if port 5000 is already used?
// Need to edit code and restart!

// ✅ FLEXIBLE
const PORT = process.env.PORT || 5000;
// Can change port without editing code
// Just change environment variable
```

#### **3. Different Environments** 🌍

```javascript
// Same code, different behavior:

// DEVELOPMENT (your laptop)
MONGODB_URI=mongodb://localhost:27017/vnit_dev
NODE_ENV=development
API_URL=http://localhost:5000

// PRODUCTION (Render server)
MONGODB_URI=mongodb+srv://cluster.mongodb.net/vnit_prod
NODE_ENV=production
API_URL=https://vnit-ig.onrender.com
```

---

## Part 2: Understanding process.env

### **What is process.env?**

```javascript
// ════════════════════════════════════════════════
// process = Global Node.js object
// ════════════════════════════════════════════════

console.log(process);
// Output: {
//   version: 'v18.17.0',
//   arch: 'x64',
//   platform: 'linux',
//   env: { ... },
//   argv: [...],
//   pid: 12345,
//   ...
// }

// What is it?
// - Object containing information about current Node.js process
// - Available globally (no import needed)
// - Provided by Node.js runtime

// ════════════════════════════════════════════════
// process.env = Environment variables object
// ════════════════════════════════════════════════

console.log(process.env);
// Output: {
//   PATH: '/usr/bin:/bin:/usr/sbin',
//   HOME: '/home/user',
//   USER: 'john',
//   NODE_ENV: 'development',
//   PORT: '5000',
//   MONGODB_URI: 'mongodb://localhost:27017',
//   ... hundreds more
// }

// What is it?
// - Object containing all environment variables
// - Set by operating system + .env file
// - Always strings (even numbers!)

// ════════════════════════════════════════════════
// Accessing Environment Variables
// ════════════════════════════════════════════════

const port = process.env.PORT;
console.log(port);  // "5000" (string!)
console.log(typeof port);  // "string"

// IMPORTANT: Always strings!
const limit = process.env.LIMIT;  // "10"
const num = limit + 5;  // "105" (string concatenation!)
const correct = parseInt(limit) + 5;  // 15 (correct!)

// ════════════════════════════════════════════════
// Setting Default Values
// ════════════════════════════════════════════════

const PORT = process.env.PORT || 5000;
// If PORT not set → use 5000

const NODE_ENV = process.env.NODE_ENV || 'development';
// If NODE_ENV not set → use 'development'

const MAX_CONNECTIONS = parseInt(process.env.MAX_CONNECTIONS) || 100;
// Convert to number + default
```

### **Where do Environment Variables Come From?**

```bash
# ════════════════════════════════════════════════
# 1. Operating System
# ════════════════════════════════════════════════

# Linux/Mac:
echo $PATH
echo $HOME
echo $USER

# Windows:
echo %PATH%
echo %USERPROFILE%
echo %USERNAME%

# These are set by your OS
# Available to all programs

# ════════════════════════════════════════════════
# 2. Terminal/Shell
# ════════════════════════════════════════════════

# Set temporarily (current session only)
export PORT=3000
export NODE_ENV=development

# Run Node.js
node server.js
# process.env.PORT = "3000"
# process.env.NODE_ENV = "development"

# ════════════════════════════════════════════════
# 3. .env File (with dotenv library)
# ════════════════════════════════════════════════

# File: .env
PORT=5000
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=mysecret

# File: server.js
require('dotenv').config();
console.log(process.env.PORT);  // "5000"

# ════════════════════════════════════════════════
# 4. Inline (one command)
# ════════════════════════════════════════════════

PORT=8080 NODE_ENV=production node server.js
# Sets PORT and NODE_ENV just for this command
```

---

## Part 3: Using dotenv Library

### **Installation**

```bash
# Install dotenv
npm install dotenv

# Or with yarn
yarn add dotenv
```

### **Basic Setup - Line by Line**

**File:** `server/server.js`

```javascript
// ════════════════════════════════════════════════
// STEP 1: Import dotenv (MUST be first!)
// ════════════════════════════════════════════════
require('dotenv').config();

// What does this do?
// ──────────────────────────────────────────────

// 1. Looks for .env file in current directory
// 2. Reads all variables from .env
// 3. Adds them to process.env
// 4. Now you can use process.env.VARIABLE_NAME

// Why at the top?
// - Must run BEFORE any code uses process.env
// - Otherwise variables won't be loaded yet!

// Alternative syntax (ES6):
import dotenv from 'dotenv';
dotenv.config();

// Custom .env file location:
require('dotenv').config({ path: './config/.env' });

// ════════════════════════════════════════════════
// STEP 2: Import other modules
// ════════════════════════════════════════════════
const express = require('express');
const mongoose = require('mongoose');

// Now these can use environment variables

// ════════════════════════════════════════════════
// STEP 3: Use environment variables
// ════════════════════════════════════════════════

const PORT = process.env.PORT || 5000;
// Get PORT from .env or default to 5000

const MONGODB_URI = process.env.MONGODB_URI;
// Get MongoDB connection string

const JWT_SECRET = process.env.JWT_SECRET;
// Get JWT secret for signing tokens

// ════════════════════════════════════════════════
// Why not import at usage site?
// ════════════════════════════════════════════════

// ❌ DON'T DO THIS:
// File: config/db.js
require('dotenv').config();  // Called again
const uri = process.env.MONGODB_URI;

// Problem: .env loaded multiple times (inefficient)

// ✅ DO THIS:
// File: server.js (main entry)
require('dotenv').config();  // Load once

// File: config/db.js
const uri = process.env.MONGODB_URI;  // Just use it
// Variables already loaded!
```

### **.env File Format**

**File:** `.env`

```bash
# ════════════════════════════════════════════════
# .env File Syntax Rules
# ════════════════════════════════════════════════

# ────────────────────────────────────────────────
# 1. BASIC FORMAT
# ────────────────────────────────────────────────
KEY=value
PORT=5000
NODE_ENV=development

# Rules:
# - No spaces around =
# - One variable per line
# - Case-sensitive (PORT ≠ port)

# ────────────────────────────────────────────────
# 2. COMMENTS
# ────────────────────────────────────────────────
# This is a comment
# PORT=3000  ← This is ignored

PORT=5000  # This works too

# ────────────────────────────────────────────────
# 3. STRINGS (with/without quotes)
# ────────────────────────────────────────────────

# Without quotes
DB_NAME=vnit_ig_app

# With quotes (if value has spaces)
APP_NAME="VNIT Inter-Department Games"

# Single quotes work too
APP_NAME='VNIT Inter-Department Games'

# Access in code:
# process.env.APP_NAME = "VNIT Inter-Department Games"

# ────────────────────────────────────────────────
# 4. MULTILINE VALUES
# ────────────────────────────────────────────────

# Use quotes and \n
WELCOME_MESSAGE="Welcome to VNIT!\nEnjoy the games!"

# Or use template literal in code:
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"

# ────────────────────────────────────────────────
# 5. NUMBERS
# ────────────────────────────────────────────────

PORT=5000
MAX_USERS=100

# IMPORTANT: All values are strings!
# In code:
# typeof process.env.PORT === 'string'  // true
# process.env.PORT === 5000  // false (string vs number)
# process.env.PORT === '5000'  // true

# Must convert:
const port = parseInt(process.env.PORT);
const maxUsers = Number(process.env.MAX_USERS);

# ────────────────────────────────────────────────
# 6. BOOLEAN VALUES
# ────────────────────────────────────────────────

DEBUG=true
ENABLE_LOGGING=false

# In code (also strings!):
process.env.DEBUG === 'true'  // true (not boolean!)
process.env.DEBUG === true  // false

# Convert to boolean:
const debug = process.env.DEBUG === 'true';
const enableLogging = process.env.ENABLE_LOGGING === 'true';

# ────────────────────────────────────────────────
# 7. URLS
# ────────────────────────────────────────────────

MONGODB_URI=mongodb://localhost:27017/vnit_ig_app
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# ────────────────────────────────────────────────
# 8. SPECIAL CHARACTERS
# ────────────────────────────────────────────────

# If password has special chars, use quotes
DB_PASSWORD="p@ssw0rd!#$%"
JWT_SECRET="my-super-secret-key-123!@#"

# ────────────────────────────────────────────────
# 9. EMPTY VALUES
# ────────────────────────────────────────────────

OPTIONAL_FEATURE=
# process.env.OPTIONAL_FEATURE = ""

# Check in code:
if (process.env.OPTIONAL_FEATURE) {
    // This won't run (empty string is falsy)
}

# ────────────────────────────────────────────────
# 10. VARIABLE REFERENCES (doesn't work!)
# ────────────────────────────────────────────────

# ❌ This doesn't work in .env:
BASE_URL=http://localhost
API_URL=$BASE_URL/api
# process.env.API_URL = "$BASE_URL/api" (literal string!)

# ✅ Do this in code instead:
const BASE_URL = process.env.BASE_URL;
const API_URL = `${BASE_URL}/api`;
```

### **Complete .env Example**

**File:** `.env`

```bash
# ════════════════════════════════════════════════
# Server Configuration
# ════════════════════════════════════════════════
NODE_ENV=development
PORT=5000
HOST=localhost

# ════════════════════════════════════════════════
# Database
# ════════════════════════════════════════════════
MONGODB_URI=mongodb://localhost:27017/vnit_ig_app

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vnit_ig_app

# ════════════════════════════════════════════════
# Authentication
# ════════════════════════════════════════════════
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long
JWT_EXPIRE=30d

# ════════════════════════════════════════════════
# Google OAuth
# ════════════════════════════════════════════════
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456

# ════════════════════════════════════════════════
# Cloudinary (Image Upload)
# ════════════════════════════════════════════════
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz

# ════════════════════════════════════════════════
# Frontend URL (for CORS)
# ════════════════════════════════════════════════
FRONTEND_URL=http://localhost:5173

# ════════════════════════════════════════════════
# Email (if using email features)
# ════════════════════════════════════════════════
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# ════════════════════════════════════════════════
# Feature Flags
# ════════════════════════════════════════════════
ENABLE_SOCKET_IO=true
ENABLE_FILE_UPLOAD=true
DEBUG_MODE=true

# ════════════════════════════════════════════════
# Rate Limiting
# ════════════════════════════════════════════════
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Part 4: Using Environment Variables in Code

### **Server Configuration**

**File:** `server/server.js`

```javascript
require('dotenv').config();
const express = require('express');

const app = express();

// ════════════════════════════════════════════════
// Get configuration from environment
// ════════════════════════════════════════════════

const PORT = process.env.PORT || 5000;
// What if PORT not set?
// - Use default value 5000
// - Prevents crashes

const NODE_ENV = process.env.NODE_ENV || 'development';
// development, production, or test

const HOST = process.env.HOST || 'localhost';
// Where to bind server

// ════════════════════════════════════════════════
// Start server
// ════════════════════════════════════════════════

app.listen(PORT, HOST, () => {
    console.log(`Server running in ${NODE_ENV} mode`);
    console.log(`Listening on ${HOST}:${PORT}`);
});

// Output (development):
// Server running in development mode
// Listening on localhost:5000
```

### **Database Connection**

**File:** `server/config/db.js`

```javascript
const mongoose = require('mongoose');

// ════════════════════════════════════════════════
// Connect to MongoDB
// ════════════════════════════════════════════════

const connectDB = async () => {
    try {
        // ────────────────────────────────────────────
        // Get MongoDB URI from environment
        // ────────────────────────────────────────────
        const uri = process.env.MONGODB_URI;
        
        // What is uri?
        // Development: "mongodb://localhost:27017/vnit_ig_app"
        // Production: "mongodb+srv://user:pass@cluster.mongodb.net/vnit_ig_app"
        
        // ────────────────────────────────────────────
        // Validate URI exists
        // ────────────────────────────────────────────
        if (!uri) {
            throw new Error('MONGODB_URI not defined in environment variables');
        }
        // Prevent crashes if .env file missing
        
        // ────────────────────────────────────────────
        // Connect with options
        // ────────────────────────────────────────────
        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        // Output: MongoDB Connected: localhost
        // Or: MongoDB Connected: cluster.mongodb.net
        
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);  // Exit with failure
    }
};

module.exports = connectDB;
```

### **JWT Authentication**

**File:** `server/controllers/authController.js`

```javascript
const jwt = require('jsonwebtoken');

// ════════════════════════════════════════════════
// Generate JWT Token
// ════════════════════════════════════════════════

const generateToken = (userId) => {
    // ────────────────────────────────────────────
    // Get secret from environment
    // ────────────────────────────────────────────
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
        throw new Error('JWT_SECRET not configured');
    }
    // Critical security check!
    
    // ────────────────────────────────────────────
    // Get expiration from environment
    // ────────────────────────────────────────────
    const expiresIn = process.env.JWT_EXPIRE || '30d';
    // Default: 30 days
    
    // ────────────────────────────────────────────
    // Sign token
    // ────────────────────────────────────────────
    const token = jwt.sign(
        { id: userId },      // Payload
        secret,              // Secret key (from .env!)
        { expiresIn }        // Options
    );
    
    return token;
};

// ════════════════════════════════════════════════
// Verify JWT Token
// ════════════════════════════════════════════════

const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET;
    
    try {
        const decoded = jwt.verify(token, secret);
        return decoded;
    } catch (error) {
        throw new Error('Invalid token');
    }
};
```

### **CORS Configuration**

**File:** `server/server.js`

```javascript
const cors = require('cors');

// ════════════════════════════════════════════════
// Configure CORS
// ════════════════════════════════════════════════

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    // Allow requests from frontend URL
    
    credentials: true,
    // Allow cookies
    
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    // Allowed HTTP methods
    
    allowedHeaders: ['Content-Type', 'Authorization']
    // Allowed headers
};

app.use(cors(corsOptions));

// Why use environment variable?
// Development: FRONTEND_URL=http://localhost:5173
// Production: FRONTEND_URL=https://vnit-ig.netlify.app
// One code, different values!
```

### **Conditional Features**

```javascript
// ════════════════════════════════════════════════
// Enable features based on environment
// ════════════════════════════════════════════════

// ────────────────────────────────────────────────
// Detailed logging in development only
// ────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        next();
    });
}

// ────────────────────────────────────────────────
// Debug mode
// ────────────────────────────────────────────────
const DEBUG = process.env.DEBUG_MODE === 'true';

if (DEBUG) {
    console.log('Debug mode enabled');
    console.log('Environment variables:', process.env);
}

// ────────────────────────────────────────────────
// Feature flags
// ────────────────────────────────────────────────
if (process.env.ENABLE_SOCKET_IO === 'true') {
    const socketIo = require('socket.io');
    const io = socketIo(server);
    // Socket.io enabled!
}

// ────────────────────────────────────────────────
// Error details (dev vs prod)
// ────────────────────────────────────────────────
app.use((err, req, res, next) => {
    const isDev = process.env.NODE_ENV === 'development';
    
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
        // Only show stack trace in development
        stack: isDev ? err.stack : undefined
    });
});
```

---

## Part 5: Security Best Practices

### **1. Never Commit .env to Git**

```bash
# ════════════════════════════════════════════════
# .gitignore file
# ════════════════════════════════════════════════

# Environment variables
.env
.env.local
.env.development
.env.production
.env.test

# This prevents .env from being committed to Git
```

### **2. Use .env.example**

```bash
# ════════════════════════════════════════════════
# .env.example (safe to commit)
# ════════════════════════════════════════════════

# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=your_mongodb_connection_string_here

# Authentication
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend
FRONTEND_URL=http://localhost:5173
```

**Purpose:**
- Shows what environment variables are needed
- Team members can copy to `.env` and fill in their values
- Safe to commit (no actual secrets)

### **3. Validate Environment Variables**

```javascript
// ════════════════════════════════════════════════
// Validate required environment variables
// ════════════════════════════════════════════════

const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
];

const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.error('\nPlease check your .env file');
    process.exit(1);
}

console.log('✅ All required environment variables set');
```

### **4. Use Strong Secrets**

```bash
# ❌ WEAK SECRETS
JWT_SECRET=secret
JWT_SECRET=123456
JWT_SECRET=password

# ✅ STRONG SECRETS
JWT_SECRET=8f7d6e5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7
JWT_SECRET=kJ8%mP2#qL5@nR9&tY4$wE7^uI0!oP3*aS6+dF1=gH2-zX8

# Generate strong secrets:
# Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL:
openssl rand -hex 32

# Online generator:
# https://randomkeygen.com/
```

### **5. Different .env for Different Environments**

```bash
# ════════════════════════════════════════════════
# .env.development (local development)
# ════════════════════════════════════════════════
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vnit_ig_dev
FRONTEND_URL=http://localhost:5173
DEBUG_MODE=true

# ════════════════════════════════════════════════
# .env.production (deployed server)
# ════════════════════════════════════════════════
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vnit_ig_prod
FRONTEND_URL=https://vnit-ig.netlify.app
DEBUG_MODE=false

# Load specific file:
# package.json scripts:
{
    "scripts": {
        "dev": "NODE_ENV=development node -r dotenv/config server.js dotenv_config_path=.env.development",
        "start": "NODE_ENV=production node -r dotenv/config server.js dotenv_config_path=.env.production"
    }
}
```

---

## Part 6: Deployment Platform Variables

### **Render.com**

```
1. Go to Render Dashboard
2. Select your service
3. Click "Environment"
4. Add variables:

   Key                    Value
   ──────────────────────────────────────────────
   NODE_ENV               production
   MONGODB_URI            mongodb+srv://...
   JWT_SECRET             your_secret_here
   GOOGLE_CLIENT_ID       your_client_id
   GOOGLE_CLIENT_SECRET   your_secret
   FRONTEND_URL           https://yourapp.netlify.app

5. Click "Save Changes"
6. Service will auto-redeploy
```

### **Netlify (Frontend)**

```
1. Go to Netlify Dashboard
2. Select your site
3. Site settings → Build & deploy → Environment
4. Add variables:

   Key                    Value
   ──────────────────────────────────────────────
   VITE_API_URL           https://yourapi.onrender.com
   VITE_GOOGLE_CLIENT_ID  your_client_id

5. Click "Save"
6. Trigger new deploy
```

---

## Summary & Quiz

### **Key Terminology**

✅ **Environment Variable**: Configuration value stored outside code  
✅ **process.env**: Node.js object containing environment variables  
✅ **dotenv**: Library to load .env file into process.env  
✅ **.env**: File containing environment variables  
✅ **.env.example**: Template showing required variables  
✅ **.gitignore**: File specifying what Git should ignore  
✅ **Secret**: Sensitive value (password, API key)  
✅ **NODE_ENV**: Environment name (development, production, test)  
✅ **Default Value**: Fallback if variable not set  

### **Quiz Questions**

1. Why shouldn't you commit .env to Git?
2. What does `process.env.PORT || 5000` do?
3. What's the purpose of .env.example?
4. How do you generate a strong JWT secret?
5. Why are all environment variable values strings?

---

**Next Chapter:** Deployment Complete Guide →

Learn how to deploy your MERN app to production!
