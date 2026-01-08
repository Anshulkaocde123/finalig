# Chapter 6: Google OAuth Explained 🔐

## What You'll Learn

By the end of this chapter, you'll understand:
- What OAuth is and why it exists
- How "Sign in with Google" works
- The complete OAuth flow step-by-step
- How to implement OAuth in your app
- Security benefits of OAuth
- User verification workflow

---

## What is OAuth?

**OAuth** = Open Authorization

**Simple Explanation:**  
OAuth lets users sign in to your app using their Google/Facebook/GitHub account instead of creating a new password.

**Real-World Analogy:**

```
Regular Login:
You need a key for EVERY building
- Office key
- Gym key  
- Library key
- Home key
(Lots of keys to manage!)

OAuth:
You have ONE master key (Google account)
That works at multiple buildings
(Only manage one key!)
```

### **Why Use OAuth?**

**For Users:**
- ✅ No need to create another password
- ✅ No need to remember another password
- ✅ Faster signup (one click!)
- ✅ More secure (Google handles security)

**For Developers:**
- ✅ Don't store user passwords
- ✅ Don't worry about password security
- ✅ Get verified email automatically
- ✅ Users trust Google more than small apps

---

## How "Sign in with Google" Works

### **The Complete Flow (High Level)**

```
Step 1: User clicks "Sign in with Google"
        ↓
Step 2: Redirect to Google login page
        ↓
Step 3: User logs into Google
        ↓
Step 4: Google asks: "Allow this app access?"
        ↓
Step 5: User clicks "Allow"
        ↓
Step 6: Google sends user data to your app
        ↓
Step 7: Your app creates/updates user account
        ↓
Step 8: Your app generates JWT token
        ↓
Step 9: User is logged in!
```

### **The Complete Flow (Technical Details)**

```
┌─────────────────────────────────────────────────┐
│         USER'S BROWSER                          │
│   (Your App - http://localhost:5173)           │
└────────────┬────────────────────────────────────┘
             │
             │ 1. User clicks "Sign in with Google"
             ↓
┌─────────────────────────────────────────────────┐
│    GOOGLE OAUTH POPUP OPENS                     │
│  (https://accounts.google.com)                  │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  Sign in with Google                   │    │
│  │                                        │    │
│  │  Email: user@gmail.com                │    │
│  │  Password: ********                   │    │
│  │                                        │    │
│  │  [Continue]                           │    │
│  └───────────────────────────────────────┘    │
└────────────┬────────────────────────────────────┘
             │
             │ 2. User enters Google credentials
             ↓
┌─────────────────────────────────────────────────┐
│    GOOGLE PERMISSION SCREEN                     │
│                                                 │
│  "VNIT IG Sports App wants to:"                │
│  ✓ See your email address                     │
│  ✓ See your basic profile info                │
│                                                 │
│  [Cancel]  [Allow]                             │
└────────────┬────────────────────────────────────┘
             │
             │ 3. User clicks "Allow"
             ↓
┌─────────────────────────────────────────────────┐
│         GOOGLE SERVERS                          │
│                                                 │
│  Generates user data:                          │
│  {                                             │
│    googleId: "12345678",                      │
│    email: "user@gmail.com",                   │
│    name: "John Doe",                          │
│    picture: "https://photo.jpg"               │
│  }                                             │
└────────────┬────────────────────────────────────┘
             │
             │ 4. Google sends data to your frontend
             ↓
┌─────────────────────────────────────────────────┐
│      YOUR FRONTEND (React)                      │
│                                                 │
│  Receives Google data in callback              │
│  Sends to your backend:                        │
│                                                 │
│  POST /api/auth/register-oauth                 │
│  {                                             │
│    googleId: "12345678",                      │
│    email: "user@gmail.com",                   │
│    name: "John Doe",                          │
│    picture: "https://photo.jpg"               │
│  }                                             │
└────────────┬────────────────────────────────────┘
             │
             │ 5. Frontend sends to backend
             ↓
┌─────────────────────────────────────────────────┐
│      YOUR BACKEND (Express)                     │
│                                                 │
│  Check if user exists:                         │
│  - Find by googleId                            │
│                                                 │
│  If exists:                                    │
│    → Update profile                            │
│    → Generate JWT token                        │
│                                                 │
│  If new user:                                  │
│    → Create account                            │
│    → Set role = 'viewer'                       │
│    → Set isTrusted = false                     │
│    → Generate JWT token                        │
│                                                 │
│  Return: {                                     │
│    token: "eyJhbGciOi...",                    │
│    role: "viewer",                            │
│    isTrusted: false,                          │
│    ...userData                                │
│  }                                             │
└────────────┬────────────────────────────────────┘
             │
             │ 6. Backend responds with token
             ↓
┌─────────────────────────────────────────────────┐
│      YOUR FRONTEND (React)                      │
│                                                 │
│  1. Save token to localStorage                 │
│  2. Save user data                             │
│  3. Check role and isTrusted                   │
│  4. Redirect appropriately                     │
│                                                 │
│  If viewer + not trusted:                      │
│    → Show "Pending approval" message           │
│  If admin or trusted:                          │
│    → Redirect to /admin/dashboard              │
└─────────────────────────────────────────────────┘
```

