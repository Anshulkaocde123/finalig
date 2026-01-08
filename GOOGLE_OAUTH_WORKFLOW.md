# Google OAuth Admin Verification Workflow

## Complete Professional Workflow

### 🔹 Step 1: User Signs in with Google

**What happens:**
1. User clicks "Sign in with Google" on `/auth/login`
2. Google OAuth popup appears
3. User selects their Google account
4. Backend receives: `{ googleId, email, name, picture }`

**Backend creates new user:**
```javascript
{
  googleId: "123456789",
  email: "user@gmail.com",
  name: "John Doe",
  profilePicture: "https://lh3.googleusercontent.com/...",
  provider: "google",
  role: "viewer",          // Default role for new users
  isTrusted: false,        // Needs super_admin verification
  verified: true           // Email verified by Google
}
```

**User Experience:**
- ❌ **BLOCKED from Admin Panel** - "Access denied. Only admins can access this area."
- ✅ Can view public pages (leaderboard, matches, etc.)

---

### 🔹 Step 2: Super Admin Reviews New User

**Super Admin navigates to:**
- `/admin/users` (Admin Management page)

**What Super Admin sees:**
```
┌──────────────────────────────────────────────────────────┐
│ Admin Management                                          │
├──────────────────────────────────────────────────────────┤
│ [Google Icon] John Doe                    [Google Badge] │
│ user@gmail.com                                            │
│ Role: Viewer ▼                                           │
│ Status: [⚠️ Pending]                                      │
│ Actions: [✓ Verify] [❌ Suspend]                          │
└──────────────────────────────────────────────────────────┘
```

**UI Features:**
- ✅ **Google Profile Picture** displayed
- ✅ **Blue "Google" badge** shows OAuth provider
- ✅ **Yellow "Pending" status** indicates needs verification
- ✅ **Verify button** (green checkmark) to approve user

---

### 🔹 Step 3: Super Admin Verifies User

**Super Admin clicks "Verify" button:**

**Confirmation Dialog:**
```
Verify and trust John Doe?

This will grant them viewer access to the system.

[Cancel] [OK]
```

**Backend logs:**
```
✅ Super Admin admin1 verifying John Doe: { 
  provider: 'google',
  currentRole: 'viewer', 
  wasTrusted: false,
  nowTrusted: true 
}

👤 Admin John Doe is now: {
  verified: true,
  isTrusted: true,
  role: 'viewer',
  canAccessAdmin: true
}
```

**Database update:**
```javascript
{
  isTrusted: true,
  trustedSince: "2026-01-08T12:00:00Z",
  trustedBy: "super_admin_id",
  verified: true,
  verifiedAt: "2026-01-08T12:00:00Z",
  verifiedBy: "super_admin_id"
}
```

**Success Toast:**
```
✅ John Doe verified and trusted successfully!
```

---

### 🔹 Step 4: Super Admin Assigns Role

**Super Admin changes role dropdown:**
- Viewer → **Admin** (or any other role)

**Backend logs:**
```
🔄 Super Admin admin1 changing role: {
  admin: 'John Doe',
  from: 'viewer',
  to: 'admin',
  provider: 'google'
}

✅ Admin John Doe granted trust by admin1

👤 Admin updated: {
  name: 'John Doe',
  role: 'admin',
  isTrusted: true,
  provider: 'google'
}
```

**Success Toast:**
```
✅ Role updated
```

---

### 🔹 Step 5: User Can Now Access Admin Panel

**User refreshes page or logs out/in:**

**Frontend checks:**
```javascript
console.log('🔐 AdminLayout Auth Check:', { hasToken: true, hasUser: true })
console.log('👤 User role:', 'admin', 'isTrusted:', true)
console.log('✅ Auth check passed')
```

**User Experience:**
- ✅ **GRANTED access** to Admin Panel
- ✅ Can access all routes permitted for their role
- ✅ Session persists across page refreshes

---

## Role Permissions Matrix

| Role          | isTrusted | Can Access Admin? | Can Manage Matches? | Can Manage Users? |
|---------------|-----------|-------------------|---------------------|-------------------|
| Viewer        | ❌ false  | ❌ NO             | ❌ NO               | ❌ NO             |
| Viewer        | ✅ true   | ✅ YES            | ❌ NO               | ❌ NO             |
| Moderator     | ✅ true   | ✅ YES            | ⚠️ Limited          | ❌ NO             |
| Score Manager | ✅ true   | ✅ YES            | ✅ YES              | ❌ NO             |
| Admin         | ✅ true   | ✅ YES            | ✅ YES              | ⚠️ Limited        |
| Super Admin   | ✅ true   | ✅ YES            | ✅ YES              | ✅ YES            |

---

## Admin Management UI Features

### 1. **User Card Display**
```jsx
┌─────────────────────────────────────────┐
│ [Profile Pic] John Doe      [Google]   │
│               user@gmail.com            │
│               @johndoe (if different)   │
└─────────────────────────────────────────┘
```

