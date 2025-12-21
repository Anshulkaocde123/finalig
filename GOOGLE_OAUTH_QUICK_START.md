# 🔐 Google OAuth Login - Quick Start (5 minutes)

## Why You Don't See the Google Login Button

The Google Sign-In button won't appear until you configure your Google OAuth credentials. Here's the quick fix:

---

## Step 1: Get Your Google Client ID (5 minutes)

### Option A: Fast Setup (If you already have a Google account)

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** (top left dropdown)
   - Name: `VNIT Sports`
   - Click **Create**

3. **Enable Google+ API**
   - Left sidebar: **APIs & Services** → **Library**
   - Search: `Google+ API`
   - Click **Enable**

4. **Create OAuth Credentials**
   - Left sidebar: **APIs & Services** → **Credentials**
   - Click **+ Create Credentials** → **OAuth 2.0 Client ID**
   - If prompted for "Configure OAuth consent screen":
     - User Type: **Internal**
     - App name: **VNIT Sports**
     - Click **Create**
   
5. **Configure OAuth Application**
   - Application Type: **Web application**
   - Name: **VNIT Admin Portal**
   
   **Add these Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:5174
   ```
   
   **Add these Authorized redirect URIs:**
   ```
   http://localhost:5000/api/auth/register-oauth
   ```
   
   Click **Create**

6. **Copy Your Credentials**
   - A popup will appear with your credentials
   - Copy the **Client ID** (looks like: `123456789-xxx.apps.googleusercontent.com`)

---

## Step 2: Add to Your App (30 seconds)

### Edit `.env.local` file in the client folder

```bash
# File: /home/anshul-jain/Desktop/vnit-ig-app/client/.env.local

REACT_APP_GOOGLE_CLIENT_ID=PASTE_YOUR_CLIENT_ID_HERE
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Replace `PASTE_YOUR_CLIENT_ID_HERE` with your actual Client ID from step 1.

Example:
```
REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
```

---

## Step 3: Restart Your App (30 seconds)

```bash
# Kill existing servers
pkill -f "npm start"
sleep 2

# Start fresh
cd /home/anshul-jain/Desktop/vnit-ig-app
npm start
```

---

## Step 4: Test It! (30 seconds)

1. Open http://localhost:5173/login
2. You should now see the **"Sign in with Google"** button
3. Click it and sign in with your Google account
4. 🎉 You're logged in!

---

## Troubleshooting

### "Google Sign-In button not showing"

**Check:**
1. Is `.env.local` file created? 
   ```bash
   cat /home/anshul-jain/Desktop/vnit-ig-app/client/.env.local
   ```
   Should show your Client ID (not `YOUR_GOOGLE_CLIENT_ID_HERE`)

2. Did you restart the app after creating `.env.local`?
   ```bash
   pkill -f "npm start"
   sleep 2
   npm start
   ```

3. Check browser console for errors:
   - Press `F12` → Console tab
   - Look for error messages
   - Common: "Google is not defined" = Script didn't load

### "Invalid Client ID" error

- Double-check your Client ID is correct
- Make sure there are no extra spaces or quotes
- Verify you're using the **Client ID** (not Client Secret)

### "Redirect URI mismatch" error

- In Google Cloud Console, verify you added:
  - `http://localhost:5000/api/auth/register-oauth`
- Not the frontend URL, the **backend URL**

### "Google identity services script failed to load"

- Check your internet connection
- Try clearing browser cache: `Ctrl+Shift+Delete`
- Make sure you're not using a VPN that blocks Google

---

## What Happens When You Click "Sign in with Google"

1. Google popup appears
2. You sign in with your Google account
3. Google sends your profile info back to our app
4. App creates/updates your admin account
5. You get logged in automatically
6. Redirected to admin dashboard

---

## Security Notes

✅ Your Google password is **never** sent to our app
✅ Only profile info (email, name, photo) is shared
✅ Sessions are secure with JWT tokens
✅ Token expires in 30 days (you'll need to login again)

---

## Next Steps

Once Google Login works:
1. Test creating a season from admin dashboard
2. Try scheduling a match
3. Check real-time updates

---

## Need Help?

**If Google button still not showing:**

Run this command to see what's in your .env.local:
```bash
cat /home/anshul-jain/Desktop/vnit-ig-app/client/.env.local
```

Should output:
```
REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENABLE_GOOGLE_LOGIN=true
```

If it shows `YOUR_GOOGLE_CLIENT_ID_HERE`, you need to:
1. Get actual Client ID from Google Cloud Console
2. Update .env.local
3. Restart app

---

**Time estimate:** 5 minutes total ⏱️

**Status:** You should see Google button within 5 minutes! 🚀