---

## Part 1: Setting Up Google OAuth

### **Step 1: Create Google Cloud Project**

1. Go to: https://console.cloud.google.com/
2. Create new project: "VNIT IG Sports App"
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials

### **Step 2: Configure OAuth Consent Screen**

```
Application name: VNIT IG Sports App
Support email: your@email.com
Authorized domains: localhost, yourapp.com
Scopes: email, profile
```

### **Step 3: Create OAuth Client ID**

```
Application type: Web application
Name: VNIT IG Sports Web Client

Authorized JavaScript origins:
- http://localhost:5173
- https://yourapp.onrender.com

Authorized redirect URIs:
- http://localhost:5173
- http://localhost:5173/auth/login
- https://yourapp.onrender.com
- https://yourapp.onrender.com/auth/login
```

**You'll get:**
- Client ID: `311672185118-fnu83et05guc71ffdf39r4meknj3lolj.apps.googleusercontent.com`
- Client Secret: (Keep this SECRET!)

---

## Part 2: Frontend Implementation

### **Installing Google OAuth Library**

**File:** `client/package.json`

```json
{
  "dependencies": {
    "@react-oauth/google": "^0.12.1"
  }
}
```

### **Wrapping App with GoogleOAuthProvider**

**File:** `client/src/main.jsx`

```javascript
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = '311672185118-fnu83et05guc71ffdf39r4meknj3lolj.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
    </GoogleOAuthProvider>
);
```

**What This Does:**
- Provides Google OAuth context to entire app
- Configures your app with Google Client ID
- Must wrap around your entire app

### **Login Page with Google Button**

**File:** `client/src/pages/auth/Login.jsx`

