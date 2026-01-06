# Chapter 8: Environment Variables & Configuration 🔐

## What are Environment Variables?

**Simple Analogy:**
- **Code** = Your car
- **Environment Variables** = GPS destination settings
- Same car, different destinations based on where you're going

Environment variables store configuration that **changes** between environments (development, production).

---

## 🌍 Why Use Environment Variables?

### Problem: Hardcoding Values

```javascript
// ❌ BAD: Hardcoded values
const dbUrl = "mongodb://user:password123@localhost:27017/mydb";
const apiKey = "sk_live_abc123xyz";
const port = 5000;

// PROBLEMS:
// 1. Password exposed in code
// 2. Uploaded to GitHub (security risk!)
// 3. Can't change without editing code
// 4. Same values in dev and production
```

### Solution: Environment Variables

```javascript
// ✅ GOOD: Environment variables
const dbUrl = process.env.MONGODB_URI;
const apiKey = process.env.API_KEY;
const port = process.env.PORT || 5000;

// BENEFITS:
// 1. Secrets stay secret
// 2. .env file not uploaded (in .gitignore)
// 3. Change values without code changes
// 4. Different values per environment
```

---

## 📁 .env File

**.env** = File storing environment variables (key-value pairs)

### Creating .env File

**File:** `server/.env`

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vnit-ig

# Server
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_super_secret_key_here_minimum_32_characters
JWT_EXPIRE=30d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000

# Other APIs (if any)
CLOUDINARY_URL=cloudinary://...
```

### .env File Rules

```bash
# NO SPACES around =
DATABASE_URL=mongodb://...      ✅
DATABASE_URL = mongodb://...    ❌

# NO QUOTES needed (usually)
API_KEY=abc123                  ✅
API_KEY="abc123"                ❌ (quotes become part of value)

# COMMENTS with #
# This is a comment
PORT=5000

# UPPERCASE convention
PORT=5000                       ✅
port=5000                       ❌ (works but not conventional)

# SNAKE_CASE for multi-word
DATABASE_URL=...                ✅
database-url=...                ❌
```

---

## 🔧 Using dotenv Package

### Installation

```bash
npm install dotenv
```

### Loading Environment Variables

**File:** `server/server.js`

```javascript
// Load environment variables FIRST (before anything else)
require('dotenv').config();

// OR (ES6 import)
import dotenv from 'dotenv';
dotenv.config();

// Now you can use process.env
console.log(process.env.MONGODB_URI);
console.log(process.env.PORT);
```

### How It Works

```javascript
// 1. dotenv.config() runs
dotenv.config();

// 2. Reads .env file
// PORT=5000
// NODE_ENV=development

// 3. Adds to process.env object
process.env.PORT = '5000';
process.env.NODE_ENV = 'development';

// 4. You can access them
const port = process.env.PORT;  // '5000'
const env = process.env.NODE_ENV;  // 'development'
```

---

## 🎯 Real Example from Your Project

### Server .env Configuration

**File:** `server/.env` (example)

```bash
# ============================================
# DATABASE
# ============================================
MONGODB_URI=mongodb+srv://vnitadmin:SecurePass123@cluster0.abc123.mongodb.net/vnit-ig-app?retryWrites=true&w=majority

# ============================================
# SERVER
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# JWT (Authentication)
# ============================================
JWT_SECRET=vnit_ig_super_secret_key_2025_minimum_32_characters_long
JWT_EXPIRE=30d

# ============================================
# CLIENT (for CORS)
# ============================================
CLIENT_URL=http://localhost:3000
```

### Using in Code

**File:** `server/config/db.js`

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Get MongoDB URI from environment variable
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not set in environment');
        }
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
};

module.exports = connectDB;
```

**File:** `server/server.js`

```javascript
require('dotenv').config();  // Load first!

const express = require('express');
const app = express();

// Use environment variables
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
});
```

---

## 🎨 Frontend Environment Variables (Vite)

### Vite Environment Variables

Vite uses a **different prefix**: `VITE_`

