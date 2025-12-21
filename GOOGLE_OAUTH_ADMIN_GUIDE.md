# Google OAuth Setup & Admin Credentials Guide

**Status**: Complete Setup Instructions  
**Date**: December 21, 2025  
**Production URL**: https://web-production-184c.up.railway.app/

---

## 🔐 Admin Login Credentials

### Default Local Credentials (Always Works)
```
Username: admin
Password: admin123
```

**Note**: These credentials are seeded automatically on first `/api/auth/seed` call.

---

## 🚀 Google OAuth Setup (Optional but Recommended)

### Step 1: Create Google OAuth Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: **"VNIT IG App"**
3. Go to **Credentials** → Create OAuth 2.0 Client ID
4. Choose **"Web Application"**

### Step 2: Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Select **"External"** (for testing)
3. Fill in:
   - **App name**: VNIT Inter-Department Games
   - **User support email**: your-email@vnit.ac.in
   - **Developer contact**: your-email@vnit.ac.in
4. Save and Continue

### Step 3: Add Required Scopes

1. Add these scopes:
   - `openid`
   - `email`
   - `profile`
2. Save and Continue

### Step 4: Create OAuth Credentials

1. Go to **Credentials** → **Create Credentials** → OAuth 2.0 Client ID
2. Select **"Web Application"**
3. Add Authorized redirect URIs:
   ```
   http://localhost:5000
   http://localhost:5173
   https://web-production-184c.up.railway.app/
   ```
4. Click **Create**

### Step 5: Copy Your Credentials

You'll see:
```
Client ID: [YOUR_CLIENT_ID]
Client Secret: [YOUR_CLIENT_SECRET]
```

**Save these securely!**

---

## 🔧 Local Development Setup

### Create `.env.local` in `client/` folder:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
VITE_API_URL=http://localhost:5000/api
```

### Create `.env` in `server/` folder:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://anshuljain532006_db_user:RruAcmA5Q8HcyVqp@vnit-ig-app.iymg4sc.mongodb.net/vnit_sports?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-min-32-chars-1234567890
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/register-oauth
CORS_ORIGIN=http://localhost:5173,http://localhost:5000
```

### Run locally:

```bash
# Terminal 1: Backend
cd server
npm install
npm start  # or npm run server for nodemon

# Terminal 2: Frontend
cd client
npm install
npm run dev
```

**Login at**: http://localhost:5173/login

---

## ☁️ Production Deployment (Railway)

### Set These Environment Variables in Railway Dashboard:

1. Go to https://railway.app → vnit-ig-app → Variables

2. Set:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://anshuljain532006_db_user:RruAcmA5Q8HcyVqp@vnit-ig-app.iymg4sc.mongodb.net/vnit_sports?retryWrites=true&w=majority
   JWT_SECRET=your-secure-random-string-min-32-chars
   GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
   GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
   GOOGLE_CALLBACK_URL=https://web-production-184c.up.railway.app/api/auth/register-oauth
   CORS_ORIGIN=https://web-production-184c.up.railway.app
   ```

3. **Note**: If you don't have Google credentials yet, leave them blank. The app will still work with local login (admin/admin123).

---

## 🔑 Getting Your Actual Google Credentials

### Example Credentials (For Testing - Replace These):
```
Google Client ID:     123456789-abcdefghijklmnop.apps.googleusercontent.com
Google Client Secret: GOCSPX-aBcDeFgHiJkLmNoPqRsT
```

**Real credentials have this format**:
- **Client ID**: Starts with numbers, ends with `.apps.googleusercontent.com`
- **Client Secret**: Starts with `GOCSPX-` followed by random characters

---

## 📝 How Login Works

### Local Login (Always Available)
1. User enters: username `admin`, password `admin123`
2. Backend checks MongoDB
3. Password verified with bcrypt
4. JWT token generated
5. User redirected to dashboard

### Google OAuth Login (If Configured)
1. User clicks "Sign in with Google"
2. Google Identity Services loads
3. User authenticates with Google
4. JWT credential returned to app
5. App sends to backend `/api/auth/register-oauth`
6. Backend creates/updates admin account
7. JWT token generated
8. User redirected to dashboard

---

## ✅ Login Page Features

### Improved Login Page Includes:
- ✅ Professional VNIT branding
- ✅ Google OAuth button (if configured)
- ✅ Local username/password login
- ✅ Real-time form validation
- ✅ Loading indicators
- ✅ Error messages (toast notifications)
- ✅ Responsive design (mobile & desktop)
- ✅ Dark mode ready (if theme implemented)

---

## 🧪 Testing Login

### Test Local Login (No Google Setup Needed)
```bash
# POST request to login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Response:
{
  "_id": "...",
  "username": "admin",
  "email": "admin@vnit.ac.in",
  "name": "VNIT Admin",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "provider": "local"
}
```

### Test Google OAuth (If Configured)
```bash
# POST request to register
curl -X POST http://localhost:5000/api/auth/register-oauth \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "108...",
    "email": "user@gmail.com",
    "name": "John Doe",
    "picture": "https://..."
  }'
