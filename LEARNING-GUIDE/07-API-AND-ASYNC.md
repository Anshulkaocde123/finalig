# Chapter 7: API Communication & Async/Await 🔄

## What is an API?

**API = Application Programming Interface**

**Simple Analogy:**
- **Restaurant Menu** = API
- **You** = Frontend
- **Kitchen** = Backend
- **Waiter** = HTTP Protocol

You don't go into the kitchen to cook. You order from the menu (API), waiter takes your request to the kitchen (backend), and brings back food (data).

---

## 🔄 Synchronous vs Asynchronous

### Synchronous (Blocking)

```javascript
// Line 1 runs
console.log('Start');

// Line 2 runs (waits here)
const data = fetchDataSync();  // Takes 5 seconds

// Line 3 runs AFTER line 2 finishes
console.log('End');

// Output:
// Start
// (5 second wait)
// End
```

**Problem:** Everything stops while waiting!

### Asynchronous (Non-Blocking)

```javascript
// Line 1 runs
console.log('Start');

// Line 2 starts (doesn't wait)
fetchDataAsync().then(data => {
    console.log('Data received');
});

// Line 3 runs IMMEDIATELY
console.log('End');

// Output:
// Start
// End
// (5 seconds later)
// Data received
```

**Benefit:** Code continues running while waiting!

---

## 🎯 Three Ways to Handle Async Code

### 1. Callbacks (Old Way - Messy)

```javascript
getData(function(data) {
    processData(data, function(processed) {
        saveData(processed, function(saved) {
            console.log('Done');
        });
    });
});
// "Callback Hell" - hard to read!
```

### 2. Promises (Better)

```javascript
getData()
    .then(data => processData(data))
    .then(processed => saveData(processed))
    .then(saved => console.log('Done'))
    .catch(error => console.error(error));
```

### 3. Async/Await (Best - Modern)

```javascript
async function handleData() {
    try {
        const data = await getData();
        const processed = await processData(data);
        const saved = await saveData(processed);
        console.log('Done');
    } catch (error) {
        console.error(error);
    }
}
```

---

## 📦 Promises Explained

A **Promise** is an object representing eventual completion of an async operation.

```javascript
// Promise states:
// 1. Pending   - Still working
// 2. Fulfilled - Completed successfully
// 3. Rejected  - Failed with error

// Creating a promise
const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
        const success = true;
        
        if (success) {
            resolve('Data loaded!');  // Success
        } else {
            reject('Error occurred');  // Failure
        }
    }, 2000);
});

// Using a promise
myPromise
    .then(result => {
        console.log(result);  // 'Data loaded!'
    })
    .catch(error => {
        console.error(error);  // 'Error occurred'
    });
```

### Real-World Example

```javascript
// Fetch user data (returns Promise)
fetch('https://api.example.com/users')
    .then(response => response.json())  // Convert to JSON
    .then(data => {
        console.log('Users:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
```

---

## ⚡ Async/Await - Modern Approach

### Basic Syntax

```javascript
// async function returns a Promise
async function fetchData() {
    // await pauses function until Promise resolves
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
}

// Calling async function
fetchData().then(data => {
    console.log(data);
});

// Or with await (if inside async function)
async function main() {
    const data = await fetchData();
    console.log(data);
}
```

### Try-Catch for Error Handling

```javascript
async function fetchData() {
    try {
        const response = await fetch('https://api.example.com/data');
        
        if (!response.ok) {
            throw new Error('HTTP error');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
```

---

## 🌐 HTTP Requests with Axios

**Axios** = Library for making HTTP requests (better than fetch)

### Why Axios?

```javascript
// FETCH (native) - More code
fetch('https://api.example.com/data', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: 'John' })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// AXIOS - Simpler
axios.post('https://api.example.com/data', { name: 'John' })
    .then(res => console.log(res.data))
    .catch(err => console.error(err));
```

### Installing Axios

```bash
npm install axios
```

---

## 🔧 Axios Configuration in Your Project

**File:** `client/src/api/axiosConfig.js`

```javascript
import axios from 'axios';

// Determine base URL based on environment
const apiUrl = import.meta.env.MODE === 'production'
    ? ''  // Production: Same domain
    : 'http://localhost:5000';  // Development: Local backend

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor (runs before every request)
axiosInstance.interceptors.request.use(
    (config) => {
        // Add auth token if exists
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor (runs after every response)
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle errors globally
        if (error.response?.status === 401) {
            // Unauthorized - redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
```

### Line-by-Line Breakdown