**File:** `client/.env`

```bash
# Must start with VITE_ to be accessible in browser
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=VNIT IG App
```

### Using in React

```javascript
// Access with import.meta.env (NOT process.env)
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;

console.log(apiUrl);  // 'http://localhost:5000'
```

**Example:** `client/src/api/axiosConfig.js`

```javascript
import axios from 'axios';

// Use environment variable for API URL
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosInstance;
```

---

## 🔒 Security Best Practices

### 1. Never Commit .env Files

**File:** `.gitignore`

```bash
# Environment variables
.env
.env.local
.env.development
.env.production

# Node modules
node_modules/

# Build files
dist/
build/
```

### 2. Provide .env.example

**File:** `.env.example`

```bash
# Copy this file to .env and fill in values

# Database
MONGODB_URI=your_mongodb_connection_string_here

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key_here_minimum_32_characters

# Client
CLIENT_URL=http://localhost:3000
```

**Purpose:**
- Shows what variables are needed
- Others can create their own .env
- No actual secrets in repository

### 3. Different .env Files for Environments

```bash
.env                    # Default (committed to git as example)
.env.local              # Local overrides (not committed)
.env.development        # Development settings
.env.production         # Production settings
```

**Loading:**
```javascript
// Vite automatically loads based on mode
// npm run dev       → loads .env.development
// npm run build     → loads .env.production

// Manual loading
require('dotenv').config({ path: '.env.production' });
```

---

## 📦 package.json Explained

### What is package.json?

**package.json** = Manifest file for your project

```json
{
    "name": "server",
    "version": "1.0.0",
    "description": "VNIT IG App Backend",
    "main": "server.js",
    "scripts": {
        "start": "node server.js",
        "dev": "nodemon server.js",
        "test": "jest"
    },
    "dependencies": {
        "express": "^5.2.1",
        "mongoose": "^8.0.0"
    },
    "devDependencies": {
        "nodemon": "^3.1.11"
    }
}
```

### Line-by-Line Breakdown

```json
{
    // PROJECT INFO
    "name": "server",
    // Name of your project (lowercase, no spaces)
    
    "version": "1.0.0",
    // Semantic versioning: MAJOR.MINOR.PATCH
    // 1.0.0 → 1.0.1 (bug fix)
    // 1.0.0 → 1.1.0 (new feature)
    // 1.0.0 → 2.0.0 (breaking change)
    
    "description": "VNIT IG App Backend",
    // Short description
    
    "main": "server.js",
    // Entry point file
    
    // SCRIPTS
    "scripts": {
        "start": "node server.js",
        // npm start → runs: node server.js
        
        "dev": "nodemon server.js",
        // npm run dev → runs: nodemon server.js
        
        "test": "jest",
        // npm test → runs: jest
    },
    
    // DEPENDENCIES (needed in production)
    "dependencies": {
        "express": "^5.2.1",
        // ^ means: compatible versions (5.x.x)
        // ~ means: patch updates only (5.2.x)
        // No symbol: exact version
        
        "mongoose": "^8.0.0"
    },
    
    // DEV DEPENDENCIES (only needed in development)
    "devDependencies": {
        "nodemon": "^3.1.11"
        // Auto-restart server on file changes
    }
}
```

### Dependencies vs DevDependencies

```json
// DEPENDENCIES (production)
"dependencies": {
    "express": "^5.2.1",      // Web framework - NEEDED in production
    "mongoose": "^8.0.0",     // Database - NEEDED in production
    "dotenv": "^17.2.3"       // Env vars - NEEDED in production
}

// DEV DEPENDENCIES (development only)
"devDependencies": {
    "nodemon": "^3.1.11",     // Auto-restart - NOT needed in production
    "jest": "^29.0.0",        // Testing - NOT needed in production
    "eslint": "^8.0.0"        // Linting - NOT needed in production
}

// Installing:
npm install express          // Adds to dependencies
npm install --save-dev jest  // Adds to devDependencies
```

---

## 🚀 Scripts Explained