```

---

## 🔒 Security Best Practices

### ✅ What We're Doing Right
- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens with expiry (30 days)
- CORS properly configured
- Google OAuth uses official Google Identity Services
- Secrets stored in environment variables
- No hardcoded credentials in code

### ⚠️ Things to Remember
- **Never commit .env files** (already in .gitignore)
- **Keep JWT_SECRET secure** (min 32 characters recommended)
- **Regularly rotate credentials** in production
- **Monitor login attempts** for suspicious activity
- **Use HTTPS only** in production (Railway provides this)

---

## 🐛 Troubleshooting

### Google Sign-In Button Not Showing
**Problem**: Button doesn't appear on login page
**Solution**:
1. Check if `VITE_GOOGLE_CLIENT_ID` is set in `.env.local`
2. Check browser console for errors (F12)
3. Verify Client ID format (should end with `.apps.googleusercontent.com`)

### "Google sign-in failed" Error
**Problem**: Can't login with Google
**Solution**:
1. Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in server `.env`
2. Verify redirect URIs in Google Cloud Console match your app URL
3. Check browser console for specific error message
4. Make sure account hasn't been logged in before (creates new account)

### "Invalid credentials" for Local Login
**Problem**: admin/admin123 doesn't work
**Solution**:
1. Make sure admin account exists: Call `/api/auth/seed`
2. Check MongoDB connection is working
3. Verify username and password are exactly: `admin` / `admin123`
4. Check server logs for database errors

### JWT Token Expired
**Problem**: "Token expired" error after login
**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Login again
3. Or increase token expiry in `authController.js` (line: `expiresIn: '30d'`)

---

## 📋 Login Flow Diagram

```
┌─────────────────┐
│   Login Page    │
└────────┬────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
┌─────────┐  ┌──────────────┐
│ Local   │  │ Google OAuth │
│ Login   │  │   Button     │
└────┬────┘  └──────┬───────┘
     │               │
     ▼               ▼
┌──────────────────────────────┐
│   POST /api/auth/login       │
│   or                         │
│   POST /api/auth/register-oauth
└──────────────┬───────────────┘
               │
               ▼
        ┌──────────────┐
        │ Verify Creds │
        └──────┬───────┘
               │
        ┌──────┴──────┐
        │ Valid?      │
        └─┬──────────┬┘
          │ Yes    No│
          ▼          ▼
      ┌─────────┐ ┌─────────┐
      │Generate │ │  Error  │
      │  Token  │ │ Message │
      └────┬────┘ └─────────┘
           │
           ▼
    ┌────────────────┐
    │Save to Storage │
    │  Redirect to   │
    │  Dashboard     │
    └────────────────┘
```

---

## 🎯 Next Steps

### Option 1: Use Local Login Only (Recommended for Now)
- Use: admin / admin123
- No Google setup needed
- Works immediately

### Option 2: Add Google OAuth (For Production)
1. Follow the Google OAuth setup steps above
2. Get your credentials
3. Add to Railway environment variables
4. Users can then use either local or Google login

### Option 3: Protect Local Login (Advanced)
- Require Google OAuth only
- Remove local login
- More secure but less convenient

---

## 📞 Summary

**Current Status**:
- ✅ Local login working: admin / admin123
- ✅ Google OAuth code implemented (ready to connect)
- ✅ Login page improved with error handling
- ✅ Hardcoded URLs removed

**To Enable Google Login**:
1. Create project at Google Cloud Console
2. Get Client ID and Secret
3. Add to Railway environment variables
4. Optionally: Update `.env.local` for local development

**All changes committed and deployed!**

