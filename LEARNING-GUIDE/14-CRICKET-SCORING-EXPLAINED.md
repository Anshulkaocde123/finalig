# Chapter 14: Cricket Scoring System Deep Dive 🏏

## What You'll Learn

By the end of this chapter, you'll understand:
- Complete cricket scoring logic implementation
- Bowler selection with real-time validation
- Department name population for display
- Comprehensive validation rules for cricket
- Socket.io emissions for real-time updates
- Undo functionality with stat reversal
- Edge case handling and debugging

---

## Part 1: Cricket Scoring Architecture

### **The Complete Flow**

```
CRICKET MATCH LIFECYCLE:

┌─────────────────────────────────────────┐
│       1. MATCH CREATION                  │
│  - Create CricketMatch document          │
│  - Set squads (squadA, squadB)          │
│  - Initialize scores (scoreA, scoreB)   │
│  - Set totalOvers (default: 20)         │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│       2. TOSS & BATTING TEAM             │
│  - Decide who bats first                │
│  - Set battingTeam: 'A' or 'B'          │
│  - Determine bowling team               │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│       3. SELECT PLAYERS                  │
│  - Select striker batsman               │
│  - Select non-striker batsman           │
│  - Select current bowler                │
│  - Initialize player stats              │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│       4. BALL-BY-BALL UPDATES            │
│  - Add runs (0-7 per ball)              │
│  - Update batsman stats                 │
│  - Update bowler stats                  │
│  - Track extras (wide, no-ball, etc)    │
│  - Handle wickets                       │
│  - Switch strike on odd runs            │
│  - Increment overs (5.6 → 6.0)          │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│       5. INNINGS MANAGEMENT              │
│  - End over (6 legal deliveries)        │
│  - Swap innings (1st → 2nd)             │
│  - Calculate target for 2nd innings     │
│  - Track required run rate              │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│       6. MATCH COMPLETION                │
│  - Status: COMPLETED                    │
│  - Block further updates                │
│  - Calculate final result               │
│  - Update leaderboard                   │
└─────────────────────────────────────────┘
```

---

## Part 2: Bowler Selection Logic (Recent Rewrite)

### **The Problem We Fixed**

**Issue:** When admin clicked "Change Bowler" and selected a player, the wrong bowler was being selected.

**Example Bug:**
```
Admin selects: "CIVIL Player 2"
System found:  "CIVIL Player 1" ❌

Why? The find() logic was matching the first player instead of exact match!
```

### **The Complete Fix**

**File:** `server/controllers/sports/cricketController.js` (Lines 340-455)

#### **Step 1: Request Logging**

```javascript
console.log('🎳 SELECT BOWLER REQUEST:', { 
    requestedName: bowlerName,  // "CIVIL Player 2"
    requestedId: bowlerId,      // undefined or ID
    battingTeam: match.battingTeam,  // "A"
    bowlingTeam: match.battingTeam === 'A' ? 'B' : 'A'  // "B"
});
```

**Why?** We need to see exactly what the admin requested.

#### **Step 2: Determine Bowling Squad**

```javascript
// If Team A is batting, Team B is bowling
const bowlingSquad = match.battingTeam === 'A' ? match.squadB : match.squadA;

console.log('🎳 Bowling squad:', 
    bowlingSquad.map((p, idx) => `${idx}: ${p.playerName}`)
);
// Output: ['0: CIVIL Player 1', '1: CIVIL Player 2', '2: CIVIL Player 3', ...]
```

**Why?** We need to know which squad to search in.

#### **Step 3: Clear Previous Bowler Flags**

```javascript
// Clear ALL previous bowler flags
bowlingSquad.forEach(p => {
    p.isCurrentBowler = false;
});
```

**Why?** Ensure only one bowler is marked as current.

#### **Step 4: ID-First Search with Logging**

