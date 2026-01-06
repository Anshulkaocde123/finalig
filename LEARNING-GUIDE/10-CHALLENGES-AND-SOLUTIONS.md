# Chapter 10: Common Challenges & Solutions 🔧

## Real Problems You'll Face & How to Fix Them

This chapter covers **actual errors and challenges** faced during development and how they were solved.

---

## 🔴 Challenge 1: CORS Errors

### The Problem

```
Access to XMLHttpRequest at 'http://localhost:5000/api/matches' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**When it happens:**
- Frontend (localhost:3000) tries to access Backend (localhost:5000)
- Browser blocks request for security

### Why It Happens

```
Browser Security:
Frontend (localhost:3000) → Backend (localhost:5000)
                          ❌ BLOCKED!
                          Different domains!
```

### Solution 1: Install and Use CORS

```bash
npm install cors
```

**File:** `server/server.js`

```javascript
const cors = require('cors');

// Allow all origins (development)
app.use(cors());

// Or specific origin (production)
app.use(cors({
    origin: 'https://your-frontend-domain.com',
    credentials: true
}));
```

### Solution 2: Proxy in Development

**File:** `client/vite.config.js`

```javascript
export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true
            }
        }
    }
});
```

**Now you can use:**
```javascript
// Instead of: http://localhost:5000/api/matches
axios.get('/api/matches');  // Vite proxies to backend
```

---

## 🔴 Challenge 2: MongoDB Connection Failed

### The Problem

```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

### Possible Causes & Solutions

#### Cause 1: MongoDB Not Running

**Check:**
```bash
# Is MongoDB running?
sudo systemctl status mongod

# If not, start it
sudo systemctl start mongod
```

#### Cause 2: Wrong Connection String

**File:** `server/.env`

```bash
# ❌ WRONG
MONGODB_URI=mongodb://localhost:27017

# ✅ CORRECT
MONGODB_URI=mongodb://localhost:27017/vnit-ig-app
#                                      └─ Database name
```

#### Cause 3: Network Issues (MongoDB Atlas)

```bash
# ❌ WRONG
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net

# ✅ CORRECT
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vnit-ig-app?retryWrites=true&w=majority
```

**Common fixes:**
1. Check username/password (no special characters or URL-encode them)
2. Whitelist your IP in MongoDB Atlas
3. Check network connection

#### Cause 4: Environment Variable Not Loaded

```javascript
// Load dotenv BEFORE using process.env
require('dotenv').config();  // Must be first!

const mongoose = require('mongoose');
// Now process.env.MONGODB_URI is available
```

---

## 🔴 Challenge 3: req.body is undefined

### The Problem

```javascript
app.post('/api/matches', (req, res) => {
    console.log(req.body);  // undefined
});
```

### Solution: Add Body Parser Middleware

```javascript
// BEFORE route definitions
app.use(express.json());                      // For JSON
app.use(express.urlencoded({ extended: true })); // For form data

// NOW routes
app.post('/api/matches', (req, res) => {
    console.log(req.body);  // { sport: 'CRICKET', ... }
});
```

### Why This Works

```
Request → Middleware (express.json()) → Route Handler
          └─ Parses JSON body
          └─ Adds to req.body
```

---

## 🔴 Challenge 4: State Not Updating in React

### The Problem

```jsx
function Counter() {
    const [count, setCount] = useState(0);
    
    const handleClick = () => {
        setCount(count + 1);
        console.log(count);  // Still shows old value!
    };
}
```

### Why It Happens

**State updates are asynchronous:**
```jsx
setCount(count + 1);     // Schedules update
console.log(count);      // Runs before update applied
```

### Solution 1: Use useEffect to See Updates

```jsx
useEffect(() => {
    console.log('Count updated:', count);
}, [count]);  // Runs when count changes
```

### Solution 2: Use Functional Update

```jsx
// ❌ WRONG: Multiple updates may be lost
setCount(count + 1);
setCount(count + 1);  // Both use same 'count' value

// ✅ CORRECT: Each uses latest value
setCount(prev => prev + 1);
setCount(prev => prev + 1);
```

---

## 🔴 Challenge 5: useEffect Running Too Many Times

### The Problem

```jsx
useEffect(() => {
    fetchData();  // Runs infinitely!
});
```

### Why It Happens