### Your Project's Scripts

**Root `package.json`:**
```json
{
    "scripts": {
        "start": "concurrently \"npm run server --prefix server\" \"npm run dev --prefix client\""
    }
}
```

**Breaking it down:**
```bash
npm start

# Runs:
concurrently 
  "npm run server --prefix server"  # Run 'server' script in server/ folder
  "npm run dev --prefix client"     # Run 'dev' script in client/ folder

# Result: Starts both backend and frontend simultaneously
```

**Server `package.json`:**
```json
{
    "scripts": {
        "start": "node server.js",
        "server": "nodemon server.js"
    }
}
```

```bash
npm start        # Production: node server.js
npm run server   # Development: nodemon server.js
```

**Client `package.json`:**
```json
{
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
    }
}
```

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🎯 Environment-Specific Configuration

### Development vs Production

```javascript
// Check environment
if (process.env.NODE_ENV === 'production') {
    // Production settings
    app.use(helmet());  // Security headers
    app.use(compression());  // Gzip compression
} else {
    // Development settings
    app.use(morgan('dev'));  // Detailed logging
}
```

### Example: API URL Configuration

**Client `src/api/axiosConfig.js`:**
```javascript
const apiUrl = import.meta.env.MODE === 'production'
    ? ''  // Production: Same domain (myapp.com/api)
    : 'http://localhost:5000';  // Dev: Local backend

const axiosInstance = axios.create({
    baseURL: apiUrl
});
```

### Example: Database Connection

```javascript
// Development: Local MongoDB
// mongodb://localhost:27017/vnit-ig

// Production: MongoDB Atlas
// mongodb+srv://user:pass@cluster.mongodb.net/vnit-ig

const dbUrl = process.env.MONGODB_URI;
// Configured differently in each environment
```

---

## 🔧 Common Environment Variables

### Backend (Node.js/Express)

```bash
# Server
NODE_ENV=development|production
PORT=5000

# Database
MONGODB_URI=mongodb://...
DB_NAME=vnit-ig-app

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d

# CORS
CLIENT_URL=http://localhost:3000

# Email (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourapp@gmail.com
SMTP_PASS=your-app-password

# Cloud Storage (if using)
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=123456
CLOUDINARY_API_SECRET=secret
```

### Frontend (React/Vite)

```bash
# API
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# App Info
VITE_APP_NAME=VNIT IG App
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_ANALYTICS=false
```

---

## ⚙️ Configuration Files

### vite.config.js

**File:** `client/vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    
    // Development server settings
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true
            }
        }
    },
    
    // Build settings
    build: {
        outDir: 'dist',
        sourcemap: false
    }
});
```

### tailwind.config.js

**File:** `client/tailwind.config.js`

```javascript
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    
    theme: {
        extend: {
            colors: {
                'vnit-primary': '#FF6B35',
                'vnit-secondary': '#004E89',
            }
        },
    },
    
    plugins: [],
}
```

---

## 🎯 Real-World Example: Railway Deployment

**File:** `RAILWAY_VARIABLES.env` (example for Railway)

```bash
# Railway automatically provides:
PORT=5000

# You need to set:
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-secret
NODE_ENV=production
CLIENT_URL=https://yourapp.railway.app
```

**In Railway Dashboard:**
1. Go to Variables tab
2. Add each variable
3. Railway injects them as environment variables
4. Your app reads from `process.env`

---

## ✅ Best Practices Checklist

- ✅ Use .env for sensitive data
- ✅ Never commit .env files
- ✅ Provide .env.example
- ✅ Use different values per environment
- ✅ Validate required variables on startup
- ✅ Use strong secrets (32+ characters)
- ✅ Document all variables
- ✅ Use meaningful names (MONGODB_URI not DB)

---

## 🚀 Next Chapter

Let's see how to build the project from scratch!

**Next:** [Chapter 9: Building From Scratch](./09-BUILD-SEQUENCE.md)

---

*Remember: Keep secrets secret with environment variables!*
