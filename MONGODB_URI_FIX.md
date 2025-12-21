# CRITICAL FIX - MongoDB URI Not Set

## Issues Found in Logs:
1. ❌ **MongoDB URI undefined** - MONGODB_URI variable not in Railway
2. ⚠️ **Node version** - Was using Node 18, but dependencies need it

## Fixes Applied ✅
- Downgraded Mongoose from 9.0.1 to 8.0.0 (works with Node 18)
- Updated Node version specification to 20.11.0
- Improved error handling for missing MongoDB URI

---

## YOU NEED TO DO THIS NOW:

### Step 1: Add MONGODB_URI to Railway Variables

**This is CRITICAL - your app can't start without this!**

1. Go to Railway dashboard
2. Click your **vnit-ig-app** service
3. Click **"Variables"** tab
4. Look for field to add new variable
5. Add this EXACT line:

```
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/vnit_sports?retryWrites=true&w=majority
```

**Replace:**
- `YOUR_PASSWORD` = Your MongoDB password (from Step 1 of deployment)
- `YOUR_CLUSTER` = Your cluster name (from MongoDB Atlas)

**Example:**
```
MONGODB_URI=mongodb+srv://admin:P@ssw0rd123@vnit-ig-app.w3xyz.mongodb.net/vnit_sports?retryWrites=true&w=majority
```

### Step 2: Verify All Variables Are Present

In Railway Variables, you should have ALL of these:

```
CORS_ORIGIN=https://your-railway-url.railway.app
GOOGLE_CALLBACK_URL=https://your-railway-url.railway.app/api/auth/register-oauth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=your_long_random_string_here
MONGODB_URI=mongodb+srv://admin:PASSWORD@cluster.mongodb.net/vnit_sports?retryWrites=true&w=majority
NODE_ENV=production
PORT=5000
```

### Step 3: Click "Redeploy"

1. After adding MONGODB_URI, Railway should auto-redeploy
2. If not, click the **"Redeploy"** button
3. Wait 3-5 minutes for build

### Step 4: Check Logs

1. Click **"Logs"** tab
2. Look for:
   - `✅ MongoDB Connected` (GREEN = Success)
   - `🚀 Server listening on port 5000` (GREEN = Running)

### Step 5: Test

1. Open your Railway URL
2. You should see login page
3. Login with: `admin` / `admin123`
4. Should show dashboard

---

## TROUBLESHOOTING

### "MongoDB Connected Error: The `uri` parameter must be a string, got 'undefined'"
→ You haven't added MONGODB_URI to Railway Variables yet. Do Step 1 above.

### "Connect ECONNREFUSED"
→ MongoDB URI is wrong. Check your password and cluster name carefully.

### Still seeing errors?
1. Screenshot the Railway logs
2. Check that MONGODB_URI has no typos
3. Make sure MongoDB Atlas IP whitelist includes 0.0.0.0/0

---

## YOUR MONGODB CONNECTION STRING

If you forgot it, get it from:
1. Go to MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. Click your cluster → Connect → Drivers
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Paste it in Railway Variables as `MONGODB_URI`

---

**NEXT STEP:** Add MONGODB_URI to Railway and click Redeploy! 🚀
