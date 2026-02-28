# Chapter 5: Authentication System Deep Dive 🔐

## What You'll Learn

By the end of this chapter, you'll understand:
- How login systems work
- What JWT tokens are and why we use them
- Password hashing and security
- Protected routes and authorization
- Role-based access control
- Session management

---

## What is Authentication?

**Authentication** = Proving who you are  
**Authorization** = What you're allowed to do

**Real-World Analogy:**
- **Authentication**: Showing your ID card to enter college
- **Authorization**: Your ID determines which rooms you can access (student vs professor)

---

## How Login Works (Step-by-Step)

### **The Complete Flow:**

```
Step 1: User enters username and password
        ↓
Step 2: Frontend sends credentials to backend
        ↓
Step 3: Backend checks database
        ↓
Step 4: If correct → Generate JWT token
        ↓
Step 5: Send token back to frontend
        ↓
Step 6: Frontend stores token (localStorage)
        ↓
Step 7: Frontend includes token in all requests
        ↓
Step 8: Backend verifies token on each request
        ↓
Step 9: If valid → Allow access
```

---

## Part 1: Password Hashing

### **Why We Hash Passwords**

**❌ NEVER store plain text passwords:**

```javascript
// BAD - NEVER DO THIS!
const user = {
    username: "admin",
    password: "mypassword123"  // ❌ Anyone can read this!
}
```

**✅ Always hash passwords:**

```javascript
// GOOD - Password is encrypted
const user = {
    username: "admin",
    password: "$2a$10$abcd1234xyz..."  // ✅ Encrypted!
}
```

### **How bcrypt Works**

**bcrypt** is a library that encrypts passwords:

```javascript
const bcrypt = require('bcryptjs');

// 1. HASHING (When user signs up)
const plainPassword = "mypassword123";
const hashedPassword = await bcrypt.hash(plainPassword, 10);
// Result: "$2a$10$N9qo8uLOickgx..."

// 2. COMPARING (When user logs in)
const isMatch = await bcrypt.compare(
    "mypassword123",  // User typed this
    hashedPassword    // Stored in database
);
// Result: true or false
```

**Key Points:**
- Same password → Different hash each time!
- Can't reverse a hash (one-way encryption)
- Fast to create, slow to crack

### **In Your Code: Admin Model**

**File:** `server/models/Admin.js`

```javascript
// Define password field
password: {
    type: String,
    required: function() {
        return this.provider === 'local';  // Only required for local login
    },
    minlength: 6,
    select: false  // Don't return password in queries
},

// Before saving, hash the password
AdminSchema.pre('save', async function(next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return next();
    }
    
    // Generate salt (random data added to password)
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
AdminSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
```

**What This Means:**

1. **`select: false`**: Password never returned in queries (extra security)
2. **`pre('save')`**: Runs before saving to database
3. **`salt`**: Random data that makes each hash unique
4. **`comparePassword`**: Method to check if password matches

---

## Part 2: JWT Tokens

# JWT (JSON Web Token) Components Breakdown

A JWT (JSON Web Token) is a compact, URL-safe token used for securely transmitting information between parties as a JSON object. It is commonly used for authentication and authorization in web applications.

A JWT consists of three main parts, separated by dots (`.`):

```
<Header>.<Payload>.<Signature>
```

### 1. Header
- **Purpose:** Specifies the type of token and the signing algorithm used.
- **Example:**
  ```json
  {
    "alg": "HS256", // Algorithm used for signing (HMAC SHA-256)
    "typ": "JWT"    // Token type (always "JWT")
  }
  ```
- **Encoded:** Base64Url encoded to form the first part of the JWT.

### 2. Payload
- **Purpose:** Contains the claims (statements about an entity, typically the user) and any additional data.
- **Common Claims:**
  - `sub`: Subject (user ID)
  - `iat`: Issued at (timestamp)
  - `exp`: Expiration time (timestamp)
  - `iss`: Issuer
  - `aud`: Audience
  - Custom claims (e.g., user roles, permissions)
- **Example:**
  ```json
  {
    "id": "6743c2d8...", // User/admin ID
    "iat": 1736341200,    // Issued at (Unix timestamp)
    "exp": 1738933200,    // Expiry (Unix timestamp)
    "role": "admin",     // Custom claim: user role
    "isTrusted": true     // Custom claim: trust status
  }
  ```
- **Encoded:** Base64Url encoded to form the second part of the JWT.

