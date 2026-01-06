# Chapter 11: Postman - API Testing & Documentation 📬

## Table of Contents
1. [What is Postman?](#what-is-postman)
2. [Installing Postman](#installing-postman)
3. [HTTP Methods & Requests](#http-methods--requests)
4. [Request Components](#request-components)
5. [Testing Endpoints](#testing-endpoints)
6. [Collections & Environments](#collections--environments)
7. [Real API Examples](#real-api-examples)
8. [Assertions & Validations](#assertions--validations)
9. [Debugging Tips](#debugging-tips)

---

## What is Postman?

**Postman** is a tool for testing, documenting, and using APIs.

### Why Postman?

```
BEFORE Postman (Manual Testing):
1. Open browser console
2. Use fetch() or axios
3. Type request manually
4. Check response manually
5. No organized documentation

❌ Time-consuming
❌ Error-prone
❌ Difficult to share with team
```

```
WITH Postman (Professional Testing):
1. Click to build request
2. Visual interface
3. Auto-format responses
4. Save requests for reuse
5. Generate documentation
6. Share with team

✅ Fast and efficient
✅ Organized
✅ Team collaboration
✅ Professional documentation
```

### Postman vs Code Examples

```javascript
// JavaScript (Code)
const response = await fetch('http://localhost:5000/api/departments', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer token123'
    }
});
const data = await response.json();
console.log(data);
```

**VS**

**Postman (Visual)**
- Click "GET" dropdown
- Enter URL
- Add headers
- Click "Send"
- View formatted response
- Click "Save"

**Postman is easier for testing!**

---

## Installing Postman

### Download & Install

1. **Visit:** https://www.postman.com/downloads/
2. **Download** appropriate version (Windows, Mac, Linux)
3. **Install** and launch
4. **Sign up** (free account)

### First Launch

```
Welcome Screen
├── Create New
│   ├── Request
│   ├── Collection
│   └── Environment
├── Open Recent
└── Learn
```

---

## HTTP Methods & Requests

### What are HTTP Methods?

HTTP methods are **verbs** that tell the server what operation to perform.

### The Main HTTP Methods

```
┌─────────┬───────────────────────────┬────────────────────┐
│ Method  │ Purpose                   │ Uses Query/Body?   │
├─────────┼───────────────────────────┼────────────────────┤
│ GET     │ Retrieve data             │ Query params       │
│ POST    │ Create new data           │ Request body       │
│ PUT     │ Replace entire document   │ Request body       │
│ PATCH   │ Update specific fields    │ Request body       │
│ DELETE  │ Remove data               │ Optional           │
└─────────┴───────────────────────────┴────────────────────┘
```

### Detailed Explanation

#### GET - Retrieve Data

```
Purpose: Fetch data FROM server
Safe: YES (doesn't change data)
Idempotent: YES (same result every time)

Syntax:
  GET /api/departments
  GET /api/departments/:id
  GET /api/departments?sport=CRICKET

Response: 200 OK + Data
```

**Example in Postman:**
```
Method: GET
URL: http://localhost:5000/api/departments
Click: Send

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "645abc123...",
      "name": "Computer Science",
      "shortCode": "CSE",
      "logo": "/uploads/cse.png"
    },
    ...
  ]
}
```

#### POST - Create Data

```
Purpose: Send data TO server to create new record
Safe: NO (changes data)
Idempotent: NO (creates new record each time)

Syntax:
  POST /api/departments

Body: { Data to create }

Response: 201 Created + New data with _id
```

**Example in Postman:**
```
Method: POST
URL: http://localhost:5000/api/departments

Body (JSON):
{
  "name": "Computer Science",
  "shortCode": "CSE",
  "logo": "/uploads/cse.png"
}

Click: Send

Response:
{
  "success": true,
  "data": {
    "_id": "645abc123...",
    "name": "Computer Science",
    "shortCode": "CSE",
    "logo": "/uploads/cse.png",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

#### PUT - Replace Entire Document

```
Purpose: Replace entire document with new data
Safe: NO (changes data)
Idempotent: YES (replaces everything)

Syntax:
  PUT /api/departments/:id

Body: { Complete new data }

Response: 200 OK + Updated data
```

**Example in Postman:**
```
Method: PUT
URL: http://localhost:5000/api/departments/645abc123...

Body (JSON):
{
  "name": "Computer Science Engineering",
  "shortCode": "CSE",
  "logo": "/uploads/cse-new.png"
}

Response: 200 OK + Updated document
```

#### PATCH - Partial Update

```
Purpose: Update ONLY specific fields
Safe: NO (changes data)
Idempotent: NO (partial updates)

Syntax:
  PATCH /api/departments/:id

Body: { Only fields to update }

Response: 200 OK + Updated data
```

**Example in Postman:**
```
Method: PATCH
URL: http://localhost:5000/api/departments/645abc123...

Body (JSON):
{
  "logo": "/uploads/cse-updated.png"
}

Response: 200 OK + Full updated document
```

#### DELETE - Remove Data

```
Purpose: Delete record from database
Safe: NO (changes data)
Idempotent: YES (always removes)

Syntax:
  DELETE /api/departments/:id

Body: (optional)

Response: 200 OK + Deleted data OR 204 No Content
```

**Example in Postman:**
```
Method: DELETE
URL: http://localhost:5000/api/departments/645abc123...

Click: Send

Response:
{
  "success": true,
  "message": "Department deleted successfully"
}
```

---

## Request Components

### Anatomy of an HTTP Request

```
┌─────────────────────────────────────────────┐
│ REQUEST LINE                                │
│ METHOD  PATH  HTTP_VERSION                  │
│ POST /api/departments HTTP/1.1              │
├─────────────────────────────────────────────┤
│ HEADERS                                     │
│ Key: Value pairs                            │
│ Content-Type: application/json              │
│ Authorization: Bearer token123              │
├─────────────────────────────────────────────┤
│ BLANK LINE (separates headers from body)    │
├─────────────────────────────────────────────┤
│ BODY (Request Data)                         │
│ { JSON data }                               │
└─────────────────────────────────────────────┘
```

### In Postman Interface

```
┌─────────────────────────────────────┐
│ [GET ▼] [URL input field]  [Send] │
├─────────────────────────────────────┤
│ [Params] [Headers] [Body] [Tests]   │
├─────────────────────────────────────┤
│ PARAMS TAB:                         │
│ Key        Value                    │
│ sport  =   CRICKET                  │
│ status =   SCHEDULED                │
├─────────────────────────────────────┤
│ HEADERS TAB:                        │
│ Key              Value              │
│ Content-Type  =  application/json   │
│ Authorization =  Bearer token123    │
├─────────────────────────────────────┤
│ BODY TAB:                           │
│ Raw / Form-data / x-www-form...     │
│ {                                   │
│   "name": "Computer Science"        │
│ }                                   │
└─────────────────────────────────────┘
```

### 1. URL

```javascript
// Format: Protocol://Host:Port/Path?QueryParams

http://localhost:5000/api/departments?sport=CRICKET&limit=10
│       │          │   │     │            │                  │
└─ Protocol        │   Path   Query Parameters ───────────────┘
└─ Host:Port

// Components:
// - Protocol: http:// or https://
// - Host: localhost (your computer)
// - Port: 5000 (server listening port)
// - Path: /api/departments (route)
// - Query: ?sport=CRICKET&limit=10 (filters)
```

**In Postman:**
```
URL: http://localhost:5000/api/departments

OR use Params tab:
[Params Tab]
Key     | Value
--------|--------
sport   | CRICKET
limit   | 10

Postman automatically builds: 
http://localhost:5000/api/departments?sport=CRICKET&limit=10
```

### 2. Headers

Headers are **metadata** about the request.

```javascript
// Common Headers:

Content-Type: application/json
// Tells server: "I'm sending JSON data"

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
// Authentication token for protected routes

User-Agent: Postman/10.0
// Identifies the client making request

Accept: application/json
// Client says: "I accept JSON responses"

Accept-Language: en-US
// Preferred language

Cache-Control: no-cache
// Browser cache instructions
```

**Setting Headers in Postman:**

```
[Headers Tab]

Key                Value
─────────────────  ────────────────────────────
Content-Type       application/json
Authorization      Bearer token123
X-API-Key          your-api-key-here
User-Agent         Postman/10.0
```

### 3. Query Parameters

Parameters in the URL for filtering/searching

```javascript
// URL with Query Parameters:
GET http://localhost:5000/api/matches?sport=CRICKET&status=COMPLETED&page=1&limit=10

// Components:
// sport=CRICKET    -> Filter by sport
// status=COMPLETED -> Filter by status
// page=1           -> Page number for pagination
// limit=10         -> Records per page

// Database Query:
{
  sport: "CRICKET",
  status: "COMPLETED"
}
// Then sort, skip, limit
```

**In Postman (Params Tab):**

```
Instead of typing URL manually:

[Params Tab]
Key     | Value      | Description
--------|------------|─────────────────────
sport   | CRICKET    | Filter by sport type
status  | COMPLETED  | Filter by status
page    | 1          | Page number
limit   | 10         | Results per page

Postman builds the full URL automatically!
```

### 4. Request Body

Data sent to server (used in POST, PUT, PATCH)

```javascript
// POST /api/departments
// Body (JSON):
{
  "name": "Computer Science",
  "shortCode": "CSE",
  "logo": "/uploads/cse.png"
}

// Server receives this data and creates document in database
```

**In Postman (Body Tab):**

```
[Body Tab]

Select: raw (JSON)

Input:
{
  "name": "Computer Science",
  "shortCode": "CSE",
  "logo": "/uploads/cse.png"
}

Postman automatically:
1. Sets Content-Type: application/json header
2. Sends body as JSON
```

---

## Testing Endpoints

### Step-by-Step: Testing GET Request

#### Scenario: Get all departments

**Step 1: Choose Method**
```
Click: GET dropdown (already selected by default)
```

**Step 2: Enter URL**
```
URL Field: http://localhost:5000/api/departments
```

**Step 3: Add Query Parameters (Optional)**
```
Click: [Params] tab
Add:
  Key: limit  | Value: 5
  Key: page   | Value: 1
```

**Step 4: Set Headers (If Needed)**
```
Click: [Headers] tab
Add:
  Key: Authorization  | Value: Bearer token123
```

**Step 5: Send Request**
```
Click: [Send] button
```

**Step 6: View Response**
```
Response appears below:

Status: 200 OK ✅
Time: 145ms
Size: 2.4 KB

Body:
{
  "success": true,
  "count": 5,
  "total": 12,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "645abc...",
      "name": "Computer Science",
      "shortCode": "CSE",
      "logo": "/uploads/cse.png"
    },
    // ... more departments
  ]
}
```

### Step-by-Step: Testing POST Request

#### Scenario: Create a new department

**Step 1: Choose Method**
```
Click: GET dropdown → Select POST
```

**Step 2: Enter URL**
```
URL: http://localhost:5000/api/departments
```

**Step 3: Set Headers**
```
Click: [Headers] tab

Postman usually auto-adds Content-Type, but ensure:
Key: Content-Type | Value: application/json
Key: Authorization | Value: Bearer token123
```

**Step 4: Add Request Body**
```
Click: [Body] tab
Select: raw
Select: JSON (from dropdown)

Type:
{
  "name": "Electrical Engineering",
  "shortCode": "EE",
  "logo": "/uploads/ee.png"
}
```

**Step 5: Send Request**
```
Click: [Send]
```

**Step 6: View Response**
```
Status: 201 Created ✅
Time: 234ms

Body:
{
  "success": true,
  "data": {
    "_id": "645xyz...",
    "name": "Electrical Engineering",
    "shortCode": "EE",
    "logo": "/uploads/ee.png",
    "createdAt": "2025-01-15T14:30:00Z",
    "updatedAt": "2025-01-15T14:30:00Z"
  }
}
```

### Step-by-Step: Testing PUT Request

#### Scenario: Update a department (replace entire record)

**Step 1: Choose Method**
```
Method: PUT
```

**Step 2: Enter URL with ID**
```
URL: http://localhost:5000/api/departments/645xyz...
     (use the _id from previous POST response)
```

**Step 3: Set Headers**
```
Content-Type: application/json
Authorization: Bearer token123
```

**Step 4: Add Complete Body**
```
Body (must include ALL fields):
{
  "name": "Electronics & Electrical Engineering",
  "shortCode": "EEE",
  "logo": "/uploads/eee-new.png"
}
```

**Step 5: Send & Check Response**
```
Status: 200 OK ✅

Response shows updated document with all fields
```

### Step-by-Step: Testing PATCH Request

#### Scenario: Update only the logo field

**Step 1: Choose Method**
```
Method: PATCH
```

**Step 2: Enter URL with ID**
```
URL: http://localhost:5000/api/departments/645xyz...
```

**Step 3: Set Headers**
```
Content-Type: application/json
Authorization: Bearer token123
```

**Step 4: Add Partial Body**
```
Body (only updated field):
{
  "logo": "/uploads/ee-updated.png"
}
```

**Step 5: Send & Check Response**
```
Status: 200 OK ✅

Response shows full document but only logo was changed
```

### Step-by-Step: Testing DELETE Request

#### Scenario: Delete a department

**Step 1: Choose Method**
```
Method: DELETE
```

**Step 2: Enter URL with ID**
```
URL: http://localhost:5000/api/departments/645xyz...
```

**Step 3: Set Headers**
```
Authorization: Bearer token123
(No body needed for DELETE)
```

**Step 4: Send Request**
```
Click: [Send]
```

**Step 5: View Response**
```
Status: 200 OK ✅

Body:
{
  "success": true,
  "message": "Department deleted successfully"
}
```

---

## Collections & Environments

### Collections

Collections are **organized folders of requests**.

**Why use Collections?**
```
❌ Without Collections:
- 50 loose requests
- Hard to find requests
- Difficult to organize
- Can't reuse values

✅ With Collections:
- Organized by feature
- Easy to find and run
- Can share with team
- Reuse values across requests
```

#### Creating a Collection

**Step 1: Create Collection**
```
Click: [New] → [Collection]
Name: VNIT IG API
Description: Inter-Department Games API
```

**Step 2: Add Folders**
```
Right-click Collection → [Add Folder]

Folders:
├── Departments
├── Matches
├── Seasons
└── Authentication
```

**Step 3: Add Requests to Folders**
```
Right-click Folder → [Add Request]

Departments:
├── GET All Departments
├── GET Department by ID
├── POST Create Department
├── PATCH Update Department
└── DELETE Department

Matches:
├── GET All Matches
├── GET Match by ID
├── POST Create Match
├── ...
```

**Step 4: Organize & Save**
```
Postman automatically saves collection
Can export as .json to share with team
```

### Environments

Environments store **variables** for different setups.

**Example:**
```
Development:
  BASE_URL = http://localhost:5000
  API_KEY = dev-key-123
  
Production:
  BASE_URL = https://api.vnit.com
  API_KEY = prod-key-456
  
Testing:
  BASE_URL = http://testing-server:5000
  API_KEY = test-key-789
```

#### Creating Environment

**Step 1: Create Environment**
```
Click: [Environments] → [+]
Name: Development
```

**Step 2: Add Variables**
```
Variable Name    | Initial Value           | Current Value
─────────────────|───────────────────────│──────────────────
BASE_URL         | http://localhost:5000 | http://localhost:5000
API_KEY          | dev-key-123           | dev-key-123
AUTH_TOKEN       | (Leave empty)          | (Will be filled)
DEPARTMENT_ID    | (Leave empty)          | (Will be filled)
```

**Step 3: Use Variables in Requests**
```
Instead of:
URL: http://localhost:5000/api/departments

Use:
URL: {{BASE_URL}}/api/departments

Headers:
Key: X-API-Key
Value: {{API_KEY}}

Authorization:
Value: Bearer {{AUTH_TOKEN}}
```

**Step 4: Switch Environments**
```
Top-right dropdown: Select environment
- Development ✅ (selected)
- Production
- Testing

All {{variables}} automatically update!
```

---

## Real API Examples

### Example 1: Get All Departments

```
Endpoint: GET /api/departments
Purpose: Fetch all departments
Query Params: limit (10), page (1)

[Postman Setup]

Method: GET
URL: {{BASE_URL}}/api/departments

Params:
  limit | 10
  page  | 1

Headers:
  Content-Type | application/json

Click: [Send]

Expected Response (200 OK):
{
  "success": true,
  "count": 10,
  "total": 12,
  "page": 1,
  "pages": 2,
  "data": [
    {
      "_id": "645abc...",
      "name": "Computer Science",
      "shortCode": "CSE",
      "logo": "/uploads/cse.png",
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-01-15T14:30:00Z"
    },
    // ... 9 more departments
  ]
}
```

### Example 2: Get Match by ID with Population

```
Endpoint: GET /api/matches/:id
Purpose: Get single match with team details populated

[Postman Setup]

Method: GET
URL: {{BASE_URL}}/api/matches/645abc...

Headers:
  Content-Type | application/json

Click: [Send]

Expected Response (200 OK):
{
  "success": true,
  "data": {
    "_id": "645abc...",
    "sport": "CRICKET",
    "teamA": {
      "_id": "645def...",
      "name": "Computer Science",
      "shortCode": "CSE",
      "logo": "/uploads/cse.png"
    },
    "teamB": {
      "_id": "645ghi...",
      "name": "Electrical Engineering",
      "shortCode": "EE",
      "logo": "/uploads/ee.png"
    },
    "winner": {
      "_id": "645def...",
      "name": "Computer Science",
      "shortCode": "CSE",
      "logo": "/uploads/cse.png"
    },
    "status": "COMPLETED",
    "scheduledAt": "2025-01-10T14:00:00Z",
    "venue": "Main Stadium",
    "season": {
      "_id": "645jkl...",
      "name": "VNIT Inter-Department Games 2025",
      "year": 2025
    },
    "matchType": "REGULAR",
    "createdAt": "2025-01-05T10:00:00Z",
    "updatedAt": "2025-01-10T16:00:00Z"
  }
}
```

### Example 3: Create Match with References

```
Endpoint: POST /api/matches/cricket/create
Purpose: Create new cricket match

[Postman Setup]

Method: POST
URL: {{BASE_URL}}/api/matches/cricket/create

Headers:
  Content-Type  | application/json
  Authorization | Bearer {{AUTH_TOKEN}}

Body (Raw JSON):
{
  "teamA": "645abc...",  ← Department ID
  "teamB": "645def...",  ← Department ID
  "scheduledAt": "2025-02-01T14:00:00Z",
  "venue": "Stadium A",
  "season": "645jkl..."  ← Season ID
}

Click: [Send]

Expected Response (201 Created):
{
  "success": true,
  "data": {
    "_id": "645new...",
    "sport": "CRICKET",
    "teamA": "645abc...",
    "teamB": "645def...",
    "winner": null,
    "status": "SCHEDULED",
    "scheduledAt": "2025-02-01T14:00:00Z",
    "venue": "Stadium A",
    "season": "645jkl...",
    "matchType": "REGULAR",
    "createdAt": "2025-01-15T15:00:00Z",
    "updatedAt": "2025-01-15T15:00:00Z"
  }
}
```

### Example 4: Update Match Status

```
Endpoint: PATCH /api/matches/:id
Purpose: Update match status to COMPLETED

[Postman Setup]

Method: PATCH
URL: {{BASE_URL}}/api/matches/645new...

Headers:
  Content-Type  | application/json
  Authorization | Bearer {{AUTH_TOKEN}}

Body (Raw JSON):
{
  "status": "COMPLETED",
  "winner": "645abc..."  ← Department ID of winner
}

Click: [Send]

Expected Response (200 OK):
{
  "success": true,
  "data": {
    "_id": "645new...",
    "sport": "CRICKET",
    "teamA": "645abc...",
    "teamB": "645def...",
    "winner": "645abc...",  ← Now filled
    "status": "COMPLETED",  ← Updated
    "scheduledAt": "2025-02-01T14:00:00Z",
    "venue": "Stadium A",
    "season": "645jkl...",
    "matchType": "REGULAR",
    "createdAt": "2025-01-15T15:00:00Z",
    "updatedAt": "2025-01-15T16:30:00Z"  ← Updated timestamp
  }
}
```

---

## Assertions & Validations

### What are Assertions?

Assertions are **automated checks** on responses.

### Tests Tab (Pre-written Scripts)

```javascript
// Open [Tests] tab and write validation scripts

// Test 1: Check response status is 200
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test 2: Response has success: true
pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.equal(true);
});

// Test 3: Department has required fields
pm.test("Department has name field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.name).to.exist;
    pm.expect(jsonData.data.shortCode).to.exist;
});

// Test 4: Name is not empty
pm.test("Department name is not empty", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.name).to.not.be.empty;
});

// Test 5: Response time < 500ms
pm.test("Response time < 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

### Using Environment Variables from Response

```javascript
// Test script that saves response data to environment

pm.test("Save department ID to environment", function () {
    var jsonData = pm.response.json();
    
    // Save to environment for use in next requests
    pm.environment.set("DEPARTMENT_ID", jsonData.data._id);
    pm.environment.set("DEPARTMENT_NAME", jsonData.data.name);
    
    pm.expect(jsonData.success).to.equal(true);
});

// Next request can use:
// URL: {{BASE_URL}}/api/departments/{{DEPARTMENT_ID}}
```

### Running Tests on Collection

```
1. Click: [Collection] name
2. Click: [Run] button
3. Select requests to test
4. Click: [Run VNIT IG API]

Results:
  ✅ Test 1 passed
  ✅ Test 2 passed
  ❌ Test 3 failed
     Expected: 201
     Actual: 400

Test Summary: 3/4 passed
```

---

## Debugging Tips

### 1. Check Status Codes

```
200 OK              ✅ Request successful
201 Created         ✅ Resource created
204 No Content      ✅ Successful, no response body
400 Bad Request     ❌ Invalid request data
401 Unauthorized    ❌ Missing/invalid authentication
403 Forbidden       ❌ No permission
404 Not Found       ❌ Resource doesn't exist
500 Server Error    ❌ Server problem
```

### 2. Read Error Messages

```
Bad Request Response:
{
  "success": false,
  "message": "Department validation failed: shortCode: Path `shortCode` is required."
}

What to do:
1. Check request body
2. Ensure all required fields are present
3. Check field values match schema requirements
```

### 3. Test with Correct IDs

```
Common Error:
{
  "success": false,
  "message": "Department not found"
}

Solutions:
1. Get valid IDs from GET all endpoint first
2. Use {{DEPARTMENT_ID}} environment variable
3. Check if ID is 24-character hex string (MongoDB ObjectId)
```

### 4. Verify Headers

```
Missing Authorization:
{
  "success": false,
  "message": "No authorization token provided"
}

Solution:
[Headers] tab → Add:
Key: Authorization
Value: Bearer {{AUTH_TOKEN}}
```

### 5. Use Postman Console

```
Click: [Console] button (bottom-left)

Shows:
- Request sent (method, URL, headers, body)
- Response received
- Any errors or logs
- Helpful for debugging
```

---

## Summary

| Concept | Purpose |
|---------|---------|
| **GET** | Retrieve data |
| **POST** | Create new data |
| **PUT** | Replace entire document |
| **PATCH** | Update specific fields |
| **DELETE** | Remove data |
| **Headers** | Metadata about request |
| **Query Params** | Filters and pagination |
| **Body** | Data to send to server |
| **Collections** | Organize requests |
| **Environments** | Store variables for different setups |
| **Tests** | Automated response validation |

---

## Next Steps

- 👉 Use Postman to test all API endpoints in [Chapter 5: Routes and APIs](./05-ROUTES-AND-APIs.md)
- 👉 Learn how to write tests following [Chapter 11: Database Operations Guide](./12-DATABASE-OPERATIONS-GUIDE.md)
- 👉 Read [Chapter 3: Backend Deep Dive](./03-BACKEND-DEEP-DIVE.md) to understand server code