```javascript
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    // Handle Google login success
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            console.log('🎉 Google login successful');
            
            // 1. Decode JWT token from Google
            const decoded = jwtDecode(credentialResponse.credential);
            console.log('📋 Decoded Google data:', decoded);
            
            // 2. Extract user info
            const googleData = {
                googleId: decoded.sub,           // Google user ID
                email: decoded.email,            // Email address
                name: decoded.name,              // Full name
                picture: decoded.picture         // Profile picture URL
            };
            
            // 3. Send to backend
            const res = await api.post('/auth/register-oauth', googleData);
            console.log('✅ Backend response:', res.data);
            
            // 4. Check role and permissions
            if (res.data.role === 'viewer' && !res.data.isTrusted) {
                toast.error('Your account is pending approval. Contact an administrator.');
                return;
            }
            
            // 5. Save token and user data
            localStorage.setItem('adminToken', res.data.token);
            localStorage.setItem('adminUser', JSON.stringify(res.data));
            
            // 6. Redirect to admin
            toast.success(`Welcome ${res.data.name}!`);
            navigate('/admin/dashboard', { replace: true });
            
        } catch (err) {
            console.error('❌ Google login error:', err);
            toast.error(err.response?.data?.message || 'Google login failed');
        }
    };

    return (
        <div className="login-page">
            {/* Regular login form */}
            <form onSubmit={handleSubmit}>
                {/* ... username/password fields ... */}
            </form>
            
            {/* Divider */}
            <div className="divider">OR</div>
            
            {/* Google OAuth Button */}
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                    console.error('❌ Google Login Failed');
                    toast.error('Google login failed');
                }}
                useOneTap  // Enable One-Tap sign-in
            />
        </div>
    );
};
```

**Breaking Down the Code:**

1. **`jwtDecode(credentialResponse.credential)`**
   - Google sends a JWT token
   - We decode it to get user info
   - Contains: sub (ID), email, name, picture

2. **`api.post('/auth/register-oauth', googleData)`**
   - Send Google user info to our backend
   - Backend creates/updates user
   - Returns our app's JWT token

3. **Role checking**
   ```javascript
   if (res.data.role === 'viewer' && !res.data.isTrusted) {
       // Block untrusted viewers
       toast.error('Pending approval');
       return;
   }
   ```

4. **Token storage**
   ```javascript
   localStorage.setItem('adminToken', res.data.token);
   localStorage.setItem('adminUser', JSON.stringify(res.data));
   ```

---

## Part 3: Backend Implementation

### **OAuth Registration Route**

**File:** `server/routes/authRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { registerOAuth } = require('../controllers/authController');

// POST /api/auth/register-oauth
router.post('/register-oauth', registerOAuth);

module.exports = router;
```

### **OAuth Controller**

**File:** `server/controllers/authController.js`

```javascript
const registerOAuth = async (req, res) => {
    try {
        const { googleId, email, name, picture } = req.body;
        
        console.log('🔐 OAuth registration attempt:', { googleId, email, name });

        // 1. Check if user already exists
        let admin = await Admin.findOne({ googleId });

        if (!admin) {
            console.log('✨ Creating new OAuth user');
            
            // 2. Check if VNIT student email
            const isVNITEmail = email?.match(/^[a-z]{2}\d{2}[a-z]{3}\d{3}@students\.vnit\.ac\.in$/);
            
            // 3. Create new user
            admin = await Admin.create({
                googleId,          // Google's unique ID
                email,             // Email from Google
                name,              // Full name from Google
                profilePicture: picture,  // Profile photo URL
                provider: 'google',       // Mark as Google user
                verified: true,           // Email verified by Google
                role: 'viewer',           // Start as viewer
                isTrusted: false          // Needs super admin approval
            });
            
            // 4. Extract student ID from VNIT email
            if (isVNITEmail) {
                const match = email.match(/\d{2}[a-z]{3}(\d{3})/);
                if (match) {
                    admin.studentId = match[1].padStart(5, '0');
                    await admin.save();
                }
            }
            
            console.log('✅ New user created:', admin.email);
            
        } else {
            console.log('👤 Existing user found, updating info');
            
            // 5. Update existing user's info
            admin.name = name || admin.name;
            admin.profilePicture = picture || admin.profilePicture;
            admin.email = email || admin.email;
            admin.lastLogin = new Date();
            admin.loginCount = (admin.loginCount || 0) + 1;
            await admin.save();
            
            console.log('✅ User updated:', admin.email);
        }

        // 6. Check if account is active
        if (!admin.isActive) {
            console.log('🚫 Account suspended:', admin.email);
            return res.status(403).json({ 
                message: 'Account suspended',
                reason: admin.suspensionReason 
            });
        }

        // 7. Generate JWT token for our app
        const token = generateToken(admin._id);

        // 8. Return user data and token
        res.json({
            _id: admin._id,
            studentId: admin.studentId,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            isTrusted: admin.isTrusted,
            permissions: admin.permissions,
            profilePicture: admin.profilePicture,
            token: token,
            provider: 'google'
        });
        
        console.log('✅ OAuth login successful:', { 
            email: admin.email, 
            role: admin.role, 
            isTrusted: admin.isTrusted 
        });
        
    } catch (error) {
        console.error('❌ OAuth error:', error);
        res.status(500).json({ message: error.message });
    }
};
```

