# Chapter 6: React Frontend Fundamentals ⚛️

## What is React?

**Simple Analogy:**
- **HTML/CSS** = Building with LEGO blocks one by one
- **React** = Building with pre-made LEGO sets (components) that you can reuse

React is a JavaScript library for building user interfaces using **reusable components**.

---

## 🧱 Components - The Building Blocks

### What is a Component?

A component is a **piece of UI that you can reuse**.

**Traditional HTML (Repetitive):**
```html
<div class="card">
    <h3>Match 1</h3>
    <p>Cricket</p>
    <button>View</button>
</div>

<div class="card">
    <h3>Match 2</h3>
    <p>Football</p>
    <button>View</button>
</div>

<!-- Copy-paste 50 times... -->
```

**React (Reusable):**
```jsx
function MatchCard({ title, sport }) {
    return (
        <div className="card">
            <h3>{title}</h3>
            <p>{sport}</p>
            <button>View</button>
        </div>
    );
}

// Use it many times
<MatchCard title="Match 1" sport="Cricket" />
<MatchCard title="Match 2" sport="Football" />
<MatchCard title="Match 3" sport="Basketball" />
```

---

## 📝 JSX - JavaScript + HTML

JSX looks like HTML but it's actually JavaScript.

```jsx
// This JSX:
const element = <h1>Hello World</h1>;

// Gets converted to:
const element = React.createElement('h1', null, 'Hello World');

// Which creates:
{
    type: 'h1',
    props: {},
    children: 'Hello World'
}
```

### JSX Rules

```jsx
// 1. Use className instead of class
<div className="container">  ✅
<div class="container">      ❌

// 2. Close all tags
<input />          ✅
<input>            ❌
<img />            ✅
<img>              ❌

// 3. Use camelCase for attributes
<div onClick={handleClick}>  ✅
<div onclick={handleClick}>  ❌

// 4. JavaScript in curly braces
<h1>{name}</h1>              ✅
<h1>name</h1>                ❌ (renders "name" as text)

// 5. One root element
return (
    <div>
        <h1>Title</h1>
        <p>Text</p>
    </div>
);  ✅

return (
    <h1>Title</h1>
    <p>Text</p>
);  ❌ (Two root elements)
```

---

## 🔧 Creating Your First Component

**File:** `client/src/components/MatchCard.jsx`

```jsx
// 1. Import React (if using older versions)
import React from 'react';

// 2. Define component
function MatchCard({ match }) {
    // 3. Return JSX
    return (
        <div className="card">
            <h3>{match.sport}</h3>
            <p>{match.teamA.name} vs {match.teamB.name}</p>
            <span>{match.status}</span>
        </div>
    );
}

// 4. Export component
export default MatchCard;
```

### Line-by-Line Breakdown

```jsx
// FUNCTION COMPONENT
function MatchCard({ match }) {
//       └─ Component name (must start with capital letter)
//                └─ Props (data passed to component)
    
    // COMPONENT LOGIC (JavaScript)
    const isLive = match.status === 'LIVE';
    const teamAScore = match.scoreA?.runs || 0;
    
    // RETURN JSX (What to display)
    return (
        <div className="card">
            {/* JavaScript expressions in {} */}
            <h3>{match.sport}</h3>
            
            {/* Conditional rendering */}
            {isLive && <span className="live-badge">LIVE</span>}
            
            {/* Object access */}
            <p>{match.teamA.name} vs {match.teamB.name}</p>
            
            {/* Display score */}
            <div>{teamAScore} - {match.scoreB?.runs || 0}</div>
        </div>
    );
}

export default MatchCard;
```

---

## 🎯 Props - Passing Data to Components

Props = **Properties** (data you pass to a component)

```jsx
// PARENT COMPONENT
function Home() {
    const match = {
        sport: 'CRICKET',
        teamA: { name: 'CSE' },
        teamB: { name: 'CE' },
        status: 'LIVE'
    };
    
    // Pass data via props
    return <MatchCard match={match} />;
}

// CHILD COMPONENT
function MatchCard({ match }) {
//                   └─ Destructuring props
    return <div>{match.sport}</div>;
}

// Alternative (without destructuring):
function MatchCard(props) {
    return <div>{props.match.sport}</div>;
}
```

### Props are Read-Only

```jsx
function MatchCard({ match }) {
    // ❌ CANNOT modify props
    match.sport = 'FOOTBALL';  // Error!
    
    // ✅ CAN use props
    const sportName = match.sport;
    
    return <div>{sportName}</div>;
}
```

### Multiple Props

