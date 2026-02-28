# Backend Testing Suite - Documentation

## Overview
Comprehensive testing suite for the VNIT IG App backend, including API endpoints, database operations, and system health checks.

## Test Scripts

### 1. Backend Structure Test (`test-backend.js`)
Tests the overall backend structure, dependencies, models, controllers, and middleware.

**What it tests:**
- Environment variables configuration
- Node.js dependencies
- Database connection
- Model schemas and structure
- Controller functions
- Middleware setup
- Basic CRUD operations

**Run:**
```bash
npm run test:backend
```

**Or:**
```bash
node test-backend.js
```

---

### 2. Database Diagnostics (`test-database.js`)
Comprehensive database health check and diagnostics.

**What it tests:**
- Database connection health
- Collection statistics
- Index analysis
- Data integrity
- Performance metrics
- Orphaned references
- Duplicate data

**Run:**
```bash
npm run test:database
```

**Or:**
```bash
node test-database.js
```

---

### 3. API Endpoint Tests (`test-api-endpoints.js`)
Tests all REST API endpoints with actual HTTP requests.

**What it tests:**
- Health check endpoints
- Authentication endpoints
- Department management
- Season management
- Match management
- Player management
- Leaderboard
- Scoring presets
- Student council
- About page
- Foul management
- Admin management

**Prerequisites:**
The server must be running before executing API tests.

**Run:**
```bash
# Start server in one terminal
npm run server

# Run API tests in another terminal
npm run test:api
```

**Custom server URL:**
```bash
node test-api-endpoints.js --server=http://localhost:5000
```

---

## Running All Tests

To run all tests sequentially:
```bash
npm run test:all
```

**Note:** For API tests, make sure the server is running first.

---

## Test Output

All test scripts provide color-coded output:
- ✅ **Green**: Test passed
- ❌ **Red**: Test failed
- ⚠️ **Yellow**: Warning or optional check
- ℹ️ **Blue**: Information
- 🧪 **Cyan**: Test in progress

---

## Test Results

Each test script generates a summary report with:
- Total tests run
- Tests passed
- Tests failed
- Warnings
- Success/pass rate
- Detailed breakdown

---

## Common Issues and Troubleshooting

### 1. Database Connection Fails
**Error:** `MONGODB_URI not set`
**Solution:** 
```bash
# Create .env file in server directory
echo "MONGODB_URI=your_mongodb_connection_string" > .env
```

### 2. Server Not Running (API Tests)
**Error:** `Server is not responding!`
**Solution:**
```bash
# Start the server first
npm run server
```

### 3. Missing Dependencies
**Error:** `Cannot find module 'xxx'`
**Solution:**
```bash
# Install dependencies
npm install
```

### 4. Port Already in Use
**Error:** `EADDRINUSE: address already in use`
**Solution:**
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=5001 npm run server
```

---

## Environment Variables Required

Create a `.env` file in the server directory with:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
JWT_SECRET=your_jwt_secret_key

# Server
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

## Manual Testing Workflow

### 1. Structure Test
```bash
npm run test:backend
```
This verifies:
- All models load correctly
- All controllers have methods
- All middleware exists
- Dependencies are installed

### 2. Database Test
```bash
npm run test:database
```
This checks:
- Database connectivity
- Data integrity
- Performance
- Collection statistics

### 3. API Test
```bash
# Terminal 1: Start server
npm run server

# Terminal 2: Test APIs
npm run test:api
```
This validates:
- All endpoints respond
- Correct HTTP methods
- Response formats
- Error handling

---

## Continuous Integration

To integrate with CI/CD:

```yaml
# .github/workflows/test.yml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd server
          npm install
      
      - name: Run backend tests
        run: |
          cd server
          npm run test:backend
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
      
      - name: Run database tests
        run: |
          cd server
          npm run test:database
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
```

---

## Test Coverage

### Models (10 total)
- ✅ About
- ✅ Admin
- ✅ Department
- ✅ Foul
- ✅ Match
- ✅ Player
- ✅ PointLog
- ✅ ScoringPreset
- ✅ Season
- ✅ StudentCouncil

### Controllers (11 total)
- ✅ aboutController
- ✅ adminController
- ✅ authController
- ✅ departmentController
- ✅ foulController
- ✅ leaderboardController
- ✅ matchController
- ✅ playerController
- ✅ scoringPresetController
- ✅ seasonController
- ✅ studentCouncilController

### Routes (11 total)
- ✅ /api/about
- ✅ /api/admins
- ✅ /api/auth
- ✅ /api/departments
- ✅ /api/fouls
- ✅ /api/leaderboard
- ✅ /api/matches
- ✅ /api/players
- ✅ /api/scoring-presets
- ✅ /api/seasons
- ✅ /api/student-council

---

## Advanced Testing

### Performance Benchmarking
```bash
# Run database performance test
node test-database.js | grep "Performance"
```

### Load Testing
For load testing, consider using tools like:
- Apache Bench (ab)
- Artillery
- k6

Example with Apache Bench:
```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:5000/api/health
```

---

## Debugging Failed Tests

### Enable Verbose Logging
```bash
# Set debug mode
DEBUG=* npm run test:backend
```

### Check Individual Endpoints
```bash
# Test single endpoint with curl
curl -X GET http://localhost:5000/api/health

# With JSON body
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Database Query Debugging
```javascript
// Add to test-database.js
mongoose.set('debug', true);
```

---

## Best Practices

1. **Run tests before commits**
   ```bash
   npm run test:all
   ```

2. **Test on production-like environment**
   ```bash
   NODE_ENV=production npm run test:backend
   ```

3. **Monitor test performance**
   - Keep tests under 30 seconds
   - Optimize slow database queries

4. **Regular testing schedule**
   - Daily: Structure tests
   - Weekly: Full test suite
   - Before deployment: All tests

---

## Support

If tests fail or you encounter issues:

1. Check server logs
2. Verify environment variables
3. Ensure database is accessible
4. Check network connectivity
5. Review error messages in test output

For more help, refer to the main project documentation.

---

## Version History

- **v1.0.0** (2026-01-09): Initial test suite release
  - Backend structure tests
  - Database diagnostics
  - API endpoint tests
