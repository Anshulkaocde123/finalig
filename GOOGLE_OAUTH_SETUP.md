# Google OAuth 2.0 Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Name: `VNIT Inter-Department Games`
4. Click "Create"

## Step 2: Enable OAuth 2.0 APIs

1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for and enable:
   - Google+ API
   - Google Identity Service

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
3. If prompted, configure OAuth consent screen first:
   - **User Type:** Internal (or External if needed)
   - **App name:** VNIT Inter-Department Games
   - **User support email:** your-email@vnit.ac.in
   - **App logo:** (Optional) VNIT logo
   - **Scopes:** Add `userinfo.email` and `userinfo.profile`
   - Save and continue

4. Back to Credentials, click **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
5. **Application Type:** Web application
6. **Name:** VNIT Admin Portal
7. **Authorized JavaScript origins:**
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `http://localhost:3000` (for any other local dev ports)
   - `https://yourdomain.com` (production domain)

8. **Authorized redirect URIs:**
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:5000/api/auth/google-web/callback` (web-based redirect)
   - `https://yourdomain.com/api/auth/google/callback` (production)

9. Click "Create"
10. Copy your **Client ID** and **Client Secret** (save these securely!)

## Step 4: Environment Variables

Add to your `.env` file:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
GOOGLE_WEB_CALLBACK_URL=http://localhost:5000/api/auth/google-web/callback
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## Step 5: Update Admin Model

The Admin model needs a `googleId` and `email` field to support OAuth:

```javascript
const adminSchema = new mongoose.Schema({
    username: { type: String, unique: true, sparse: true }, // sparse allows null for OAuth users
    password: { type: String }, // optional for OAuth users
    email: { type: String, unique: true, sparse: true },
    googleId: { type: String, unique: true, sparse: true },
    name: String,
    profilePicture: String,
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    verified: { type: Boolean, default: false }
});
```

## Implementation Complete! 🎉

Follow the remaining guide files for:
- Backend implementation
- Frontend integration
- Deployment strategies
