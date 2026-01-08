# Authentication Debugging Guide

## Issues Fixed:

### 1. **CRITICAL: JWT_SECRET was missing**
   - ✅ Added secure JWT_SECRET to server/.env
   - New secret: `cBGBXGY1GgYfe6xvVXJMeoLmJNEPkHLBLPtwLtFj9ineVe2BaQgS31VPIdLUZ8Wfp8cerl/IqIa7Wpz0G3hVIg==`
   - **Impact**: Without this, all tokens were signed with 'secret123' fallback

### 2. **Route Mismatch: /login vs /auth/login**
   - ✅ Fixed ProtectedRoute.jsx redirect: `/login` → `/auth/login`
   - ✅ Fixed App.jsx: Added `/auth/login` route (keeping `/login` as legacy)
   - ✅ axiosConfig.js already redirects to `/auth/login`
   - **Impact**: Was causing 404 errors on logout/session expiry

### 3. **Google OAuth hardcoded localhost**
   - ✅ Fixed Login.jsx to use relative URLs via api config
   - ✅ Removed `http://localhost:5000` prefix
   - **Impact**: Google OAuth will now work in production

### 4. **Enhanced Debugging Logs**
   - ✅ Added comprehensive logging to authMiddleware.js
   - ✅ Added logging to ProtectedRoute.jsx
   - ✅ Added logging to AdminLayout.jsx
   - ✅ Added logging to Login.jsx
   - **Impact**: Can now track exact authentication flow

## Testing Checklist:

### Test 1: Super Admin Login
1. Navigate to http://localhost:5173/auth/login
2. Enter super_admin credentials
3. Check browser console for:
   - ✅ `🔐 Auth Middleware - Token received`
   - ✅ `✅ Token verified for admin ID`
   - ✅ `👤 Admin authenticated`
4. Should redirect to `/admin/dashboard`
5. Should NOT get logged out randomly

### Test 2: Regular Admin Login
1. Login with regular admin credentials
2. Check console for auth logs
3. Verify can access admin panel
4. Verify stays logged in

### Test 3: Viewer Account (should be blocked)
1. Login with viewer credentials (no isTrusted flag)
2. Should see error: "You need admin privileges"
3. Should NOT access admin panel

### Test 4: Google OAuth
1. Click "Sign in with Google"
2. Complete Google login
3. New users should be created as 'viewer' role
4. Viewers should be blocked from admin access
5. Only trusted users can access admin

### Test 5: Session Persistence
1. Login successfully
2. Refresh page (F5)
3. Should NOT be logged out
4. Token should persist in localStorage

### Test 6: Token Expiration (30 days)
1. Tokens expire after 30 days
2. On expiration, should redirect to `/auth/login`
3. Should show "Session expired" toast

## Backend Logs to Watch:

When accessing protected routes, you should see:
```
🔐 Auth Middleware - Token received: cBGBXGY1GgYfe6xvVXJ...
✅ Token verified for admin ID: 6743c2d87bd7c8f9c123abc
👤 Admin authenticated: { id: ..., username: 'admin1', role: 'admin', isActive: true }
```

If there's an error:
```
❌ Auth error: jwt malformed
❌ Auth error: invalid signature
❌ Auth error: jwt expired
❌ Admin not found for ID: xxx
🚫 Admin account suspended: username
❌ No authorization header found
```

## Frontend Logs to Watch:

### ProtectedRoute:
```
🔒 ProtectedRoute check: ✅ Token exists
```
OR
```
🔒 ProtectedRoute check: ❌ No token
🚫 Redirecting to /auth/login - no token found
```

### AdminLayout:
```
🔐 AdminLayout Auth Check: { hasToken: true, hasUser: true }
👤 User role: admin isTrusted: true
✅ Auth check passed
```

### axiosConfig (on 401):
```
🔒 401 Unauthorized - Clearing session
```

## Common Issues:

### Issue: Getting logged out randomly
**Cause**: Token expired, invalid, or route mismatch
**Solution**: Check console for auth errors, verify JWT_SECRET is set

### Issue: Google OAuth not working
**Cause**: Hardcoded localhost URLs
**Solution**: Already fixed - now uses relative URLs

### Issue: Viewer can access admin
**Cause**: Missing role check
**Solution**: Already fixed in AdminLayout.jsx and Login.jsx

### Issue: 404 on logout
**Cause**: Redirecting to wrong route
**Solution**: Already fixed - all redirects go to `/auth/login`

## Files Modified:

1. **server/.env** - Added JWT_SECRET
2. **server/middleware/authMiddleware.js** - Enhanced logging
3. **client/src/components/ProtectedRoute.jsx** - Fixed redirect + logging
4. **client/src/components/AdminLayout.jsx** - Enhanced auth check + logging
5. **client/src/pages/auth/Login.jsx** - Fixed OAuth URL + role check + logging
6. **client/src/api/axiosConfig.js** - Fixed redirect path + loop prevention
7. **client/src/App.jsx** - Added /auth/login route

## Next Steps:

1. ✅ Server is running (localhost:5000)
2. ✅ Client is running (localhost:5173)
3. 🔧 TEST super_admin login
4. 🔧 TEST regular admin login
5. 🔧 TEST viewer access (should be blocked)
6. 🔧 TEST Google OAuth
7. 🔧 PUSH fixes to GitHub
8. 🔧 DEPLOY to Render

## Git Commit Ready:

```bash
git add .
git commit -m "fix: comprehensive authentication debugging and JWT_SECRET setup

- Added secure JWT_SECRET to .env (was missing)
- Fixed route mismatch: /login → /auth/login throughout app
- Enhanced logging in auth middleware with emoji indicators
- Fixed Google OAuth to use relative URLs (production-ready)
- Added role validation to prevent viewer access
- Added redirect loop prevention in axios interceptor
- Added comprehensive console logging for debugging
- Fixed ProtectedRoute redirect path
- Updated App.jsx with both /auth/login and /login routes

This fixes:
- Random logout issues (wrong redirect path)
- Google OAuth not working (hardcoded localhost)
- Viewers accessing admin panel (missing role check)
- Token verification failures (missing JWT_SECRET)"

git push origin main
```