**Step-by-Step Breakdown:**

1. **Receive Google Data**
   ```javascript
   const { googleId, email, name, picture } = req.body;
   ```
   - googleId: Google's unique ID for this user
   - email: User's Gmail address
   - name: User's full name
   - picture: Profile photo URL

2. **Check if User Exists**
   ```javascript
   let admin = await Admin.findOne({ googleId });
   ```
   - Search database for this Google ID
   - If found → Existing user
   - If not found → New user

3. **Create New User**
   ```javascript
   admin = await Admin.create({
       googleId,
       email,
       name,
       profilePicture: picture,
       provider: 'google',
       verified: true,    // Google verified the email
       role: 'viewer',    // Default role
       isTrusted: false   // Needs approval
   });
   ```

4. **VNIT Email Detection**
   ```javascript
   const isVNITEmail = email?.match(/^[a-z]{2}\d{2}[a-z]{3}\d{3}@students\.vnit\.ac\.in$/);
   
   // Example: ec22btech003@students.vnit.ac.in
   // Pattern: ec (branch) + 22 (year) + btech (program) + 003 (roll number)
   ```

5. **Update Existing User**
   ```javascript
   admin.name = name || admin.name;
   admin.profilePicture = picture || admin.profilePicture;
   admin.lastLogin = new Date();
   ```
   - Updates profile info from Google
   - Tracks last login time
   - Increments login count

6. **Generate Our Token**
   ```javascript
   const token = generateToken(admin._id);
   ```
   - Creates JWT token for our app
   - Different from Google's token!
   - Used for subsequent requests

---

## Part 4: Admin Verification Workflow

### **Why Verification is Needed**

```
Problem: Anyone with a Google account can sign up
Solution: Super admin must verify and trust users

Workflow:
1. User signs in with Google → Created as "viewer" + untrusted
2. User blocked from admin access
3. Super admin reviews user in Admin Management
4. Super admin verifies user → Sets isTrusted = true
5. Super admin assigns appropriate role
6. User can now access admin features
```

### **Verification in Admin Management**

**File:** `client/src/pages/admin/AdminManagement.jsx`

```javascript
const handleVerifyAdmin = async (adminId) => {
    const admin = admins.find(a => a._id === adminId);
    const displayName = admin?.name || admin?.username || 'Admin';
    
    // Confirmation dialog
    if (!window.confirm(`Verify and trust ${displayName}?\\n\\nThis will grant them ${admin?.role} access.`)) {
        return;
    }
    
    try {
        // Call verify endpoint
        await api.put(`/admins/${adminId}/verify`, { 
            isTrusted: true, 
            verified: true 
        });
        
        toast.success(`${displayName} verified and trusted successfully!`);
        fetchAdmins();  // Refresh list
        
    } catch (err) { 
        console.error('❌ Verify error:', err);
        toast.error(err.response?.data?.message || 'Failed to verify admin'); 
    }
};

// In the UI:
{!admin.isTrusted && !admin.isSuspended && (
    <button onClick={() => handleVerifyAdmin(admin._id)}
        className="verify-button">
        <UserCheck className="w-4 h-4" /> Verify
    </button>
)}
```

**Display Google Users:**

