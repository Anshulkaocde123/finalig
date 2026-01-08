# How to Add Friends to VNIT IG Sports App

## Quick Start - Add Friends in 2 Minutes

### **Recommended: Google OAuth Method**

**Step 1:** Send your friend this link:
```
http://localhost:5173/auth/login
```
*(Replace with your Render URL after deployment)*

**Step 2:** Friend clicks "Sign in with Google"

**Step 3:** You (super admin) verify them:
1. Login as super admin
2. Go to `/admin/users` (Admin Management)
3. Find their name (shows Google profile pic)
4. Click green **"✓ Verify"** button
5. Change role dropdown: **Viewer** → **Admin** (or any role)

✅ **Done!** Your friend can now access admin panel.

---

## GitHub Repository Access

### **Add as Collaborator:**

1. Go to: https://github.com/Anshulkaocde123/vnit-ig-sports-app
2. Click **Settings** tab
3. Click **Collaborators** in left sidebar
4. Click **"Add people"** button
5. Enter their GitHub username or email
6. They receive invitation email
7. Once accepted, they can:
   - Clone the repo
   - Push changes
   - Create branches

### **Their Setup Steps:**

```bash
# 1. Clone the repository
git clone https://github.com/Anshulkaocde123/vnit-ig-sports-app.git
cd vnit-ig-sports-app

# 2. Install dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..

# 3. Create server/.env file
# Copy the .env content you share with them (see below)

# 4. Start development
npm start
```

### **.env File to Share (server/.env):**

**⚠️ IMPORTANT:** Share this securely (don't post publicly!)

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://anshuljain532006_db_user:RruAcmA5Q8HcyVqp@vnit-ig-app.iymg4sc.mongodb.net/vnit_sports?retryWrites=true&w=majority

# JWT Secret (must match production!)
JWT_SECRET=cBGBXGY1GgYfe6xvVXJMeoLmJNEPkHLBLPtwLtFj9ineVe2BaQgS31VPIdLUZ8Wfp8cerl/IqIa7Wpz0G3hVIg==

# Google OAuth (optional for local dev)
GOOGLE_CLIENT_ID=311672185118-fnu83et05guc71ffdf39r4meknj3lolj.apps.googleusercontent.com
```

---

## Admin Panel - Create Account Manually

### **Using the Admin Management UI:**

1. **Login as Super Admin**
   - Go to: http://localhost:5173/auth/login
   - Use your super_admin credentials

2. **Navigate to Admin Management**
   - Click **"Admin Management"** in sidebar
   - Or go to: http://localhost:5173/admin/users

3. **Click "+ Add Admin" Button**

4. **Fill in Friend's Details:**
   ```
   Student ID: 12345 (or any unique ID)
   Username: friend_username
   Email: friend@example.com
   Password: their_secure_password
   Role: admin (or choose from dropdown)
   Trusted: ✓ (toggle ON)
   ```

5. **Click "Create"**

6. **Share Credentials with Friend:**
   ```
   URL: http://localhost:5173/auth/login
   Username: friend_username
   Password: their_secure_password
   ```

---

## Role Permissions

Choose the right role for your friend:

| Role          | Can Access Admin? | Can Manage Matches? | Can Manage Users? | Best For                    |
|---------------|-------------------|---------------------|-------------------|-----------------------------|
| Viewer        | ⚠️ Only if trusted | ❌ NO              | ❌ NO            | Read-only access            |
| Moderator     | ✅ YES            | ⚠️ Limited         | ❌ NO            | Basic content moderation    |
| Score Manager | ✅ YES            | ✅ YES             | ❌ NO            | Live score updates          |
| Admin         | ✅ YES            | ✅ YES             | ⚠️ Limited       | Full match management       |
| Super Admin   | ✅ YES            | ✅ YES             | ✅ YES           | Complete system control     |

---

## Database Access (MongoDB Atlas)

### **Add Team Member to MongoDB:**

1. Go to: https://cloud.mongodb.com/
2. Login to your MongoDB Atlas account
3. Click on your organization
4. Go to **"Access Manager"**
5. Click **"Invite to Organization"**
6. Enter friend's email
7. Choose role: **Project Owner** or **Project Data Access Admin**
8. They receive invitation email

### **Whitelist Their IP:**

1. In MongoDB Atlas Dashboard
2. Click **"Network Access"** (left sidebar)
3. Click **"Add IP Address"**
4. Enter their IP or click **"Allow Access from Anywhere"** (less secure)

---

## Production Access (Render)

### **After Deploying to Render:**

**Option 1: Render Dashboard Access**
1. Go to: https://dashboard.render.com/
2. Your project → **Settings** → **Team**
3. Invite team members via email
4. They get full dashboard access

**Option 2: Just Give Them Login Credentials**
- Share your Render app URL: `https://your-app.onrender.com`
- Create their admin account using super admin panel
- They login and use the app

---

## Security Best Practices

### **⚠️ What NOT to Share Publicly:**

❌ **Never commit these to GitHub:**
- `server/.env` file
- JWT_SECRET
- MongoDB connection string
- Google OAuth client secret

### **✅ What's Safe to Share:**

- GitHub repository (if private)
- Render deployment URL
- Super admin panel access (over secure channel)
- Google Client ID (public anyway)

### **Use .gitignore:**

Your `.gitignore` should include:
```
# Environment variables
server/.env
.env
.env.local

# Dependencies
node_modules/

# Build outputs
client/dist/
client/build/
```

---

## Quick Commands Reference

### **For Your Friends:**

```bash
# Clone and setup
git clone https://github.com/Anshulkaocde123/vnit-ig-sports-app.git
cd vnit-ig-sports-app
npm install
cd client && npm install
cd ../server && npm install
cd ..

# Create .env file (copy content you shared)
nano server/.env  # or use any text editor

# Start development servers
npm start

# Access app
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
# Admin Panel: http://localhost:5173/auth/login
```

### **Update Their Code:**

```bash
git pull origin main
npm install  # if package.json changed
cd client && npm install
cd ../server && npm install
npm start
```

---

## Troubleshooting

### **Friend Can't Login:**

1. Check if account exists in Admin Management
2. Verify `isTrusted` is set to `true`
3. Check role is not just `viewer` (unless trusted)
4. Verify they're using correct URL: `/auth/login`

### **Friend Gets "Access Denied":**

- Their account is created but `isTrusted=false`
- Solution: You verify them via Admin Management

### **Friend Can't Access GitHub Repo:**

- Check if they accepted the collaborator invitation
- Verify their GitHub username is correct
- Make sure repo isn't private without access

---

## Summary - Fastest Way

**🚀 Recommended Quick Setup:**

1. **Add to GitHub:** Settings → Collaborators → Add their username
2. **Create Admin:** Admin Management → + Add Admin → Fill details
3. **Share:** Send them:
   - GitHub repo link
   - `.env` file content (securely)
   - Login credentials
   - App URL

**⏱️ Time:** 5 minutes total!

---

## Need Help?

Check the logs:
- **Backend:** Terminal running `npm start` (server logs)
- **Frontend:** Browser Console (F12)
- **Auth issues:** Look for 🔐 ✅ ❌ emoji indicators

All authentication is logged with clear messages for debugging.