```
Component renders
  ↓
useEffect runs
  ↓
State updates
  ↓
Component re-renders
  ↓
useEffect runs again (infinite loop!)
```

### Solution: Add Dependency Array

```jsx
// Run once on mount
useEffect(() => {
    fetchData();
}, []);  // Empty array = run once

// Run when specific value changes
useEffect(() => {
    fetchData(id);
}, [id]);  // Run when 'id' changes
```

---

## 🔴 Challenge 6: Map() Not Working

### The Problem

```jsx
{matches.map(match => (
    <div>{match.name}</div>
))}
// Error: matches.map is not a function
```

### Possible Causes & Solutions

#### Cause 1: Not an Array

```jsx
// Check what you're mapping
console.log(matches);
console.log(Array.isArray(matches));

// Fix: Ensure it's array
const [matches, setMatches] = useState([]);  // Start with []

// Or check before mapping
{Array.isArray(matches) && matches.map(...)}
```

#### Cause 2: Data Structure

```javascript
// API returns:
{
    success: true,
    data: [...]  // Actual array
}

// ❌ WRONG
setMatches(response.data);  // Sets entire object

// ✅ CORRECT
setMatches(response.data.data);  // Sets array
```

---

## 🔴 Challenge 7: Cannot Find Module

### The Problem

```
Error: Cannot find module './Department'
```

### Solutions

#### Check 1: File Path

```javascript
// ❌ WRONG
require('./models/department.js');  // Wrong case

// ✅ CORRECT
require('./models/Department.js');  // Exact case match
```

#### Check 2: File Extension

```javascript
// ❌ WRONG
import Department from './Department';  // Missing extension

// ✅ CORRECT (ES6 modules)
import Department from './Department.js';

// ✅ CORRECT (CommonJS)
const Department = require('./Department');  // No extension needed
```

#### Check 3: Relative Path

```javascript
// Current file: server/controllers/matchController.js
// Model file: server/models/Match.js

// ❌ WRONG
require('./models/Match');  // Looking in controllers/models

// ✅ CORRECT
require('../models/Match');  // Go up one level
```

---

## 🔴 Challenge 8: Socket.io Not Connecting

### The Problem

```
Socket.io connection failed
WebSocket connection failed
```

### Solutions

#### Solution 1: Check Server Setup

```javascript
// ❌ WRONG
const server = http.createServer(app);
const io = new Server(server);
app.listen(5000);  // Wrong! Using app instead of server

// ✅ CORRECT
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});
server.listen(5000);  // Use server, not app
```

#### Solution 2: Check Client Setup

```javascript
// ❌ WRONG
const socket = io();  // No URL

// ✅ CORRECT
const socket = io('http://localhost:5000');
```

#### Solution 3: Enable CORS for Socket.io

```javascript
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});
```

---

## 🔴 Challenge 9: JWT Token Not Working

### The Problem

```
401 Unauthorized: Invalid token
```

### Solutions

#### Check 1: Token Format

```javascript
// ❌ WRONG
headers: {
    'Authorization': token  // Missing "Bearer"
}

// ✅ CORRECT
headers: {
    'Authorization': `Bearer ${token}`
}
```

#### Check 2: Token Storage

```javascript
// Save token
localStorage.setItem('token', response.data.token);

// Retrieve token
const token = localStorage.getItem('token');

// Remove token (logout)
localStorage.removeItem('token');
```

#### Check 3: Axios Interceptor

