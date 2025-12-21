# 🚀 VNIT Inter-Department Games - Complete Setup & Deployment Guide

## Quick Start (Development)

```bash
# Clone and install
git clone <repo-url> && cd vnit-ig-app
npm install
cd server && npm install
cd ../client && npm install
cd ..

# Setup environment
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# Start development servers
npm start
# Frontend: http://localhost:5173 (or 5174)
# Backend: http://localhost:5000
```

---

## 🔐 Google OAuth Setup (Complete)

### Part 1: Google Cloud Console

1. **Create Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click **Select a Project** → **New Project**
   - Name: `VNIT Inter-Department Games`
   - Click **Create**

2. **Enable APIs**
   - Left sidebar: **APIs & Services** → **Library**
   - Search: `Google+ API` → Click → **Enable**
   - Search: `Google Identity Services API` → Click → **Enable**

3. **Create OAuth Credentials**
   - Left sidebar: **APIs & Services** → **Credentials**
   - Click **+ Create Credentials** → **OAuth 2.0 Client ID**
   - Choose: **Web application**
   - Name: `VNIT Admin Portal`
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:5174
   https://sports.vnit.ac.in
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:5000/api/auth/register-oauth
   https://sports.vnit.ac.in/api/auth/register-oauth
   ```

4. **Copy Credentials**
   - You'll get a modal with Client ID and Client Secret
   - Save these safely! Example format:
   ```
   Client ID: 123456789-xxx.apps.googleusercontent.com
   Client Secret: GOCSP-xxx-yyy
   ```

### Part 2: Application Configuration

**Backend Setup** (`server/.env`):
```env
GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSP-xxx-yyy
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/register-oauth
JWT_SECRET=your-super-secret-jwt-key-with-32-characters-minimum
```

**Frontend Setup** (`client/.env.local`):
```env
REACT_APP_GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Part 3: Test Google Login

1. Start the app: `npm start`
2. Go to http://localhost:5173/login
3. Click **Google Sign-In** button
4. Sign in with your Google account
5. Should redirect to admin dashboard

---

## 🌐 Deployment Strategies

### ⭐ RECOMMENDED: Railway.app (Free Tier)

**Why Railway?**
- Free tier with $5 monthly credit
- One-click GitHub deployment
- Automatic SSL certificates
- Built-in MongoDB support
- Perfect for student projects

**Deployment Steps:**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: add google oauth and professional features"
   git push origin main
   ```

2. **Create Railway Account**
   - Go to [Railway.app](https://railway.app)
   - Sign up with GitHub
   - Click **New Project** → **Deploy from GitHub repo**
   - Select your repository
   - Click **Deploy**

3. **Configure Environment Variables**
   - In Railway Dashboard → Project Settings → Variables
   - Add all variables from your `.env` file:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_CALLBACK_URL=https://your-railway-url/api/auth/register-oauth
   ```

4. **Custom Domain** (Optional)
   - Railway Dashboard → Deployments → Your service → Settings
   - Add custom domain: `sports.vnit.ac.in`
   - Update DNS CNAME record

5. **Your URLs**
   - Frontend: `https://your-app.railway.app`
   - Backend: `https://your-app.railway.app/api`
   - Admin: `https://your-app.railway.app/admin/dashboard`

**Cost:** Free ($0/month within credits)

---

### 🔧 PROFESSIONAL: AWS + DigitalOcean

See `DEPLOYMENT_GUIDE.md` for detailed AWS and DigitalOcean setup.

**Cost Estimate:**
- AWS: $45-50/month
- DigitalOcean: $12-70/month
- Railway.app: $0-5/month ⭐ (Recommended)

---

## 📚 Professional Features Added

### 1. Google OAuth Integration ✅
- Sign in with Google account
- Automatic user creation from Google profile
- Secure token handling
- Multiple authentication methods

### 2. Enhanced Security
- JWT token-based authentication
- HTTP-only secure cookies (if needed)
- CORS protection
- Rate limiting ready
- Environment variable management

### 3. Better Error Handling
- Request/response interceptors
- Automatic token refresh
- User-friendly error messages
- Automatic logout on 401 errors

### 4. Session Management
- Remember login state
- Auto-logout on token expiration
- Secure session storage
- Token expiration handling

### 5. Production Ready
- Environment-based configuration
- Proper logging setup
- Health check endpoint
- Database connection pooling

---

## 🧪 Testing the Features

### Test Google OAuth
```bash
# Terminal 1: Start backend
cd server && npm start

# Terminal 2: Start frontend
cd client && npm run dev

# Browser: http://localhost:5173/login
# Click Google button and sign in
```

### Test API Endpoints
```bash
# Get Google user info (after login)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create season (authenticated)
curl -X POST http://localhost:5000/api/seasons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name":"Spring 2025",
    "year":2025,
    "startDate":"2025-03-01",
    "endDate":"2025-05-31",
    "description":"Spring semester matches"
  }'
```

