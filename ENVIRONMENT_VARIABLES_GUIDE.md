# 🔐 Environment Variables Setup Guide

**For: VNIT Inter-Department Games App**  
**Version:** 1.0  
**Last Updated:** February 28, 2026

---

## 📋 Overview

This guide explains all environment variables needed for the VNIT Sports App (MERN Stack).

**⚠️ IMPORTANT:**
- **NEVER commit `.env` files to Git** (they contain sensitive data)
- Each developer creates their own `.env` files locally
- Use `.env.example` files as templates
- For production, use your hosting platform's secrets manager (Railway, Render, Vercel, etc.)

---

## 📁 Environment Files in the Project

```
project-root/
├── server/
│   ├── .env              ← Actual file (gitignored) - DO NOT COMMIT
│   └── .env.example      ← Template file - SHARE THIS
├── client/
│   ├── .env.local        ← Local dev (gitignored) - DO NOT COMMIT
│   ├── .env.production   ← Production build - gitignored
│   └── .env.example      ← Template file - SHARE THIS
├── RAILWAY_VARIABLES.env ← Reference for production deployment
└── ENVIRONMENT_VARIABLES_GUIDE.md ← This file
```

---

## 🖥️ SERVER ENVIRONMENT VARIABLES

**Location:** `server/.env`

### 1. **Application Settings**
```dotenv
NODE_ENV=development          # Values: development | production | test
PORT=5000                     # Server port (local: 5000, production: set by platform)
```

### 2. **Database (MongoDB Atlas)**
```dotenv
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/vnit_sports?retryWrites=true&w=majority
```

