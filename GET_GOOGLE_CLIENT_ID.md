# How to Get Google Client ID - Step-by-Step Guide

## 📋 Overview
This guide walks you through creating a Google OAuth 2.0 Client ID for your VNIT Inter-Department Games app.

**Time Required:** 5-10 minutes  
**Cost:** FREE  
**Difficulty:** Easy

---

## ⚡ Quick Steps Summary
1. Go to Google Cloud Console
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Configure redirect URIs
6. Copy your Client ID
7. Paste into `.env.local` file

---

## 📖 Detailed Instructions

### Step 1: Go to Google Cloud Console

1. Open your browser and go to:
   ```
   https://console.cloud.google.com/
   ```

2. Sign in with your Google account (create one if you don't have one)

3. You should see the Google Cloud Console dashboard

---

### Step 2: Create a New Project

1. At the top of the page, click on the **project dropdown** (near the Google Cloud logo)

2. Click **"NEW PROJECT"** button

3. In the dialog that appears:
   - **Project name:** Enter `VNIT IG App` (or any name you prefer)
   - **Organization:** Leave as "No organization" (unless you have one)
   - Click **"CREATE"**

4. Wait 1-2 minutes for the project to be created

5. Once created, you'll see a notification. Click it or select the project from the dropdown

---

### Step 3: Enable Google+ API

1. In the left sidebar, find and click **"APIs & Services"**

2. Click **"Enabled APIs & services"** (or "Library" if you see it)

3. Click the **"+ ENABLE APIS AND SERVICES"** button at the top

4. In the search box, type: `Google+ API`

5. Click on **"Google+ API"** from the results

6. Click the blue **"ENABLE"** button

7. Wait for it to enable (usually instant)

---

### Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"** (in left sidebar)

2. Click the blue **"+ CREATE CREDENTIALS"** button at the top

3. Select **"OAuth 2.0 Client ID"** from the dropdown

4. You might see a notification: **"You'll need to create a consent screen first"**
   - If so, click **"CONFIGURE CONSENT SCREEN"**
   - Go to Step 5 below

5. If no notification, skip to Step 6

---

### Step 5: Configure OAuth Consent Screen (If Prompted)

1. On the "OAuth consent screen" page:

2. Choose **"External"** (not "Internal")
   - Click **"CREATE"**

3. Fill in the form:
   - **App name:** `VNIT Inter-Department Games`
   - **User support email:** Your email address
   - **Developer contact:** Your email address
   - Click **"SAVE AND CONTINUE"**

4. On "Scopes" page:
   - Just click **"SAVE AND CONTINUE"**
   - (You don't need to add scopes for basic OAuth)

5. On "Test users" page:
   - Click **"SAVE AND CONTINUE"**

6. Review and click **"BACK TO DASHBOARD"**

---

### Step 6: Create OAuth 2.0 Client ID (Continued)

1. Back on the Credentials page, click **"+ CREATE CREDENTIALS"** again

2. Select **"OAuth 2.0 Client ID"**

3. For **"Application type"**, select:
   ```
   Web application
   ```

4. Give it a **Name:**
   ```
   VNIT IG App Web Client
   ```

5. Under **"Authorized JavaScript origins"**, add:
   ```
   http://localhost:5173
   http://localhost:5174
   ```
   - Click **"+ ADD URI"** for each one

6. Under **"Authorized redirect URIs"**, add:
   ```
   http://localhost:5000/api/auth/register-oauth
   ```
   - Click **"+ ADD URI"**

7. Click the blue **"CREATE"** button

---

### Step 7: Copy Your Client ID

1. A dialog will appear with your credentials

2. **IMPORTANT:** You'll see two things:
   - **Client ID** (this is what you need)
   - **Client Secret** (keep this private!)

3. Copy the **Client ID** (it looks like: `123456789-abc...apps.googleusercontent.com`)

4. You can click the copy icon next to it

5. **DO NOT SHARE** this Client ID publicly or with anyone

---

## 🎯 Now Update Your App

1. Open this file:
   ```
   /home/anshul-jain/Desktop/vnit-ig-app/client/.env.local
   ```

2. Find this line:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
   ```

3. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
   ```

4. Save the file (Ctrl+S or Cmd+S)

5. Restart your app:
   ```bash
   pkill -f "npm start"
   sleep 2
   npm start
   ```

6. Go to: http://localhost:5173/login

7. You should now see the **"Sign in with Google"** button! ✅

---

## 🔍 Verification Checklist

After getting your Client ID:

- [ ] Client ID copied (NOT Client Secret)
- [ ] `.env.local` file updated
- [ ] No typos in Client ID
- [ ] File saved
- [ ] App restarted
- [ ] Login page loads at http://localhost:5173/login
- [ ] "Sign in with Google" button visible (not warning message)
- [ ] Google button is clickable

---

## ❓ Troubleshooting

### "I can't find Google+ API"
- Try searching for just `google` in the API search box
- Or search for `plus`

### "The Google button still doesn't appear"
- Make sure you saved `.env.local` correctly
- Restart your app: `npm start`
- Try opening in a **private/incognito** browser window
- Check browser console for errors (F12)

### "Client ID is invalid"
- Check for extra spaces at beginning or end
- Make sure you copied the full Client ID
- Copy the entire string: `123456789-abc...apps.googleusercontent.com`

### "Too many requests" error
- Wait a few minutes
- This usually happens if you create/delete credentials too quickly

### "Can't click the Google button in my app"
- Make sure your redirect URI in Google Cloud matches exactly:
  ```
  http://localhost:5000/api/auth/register-oauth
  ```
- Make sure your JavaScript origins include:
  ```
  http://localhost:5173
  http://localhost:5174
  ```

---

## 🔒 Security Notes

✅ **Your Client ID is PUBLIC** - it's safe to share (it's used in client-side code)  
⚠️ **Your Client Secret is PRIVATE** - NEVER share this or put in `.env.local`  
✅ **Your Google password is SAFE** - never sent to your app or our server

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [VNIT App Setup Guide](./SETUP_GUIDE.md)
- [Quick Start Guide](./GOOGLE_OAUTH_QUICK_START.md)

---

## ✨ What's Next?

Once you have your Client ID in `.env.local` and the app restarted:

1. Go to the login page: http://localhost:5173/login
2. Click "Sign in with Google"
3. Sign in with your Google account
4. You'll be automatically logged in as admin
5. Access the admin dashboard!

🎉 **You're done!**

---

## 💡 Pro Tips

- You can create multiple Client IDs (e.g., one for development, one for production)
- You can edit/delete existing credentials in the Credentials page
- Keep your `.env.local` file safe - it contains your Client ID
- You can test with multiple Google accounts

---

**Need help?** Check the troubleshooting section above or refer to the main documentation files in your project.