---

## 📋 Pre-Deployment Checklist

### Code
- [ ] All Google OAuth environment variables set
- [ ] Frontend builds successfully: `npm run build`
- [ ] Backend tests pass: `npm test` (if available)
- [ ] No console errors in development
- [ ] No hardcoded API URLs (use env variables)

### Security
- [ ] JWT_SECRET is strong and unique (32+ chars)
- [ ] Google credentials stored in environment variables
- [ ] Database credentials not in version control
- [ ] CORS properly configured for your domain
- [ ] No sensitive data in commits

### Documentation
- [ ] Updated .env.example files
- [ ] README contains setup instructions
- [ ] DEPLOYMENT_GUIDE.md completed
- [ ] Team knows how to deploy

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user with proper permissions
- [ ] IP whitelist configured (0.0.0.0/0 for cloud)
- [ ] Backup enabled (if using paid tier)

### Testing
- [ ] Can login with username/password
- [ ] Can login with Google
- [ ] Token persists across page refreshes
- [ ] Token expires properly (30 days)
- [ ] Logout works correctly
- [ ] Protected routes require auth

---

## 🚀 Deployment Commands

### Deploy to Railway
```bash
# Simply push to GitHub - Railway auto-deploys!
git push origin main
# Check status at: https://railway.app
```

### Deploy to AWS EC2
```bash
# SSH into server
ssh -i key.pem ubuntu@server-ip

# Pull latest code
cd vnit-ig-app
git pull origin main

# Rebuild frontend
npm run build

# Restart services
pm2 restart all
```

### Deploy with Docker
```bash
docker-compose down
docker-compose build
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────┐
│  Browser (React SPA)                               │
│  • Login page with Google OAuth button              │
│  • Admin dashboard                                  │
│  • Real-time updates via Socket.io                  │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │ HTTPS (TLS 1.3)     │
        │ JWT Tokens          │
        │ WebSocket for RT     │
        └──────────┬──────────┘
                   │
┌──────────────────v──────────────────────────────────┐
│  Express.js Backend (Node.js)                      │
│  • Local + Google OAuth authentication              │
│  • RESTful API endpoints                            │
│  • Socket.io for real-time features                 │
│  • JWT token validation middleware                  │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │ MongoDB Connection   │
        │ Encrypted at Rest    │
        └──────────┬──────────┘
                   │
┌──────────────────v──────────────────────────────────┐
│  MongoDB Atlas (Cloud Database)                    │
│  • Secure connection strings                        │
│  • Backup & recovery                                │
│  • Performance monitoring                           │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 Next Steps After Deployment

1. **Monitor Performance**
   - Setup uptime monitoring (UptimeRobot)
   - Monitor error rates (Sentry)
   - Track API response times

2. **Optimize**
   - Add CDN for static assets (Cloudflare)
   - Implement caching strategies
   - Optimize database queries

3. **Enhance Security**
   - Enable 2FA for admin accounts
   - Setup IP whitelisting
   - Implement audit logging
   - Regular security audits

4. **Scale**
   - Add more admin users
   - Setup role-based access control
   - Implement API rate limiting
   - Add advanced filtering/search

---

## 🆘 Common Issues & Solutions

### Google OAuth Button Not Showing
```javascript
// Make sure this script is in your HTML head:
<script src="https://accounts.google.com/gsi/client" async defer></script>

// And REACT_APP_GOOGLE_CLIENT_ID is set in .env
```

### "Unauthorized" errors after login
- Clear browser localStorage: `localStorage.clear()`
- Regenerate Google OAuth credentials
- Check JWT_SECRET matches on frontend/backend

### MongoDB connection errors
- Verify connection string format
- Add your IP to MongoDB Atlas whitelist
- Check database user permissions
- Ensure database name in URL matches

### CORS errors
- Update `CORS_ORIGIN` in backend `.env`
- Ensure frontend URL matches exactly
- Check that cookies are allowed cross-origin

### Socket.io not connecting
- Verify `REACT_APP_SOCKET_URL` in frontend `.env`
- Check that backend is running on port 5000
- Look for CORS errors in browser console

---

## 📞 Support & Resources

- **GitHub Issues:** Report bugs in your repository
- **Stack Overflow:** Tag questions with `google-oauth`, `express`, `mongodb`
- **MongoDB Docs:** https://docs.mongodb.com
- **Express.js:** https://expressjs.com
- **React:** https://react.dev
- **Railway Docs:** https://docs.railway.app

---

**Your app is ready for production! 🎉**

**Total Setup Time:**
- Development: 15 minutes
- Deployment: 5 minutes (Railway)
- Testing: 10 minutes

**Questions? Check the documentation files in your project root.**