```javascript
let bowler = null;

// Try to find by ID first (most accurate)
if (bowlerId) {
    bowler = bowlingSquad.find(p => 
        p._id && p._id.toString() === bowlerId.toString()
    );
    console.log(`🎳 Search by ID: ${bowlerId} → ${bowler ? 'FOUND' : 'NOT FOUND'}`);
}
```

**Why?** MongoDB ObjectIds are unique and guaranteed to match exact player.

#### **Step 5: Exact Name Matching with Per-Comparison Logging**

```javascript
// If ID search failed, try name matching with detailed logging
if (!bowler && bowlerName) {
    console.log(`🎳 Starting name search for: "${bowlerName}"`);
    
    bowler = bowlingSquad.find(p => {
        const playerName = p.playerName || p.name;
        const matches = playerName === bowlerName;  // EXACT match!
        
        // Log each comparison
        console.log(`  🔍 Checking "${playerName}" === "${bowlerName}": ${matches}`);
        
        return matches;
    });
    
    console.log(`🎳 Search by name: ${bowlerName} → ${bowler ? 'FOUND' : 'NOT FOUND'}: ${bowler?.playerName || 'N/A'}`);
}
```

**Critical Fix:** We use `===` for EXACT match, not `.includes()` or partial match!

**Example Output:**
```
🎳 Starting name search for: "CIVIL Player 2"
  🔍 Checking "CIVIL Player 1" === "CIVIL Player 2": false
  🔍 Checking "CIVIL Player 2" === "CIVIL Player 2": true
🎳 Search by name: CIVIL Player 2 → FOUND: CIVIL Player 2
```

#### **Step 6: Auto-Create If Not in Squad**

```javascript
if (!bowler && bowlerName) {
    console.log(`⚠️ Bowler "${bowlerName}" not in squad, creating...`);
    
    bowler = {
        playerName: bowlerName,
        oversBowled: 0,
        ballsBowled: 0,
        runsConceded: 0,
        wicketsTaken: 0,
        maidens: 0,
        wides: 0,
        noBalls: 0,
        isCurrentBowler: true
    };
    bowlingSquad.push(bowler);
}
```

**Why?** If admin adds a new bowler not in original squad, we create them on-the-fly.

#### **Step 7: Mark as Current & Build Stats Object**

```javascript
// Mark as current bowler
bowler.isCurrentBowler = true;

// Update match.currentBowler with ALL stats preserved
match.currentBowler = {
    playerName: bowler.playerName,
    oversBowled: bowler.oversBowled ?? 0,    // Nullish coalescing
    ballsBowled: bowler.ballsBowled ?? 0,
    runsConceded: bowler.runsConceded ?? 0,
    wicketsTaken: bowler.wicketsTaken ?? 0,
    maidens: bowler.maidens ?? 0
};
```

**Why `??` instead of `||`?**
- `??` only replaces `null` or `undefined`
- `||` replaces `0`, `false`, `''` (which are valid values!)

```javascript
// Example:
bowler.wicketsTaken = 0;

// BAD:
const wickets = bowler.wicketsTaken || 5;  // → 5 (wrong! loses 0)

// GOOD:
const wickets = bowler.wicketsTaken ?? 5;  // → 0 (correct!)
```

#### **Step 8: Success Logging**

```javascript
console.log('✅ BOWLER SELECTED:', {
    name: bowler.playerName,
    stats: `${bowler.oversBowled ?? 0}-${bowler.maidens ?? 0}-${bowler.runsConceded ?? 0}-${bowler.wicketsTaken ?? 0}`
});
```

#### **Step 9: Save, Populate, Emit, Respond**

```javascript
await match.save();

// Populate team names for display
const populatedMatch = await CricketMatch.findById(matchId)
    .populate('teamA', 'name shortCode logo')
    .populate('teamB', 'name shortCode logo');

console.log('📡 Broadcasting bowler change via Socket.io');

// Emit to all connected clients
const io = req.app.get('io');
if (io) io.emit('matchUpdate', populatedMatch);

// Return populated match (contains department names!)
return res.json({ 
    success: true, 
    message: 'Bowler selected', 
    data: populatedMatch  // ← Important! Not `match`
});
```