### 3. Signature
- **Purpose:** Verifies that the token was not altered and was issued by a trusted source.
- **How it's created:**
  - The encoded header and payload are joined with a dot (`.`)
  - This string is signed using a secret key and the algorithm specified in the header
  - **Formula:**
    ```
    HMACSHA256(
      base64UrlEncode(header) + "." + base64UrlEncode(payload),
      secret
    )
    ```
- **Result:** The signature is the third part of the JWT.

### **Example JWT**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NDNjMmQ4N2JkN2M4ZjljMTIzYWJjIiwiaWF0IjoxNzM2MzQxMjAwLCJleHAiOjE3Mzg5MzMyMDB9.abcd1234xyz...
```
- **First part:** Header (Base64Url encoded)
- **Second part:** Payload (Base64Url encoded)
- **Third part:** Signature (Base64Url encoded)

### **Summary Table**
| Part       | Description                | Example (Base64Url Encoded)         |
|------------|---------------------------|-------------------------------------|
| Header     | Token type & algorithm    | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9|
| Payload    | Claims & user data        | eyJpZCI6IjY3NDNjMmQ4N2JkN2M4Zjlj... |
| Signature  | Verifies token integrity  | abcd1234xyz...                      |

---

### **What is JWT?**

**JWT** = JSON Web Token

It's a string that contains information about the user:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NDNjMmQ4N2JkN2M4ZjljMTIzYWJjIiwiaWF0IjoxNzM2MzQxMjAwLCJleHAiOjE3Mzg5MzMyMDB9.abcd1234xyz...
```

**Breakdown:**

```
Header.Payload.Signature

Header:    { "alg": "HS256", "typ": "JWT" }
Payload:   { "id": "6743c2d8...", "iat": 1736341200, "exp": 1738933200 }
Signature: (encrypted with secret key)
```

### **Why JWT Instead of Sessions?**

**Traditional Sessions:**
```
User logs in → Server creates session
              → Stores session in memory/database
              → Sends session ID to user
              → User sends session ID with each request
              → Server looks up session

Problems:
- Server must store all sessions (memory intensive)
- Doesn't scale well (multiple servers need shared storage)
```

**JWT Tokens:**
```
User logs in → Server creates JWT token
              → Sends token to user
              → User stores token
              → User sends token with each request
              → Server verifies token (no database lookup!)

Benefits:
- ✅ Stateless (server doesn't store anything)
- ✅ Scalable (works with multiple servers)
- ✅ Fast (no database queries)
```

### **Creating JWT Tokens**

**File:** `server/controllers/authController.js`

```javascript
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign(
        { id },  // Payload - what data to include
        process.env.JWT_SECRET || 'secret123',  // Secret key
        { expiresIn: '30d' }  // Token expires in 30 days
    );
};

// Usage in login function:
const token = generateToken(admin._id);

res.json({
    _id: admin._id,
    username: admin.username,
    role: admin.role,
    token: token  // Send token to frontend
});
```

**Explanation:**