```javascript
// 1. Import axios
import axios from 'axios';

// 2. Determine API URL
const apiUrl = import.meta.env.MODE === 'production'
    ? ''                          // Production: Use same domain
    : 'http://localhost:5000';    // Development: Use local server

// WHY?
// Development: Frontend (localhost:3000) → Backend (localhost:5000)
// Production: Frontend (myapp.com) → Backend (myapp.com/api)

// 3. Create configured instance
const axiosInstance = axios.create({
    baseURL: apiUrl,              // Prefix for all requests
    headers: {
        'Content-Type': 'application/json'  // Default header
    }
});

// USAGE:
// axiosInstance.get('/matches')
// → In dev: http://localhost:5000/matches
// → In prod: /matches (same domain)

// 4. Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // This runs BEFORE every request
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // Add to Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Return modified config
        return config;
    },
    (error) => {
        // Handle request errors
        return Promise.reject(error);
    }
);

// WHAT THIS DOES:
// All requests automatically include auth token
// You don't need to add it manually every time

// 5. Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // This runs AFTER successful response
        return response;
    },
    (error) => {
        // This runs AFTER failed response
        
        // Check if unauthorized (401)
        if (error.response?.status === 401) {
            // Remove invalid token
            localStorage.removeItem('token');
            // Redirect to login
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

// WHAT THIS DOES:
// Automatically handles 401 errors (invalid/expired token)
// Logs user out and redirects to login

// 6. Export instance
export default axiosInstance;
```

---

## 🎯 Making API Calls in React

### Example 1: Fetch Data on Component Mount

```jsx
import { useState, useEffect } from 'react';
import api from '../../api/axios';

function MatchList() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetchMatches();
    }, []);
    
    const fetchMatches = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.get('/matches');
            //                              └─ GET /api/matches
            
            setMatches(response.data.data);
            // response = { data: { success: true, data: [...] } }
            // response.data = { success: true, data: [...] }
            // response.data.data = [...]
            
        } catch (error) {
            console.error('Error fetching matches:', error);
            setError('Failed to load matches');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <div>
            {matches.map(match => (
                <div key={match._id}>{match.sport}</div>
            ))}
        </div>
    );
}
```

### Example 2: GET with Query Parameters

```jsx
const fetchCricketMatches = async () => {
    const response = await api.get('/matches', {
        params: {
            sport: 'CRICKET',
            status: 'LIVE',
            limit: 10
        }
    });
    // → GET /api/matches?sport=CRICKET&status=LIVE&limit=10
    
    setMatches(response.data.data);
};
```

### Example 3: POST Request (Create Data)

```jsx
const createMatch = async (matchData) => {
    try {
        const response = await api.post('/matches/cricket/create', matchData);
        // → POST /api/matches/cricket/create
        // Body: matchData (automatically converted to JSON)
        
        console.log('Match created:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error.response?.data?.message);
        throw error;
    }
};

// Usage:
const handleSubmit = async (e) => {
    e.preventDefault();
    
    const matchData = {
        teamA: 'cseId',
        teamB: 'ceId',
        sport: 'CRICKET',
        scheduledAt: new Date(),
        venue: 'Main Ground'
    };
    
    await createMatch(matchData);
};
```

### Example 4: PUT Request (Update Data)

```jsx
const updateScore = async (matchId, scoreData) => {
    const response = await api.put(`/matches/${matchId}`, scoreData);
    // → PUT /api/matches/507f1f77bcf86cd799439011
    // Body: scoreData
    
    return response.data;
};

// Usage:
const handleScoreUpdate = async () => {
    await updateScore(match._id, {
        scoreA: { runs: 150, wickets: 5 }
    });
};
```

### Example 5: DELETE Request

```jsx
const deleteMatch = async (matchId) => {
    const response = await api.delete(`/matches/${matchId}`);
    // → DELETE /api/matches/507f1f77bcf86cd799439011
    
    return response.data;
};

// Usage:
const handleDelete = async () => {
    if (confirm('Delete match?')) {
        await deleteMatch(match._id);
        // Refresh list
        fetchMatches();
    }
};
```

---

## 🎭 Real Example from Your Project: Home Page

**File:** `client/src/pages/public/Home.jsx`

```jsx
const Home = () => {
    const [matches, setMatches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Parallel requests (both run at same time)
            const [matchRes, deptRes] = await Promise.all([
                api.get('/matches'),
                api.get('/departments')
            ]);
            // Promise.all waits for ALL promises to complete
            // Faster than sequential requests
            
            setMatches(matchRes.data.data);
            setDepartments(deptRes.data.data);
            
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // Rest of component...
};
```

### Breaking Down Promise.all

```javascript
// SEQUENTIAL (Slow) - 10 seconds total
const matchRes = await api.get('/matches');     // 5 seconds
const deptRes = await api.get('/departments');  // 5 seconds

// PARALLEL (Fast) - 5 seconds total
const [matchRes, deptRes] = await Promise.all([
    api.get('/matches'),      // 5 seconds
    api.get('/departments')   // 5 seconds (at same time)
]);

// Both finish at the same time!
```

---

## 🔍 Handling API Errors

### Pattern 1: Try-Catch

