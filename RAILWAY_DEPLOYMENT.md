# Railway.app Deployment Guide (FREE)

## Overview
Railway.app is the easiest way to deploy your full-stack Node.js + React app for FREE with a $5 monthly credit.

## Prerequisites
- GitHub account (you already have this: Anshulkaocde123)
- MongoDB Atlas account (free tier)
- Google OAuth credentials (optional but recommended)

## Step 1: Setup MongoDB Atlas (Free)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account or login
3. Create a new cluster (M0 - Free forever)
4. Create a database user with username/password
5. Whitelist IP: Click "Allow Access from Anywhere" (0.0.0.0/0) for development
6. Get connection string:
   - Click "Connect" → "Drivers" → Copy connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/vnit_sports?retryWrites=true&w=majority`
   - Replace `username` and `password` with your credentials

## Step 2: Setup Railway Project

### 2.1 Create Railway Account
1. Go to https://railway.app
2. Click "Start New Project"
3. Sign in with GitHub (use your Anshulkaocde123 account)
4. Authorize Railway to access your GitHub repositories

### 2.2 Deploy from GitHub
1. In Railway dashboard, click "Deploy from GitHub repo"
2. Select repository: `Anshulkaocde123/vnit-ig-app`
3. Railway will auto-detect this is a Node.js project
4. Click "Deploy"

### 2.3 Wait for Build
- Railway will clone your repo
- Install dependencies from server/package.json
- Build the backend
- This typically takes 2-5 minutes

## Step 3: Configure Environment Variables

Once deployment is triggered, go to your project in Railway:

1. Click on the "Variables" tab
2. Add these environment variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vnit_sports?retryWrites=true&w=majority
JWT_SECRET=generate_a_random_32_char_string_here_!@#$%^&*()
GOOGLE_CLIENT_ID=your_google_client_id (if you have it)
GOOGLE_CLIENT_SECRET=your_google_client_secret (if you have it)
GOOGLE_CALLBACK_URL=https://your-railway-app-name.railway.app/api/auth/register-oauth
CORS_ORIGIN=https://your-railway-app-name.railway.app
```

### How to generate JWT_SECRET:
```bash
# On your local machine, run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Deploy Frontend (Optional - for production UI)

You have two options:

### Option A: Deploy Frontend on Vercel (FREE)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import your `vnit-ig-app` repository
5. In "Framework Preset", select "Vite"
6. In "Root Directory", set to `client`
7. Add environment variable:
   - `VITE_APP_API_URL=https://your-railway-backend-url.railway.app/api`
   - `VITE_APP_SOCKET_URL=https://your-railway-backend-url.railway.app`
8. Click Deploy

### Option B: Serve Frontend from Backend (Simpler)
The backend already serves static files. Just build the frontend and commit:

```bash
cd client
npm run build
# This creates client/dist folder
# Backend will serve it from /
```

## Step 5: Get Your Railway URL

1. In Railway dashboard, go to your project
2. Click on the service card
3. Look for the "Public URL" - something like:
   - `https://vnit-ig-app-production.railway.app`

## Step 6: Test Your Deployment

1. Open your Railway URL in browser
2. Test the login page
3. Try connecting with username: `admin`, password: `admin123`
4. Check if leaderboard loads
5. Verify Socket.io connection (should see real-time updates)

## Troubleshooting

### "Build failed" error
- Check that Procfile exists in root directory
- Verify server/package.json has `"start": "node server.js"`
- Check Railway build logs for specific errors

### "Cannot connect to MongoDB"
- Verify MONGODB_URI is correct
- Check MongoDB Atlas whitelist includes your Railway IP
- Test connection string locally first

### Frontend not loading
- Make sure CORS_ORIGIN matches your Railway URL
- Check client .env has correct API URL
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### Socket.io not connecting
- Verify VITE_APP_SOCKET_URL points to Railway backend
- Check browser console for connection errors
- Ensure firewall allows WebSocket connections

## Free Tier Limits

- **$5/month free credit** (enough for small apps)
- Shared resources (CPU, RAM)
- One free database (Railway PostgreSQL, but we use MongoDB)
- Can add paid services as needed

## Monitoring & Logs

1. In Railway dashboard, click your service
2. Go to "Logs" tab to see real-time logs
3. Go to "Metrics" tab to monitor CPU/memory usage
4. Restart service if needed via "Deploy" button

## Next Steps (Optional Paid)

- Add custom domain: `sports.vnit.ac.in` (requires domain purchase)
- Upgrade to paid Railway tier for more resources ($5+/month)
- Add Sentry for error tracking (free tier available)
- Setup automated backups for MongoDB

## Getting Help

- Railway Docs: https://docs.railway.app
- Community: https://discord.gg/railway
- GitHub Issues: https://github.com/Anshulkaocde123/vnit-ig-app/issues

---

**Status**: Ready for deployment
**Estimated Time**: 10 minutes
**Cost**: FREE (with $5 monthly credit)

Good luck! 🚀
