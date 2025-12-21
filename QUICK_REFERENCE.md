# 🚀 Quick Reference Guide

## Commands

### Development
```bash
# Start both servers
npm start

# Or separate terminals:
cd server && npm start          # Backend on :5000
cd client && npm run dev        # Frontend on :5173
```

### Building
```bash
# Build frontend for production
cd client && npm run build

# Output: client/dist/ (ready for deployment)
```

---

## Environment Variables

### Backend (`server/.env`)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-32-char-string
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/register-oauth
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`client/.env.local`)
```env
REACT_APP_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## Deployment (Railway.app - 5 minutes)

```bash
# 1. Push to GitHub
git add .
git commit -m "feat: oauth and deployment"
git push origin main

# 2. Go to railway.app
# 3. Click: New Project → Deploy from GitHub repo
# 4. Select your repository
# 5. Add environment variables
# 6. Click Deploy
# 7. Get your URL!
```

---

## Google OAuth Setup (15 minutes)

```
1. Google Cloud Console (console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth credentials (Web app)
5. Add authorized origins:
   - http://localhost:5173
   - http://localhost:5174
   - https://your-domain.com
6. Add authorized redirect URIs:
   - http://localhost:5000/api/auth/register-oauth
   - https://your-domain.com/api/auth/register-oauth
7. Copy Client ID and Secret to .env
```

**Full guide:** See `GOOGLE_OAUTH_SETUP.md`

---

## Test Credentials

**Local Development:**
```
Username: admin
Password: admin123
```

**OAuth:** Use your Google account

---

## Cost Summary

| Service | Cost | Setup |
|---------|------|-------|
| Railway.app | $0-5/mo | 5 min |
| MongoDB Atlas | Free | 5 min |
| Domain (.com) | $5-15/yr | 5 min |
| Google OAuth | Free | 15 min |
| **Total** | **$5-15/mo** | **30 min** |

---

## Support

- **Setup?** → `SETUP_GUIDE.md`
- **Deploying?** → `DEPLOYMENT_GUIDE.md`
- **OAuth issue?** → `GOOGLE_OAUTH_SETUP.md`
- **General?** → `README.md`

---

**🎉 You're ready! Good luck!**