```jsx
// Passing multiple props
<MatchCard 
    sport="CRICKET"
    teamA="CSE"
    teamB="CE"
    status="LIVE"
/>

// Receiving multiple props
function MatchCard({ sport, teamA, teamB, status }) {
    return (
        <div>
            <p>{sport}</p>
            <p>{teamA} vs {teamB}</p>
            <span>{status}</span>
        </div>
    );
}
```

---

## 🔄 State - Data That Changes

**State** = Data that can **change over time**

```jsx
import { useState } from 'react';

function Counter() {
    // Declare state variable
    const [count, setCount] = useState(0);
    //     └─ Current value
    //            └─ Function to update value
    //                          └─ Initial value
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
}
```

### useState Hook Explained

```jsx
import { useState } from 'react';

function Example() {
    // Syntax:
    const [value, setValue] = useState(initialValue);
    
    // Real examples:
    const [name, setName] = useState('');
    const [age, setAge] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [matches, setMatches] = useState([]);
    const [user, setUser] = useState({ name: '', email: '' });
    
    // Update state:
    setName('John');
    setAge(25);
    setIsLoggedIn(true);
    setMatches([...matches, newMatch]);
    setUser({ name: 'John', email: 'john@example.com' });
}
```

---

## 🎨 Real Example from Your Project: Home Page

**File:** `client/src/pages/public/Home.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import MatchCard from '../../components/MatchCard';

const Home = ({ isDarkMode, setIsDarkMode }) => {
    // STATE: Data that changes
    const [matches, setMatches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSport, setSelectedSport] = useState('');
    
    // EFFECT: Run code when component loads
    useEffect(() => {
        fetchData();
        
        // Socket.io listeners
        socket.on('matchUpdate', (updatedMatch) => {
            setMatches(prevMatches => 
                prevMatches.map(m => 
                    m._id === updatedMatch._id ? updatedMatch : m
                )
            );
        });
        
        // Cleanup
        return () => {
            socket.off('matchUpdate');
        };
    }, []);
    
    // FUNCTION: Fetch data from API
    const fetchData = async () => {
        try {
            setLoading(true);
            const [matchRes, deptRes] = await Promise.all([
                api.get('/matches'),
                api.get('/departments')
            ]);
            
            setMatches(matchRes.data.data);
            setDepartments(deptRes.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // FILTER: Apply filters to matches
    const filteredMatches = matches.filter(match => {
        if (selectedSport && match.sport !== selectedSport) return false;
        return true;
    });
    
    // RENDER: What to show
    if (loading) {
        return <div>Loading...</div>;
    }
    
    return (
        <div className="container">
            {/* Filter dropdown */}
            <select 
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
            >
                <option value="">All Sports</option>
                <option value="CRICKET">Cricket</option>
                <option value="FOOTBALL">Football</option>
            </select>
            
            {/* Display matches */}
            <div className="matches-grid">
                {filteredMatches.map(match => (
                    <MatchCard 
                        key={match._id}
                        match={match}
                    />
                ))}
            </div>
        </div>
    );
};

export default Home;
```

### Breaking Down This Component

```jsx
// 1. STATE DECLARATIONS
const [matches, setMatches] = useState([]);
// matches = Current list of matches
// setMatches = Function to update the list
// useState([]) = Start with empty array

const [loading, setLoading] = useState(true);
// loading = Is data still being fetched?
// Start with true (we're loading initially)

// 2. useEffect - Runs when component mounts
useEffect(() => {
    fetchData();  // Fetch data on first render
}, []);
//  └─ Empty array = Run only once (on mount)

// 3. Fetching data
const fetchData = async () => {
    setLoading(true);           // Start loading
    const res = await api.get('/matches');  // Fetch from API
    setMatches(res.data.data);  // Update state with data
    setLoading(false);          // Stop loading
};

// 4. Conditional rendering
if (loading) {
    return <div>Loading...</div>;  // Show this while loading
}
// Otherwise, show main content

// 5. Map over array to create components
{matches.map(match => (
    <MatchCard key={match._id} match={match} />
))}
// For each match, create a MatchCard component
```

---

## 🔄 useEffect Hook - Side Effects

**useEffect** runs code at specific times (on mount, update, unmount)

### Basic Usage

```jsx
import { useEffect } from 'react';

useEffect(() => {
    // Code to run
    console.log('Component rendered');
});
// Runs EVERY render (no dependency array)

useEffect(() => {
    console.log('Component mounted');
}, []);
// Runs ONCE on mount (empty dependency array)

useEffect(() => {
    console.log('Count changed');
}, [count]);
// Runs when 'count' changes (dependency array with count)
```

### Common Use Cases

#### 1. Fetch Data on Mount