```jsx
const fetchData = async () => {
    try {
        const response = await api.get('/matches');
        setMatches(response.data.data);
    } catch (error) {
        // error.response = Response from server
        // error.request = Request was made but no response
        // error.message = Something else went wrong
        
        if (error.response) {
            // Server responded with error status
            console.error('Server error:', error.response.status);
            console.error('Message:', error.response.data.message);
        } else if (error.request) {
            // Request made but no response
            console.error('No response from server');
        } else {
            // Something else
            console.error('Error:', error.message);
        }
    }
};
```

### Pattern 2: User-Friendly Error Messages

```jsx
import toast from 'react-hot-toast';

const fetchData = async () => {
    try {
        const response = await api.get('/matches');
        setMatches(response.data.data);
        toast.success('Matches loaded!');
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to load matches';
        toast.error(message);
        console.error(error);
    }
};
```

### Pattern 3: Retry on Failure

```jsx
const fetchDataWithRetry = async (retries = 3) => {
    try {
        const response = await api.get('/matches');
        return response.data;
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchDataWithRetry(retries - 1);
        }
        throw error;
    }
};
```

---

## 🎯 Advanced Async Patterns

### Pattern 1: Debouncing API Calls

```jsx
import { useState, useEffect } from 'react';

function SearchMatches() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    
    useEffect(() => {
        // Debounce: Wait 500ms after user stops typing
        const timeoutId = setTimeout(() => {
            if (searchTerm) {
                searchMatches(searchTerm);
            }
        }, 500);
        
        // Cleanup: Cancel previous timeout
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);
    
    const searchMatches = async (query) => {
        const response = await api.get('/matches', {
            params: { search: query }
        });
        setResults(response.data.data);
    };
    
    return (
        <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search matches..."
        />
    );
}
```

### Pattern 2: Loading States

```jsx
function MatchList() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    const fetchMatches = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            
            const response = await api.get('/matches');
            setMatches(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    
    return (
        <div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <button 
                        onClick={() => fetchMatches(true)}
                        disabled={refreshing}
                    >
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    {/* Matches list */}
                </>
            )}
        </div>
    );
}
```

### Pattern 3: Canceling Requests

```jsx
import { useEffect } from 'react';

function MatchDetail({ matchId }) {
    const [match, setMatch] = useState(null);
    
    useEffect(() => {
        // AbortController for canceling requests
        const controller = new AbortController();
        
        const fetchMatch = async () => {
            try {
                const response = await api.get(`/matches/${matchId}`, {
                    signal: controller.signal
                });
                setMatch(response.data);
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Request canceled');
                } else {
                    console.error(error);
                }
            }
        };
        
        fetchMatch();
        
        // Cleanup: Cancel request if component unmounts
        return () => {
            controller.abort();
        };
    }, [matchId]);
    
    return <div>{match?.sport}</div>;
}
```

---

## 📊 API Call Best Practices

### 1. Centralize API Calls

```jsx
// ✅ GOOD: Separate API service file
// api/matchService.js
export const matchAPI = {
    getAll: () => api.get('/matches'),
    getById: (id) => api.get(`/matches/${id}`),
    create: (data) => api.post('/matches/create', data),
    update: (id, data) => api.put(`/matches/${id}`, data),
    delete: (id) => api.delete(`/matches/${id}`)
};

// In component:
import { matchAPI } from '../../api/matchService';

const matches = await matchAPI.getAll();
```

### 2. Handle Loading States

```jsx
// ✅ GOOD: Show loading, data, and error states
if (loading) return <Spinner />;
if (error) return <Error message={error} />;
if (!data) return <Empty />;
return <DataDisplay data={data} />;
```

### 3. Provide User Feedback

```jsx
// ✅ GOOD: Inform user of actions
const handleCreate = async () => {
    toast.loading('Creating match...');
    
    try {
        await api.post('/matches/create', data);
        toast.success('Match created!');
    } catch (error) {
        toast.error('Failed to create match');
    }
};
```

### 4. Error Recovery

```jsx
// ✅ GOOD: Offer retry option
{error && (
    <div>
        <p>Error: {error}</p>
        <button onClick={fetchData}>Retry</button>
    </div>
)}
```

---

## ✅ Key Takeaways

1. **Async/Await**
   - Modern way to handle async code
   - Cleaner than callbacks and promises
   - Always use try-catch

2. **Axios**
   - Simpler than fetch
   - Automatic JSON conversion
   - Interceptors for global handling

3. **React Integration**
   - useEffect for API calls on mount
   - useState for storing data
   - Handle loading and error states

4. **Error Handling**
   - Try-catch for errors
   - User-friendly messages
   - Retry mechanisms

5. **Best Practices**
   - Centralize API calls
   - Debounce search
   - Cancel unused requests
   - Provide feedback

---

## 🚀 Next Chapter

Let's see how frontend and backend connect!

**Next:** [Chapter 8: Frontend-Backend Connection](./08-F   RONTEND-BACKEND-CONNECTION.md)

---

*Remember: Async/await makes async code look sync!*
