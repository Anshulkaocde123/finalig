# 🏏 VNIT IG Sports App — Team Setup Guide

## ⚡ Quick Setup (3 Commands)

```bash
git clone https://github.com/Anshulkaocde123/finalig.git
cd finalig
chmod +x setup-team.sh && ./setup-team.sh
```

Then start the app:
```bash
npm start
```

Open in browser: **http://localhost:5173**

---

## 🔐 Admin Login Credentials

| Field    | Value       |
|----------|-------------|
| Username | `admin`     |
| Password | `admin123`  |

---

## ❗ COMMON PROBLEMS & FIXES

---

### ❌ Problem 1: "Cannot connect to database" / Login fails / App shows blank data

**Cause:** Your laptop's IP is NOT whitelisted in MongoDB Atlas.

**Fix (Anshul does this ONCE):**

1. Open **https://cloud.mongodb.com**
2. Sign in with:
   - **Email:** `anshuljain532006@gmail.com`
   - **Password:** _(Anshul's MongoDB Atlas password)_
3. Click on your project → **Network Access** (left sidebar)
4. Click **"+ ADD IP ADDRESS"**
5. Click **"ALLOW ACCESS FROM ANYWHERE"** → This sets it to `0.0.0.0/0`
6. Click **Confirm**
7. Wait 1-2 minutes for it to take effect

> ✅ After this, ALL your teammates can connect from ANY laptop/wifi.

**Screenshot guide:**
```
MongoDB Atlas Dashboard
  └── Network Access (left sidebar)
       └── + ADD IP ADDRESS (green button)
            └── ALLOW ACCESS FROM ANYWHERE
                 └── Confirm ✅
```

---

### ❌ Problem 2: "VITE_API_URL not set" / API calls fail / Login page shows but login doesn't work

**Cause:** The `client/.env.local` file is missing or incorrect.

**Fix:** Make sure `client/.env.local` exists with this exact content:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=311672185118-fnu83et05guc71ffdf39r4meknj3lolj.apps.googleusercontent.com
VITE_ENABLE_GOOGLE_LOGIN=true
```

**How to create it manually:**
```bash
cd client
nano .env.local
```
Paste the above content, save (`Ctrl+X`, `Y`, `Enter`).

> ⚠️ **IMPORTANT:** After creating or changing `.env.local`, you MUST restart the client:
> - Stop the app (`Ctrl+C`)
> - Run `npm start` again

---

### ❌ Problem 3: "server/.env not found" / Server crashes on startup

**Cause:** The `server/.env` file is missing.

**Fix:** Make sure `server/.env` exists with this exact content:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://anshuljain532006_db_user:RruAcmA5Q8HcyVqp@vnit-ig-app.iymg4sc.mongodb.net/vnit_sports?retryWrites=true&w=majority

JWT_SECRET=cBGBXGY1GgYfe6xvVXJMeoLmJNEPkHLBLPtwLtFj9ineVe2BaQgS31VPIdLUZ8Wfp8cerl/IqIa7Wpz0G3hVIg==

GOOGLE_CLIENT_ID=311672185118-fnu83et05guc71ffdf39r4meknj3lolj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/register-oauth

CORS_ORIGIN=http://localhost:5173,http://localhost:5174

BASE_URL=http://localhost:5000
```

**How to create it manually:**
```bash
cd server
nano .env
```
Paste the above content, save (`Ctrl+X`, `Y`, `Enter`).

---

### ❌ Problem 4: "Port 5000 already in use"

**Fix:**
```bash
# Kill whatever is using port 5000
kill -9 $(lsof -ti:5000) 2>/dev/null
# Or on Windows:
# netstat -ano | findstr :5000
# taskkill /PID <PID_NUMBER> /F

# Then restart
npm start
```

---

### ❌ Problem 5: "npm start fails" / Missing dependencies

**Fix:**
```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
npm start
```

---

## 📋 MongoDB Atlas Account Details

| Detail           | Value |
|------------------|-------|
| **Login URL**    | https://cloud.mongodb.com |
| **Account Email**| `anshuljain532006@gmail.com` |
| **Cluster Name** | `vnit-ig-app` |
| **Database Name**| `vnit_sports` |
| **DB Username**  | `anshuljain532006_db_user` |
| **DB Password**  | `RruAcmA5Q8HcyVqp` |

> ⚠️ **Note:** The MongoDB Atlas **login password** (for the website) is different from the **database password** above. Only Anshul has the Atlas login password. Teammates don't need to log into Atlas — they just need their IP whitelisted.

---

## 🔧 How Things Connect

```
┌────────────────────────┐     ┌──────────────────────────┐     ┌─────────────────┐
│  Browser (Frontend)    │     │  Server (Backend)        │     │  MongoDB Atlas   │
│  http://localhost:5173 │────▶│  http://localhost:5000   │────▶│  Cloud Database  │
│                        │     │                          │     │                  │
│  .env.local tells      │     │  .env tells server:      │     │  IP must be      │
│  frontend where the    │     │  - DB connection string   │     │  whitelisted!    │
│  backend API is        │     │  - JWT secret key         │     │                  │
│  VITE_API_URL ─────────│─┐   │  - Google OAuth keys     │     │                  │
│  VITE_SOCKET_URL ──────│─┤   │  - CORS allowed origins  │     │                  │
│                        │ │   │                          │     │                  │
└────────────────────────┘ │   └──────────────────────────┘     └─────────────────┘
                           │              ▲
                           └──────────────┘
                         API calls go here
```

---

## ✅ Verification Checklist

After setup, verify these:

- [ ] `server/.env` file exists with MONGODB_URI
- [ ] `client/.env.local` file exists with VITE_API_URL
- [ ] `npm start` runs without errors
- [ ] http://localhost:5173 shows the app
- [ ] http://localhost:5000/api/departments returns data (test in browser)
- [ ] Login with `admin` / `admin123` works
- [ ] Dashboard loads after login

---

## 💬 Still Not Working?

1. **Check server terminal** — look for error messages (red text)
2. **Open browser DevTools** → Network tab → Look for failed API calls
3. **Try the API directly**: Open `http://localhost:5000/api/departments` in browser
   - If it works → server is fine, check client `.env.local`
   - If it fails → server issue, check `server/.env` and MongoDB Atlas IP whitelist
4. **Message Anshul** with the error message you see