```javascript
<div className="admin-card">
    {/* Profile Picture */}
    {admin.profilePicture ? (
        <img src={admin.profilePicture} alt={admin.name} 
            className="profile-pic" />
    ) : (
        <div className="avatar">{admin.name?.charAt(0)}</div>
    )}
    
    {/* Name with Google Badge */}
    <div className="info">
        <div className="name">
            {admin.name}
            {admin.provider === 'google' && (
                <span className="badge google-badge">Google</span>
            )}
        </div>
        <div className="email">{admin.email}</div>
    </div>
    
    {/* Status */}
    {admin.isTrusted ? (
        <span className="status verified">✓ Verified</span>
    ) : (
        <span className="status pending">⚠️ Pending</span>
    )}
</div>
```

### **Backend Verification**

**File:** `server/controllers/adminController.js`

```javascript
const verifyAdmin = async (req, res) => {
    const { isTrusted, verified } = req.body;
    
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
    }
    
    console.log(`✅ Super Admin ${req.admin.username} verifying ${admin.name}:`, { 
        provider: admin.provider,
        currentRole: admin.role, 
        wasTrusted: admin.isTrusted,
        nowTrusted: isTrusted 
    });
    
    // Update trust status
    if (isTrusted !== undefined) {
        admin.isTrusted = isTrusted;
        admin.trustedSince = isTrusted ? new Date() : null;
        admin.trustedBy = isTrusted ? req.admin._id : null;
    }
    
    // Update verified status
    if (verified !== undefined) {
        admin.verified = verified;
        admin.verifiedAt = verified ? new Date() : null;
        admin.verifiedBy = verified ? req.admin._id : null;
    }
    
    await admin.save();
    
    console.log(`👤 Admin ${admin.name} is now:`, {
        verified: admin.verified,
        isTrusted: admin.isTrusted,
        role: admin.role,
        canAccessAdmin: admin.isTrusted || admin.role !== 'viewer'
    });
    
    res.json({
        success: true,
        message: 'Admin verified and trusted',
        data: admin
    });
};
```

---

## Part 5: Security Considerations

### **1. Never Trust Client Data**

```javascript
// ❌ BAD - Don't trust data from frontend
const user = await Admin.create(req.body);  // User could send role: 'super_admin'!

// ✅ GOOD - Always validate and set defaults
const user = await Admin.create({
    googleId: req.body.googleId,
    email: req.body.email,
    name: req.body.name,
    role: 'viewer',        // Always start as viewer
    isTrusted: false       // Always needs approval
});
```

### **2. Validate Google Token (Optional but Recommended)**

```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (token) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    return payload;
};

// Use in controller:
const payload = await verifyGoogleToken(req.body.googleToken);
const { sub, email, name, picture } = payload;
```

### **3. Environment Variables**

```javascript
// .env
GOOGLE_CLIENT_ID=311672185118-fnu83et05guc71ffdf39r4meknj3lolj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret_here  // Keep this SECRET!

// Never commit .env to Git!
// Add to .gitignore:
# Environment
.env
.env.local
.env.production
```

### **4. HTTPS in Production**

```javascript
// Development (HTTP okay):
http://localhost:5173

// Production (MUST use HTTPS):
https://yourapp.onrender.com

// Why?
// OAuth requires HTTPS in production for security
// Google won't allow HTTP redirect URIs in production
```

---

## Part 6: OAuth vs Regular Login

### **Comparison**

| Aspect | Regular Login | Google OAuth |
|--------|--------------|--------------|
| Password storage | ✅ We store hashed password | ❌ No password stored |
| Password security | ⚠️ Our responsibility | ✅ Google's responsibility |
| User verification | ⚠️ Manual email verification | ✅ Auto verified by Google |
| Forgot password | ⚠️ Must implement reset flow | ✅ Google handles it |
| User trust | ⚠️ Users might not trust us | ✅ Users trust Google |
| Signup speed | ⏱️ Must fill form | ⚡ One click |
| Implementation | 🛠️ Simpler | 🛠️ Slightly complex |