```jsx
useEffect(() => {
    const fetchMatches = async () => {
        const res = await api.get('/matches');
        setMatches(res.data.data);
    };
    
    fetchMatches();
}, []);  // Empty array = run once on mount
```

#### 2. Listen to State Changes

```jsx
useEffect(() => {
    console.log('Selected sport:', selectedSport);
    // Fetch filtered matches
    fetchMatchesBySport(selectedSport);
}, [selectedSport]);  // Runs when selectedSport changes
```

#### 3. Set Up/Clean Up Subscriptions

```jsx
useEffect(() => {
    // Set up socket listener
    socket.on('matchUpdate', handleUpdate);
    
    // Clean up function
    return () => {
        socket.off('matchUpdate', handleUpdate);
    };
}, []);
```

#### 4. Update Document Title

```jsx
useEffect(() => {
    document.title = `${matches.length} Matches`;
}, [matches.length]);
```

---

## 🎯 Real Example: Leaderboard Component

**File:** `client/src/pages/public/Leaderboard.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const Leaderboard = () => {
    // STATE
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);
    
    // EFFECT: Fetch on mount
    useEffect(() => {
        fetchStandings();
    }, []);
    
    // FETCH FUNCTION
    const fetchStandings = async () => {
        try {
            const res = await api.get('/leaderboard');
            setStandings(res.data.data || res.data);
        } catch (error) {
            console.error('Error:', error);
            setStandings([]);
        } finally {
            setLoading(false);
        }
    };
    
    // EVENT HANDLER
    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
        // If clicked row is already expanded, collapse it
        // Otherwise, expand clicked row
    };
    
    // HELPER FUNCTION
    const getRankIcon = (rank) => {
        if (rank === 0) return '🥇';
        if (rank === 1) return '🥈';
        if (rank === 2) return '🥉';
        return `#${rank + 1}`;
    };
    
    // CONDITIONAL RENDERING
    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading standings...</p>
            </div>
        );
    }
    
    // MAIN RENDER
    return (
        <div className="leaderboard">
            <h1>General Championship</h1>
            
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Department</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map((dept, index) => (
                        <tr 
                            key={dept._id}
                            onClick={() => toggleRow(dept._id)}
                            className={expandedRow === dept._id ? 'expanded' : ''}
                        >
                            <td>{getRankIcon(index)}</td>
                            <td>{dept.name}</td>
                            <td>{dept.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;
```

### Key Concepts in This Component

```jsx
// 1. Initial state with different types
const [standings, setStandings] = useState([]);      // Array
const [loading, setLoading] = useState(true);        // Boolean
const [expandedRow, setExpandedRow] = useState(null); // Null/String

// 2. useEffect for data fetching
useEffect(() => {
    fetchStandings();  // Async function
}, []);  // Run once on mount

// 3. Try-catch-finally pattern
try {
    const res = await api.get('/leaderboard');
    setStandings(res.data.data);
} catch (error) {
    console.error(error);
    setStandings([]);  // Set empty array on error
} finally {
    setLoading(false);  // Always stop loading
}

// 4. Conditional rendering
if (loading) {
    return <Loading />;  // Show loader
}
return <MainContent />;  // Show content

// 5. Map to create list
{standings.map((dept, index) => (
    <tr key={dept._id}>
        <td>{getRankIcon(index)}</td>
        <td>{dept.name}</td>
    </tr>
))}
// Creates a table row for each department

// 6. Event handlers
onClick={() => toggleRow(dept._id)}
// When clicked, run toggleRow function

// 7. Conditional className
className={expandedRow === dept._id ? 'expanded' : ''}
// If this row is expanded, add 'expanded' class
```

---

## 📋 Lists and Keys

When rendering lists, each item needs a unique **key**.

```jsx
// ✅ GOOD: Unique key
{matches.map(match => (
    <MatchCard key={match._id} match={match} />
))}

// ❌ BAD: Using index as key
{matches.map((match, index) => (
    <MatchCard key={index} match={match} />
))}
// Only use index if items never reorder

// ❌ BAD: No key
{matches.map(match => (
    <MatchCard match={match} />
))}
// React will warn you
```

**Why keys matter:**
```jsx
// Without keys:
[Match A, Match B, Match C]  →  [Match B, Match C, Match A]
// React doesn't know items moved, recreates all

// With keys:
[{id: 1}, {id: 2}, {id: 3}]  →  [{id: 2}, {id: 3}, {id: 1}]
// React knows items moved, just reorders
```

---

## 🎨 Conditional Rendering

```jsx
// 1. IF STATEMENT (before return)
function Match({ match }) {
    if (!match) {
        return <div>No match found</div>;
    }
    
    return <div>{match.sport}</div>;
}

// 2. TERNARY OPERATOR (inline)
function Match({ match }) {
    return (
        <div>
            {match.status === 'LIVE' ? (
                <span className="live">LIVE</span>
            ) : (
                <span>{match.status}</span>
            )}
        </div>
    );
}

// 3. AND OPERATOR (show if true)
function Match({ match }) {
    return (
        <div>
            {match.status === 'LIVE' && <span>LIVE</span>}
            {/* Only shows if status is LIVE */}
        </div>
    );
}

// 4. OPTIONAL CHAINING (safe access)
function Match({ match }) {
    return (
        <div>
            {match.scoreA?.runs || 0}
            {/* If scoreA exists, show runs, else 0 */}
        </div>
    );
}
```

---

## 🔧 Event Handling

```jsx
function MatchForm() {
    const [sport, setSport] = useState('');
    
    // 1. Basic event handler
    const handleClick = () => {
        console.log('Button clicked');
    };
    
    // 2. Event handler with parameter
    const handleSportChange = (e) => {
        setSport(e.target.value);
    };
    
    // 3. Form submission
    const handleSubmit = (e) => {
        e.preventDefault();  // Prevent page reload
        console.log('Form submitted');
    };
    
    return (
        <form onSubmit={handleSubmit}>
            {/* Click event */}
            <button onClick={handleClick}>Click Me</button>
            
            {/* Change event */}
            <select onChange={handleSportChange}>
                <option value="CRICKET">Cricket</option>
                <option value="FOOTBALL">Football</option>
            </select>
            
            {/* Inline arrow function */}
            <button onClick={() => console.log('Inline')}>
                Click
            </button>
            
            <button type="submit">Submit</button>
        </form>
    );
}
```

---

## 🎯 Forms in React

```jsx
function CreateMatchForm() {
    const [formData, setFormData] = useState({
        sport: '',
        teamA: '',
        teamB: '',
        venue: ''
    });
    
    // Handle input change
    const handleChange = (e) => {
        setFormData({
            ...formData,  // Keep existing values
            [e.target.name]: e.target.value  // Update changed field
        });
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const res = await api.post('/matches/create', formData);
            console.log('Match created:', res.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                placeholder="Sport"
            />
            
            <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="Venue"
            />
            
            <select 
                name="teamA" 
                value={formData.teamA}
                onChange={handleChange}
            >
                <option value="">Select Team A</option>
                <option value="cse">CSE</option>
                <option value="ce">CE</option>
            </select>
            
            <button type="submit">Create Match</button>
        </form>
    );
}
```

---

## 🚦 React Router - Navigation

**File:** `client/src/App.jsx`

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/public/Home';
import Leaderboard from './pages/public/Leaderboard';
import MatchDetail from './pages/public/MatchDetail';

function App() {
    return (
        <Router>
            <Routes>
                {/* Map URL paths to components */}
                <Route path="/" element={<Home />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/match/:id" element={<MatchDetail />} />
            </Routes>
        </Router>
    );
}
```

### Navigation

```jsx
import { Link, useNavigate, useParams } from 'react-router-dom';

function Navigation() {
    const navigate = useNavigate();
    
    return (
        <nav>
            {/* Link component (declarative) */}
            <Link to="/">Home</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/match/12345">Match Details</Link>
            
            {/* Programmatic navigation */}
            <button onClick={() => navigate('/leaderboard')}>
                Go to Leaderboard
            </button>
        </nav>
    );
}

function MatchDetail() {
    // Get URL parameter
    const { id } = useParams();
    // URL: /match/12345
    // id = '12345'
    
    return <div>Match ID: {id}</div>;
}
```

---

## ✅ Key React Concepts Summary

1. **Components**
   - Reusable pieces of UI
   - Accept props (data)
   - Return JSX

2. **Props**
   - Data passed to components
   - Read-only
   - Flow from parent to child

3. **State**
   - Data that changes
   - Managed with useState
   - Triggers re-render when updated

4. **useEffect**
   - Side effects (API calls, subscriptions)
   - Runs at specific times
   - Can clean up

5. **Event Handling**
   - onClick, onChange, onSubmit
   - Update state on events

6. **Conditional Rendering**
   - Show/hide based on conditions
   - &&, ternary, if statements

7. **Lists**
   - Map array to JSX
   - Need unique keys

---

## 🚀 Next Chapter

Now let's learn how frontend communicates with backend!

**Next:** [Chapter 7: API Communication & Async](./07-API-AND-ASYNC.md)

---

*Remember: React makes UIs interactive and dynamic!*