**How to get it:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster (if you don't have one)
3. Database Access → Create a DB user
4. Network Access → Add IP `0.0.0.0/0` (or your IP)
5. Clusters → Connect → Copy the connection string
6. Replace `<username>`, `<password>`, `<cluster>`

**Current Database:** `vnit-ig-app` cluster on MongoDB Atlas

### 3. **JWT Authentication**
```dotenv
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_here
```

**How to generate:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

**Requirements:**
- Minimum 32 random characters
- Keep it secret! Never share or commit
- Used to sign/verify login tokens

### 4. **Google OAuth 2.0**
```dotenv
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/register-oauth
```

**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable Google+ API
4. APIs & Services → Credentials → Create OAuth 2.0 Client ID
5. Application type: **Web application**
6. Add Authorized redirect URIs:
   - Local: `http://localhost:5000/api/auth/register-oauth`
   - Production: `https://<your-domain>/api/auth/register-oauth`
7. Copy Client ID and Client Secret

**Current Setup:** Google OAuth configured for development

### 5. **CORS (Cross-Origin Resource Sharing)**
```dotenv
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

**Format:** Comma-separated list of allowed frontend origins

**Local Development:**
```
http://localhost:5173,http://localhost:5174
```

**Production:**
```
https://your-frontend-domain.com
```

### 6. **Base URL (Optional)**
```dotenv
BASE_URL=http://localhost:5000
```

**Usage:** When the server needs to reference its own public URL (e.g., for email links)

---

## 🎨 CLIENT ENVIRONMENT VARIABLES

**Location:** `client/.env.local` (development) or `client/.env.production` (production build)

### Important Rules:
- **ALL variables MUST start with `VITE_`** (Vite framework requirement)
- Only `VITE_*` variables are exposed to the browser
- Local file: `.env.local` (gitignored)
- Production file: `.env.production` (gitignored)

### 1. **Backend API URL**
```dotenv
VITE_API_URL=http://localhost:5000/api
```

**Local Dev:** `http://localhost:5000/api`  
**Production:** `https://your-backend-domain.com/api`

### 2. **Socket.IO URL**
```dotenv
VITE_SOCKET_URL=http://localhost:5000
```

**Local Dev:** `http://localhost:5000`  
**Production:** `https://your-backend-domain.com`

(Note: No `/api` path for Socket.IO)

### 3. **Google OAuth Client ID**
```dotenv
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

**Important:** 
- Use the **SAME Client ID** as the server
- This is publicly visible (it's meant to be)
- Only the Client Secret is sensitive

---

## 🚀 Setup Instructions for Team Members

### Step 1: Clone the repository
```bash
git clone <repo-url>
cd vnit-ig-app-with-framer-motion
```

### Step 2: Create server environment file
```bash
cd server
cp .env.example .env
```

Edit `server/.env` and fill in:
- `MONGODB_URI` (from MongoDB Atlas)
- `JWT_SECRET` (generate a new one)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (from Google Cloud)
- `CORS_ORIGIN` (set to client URL)

### Step 3: Create client environment file
```bash
cd ../client
cp .env.example .env.local
```

Edit `client/.env.local` and fill in:
- `VITE_API_URL` (backend URL)
- `VITE_SOCKET_URL` (backend URL, no /api)
- `VITE_GOOGLE_CLIENT_ID` (same as server)

### Step 4: Install dependencies
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### Step 5: Run the app
```bash
npm start
```

This runs both server and client concurrently.

---

## 🔒 Security Checklist

- ✅ `.env` files are in `.gitignore`
- ✅ `.env.example` files are committed (as templates)
- ✅ Never log sensitive values
- ✅ Rotate JWT_SECRET regularly
- ✅ Use strong, unique passwords
- ✅ Restrict MongoDB IP access in production
- ✅ Store production secrets in your hosting platform's secrets manager
- ✅ Use HTTPS in production
- ✅ Never share credentials via Slack, email, or chat

---

## 🚢 Production Deployment

### For Railway / Render / Vercel:

Use the platform's **Secrets/Environment Variables** section:

**Server:**
- `NODE_ENV=production`
- `PORT=<assigned by platform>`
- `MONGODB_URI=<production database>`
- `JWT_SECRET=<strong secret>`
- `GOOGLE_CLIENT_ID=<oauth id>`
- `GOOGLE_CLIENT_SECRET=<oauth secret>`
- `GOOGLE_CALLBACK_URL=https://<production-domain>/api/auth/register-oauth`
- `CORS_ORIGIN=https://<production-domain>`

**Client (build-time variables):**
- `VITE_API_URL=https://<backend-domain>/api`
- `VITE_SOCKET_URL=https://<backend-domain>`
- `VITE_GOOGLE_CLIENT_ID=<oauth id>`

---

## 📚 Variable Reference Table

| Variable | Server | Client | Required | Type | Example |
|----------|--------|--------|----------|------|---------|
| `NODE_ENV` | ✅ | - | Yes | String | `development` |
| `PORT` | ✅ | - | No | Number | `5000` |
| `MONGODB_URI` | ✅ | - | Yes | URL | `mongodb+srv://user:pass@...` |
| `JWT_SECRET` | ✅ | - | Yes | String | Base64 encoded |
| `GOOGLE_CLIENT_ID` | ✅ | ✅ | Yes | String | `xxx-yyy.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ✅ | - | Yes | String | `GOCSPX-xxx` |
| `GOOGLE_CALLBACK_URL` | ✅ | - | Yes | URL | `http://localhost:5000/api/auth/register-oauth` |
| `CORS_ORIGIN` | ✅ | - | Yes | String | `http://localhost:5173` |
| `BASE_URL` | ✅ | - | No | URL | `http://localhost:5000` |
| `VITE_API_URL` | - | ✅ | Yes | URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | - | ✅ | Yes | URL | `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | - | ✅ | Yes | String | `xxx-yyy.apps.googleusercontent.com` |

---

## 🆘 Troubleshooting

### Error: "MONGODB_URI not set"
→ Check `server/.env` exists and has valid MongoDB connection string

### Error: "CORS error" or "Connection refused"
→ Check `CORS_ORIGIN` matches your client URL  
→ Check client's `VITE_API_URL` is correct

### Error: "Invalid OAuth credentials"
→ Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in both server and client  
→ Check Google Cloud Console has correct redirect URI

### Error: "Socket connection failed"
→ Check `VITE_SOCKET_URL` is set correctly (no `/api` path)  
→ Ensure server is running on `CORS_ORIGIN`

---

## 📞 Questions?

Refer to:
- [LEARNING-GUIDE/](./LEARNING-GUIDE/) for detailed setup guides
- [server/.env.example](./server/.env.example) for server variables
- [client/.env.example](./client/.env.example) for client variables
- Google OAuth guide: [GOOGLE_OAUTH_WORKFLOW.md](./GOOGLE_OAUTH_WORKFLOW.md)

---

**Last Updated:** February 28, 2026