```javascript
// Automatically add token to all requests
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

---

## 🔴 Challenge 10: Deployment Issues

### Problem 1: Railway Build Fails

```
npm ERR! Missing script: "start"
```

**Solution:**
```json
{
  "scripts": {
    "start": "node server/server.js"
  }
}
```

### Problem 2: Environment Variables Not Set

**Solution:** Set in Railway dashboard
```
MONGODB_URI=...
JWT_SECRET=...
NODE_ENV=production
```

### Problem 3: API Routes Not Working in Production

**Solution:** Serve frontend from backend

```javascript
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}
```

---

## 🔴 Challenge 11: React Router Not Working After Refresh

### The Problem

```
Page works when clicking link
Page shows 404 when refreshing
```

### Why It Happens

```
Click link → React Router handles (works)
Refresh → Server looks for /leaderboard file (doesn't exist)
```

### Solution: Catch-All Route

```javascript
// Backend serves React for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

---

## 🔴 Challenge 12: Async Function Not Waiting

### The Problem

```javascript
const getData = async () => {
    const data = await api.get('/matches');
    console.log(data);  // undefined
};

getData();
console.log('Done');  // Runs before getData finishes
```

### Solution: Use await

```javascript
// ❌ WRONG
const getData = async () => {
    const data = await api.get('/matches');
    return data;
};

getData();  // Returns Promise, not data!

// ✅ CORRECT
const main = async () => {
    const data = await getData();
    console.log(data);  // Now has data
};

main();
```

---

## 🔴 Challenge 13: Memory Leak Warning

### The Problem

```
Warning: Can't perform a React state update on an unmounted component
```

### Why It Happens

```
Component mounts
  ↓
API call starts (takes 3 seconds)
  ↓
User navigates away (component unmounts)
  ↓
API call finishes
  ↓
setState called on unmounted component ❌
```

### Solution: Cleanup

```jsx
useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
        const data = await api.get('/matches');
        if (isMounted) {  // Only update if still mounted
            setMatches(data);
        }
    };
    
    fetchData();
    
    return () => {
        isMounted = false;  // Cleanup
    };
}, []);
```

---

## 🔴 Challenge 14: Key Prop Warning

### The Problem

```
Warning: Each child in a list should have a unique "key" prop
```

### Why Keys Matter

```jsx
// ❌ WRONG: No key
{matches.map(match => <div>{match.name}</div>)}

// ❌ WRONG: Index as key (can cause issues)
{matches.map((match, index) => (
    <div key={index}>{match.name}</div>
))}

// ✅ CORRECT: Unique ID as key
{matches.map(match => (
    <div key={match._id}>{match.name}</div>
))}
```

---

## 🛠️ Debugging Tips

### 1. Console.log Everything

```javascript
// At each step
console.log('1. Fetching data...');
const response = await api.get('/matches');
console.log('2. Response:', response);
console.log('3. Data:', response.data);
setMatches(response.data.data);
console.log('4. Matches set');
```

### 2. Check Network Tab

```
Browser DevTools → Network Tab
- See all API calls
- Check request/response
- Look for errors (404, 500)
- Check headers
```

### 3. Use React DevTools

```
Install React DevTools extension
- See component tree
- Check props and state
- Track re-renders
```

### 4. Check Server Logs

```bash
# In terminal running server
npm run server

# Watch for:
- Request logs
- Error messages
- Database connection status
```

---

## ✅ Best Practices to Avoid Issues

### 1. Always Handle Errors

```javascript
// ✅ GOOD
try {
    const data = await api.get('/matches');
    setMatches(data);
} catch (error) {
    console.error('Error:', error);
    setError('Failed to load matches');
}
```

### 2. Validate Data

```javascript
// ✅ GOOD
if (!teamA || !teamB) {
    return res.status(400).json({ error: 'Teams required' });
}
```

### 3. Use TypeScript (Advanced)

```typescript
interface Match {
    _id: string;
    sport: string;
    teamA: Department;
    teamB: Department;
}

// Catches type errors before runtime
```

### 4. Test Everything

```javascript
// Write tests
describe('Match API', () => {
    it('should get all matches', async () => {
        const response = await api.get('/matches');
        expect(response.status).toBe(200);
    });
});
```

---

## 🎯 Quick Troubleshooting Checklist

**API Not Working:**
- ✅ Server running?
- ✅ Correct URL?
- ✅ CORS enabled?
- ✅ Request format correct?

**Database Issues:**
- ✅ MongoDB running?
- ✅ Connection string correct?
- ✅ Environment variables loaded?

**React Issues:**
- ✅ Component importing correctly?
- ✅ Dependencies in useEffect?
- ✅ State initialized properly?
- ✅ Keys on list items?

**Deployment:**
- ✅ Build successful?
- ✅ Environment variables set?
- ✅ Start script defined?
- ✅ Correct Node version?

---

## 🚀 Next Steps

Congratulations! You've learned:
- ✅ MERN Stack fundamentals
- ✅ Building full-stack applications
- ✅ Debugging and problem-solving
- ✅ Best practices

**Keep learning:**
- Build more features
- Explore advanced topics
- Contribute to open source
- Build your own projects!

---

*Remember: Every error is a learning opportunity!*
