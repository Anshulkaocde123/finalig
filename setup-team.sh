#!/bin/bash

# ============================================================
#  VNIT IG Sports App — Team Setup Script
#  Run this ONCE after cloning the repo:
#    chmod +x setup-team.sh && ./setup-team.sh
# ============================================================

set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏏 VNIT IG Sports App — Team Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ─── 1. Create server/.env ───────────────────────────────────
echo "📁 Creating server/.env ..."

cat > server/.env << 'ENV_SERVER'
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection String (Shared Team Database)
MONGODB_URI=mongodb+srv://anshuljain532006_db_user:RruAcmA5Q8HcyVqp@vnit-ig-app.iymg4sc.mongodb.net/vnit_sports?retryWrites=true&w=majority

# JWT Secret for token generation
JWT_SECRET=cBGBXGY1GgYfe6xvVXJMeoLmJNEPkHLBLPtwLtFj9ineVe2BaQgS31VPIdLUZ8Wfp8cerl/IqIa7Wpz0G3hVIg==

# Google OAuth 2.0
GOOGLE_CLIENT_ID=311672185118-fnu83et05guc71ffdf39r4meknj3lolj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/register-oauth

# CORS - Allowed frontend origins
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Base URL
BASE_URL=http://localhost:5000
ENV_SERVER

echo "  ✅ server/.env created"

# ─── 2. Create client/.env.local ─────────────────────────────
echo "📁 Creating client/.env.local ..."

cat > client/.env.local << 'ENV_CLIENT'
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=311672185118-fnu83et05guc71ffdf39r4meknj3lolj.apps.googleusercontent.com
VITE_ENABLE_GOOGLE_LOGIN=true
ENV_CLIENT

echo "  ✅ client/.env.local created"

# ─── 3. Install dependencies ─────────────────────────────────
echo ""
echo "📦 Installing root dependencies..."
npm install

echo ""
echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

echo ""
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

# ─── 4. Done! ────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 To start the app, run:"
echo "   npm start"
echo ""
echo "🌐 Then open:"
echo "   Frontend → http://localhost:5173"
echo "   Backend  → http://localhost:5000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