### 2. **Role Dropdown** (Super Admin Only)
```
[Viewer ▼]
  ├─ Viewer (Can only view)
  ├─ Moderator (Basic moderation)
  ├─ Score Manager (Can update scores)
  ├─ Admin (Full admin access)
  └─ Super Admin (Complete control)
```

### 3. **Status Badges**
- 🟢 **Verified** - Green badge (isTrusted: true)
- 🟡 **Pending** - Yellow badge (isTrusted: false)
- 🔴 **Suspended** - Red badge (isSuspended: true)

### 4. **Action Buttons**
- ✅ **Verify** - Green button (only for pending users)
- ❌ **Suspend** - Red button (for active users)

---

## Testing Checklist

### ✅ Test 1: Google Login Creates Viewer
1. Login with Google OAuth
2. New user created with role='viewer', isTrusted=false
3. Blocked from accessing `/admin/*` routes
4. See error: "Access denied. Only admins can access this area."

### ✅ Test 2: Super Admin Sees Pending User
1. Login as super_admin
2. Navigate to `/admin/users`
3. See new Google user with:
   - Google profile picture
   - Blue "Google" badge
   - Yellow "Pending" status
   - Green "Verify" button

### ✅ Test 3: Super Admin Verifies User
1. Click "Verify" button
2. Confirm dialog appears
3. After confirming:
   - Status changes to green "Verified"
   - Verify button disappears
   - Backend logs show verification
   - Toast: "John Doe verified and trusted successfully!"

### ✅ Test 4: Super Admin Changes Role
1. Change role dropdown from "Viewer" to "Admin"
2. Toast: "Role updated"
3. Backend logs show role change
4. User now has admin permissions

### ✅ Test 5: User Can Access Admin
1. Google user refreshes page
2. Check console logs:
   - ✅ Token exists
   - ✅ User role: admin, isTrusted: true
   - ✅ Auth check passed
3. User can access admin panel
4. No random logouts

### ✅ Test 6: Provider Badge Shows
1. In Admin Management, Google users have blue "Google" badge
2. Local users have no badge
3. Profile pictures show for Google users

---

## Backend API Endpoints

### 1. **GET /api/admins** (Super Admin)
Returns all admins with provider info:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "user@gmail.com",
      "role": "viewer",
      "isTrusted": false,
      "provider": "google",
      "profilePicture": "https://...",
      "verified": true
    }
  ]
}
```

### 2. **PUT /api/admins/:id/verify** (Super Admin)
Verifies and trusts user:
```json
{
  "isTrusted": true,
  "verified": true
}
```

Response:
```json
{
  "success": true,
  "message": "Admin verified and trusted",
  "data": { ... }
}
```

### 3. **PUT /api/admins/:id** (Super Admin)
Updates role:
```json
{
  "role": "admin"
}
```

---

## Console Logs to Monitor

### Frontend (Browser Console):

**On Login:**
```
🔐 AdminLayout Auth Check: { hasToken: true, hasUser: true }
👤 User role: viewer isTrusted: false
🚫 Access denied for untrusted viewer
```

**After Verification:**
```
🔐 AdminLayout Auth Check: { hasToken: true, hasUser: true }
👤 User role: admin isTrusted: true
✅ Auth check passed
```

### Backend (Terminal):

**On Verification:**
```
✅ Super Admin admin1 verifying John Doe: { 
  provider: 'google',
  currentRole: 'viewer', 
  wasTrusted: false,
  nowTrusted: true 
}

👤 Admin John Doe is now: {
  verified: true,
  isTrusted: true,
  role: 'viewer',
  canAccessAdmin: true
}
```

**On Role Change:**
```
🔄 Super Admin admin1 changing role: {
  admin: 'John Doe',
  from: 'viewer',
  to: 'admin',
  provider: 'google'
}

👤 Admin updated: {
  name: 'John Doe',
  role: 'admin',
  isTrusted: true,
  provider: 'google'
}
```

---

## Deployment Considerations

### Google OAuth Settings (Production):
```
Authorized JavaScript origins:
  - https://your-render-app.onrender.com
  
Authorized redirect URIs:
  - https://your-render-app.onrender.com/auth/login
  - https://your-render-app.onrender.com
```

### Environment Variables (Render):
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<secure-random-string>
GOOGLE_CLIENT_ID=<your-client-id>
CORS_ORIGIN=https://your-render-app.onrender.com
PORT=5000
```

---

## Summary

✅ **Google OAuth users** are created as untrusted viewers
✅ **Super Admin** can see all pending users with Google badges
✅ **Verification workflow** is clear with visual status indicators
✅ **Role assignment** works with proper logging
✅ **Access control** prevents untrusted viewers from accessing admin
✅ **Professional UI** shows provider, profile pictures, and status
✅ **Comprehensive logging** for debugging and auditing

**Everything works professionally! 🎉**