---

## Part 3: Department Name Population Fix

### **The Bug**

After updating cricket score, team names changed from "CIVIL" to "Team A" / "Team B".

**Root Cause:**
```javascript
// ❌ BAD (old code):
res.status(200).json({ success: true, data: match });
```

The `match` object has `teamA` and `teamB` as ObjectIds, not populated documents!

### **The Fix**

```javascript
// ✅ GOOD (new code):
const populatedMatch = await CricketMatch.findById(matchId)
    .populate('teamA', 'name shortCode logo')
    .populate('teamB', 'name shortCode logo');

res.status(200).json({ success: true, data: populatedMatch });
```

**What `.populate()` does:**

```javascript
// BEFORE populate:
match.teamA = ObjectId("507f1f77bcf86cd799439011")
match.teamB = ObjectId("507f191e810c19729de860ea")

// AFTER populate:
match.teamA = {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    name: "CIVIL ENGINEERING",
    shortCode: "CIVIL",
    logo: "/uploads/civil.png"
}
match.teamB = {
    _id: ObjectId("507f191e810c19729de860ea"),
    name: "COMPUTER SCIENCE",
    shortCode: "CSE",
    logo: "/uploads/cse.png"
}
```

---

## Part 4: Comprehensive Validation Rules

### **Cricket-Specific Validation**

#### **Runs Per Ball: 0-7 Maximum**

```javascript
// Validation code (Lines 626-627):
const validRuns = Math.max(0, Math.min(Math.floor(runsToAdd), 7));
batsmanInSquad.runsScored = Math.max(0, (batsmanInSquad.runsScored ?? 0) + validRuns);
```

**Breakdown:**
1. `Math.floor(runsToAdd)` → Ensure integer (no decimals)
2. `Math.min(runsToAdd, 7)` → Cap at 7 (no-ball with 6 runs = 7 total)
3. `Math.max(0, ...)` → Never negative
4. `?? 0` → Default to 0 if undefined

**Edge Cases:**
```javascript
runsToAdd = 10     → validRuns = 7
runsToAdd = -5     → validRuns = 0
runsToAdd = 3.7    → validRuns = 3
runsToAdd = null   → validRuns = 0
```

#### **Wickets: Maximum 10**

```javascript
// Line 787:
const newWickets = (score.wickets ?? 0) + wicketVal;
score.wickets = Math.max(0, Math.min(10, newWickets));
```