1. **`jwt.sign()`**: Creates the token
2. **`{ id }`**: Data embedded in token (user's database ID)
3. **`JWT_SECRET`**: Secret key to encrypt token (like a password)
4. **`expiresIn`**: Token automatically becomes invalid after 30 days

### **Verifying JWT Tokens**

**File:** `server/middleware/authMiddleware.js`

```javascript
const protect = async (req, res, next) => {
    let token;

    // 1. Check if token exists in request
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
        
        try {
            // 2. Extract token
            token = req.headers.authorization.split(' ')[1];
            
            // 3. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 4. Get user from database
            req.admin = await Admin.findById(decoded.id).select('-password');
            
            // 5. Continue to next middleware/route
            next();
            
        } catch (error) {
            // Token invalid or expired
            res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    } else {
        // No token provided
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
```

**Step-by-Step:**

1. Check if `Authorization` header exists
2. Format: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Split by space and take second part (the token)
4. Verify token with secret key
5. Extract user ID from decoded token
6. Fetch full user data from database
7. Attach user to request object (`req.admin`)
8. Allow request to continue

---

## Part 3: Protected Routes

### **What are Protected Routes?**

Routes that require authentication to access.

**Example:**

```javascript
// PUBLIC route - anyone can access
router.get('/departments', getDepartments);

// PROTECTED route - must be logged in
router.get('/admins', protect, getAllAdmins);
                    //  ↑
                    // This middleware checks authentication
```

### **How Middleware Works**

**Middleware** = Function that runs BEFORE the main route handler

```javascript
Request → Middleware 1 → Middleware 2 → Route Handler → Response
                ↓              ↓              ↓
            Checks auth    Checks role    Does work
```

**Example:**

```javascript
// File: server/routes/adminRoutes.js

router.get('/admins', 
    protect,              // Middleware 1: Check if logged in
    authorize('super_admin'),  // Middleware 2: Check if super admin
    getAllAdmins          // Route handler: Return admins
);
```

**Flow:**

```
1. Request arrives
2. protect() runs → Checks token → Attaches user to req.admin
3. authorize() runs → Checks if req.admin.role === 'super_admin'
4. getAllAdmins() runs → Returns data
5. Response sent
```

---

## Part 4: Role-Based Authorization

### **Understanding Roles**

Different users have different permissions:

```javascript
const roles = {
    'viewer': {
        canView: true,
        canEdit: false,
        canDelete: false,
        canManageUsers: false
    },
    'admin': {
        canView: true,
        canEdit: true,
        canDelete: true,
        canManageUsers: false
    },
    'super_admin': {
        canView: true,
        canEdit: true,
        canDelete: true,
        canManageUsers: true
    }
};
```

### **Authorization Middleware**

**File:** `server/middleware/authMiddleware.js`

```javascript
const authorize = (...roles) => {
    return (req, res, next) => {
        // Check if user's role is in allowed roles
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                message: `Role '${req.admin.role}' not authorized`
            });
        }
        next();
    };
};

// Usage:
router.delete('/admins/:id', 
    protect,                    // Must be logged in
    authorize('super_admin'),   // Must be super admin
    deleteAdmin                 // Then delete
);
```

**Explanation:**

```javascript
authorize('super_admin', 'admin')
// This means: Only super_admin OR admin can access

// How it works:
1. protect() adds req.admin to request
2. authorize() checks if req.admin.role is in ['super_admin', 'admin']
3. If yes → continue
4. If no → return 403 Forbidden
```

### **Hierarchical Roles**

**File:** `server/models/Admin.js`

```javascript
role: {
    type: String,
    enum: ['viewer', 'moderator', 'score_manager', 'admin', 'super_admin'],
    default: 'viewer'
},

hierarchyLevel: {
    type: Number,
    default: 0
},

// Set hierarchy when role changes
AdminSchema.pre('save', function(next) {
    const roleHierarchy = {
        'viewer': 0,
        'moderator': 1,
        'score_manager': 2,
        'admin': 3,
        'super_admin': 4
    };
    
    this.hierarchyLevel = roleHierarchy[this.role] || 0;
    next();
});
```

**Why Hierarchy?**

```javascript
// Check if user can manage another user
canManage = currentUser.hierarchyLevel > targetUser.hierarchyLevel;

// Example:
admin (level 3) can manage moderator (level 1) → true
moderator (level 1) can manage admin (level 3) → false
```

---

## Part 5: Frontend Authentication

### **Storing Tokens**

**File:** `client/src/pages/auth/Login.jsx`

```javascript
// After successful login:
const response = await api.post('/auth/login', { username, password });

// 1. Store token
localStorage.setItem('adminToken', response.data.token);

// 2. Store user data
localStorage.setItem('adminUser', JSON.stringify(response.data));

// 3. Redirect to admin panel
navigate('/admin/dashboard');
```

**Why localStorage?**

```javascript
// localStorage persists even after browser closes
localStorage.setItem('key', 'value');  // Save
localStorage.getItem('key');           // Get
localStorage.removeItem('key');        // Delete

// sessionStorage only lasts until browser closes
sessionStorage.setItem('key', 'value');
```

### **Sending Tokens with Requests**

**File:** `client/src/api/axiosConfig.js`

```javascript
// Request interceptor - runs before every request
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('adminToken');
        
        if (token) {
            // Add token to Authorization header
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
```

**What This Does:**

```
Every API call:
1. Interceptor runs first
2. Gets token from localStorage
3. Adds to Authorization header
4. Request proceeds with token attached

Example request:
GET /api/admins
Headers: {
    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Handling Token Expiration**

**File:** `client/src/api/axiosConfig.js`

```javascript
// Response interceptor - runs after every response
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If 401 Unauthorized
        if (error.response?.status === 401) {
            console.log('🔒 401 Unauthorized - Clearing session');
            
            // Clear stored data
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            
            // Redirect to login
            window.location.href = '/auth/login';
            
            toast.error('Session expired. Please login again.');
        }
        
        return Promise.reject(error);
    }
);
```

**Flow:**

```
Request → Server → Token expired → 401 response
                                        ↓
                            Interceptor catches 401
                                        ↓
                            Clear localStorage
                                        ↓
                            Redirect to /auth/login