### **When to Use Which?**

**Use Regular Login when:**
- Internal system (employees only)
- Need full control
- No internet dependency
- Custom authentication requirements

**Use OAuth when:**
- Public-facing application
- Want faster signups
- Reduce password management
- Increase user trust

**Use Both (Like Your App):**
- Give users choice
- Super admin uses regular login
- Regular users use Google OAuth
- Best of both worlds!

---

## Testing Your Understanding

### **Quiz Questions:**

1. **What is OAuth and why do we use it?**

2. **What are the three main steps in OAuth flow?**
   - User clicks "Sign in with Google"
   - ...
   - ...

3. **What data do we receive from Google?**

4. **Why do new OAuth users start as 'viewer' with isTrusted=false?**

5. **What's the difference between Google's token and our JWT token?**

6. **Why must we use HTTPS in production?**

### **Practical Exercises:**

1. **Test Google Login Flow**
   ```javascript
   // Add console.logs to track flow:
   console.log('1. User clicked Google login');
   console.log('2. Google data received:', decoded);
   console.log('3. Sending to backend...');
   console.log('4. Backend response:', res.data);
   console.log('5. Token saved, redirecting...');
   ```

2. **Inspect Google Token**
   - Login with Google
   - Check browser console
   - Copy the credentialResponse.credential
   - Decode at https://jwt.io
   - See what Google sends us

3. **Test Verification Workflow**
   - Create new Google account
   - Sign in to your app
   - Try accessing admin pages (should be blocked)
   - Login as super admin
   - Verify the new user
   - Switch back to new user
   - Should now have access!

4. **Break It on Purpose**
   - Remove GOOGLE_CLIENT_ID from main.jsx
   - What error do you get?
   - Set wrong Client ID
   - What happens?

---

## Common Issues and Solutions

### **Issue 1: "Popup blocked"**

**Problem:** Browser blocks Google login popup

**Solution:**
```javascript
// Allow popups from your site in browser settings
// Or use redirect flow instead of popup
```

### **Issue 2: "Redirect URI mismatch"**

**Problem:** Google shows error about redirect URI

**Solution:**
```
1. Go to Google Cloud Console
2. OAuth 2.0 Client IDs
3. Add exact URL to Authorized JavaScript origins
4. Add exact URL to Authorized redirect URIs
5. Wait 5 minutes for changes to propagate
```

### **Issue 3: "User can't access admin after verification"**

**Problem:** User still blocked after super admin verifies

**Solution:**
```javascript
// User must logout and login again!
// Or implement real-time updates with Socket.io
// Or refresh user data from backend
```

### **Issue 4: "Email already exists"**

**Problem:** User has both local and Google accounts with same email

**Solution:**
```javascript
// In backend, link accounts:
const existingUser = await Admin.findOne({ email });
if (existingUser && !existingUser.googleId) {
    existingUser.googleId = googleId;
    existingUser.profilePicture = picture;
    await existingUser.save();
}
```

---

## Summary

**Key Concepts Learned:**

✅ **OAuth**: Third-party authentication protocol  
✅ **Google OAuth**: "Sign in with Google" implementation  
✅ **Token Exchange**: Google token → Your JWT token  
✅ **User Verification**: Super admin approval workflow  
✅ **Security**: Why OAuth is more secure  
✅ **Provider Field**: Tracking login method (local vs google)  

**OAuth Flow Summary:**

```
Click Google → Google Login → Permission → Google Data 
→ Create/Update User → Generate JWT → Store Token → Logged In
```

**Security Benefits:**

✅ No password storage  
✅ Email auto-verified  
✅ Trusted by users  
✅ Google handles security  
✅ Easy password recovery  

---

**Next Chapter:** Real-Time Updates with Socket.io →

Learn how live scoreboards update automatically!