**Why 10?** In cricket, a team has 11 players. When 10 are out, team is "all out" (last player can't bat alone).

#### **Overs: 5.6 → 6.0 Conversion**

```javascript
// Lines 891-903:
let totalBalls = Math.round(score.overs * 10);
const fullOvers = Math.floor(totalBalls / 10);
const ballsInOver = totalBalls % 10;

let actualBalls = (fullOvers * 6) + ballsInOver;

if (undo) {
    actualBalls = Math.max(0, actualBalls - 1);
} else {
    actualBalls += 1;
}

const newFullOvers = Math.floor(actualBalls / 6);
const newBallsInOver = actualBalls % 6;
score.overs = newFullOvers + (newBallsInOver / 10);
```

**Example:**
```javascript
// Current: 5.5 (5 overs, 5 balls)
score.overs = 5.5
totalBalls = 55
fullOvers = 5
ballsInOver = 5
actualBalls = (5 * 6) + 5 = 35

// Add 1 ball:
actualBalls = 36
newFullOvers = Math.floor(36 / 6) = 6
newBallsInOver = 36 % 6 = 0
score.overs = 6 + (0 / 10) = 6.0  ✅

// This is correct! 5.5 → 6.0 (not 5.6)
```

#### **Non-Negative Stats**

```javascript
// All player stats use Math.max(0, value):
batsmanInSquad.ballsFaced = Math.max(0, (batsmanInSquad.ballsFaced ?? 0) + 1);
batsmanInSquad.fours = Math.max(0, (batsmanInSquad.fours ?? 0) + 1);
batsmanInSquad.sixes = Math.max(0, (batsmanInSquad.sixes ?? 0) + 1);

bowlerInSquad.runsConceded = Math.max(0, (bowlerInSquad.runsConceded ?? 0) + runs);
bowlerInSquad.wicketsTaken = Math.max(0, (bowlerInSquad.wicketsTaken ?? 0) + 1);
```

---

## Part 5: Undo Functionality with Stat Reversal

### **The Challenge**

When admin clicks "Undo", we need to reverse:
- Team score (runs, wickets, overs)
- Batsman stats (runs, balls, boundaries)
- Bowler stats (runs conceded, balls bowled, wickets)

### **Implementation**

```javascript
// Lines 540-565 (Undo batsman stats):
if (match.currentBatsmen?.striker?.playerName) {
    const strikerName = match.currentBatsmen.striker.playerName;
    const batsmanInSquad = battingSquad.find(p => p.playerName === strikerName);
    
    if (batsmanInSquad) {
        // Reverse runs
        const runsMatch = lastAction.action.match(/(\d+)\s+runs?/);
        if (runsMatch) {
            const runsToRemove = parseInt(runsMatch[1]);
            batsmanInSquad.runsScored = Math.max(0, (batsmanInSquad.runsScored ?? 0) - runsToRemove);
        }
        
        // Reverse balls faced (if legal delivery)
        if (lastAction.action.includes('run') && !lastAction.action.includes('Wide')) {
            batsmanInSquad.ballsFaced = Math.max(0, (batsmanInSquad.ballsFaced ?? 0) - 1);
        }
        
        // Reverse boundaries
        if (lastAction.action.includes('FOUR')) {
            batsmanInSquad.fours = Math.max(0, (batsmanInSquad.fours ?? 0) - 1);
        }
        if (lastAction.action.includes('SIX')) {
            batsmanInSquad.sixes = Math.max(0, (batsmanInSquad.sixes ?? 0) - 1);
        }
        
        // Sync with display object
        match.currentBatsmen.striker.runsScored = batsmanInSquad.runsScored;
        match.currentBatsmen.striker.ballsFaced = batsmanInSquad.ballsFaced;
    }
}

// Lines 568-592 (Undo bowler stats):
if (match.currentBowler?.playerName) {
    const bowlerInSquad = bowlingSquad.find(p => p.playerName === match.currentBowler.playerName);
    if (bowlerInSquad) {
        // Reverse runs conceded
        const runsMatch = lastAction.action.match(/(\d+)\s+runs?/);
        if (runsMatch) {
            const runsToRemove = parseInt(runsMatch[1]);
            bowlerInSquad.runsConceded = Math.max(0, (bowlerInSquad.runsConceded ?? 0) - runsToRemove);
        }
        
        // Reverse wicket
        if (lastAction.action.includes('Wicket')) {
            bowlerInSquad.wicketsTaken = Math.max(0, (bowlerInSquad.wicketsTaken ?? 0) - 1);
        }
        
        // Reverse balls bowled (if legal delivery)
        if (!lastAction.action.includes('Wide') && !lastAction.action.includes('No Ball')) {
            bowlerInSquad.ballsBowled = Math.max(0, (bowlerInSquad.ballsBowled ?? 0) - 1);
            
            // Recalculate overs
            const totalBalls = bowlerInSquad.ballsBowled;
            const overs = Math.floor(totalBalls / 6);
            const balls = totalBalls % 6;
            bowlerInSquad.oversBowled = parseFloat((overs + (balls / 10)).toFixed(1));
        }
        
        // Sync with display object
        match.currentBowler.runsConceded = bowlerInSquad.runsConceded;
        match.currentBowler.ballsBowled = bowlerInSquad.ballsBowled;
        match.currentBowler.oversBowled = bowlerInSquad.oversBowled;
    }
}
```

---

## Part 6: Completed Match Protection

### **The Problem**

After match is completed, admin should not be able to:
- Change batsman
- Change bowler
- Add runs
- Switch strike

### **The Fix**

```javascript
// Lines 178-181 (Select Batsman):
if (match.status === 'COMPLETED') {
    res.status(400);
    throw new Error('Cannot select batsman on a completed match');
}

// Lines 342-345 (Select Bowler):
if (match.status === 'COMPLETED') {
    res.status(400);
    throw new Error('Cannot change bowler on a completed match');
}

// Lines 148-151 (Switch Strike):
if (match.status === 'COMPLETED') {
    res.status(400);
    throw new Error('Cannot switch strike on a completed match');
}

// Lines 164-167 (End Over):
if (match.status === 'COMPLETED') {
    res.status(400);
    throw new Error('Cannot end over on a completed match');
}
```

---

## Part 7: Frontend Bowler Modal Enhancement

### **The Problem**

Bowler selection modal was NOT showing all bowlers - it filtered out the current bowler!

### **Old Code (Broken)**

```javascript
// client/src/components/CricketAdminControls.jsx (BEFORE):
const availableBowlers = useMemo(() => {
    return bowlingSquad.filter(p => {
        const playerName = p.name || p.playerName;
        const isCurrentBowler = currentBowler?.playerName === playerName;
        
        return !isCurrentBowler && playerName;  // ❌ Excludes current bowler!
    });
}, [bowlingSquad, currentBowler]);
```

**Problem:** Admin couldn't see who the current bowler is in the list!

### **New Code (Fixed)**

```javascript
// Lines 57-70 (AFTER):
const availableBowlers = useMemo(() => {
    if (!bowlingSquad || bowlingSquad.length === 0) return [];
    
    return bowlingSquad
        .filter(p => {
            const playerName = p.name || p.playerName;
            return playerName;  // Include ALL bowlers with a name
        })
        .map(p => ({
            ...p,
            // Flag current bowler for styling
            isCurrentBowler: currentBowler?.playerName === (p.playerName || p.name)
        }));
}, [bowlingSquad, currentBowler]);
```

**Changes:**
1. ✅ Shows ALL bowlers (removed `!isCurrentBowler`)
2. ✅ Adds `isCurrentBowler` flag for visual indication
3. ✅ Preserves all player data

### **Visual Indicators (Lines 532-565)**

```jsx
{availableBowlers.map(player => (
    <motion.button
        key={player._id || player.playerId}
        onClick={() => handleSelectBowler(player)}
        className={`w-full p-4 ${
            player.isCurrentBowler 
                ? 'bg-green-900/50 border-green-500'  // Green for current
                : 'bg-slate-800 hover:bg-blue-900/50'  // Normal
        } border rounded-xl`}
    >
        <div className="flex justify-between items-center">
            <div>
                <div className="text-white font-bold">
                    {player.playerName || player.name}
                    {player.isCurrentBowler && (
                        <span className="ml-2 text-xs bg-green-600 px-2 py-1 rounded">
                            Current
                        </span>
                    )}
                </div>
                {/* Show stats */}
                <div className="text-slate-400 text-sm">
                    {player.oversBowled || 0}-{player.maidens || 0}-{player.runsConceded || 0}-{player.wicketsTaken || 0}
                </div>
            </div>
        </div>
    </motion.button>
))}
```

**Result:**
- Current bowler: Green background + "Current" badge
- Other bowlers: Normal background
- All show their stats: `Overs-Maidens-RunsConceded-Wickets`

---

## Part 8: Real-Time Socket.io Updates

### **How It Works**

Every cricket update triggers Socket.io emission:

```javascript
// After saving match:
await match.save();

// Populate team names:
const populatedMatch = await CricketMatch.findById(matchId)
    .populate('teamA', 'name shortCode logo')
    .populate('teamB', 'name shortCode logo');

// Get Socket.io instance:
const io = req.app.get('io');

// Broadcast to ALL connected clients:
if (io) io.emit('matchUpdate', populatedMatch);
```

### **Frontend Listening**

```javascript
// client/src/socket.js:
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('matchUpdate', (updatedMatch) => {
    console.log('📡 Received match update:', updatedMatch);
    // Update local state
    setMatch(updatedMatch);
});
```

**Result:**
- Admin adds 4 runs → ALL users see score update instantly
- Admin changes bowler → ALL users see new bowler name
- <100ms latency (near-instant)

---

## Part 9: Debugging Techniques Used

### **1. Detailed Console Logging**

```javascript
console.log('🎳 SELECT BOWLER REQUEST:', { requestedName, requestedId });
console.log('🎳 Bowling squad:', bowlingSquad.map((p, idx) => `${idx}: ${p.playerName}`));
console.log(`  🔍 Checking "${playerName}" === "${bowlerName}": ${matches}`);
console.log('✅ BOWLER SELECTED:', { name, stats });
console.log('📡 Broadcasting bowler change via Socket.io');
```

**Why emojis?**
- Easy to spot in terminal
- Visually distinct from other logs
- Makes debugging fun! 😄

### **2. Per-Comparison Logging**

Instead of:
```javascript
// ❌ No visibility:
const bowler = bowlingSquad.find(p => p.playerName === bowlerName);
```

We do:
```javascript
// ✅ Full visibility:
const bowler = bowlingSquad.find(p => {
    const playerName = p.playerName || p.name;
    const matches = playerName === bowlerName;
    console.log(`  🔍 Checking "${playerName}" === "${bowlerName}": ${matches}`);
    return matches;
});
```

**Benefit:** We see EVERY comparison, making it obvious which player matched.

### **3. Request/Response Logging**

```javascript
// Log what was requested:
console.log('🎳 SELECT BOWLER REQUEST:', { requestedName: 'Player 2' });

// Log what was found:
console.log('🎳 Search result:', { found: 'Player 2', stats: '0-0-0-0' });

// Log what was returned:
console.log('📡 Broadcasting:', { bowlerName: 'Player 2' });
```

---

## Summary

### **Key Changes Made**

✅ **Bowler Selection:** Complete rewrite with exact matching and detailed logging  
✅ **Department Names:** Populate teams in response for correct display  
✅ **Validation:** Comprehensive bounds checking (runs 0-7, wickets max 10)  
✅ **Undo Logic:** Properly reverses batsman AND bowler stats  
✅ **Completed Match:** Blocks updates after match completion  
✅ **Bowler Modal:** Shows ALL bowlers with current indicator  
✅ **Socket.io:** Real-time updates with populated data  

### **Files Modified**

1. `server/controllers/sports/cricketController.js` - Main scoring logic
2. `client/src/components/CricketAdminControls.jsx` - Admin UI
3. `server/controllers/sports/scoreController.js` - Timer validation
4. `server/controllers/sports/setController.js` - Set validation

### **Testing Checklist**

- [x] Select bowler → Correct player selected
- [x] Change bowler → Stats preserved
- [x] Add runs → Batsman/bowler stats updated
- [x] Undo → Stats reversed correctly
- [x] Department names → Display "CIVIL" not "Team A"
- [x] Wickets → Maximum 10 enforced
- [x] Overs → 5.6 → 6.0 conversion works
- [x] Socket.io → Real-time updates instant
- [x] Completed match → Updates blocked

---

**Next Chapter:** Advanced Cricket Features (Target Calculation, Run Rate, Partnerships) →