```

---

## Part 6: Protected Routes (Frontend)

### **ProtectedRoute Component**

**File:** `client/src/components/ProtectedRoute.jsx`

```javascript
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Check if token exists
    const token = localStorage.getItem('adminToken');

    console.log('🔒 ProtectedRoute check:', token ? '✅ Token exists' : '❌ No token');

    if (!token) {
        // No token → Redirect to login
        console.log('🚫 Redirecting to /auth/login - no token found');
        return <Navigate to="/auth/login" replace />;
    }

    // Has token → Render child routes
    return <Outlet />;
};
```

**Usage in App.jsx:**

```javascript
// File: client/src/App.jsx

<Routes>
    {/* Public routes - no authentication */}
    <Route path="/" element={<Home />} />
    <Route path="/auth/login" element={<Login />} />
    
    {/* Protected routes - must be logged in */}
    <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<AdminManagement />} />
        </Route>
    </Route>
</Routes>
```

**How It Works:**

```
User navigates to /admin/dashboard
        ↓
ProtectedRoute checks for token
        ↓
    Has token?
    /         \
  YES          NO
   ↓            ↓
Render        Redirect
Dashboard     to /login
```

### **Role-Based UI**

**File:** `client/src/components/AdminLayout.jsx`

```javascript
useEffect(() => {
    const checkAuth = () => {
        const token = localStorage.getItem('adminToken');
        const userStr = localStorage.getItem('adminUser');
        
        if (!token) {
            navigate('/auth/login', { replace: true });
            return;
        }
        
        // Check role
        if (userStr) {
            const user = JSON.parse(userStr);
            
            // Block untrusted viewers
            if (user.role === 'viewer' && !user.isTrusted) {
                console.log('🚫 Access denied for untrusted viewer');
                toast.error('Access denied. Only admins can access this area.');
                
                // Clear session
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                
                navigate('/auth/login', { replace: true });
                return;
            }
            
            setCurrentUser(user);
        }
    };
    
    checkAuth();
}, [navigate]);
```

**What This Checks:**

1. ✅ Token exists?
2. ✅ User data exists?
3. ✅ User has appropriate role?
4. ✅ If viewer, is trusted?

---

## Part 7: Complete Authentication Flow

### **Login Flow (Diagram)**

```
┌─────────────────────────────────────────────────┐
│              USER OPENS APP                      │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
        ┌──────────────────┐
        │  Has token in    │
        │  localStorage?   │
        └────┬────────┬────┘
             │        │
          NO │        │ YES
             ↓        ↓
    ┌────────────┐  ┌──────────────┐
    │ Show Login │  │ Verify Token │
    │    Page    │  │  with Server │
    └─────┬──────┘  └───┬──────────┘
          │             │
          ↓             ↓
    ┌──────────────┐  Valid?
    │ User Enters  │   /    \
    │ Credentials  │  NO    YES
    └──────┬───────┘   │     │
           │           ↓     ↓
           │      ┌─────────┐ ┌──────────┐
           │      │ Logout  │ │  Allow   │
           │      │ & Clear │ │  Access  │
           │      └─────────┘ └──────────┘
           ↓
    ┌──────────────┐
    │ POST /api/   │
    │ auth/login   │
    └──────┬───────┘
           │
           ↓
    ┌──────────────────┐
    │ Server Checks:   │
    │ 1. User exists?  │
    │ 2. Password OK?  │
    │ 3. Account active?│
    └────┬─────────────┘
         │
         ↓
      Valid?
      /    \
    NO     YES
     │      │
     ↓      ↓
┌────────┐ ┌──────────────┐
│ Return │ │ Generate JWT │
│ Error  │ │    Token     │
└────────┘ └──────┬───────┘
                  │
                  ↓
           ┌──────────────┐
           │ Return to    │
           │ Frontend:    │
           │ - token      │
           │ - user data  │
           │ - role       │
           └──────┬───────┘
                  │
                  ↓
           ┌──────────────┐
           │ Frontend:    │
           │ 1. Save token│
           │ 2. Save user │
           │ 3. Redirect  │
           └──────┬───────┘
                  │
                  ↓
           ┌──────────────┐
           │   LOGGED IN  │
           │   SUCCESS!   │
           └──────────────┘
```

### **API Request Flow with Token**

```
┌─────────────────────────────────────┐
│ User clicks "Get Admins" button     │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│ Frontend: api.get('/admins')        │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│ Axios Interceptor:                  │
│ 1. Get token from localStorage      │
│ 2. Add to Authorization header      │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│ HTTP Request:                       │
│ GET /api/admins                     │
│ Headers: {                          │
│   Authorization: "Bearer eyJ..."    │
│ }                                   │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│ Server: protect() middleware        │
│ 1. Extract token from header        │
│ 2. Verify with JWT_SECRET           │
│ 3. Decode to get user ID            │
│ 4. Fetch user from database         │
│ 5. Attach to req.admin              │
└────────────┬────────────────────────┘
             │
             ↓
         Valid Token?
            /    \
          NO     YES
           │      │
           ↓      ↓
    ┌─────────┐ ┌──────────────────┐
    │ Return  │ │ authorize()      │
    │ 401     │ │ middleware       │
    │ Error   │ │ Check role       │
    └─────────┘ └────┬─────────────┘
                     │
                     ↓
                Has Permission?
                   /    \
                 NO     YES
                  │      │
                  ↓      ↓
           ┌─────────┐ ┌──────────────┐
           │ Return  │ │ getAllAdmins()│
           │ 403     │ │ controller   │
           │ Error   │ └────┬─────────┘
           └─────────┘      │
                           ↓
                    ┌──────────────┐
                    │ Query DB     │
                    │ Return data  │
                    └────┬─────────┘
                         │
                         ↓
                  ┌──────────────┐
                  │ Response 200 │
                  │ with data    │
                  └────┬─────────┘
                       │
                       ↓
                ┌──────────────────┐
                │ Frontend:        │
                │ Display admins   │
                └──────────────────┘
```

---

## Part 8: Security Best Practices

### **1. Never Expose Secrets**

```javascript
// ❌ BAD - Secret in code
const token = jwt.sign({ id }, 'mysecretkey123');

// ✅ GOOD - Secret in environment variable
const token = jwt.sign({ id }, process.env.JWT_SECRET);
```

### **2. Use HTTPS in Production**

```javascript
// HTTP (development): http://localhost:5000
// HTTPS (production): https://yourapp.com

// Why?
// HTTP → Data sent in plain text (anyone can read)
// HTTPS → Data encrypted (secure)
```

### **3. Set Token Expiration**

```javascript
// Don't create tokens that never expire!
jwt.sign({ id }, secret, { expiresIn: '30d' });  // ✅ Expires in 30 days
```

### **4. Validate on Both Sides**

```javascript
// Frontend validation (UX - immediate feedback)
if (!username || !password) {
    setError('Please fill all fields');
    return;
}

// Backend validation (Security - can't be bypassed)
if (!username || !password) {
    return res.status(400).json({ message: 'All fields required' });
}
```

### **5. Use bcrypt, Not Plain Hashing**

```javascript
// ❌ BAD
const hash = crypto.createHash('md5').update(password).digest('hex');

// ✅ GOOD
const hash = await bcrypt.hash(password, 10);

// Why bcrypt?
// - Slow by design (prevents brute force attacks)
// - Includes salt automatically
// - Industry standard
```

---

## Testing Your Understanding

### **Quiz Questions:**

1. **What is the difference between authentication and authorization?**
   
2. **Why do we hash passwords instead of storing them plain text?**
   
3. **What are the three parts of a JWT token?**
   
4. **Where is the JWT token stored on the frontend?**
   
5. **What HTTP status code is returned when:**
   - User is not logged in? (401)
   - User doesn't have permission? (403)
   
6. **What does the `protect` middleware do?**
   
7. **How does the frontend send the token to the backend?**

### **Practical Exercises:**

1. **Add console.logs to track authentication flow**
   ```javascript
   console.log('1. User clicked login');
   console.log('2. Sending credentials to server');
   console.log('3. Token received:', token);
   ```

2. **Try logging in with wrong password**
   - What error do you get?
   - Where is it coming from?

3. **Remove token from localStorage**
   ```javascript
   localStorage.removeItem('adminToken');
   ```
   - What happens when you try to access admin pages?

4. **Inspect the JWT token**
   - Copy your token
   - Go to https://jwt.io
   - Paste and decode it
   - What information do you see?

---

## Summary

**Key Concepts Learned:**

✅ **Password Hashing**: Using bcrypt to encrypt passwords  
✅ **JWT Tokens**: Creating and verifying tokens  
✅ **Middleware**: protect() and authorize() functions  
✅ **Protected Routes**: Frontend and backend route protection  
✅ **Role-Based Access**: Different permissions for different users  
✅ **Token Management**: Storing, sending, and refreshing tokens  
✅ **Security**: Best practices for authentication  

**Authentication Flow:**

```
Login → Hash Password → Verify → Generate JWT → Store Token 
→ Send with Requests → Verify Token → Allow Access
```

---

**Next Chapter:** Google OAuth Integration →

Learn how "Sign in with Google" works!
