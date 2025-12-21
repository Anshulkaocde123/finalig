# VNIT Inter-Department Games - Deployment Guide

## Overview
This guide covers professional deployment strategies for your VNIT Sports Management App on multiple platforms.

---

## 🎯 DEPLOYMENT COMPARISON MATRIX

| Platform | Cost/mo | Ease | Scalability | Best For | Setup Time |
|----------|---------|------|-------------|----------|-----------|
| **Vercel** | Free-$20 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Frontend + Serverless Backend | 5 min |
| **Railway.app** | Free-$5+ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Full-stack (Recommended) | 5 min |
| **Render** | Free-$50+ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Node + DB hosting | 10 min |
| **Heroku** | $7-50+ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Legacy, good for teams | 10 min |
| **AWS** | Varies | ⭐⭐ | ⭐⭐⭐⭐⭐ | Enterprise scale | 30 min |
| **DigitalOcean** | $5+ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Self-managed VPS | 20 min |
| **Contabo** | $3.99+ | ⭐⭐ | ⭐⭐⭐ | Budget VPS | 15 min |

---

## 🚀 RECOMMENDED: Railway.app (Easiest + Free Tier)

### Why Railway?
- **Free tier** with $5 monthly credit (perfect for startups)
- **One-click deployment** from GitHub
- **MongoDB Atlas integration** seamless
- **Automatic SSL certificates**
- **Environment variables management**
- **No credit card needed initially**

### Step-by-Step Setup:

#### 1. Prepare Your Project

```bash
# Update .env for production
cat > server/.env << 'EOF'
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_jwt_key_12345
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-domain.railway.app/api/auth/google/callback
PORT=5000
EOF

# Update package.json to include build scripts
cat >> server/package.json << 'EOF'
"build": "echo 'No build needed'",
"start": "node server.js"
EOF

# Update client Vite config for production
# client/vite.config.js - ensure proper build output
```

#### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - VNIT Sports App"
git remote add origin https://github.com/yourusername/vnit-ig-app.git
git push -u origin main
```

#### 3. Deploy on Railway

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → "Deploy from GitHub repo"
4. Select your `vnit-ig-app` repository
5. Railway auto-detects Node.js backend
6. Add environment variables:
   - `NODE_ENV`: production
   - `MONGODB_URI`: (your MongoDB Atlas connection string)
   - `JWT_SECRET`: (strong random string)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
7. Click "Deploy"

#### 4. Configure Custom Domain (Optional)

```
In Railway Dashboard:
1. Go to your project → Deployments
2. Click on your service → Settings
3. Add custom domain: sports.vnit.ac.in
4. Update DNS records:
   - CNAME: railway.app
5. Wait 5-10 minutes for SSL certificate
```

---

## 💻 PROFESSIONAL: AWS EC2 + RDS (Enterprise Grade)

### Architecture
```
┌─────────────────────────────────────────────────────┐
│  CloudFront CDN (Global Distribution)               │
│  Route 53 (DNS)                                     │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────v───────────────────────────────────┐
│  Application Load Balancer (Multi-AZ)               │
└─────────────────┬───────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───v──┐  ┌───────v──┐  ┌──────v──┐
│ EC2  │  │   EC2    │  │  EC2    │  (Auto-scaling)
├──────┤  ├──────────┤  ├─────────┤
│Node  │  │  Node    │  │  Node   │
└──────┘  └──────────┘  └─────────┘
    │             │             │
    └─────────────┼─────────────┘
                  │
          ┌───────v──────────┐
          │  RDS PostgreSQL  │ (Multi-AZ)
          │  Read Replicas   │
          └──────────────────┘
```

### Setup Steps:

#### 1. Launch EC2 Instance

```bash
# AWS Console → EC2 → Launch Instance
# AMI: Ubuntu 22.04 LTS
# Instance Type: t3.micro (free tier) or t3.small (production)
# Storage: 30 GB
# Security Group: Allow 80, 443, 5000 (SSH from your IP)

# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git node-js npm nginx certbot python3-certbot-nginx

# Install NVM for Node version management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18.19.1
nvm use 18.19.1
```

#### 2. Setup Application

```bash
# Clone repository
cd /home/ubuntu
git clone https://github.com/yourusername/vnit-ig-app.git
cd vnit-ig-app

# Install dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..

# Create .env file
nano server/.env
# Add all production environment variables

# Build frontend
cd client && npm run build
cd ..

# Test locally
npm start
```

#### 3. Configure Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/default

# Add this configuration:
# ─────────────────────────────────────────
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name sports.vnit.ac.in;

    # Serve frontend
    location / {
        root /home/ubuntu/vnit-ig-app/client/dist;
        try_files $uri /index.html;
    }

    # Proxy API requests
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io WebSocket
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
# ─────────────────────────────────────────

# Test nginx configuration
sudo nginx -t

# Enable and restart
sudo systemctl enable nginx
sudo systemctl restart nginx
```

#### 4. Setup PM2 for Process Management

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'vnit-sports-backend',
    script: './server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Setup auto-restart on server reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

#### 5. Setup SSL Certificate (Free with Let's Encrypt)

```bash
# Using Certbot (automatic)
sudo certbot --nginx -d sports.vnit.ac.in

# Auto-renewal (runs automatically)
sudo systemctl enable certbot.timer
```

#### 6. Setup Database (RDS)

```
AWS Console → RDS → Create Database
- Engine: PostgreSQL (or MongoDB Atlas for cloud MongoDB)
- Instance: db.t3.micro
- Storage: 20 GB
- Multi-AZ: Yes (for production)
- Public accessibility: No
- VPC Security Group: Allow access only from EC2

Connection String:
postgresql://user:password@rds-endpoint:5432/vnit_sports
```

---

## 📦 SIMPLE: Docker Deployment

### Dockerfile for Backend

```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### Dockerfile for Frontend

```dockerfile
# client/Dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Multi-stage: use nginx for serving
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    depends_on:
      - mongodb
    networks:
      - vnit-network

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - vnit-network

  mongodb:
    image: mongo:6.0
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    networks:
      - vnit-network

volumes:
  mongodb_data:

networks:
  vnit-network:
```

Deploy with Docker:
```bash
docker-compose up -d
```

---

## 🌐 PRODUCTION CHECKLIST

### Security
- [ ] Enable HTTPS/SSL (Let's Encrypt)
- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable MongoDB authentication
- [ ] Setup firewall rules (ufw)
- [ ] Enable CORS only for your domain
- [ ] Use secure cookie flags (HttpOnly, Secure, SameSite)
- [ ] Implement rate limiting
- [ ] Enable MongoDB encryption at rest

### Performance
- [ ] Enable gzip compression in Nginx
- [ ] Setup CDN (CloudFront, Cloudflare)
- [ ] Enable caching headers
- [ ] Optimize images (WebP format)
- [ ] Use MongoDB indexes for frequent queries
- [ ] Setup database read replicas
- [ ] Monitor response times

### Monitoring & Logging
- [ ] Setup application logging (Winston, Bunyan)
- [ ] Monitor CPU/Memory (PM2 Plus, DataDog)
- [ ] Setup error tracking (Sentry)
- [ ] Monitor database performance
- [ ] Setup uptime monitoring (UptimeRobot)
- [ ] Create alerts for critical errors

### Backup & Recovery
- [ ] Daily database backups to S3
- [ ] Backup environment configurations
- [ ] Setup disaster recovery plan
- [ ] Test restore procedures
- [ ] Document recovery procedures

---

## 📊 COST ESTIMATION (Monthly)

### Option 1: Railway.app (RECOMMENDED)
- Backend: Free (within $5 credit)
- Database: MongoDB Atlas Free
- **Total: $0-5/month**

### Option 2: AWS
- EC2 (t3.small): $20
- RDS (db.t3.micro): $20
- Data transfer: ~$5
- Route 53: $0.50
- **Total: $45-50/month**

### Option 3: DigitalOcean
- Droplet (2GB RAM): $12
- Managed MongoDB: $57
- **Total: $70/month**

---

## 🎯 RECOMMENDED STACK FOR VNIT

**Best Balance of Cost, Performance & Ease:**

```
Frontend → Vercel (Free)
Backend → Railway.app (Free tier)
Database → MongoDB Atlas Free (or paid if needed)
Domain → Namecheap ($5/yr)
Email → Gmail (Free)
CDN → Cloudflare (Free)
Total: $5-15/month
```

---

## 🔧 ENVIRONMENT VARIABLES FOR PRODUCTION

Create `.env` file in root:

```env
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vnit_sports
JWT_SECRET=your_super_secret_32_character_string_here_12345
CORS_ORIGIN=https://sports.vnit.ac.in

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret_here
GOOGLE_CALLBACK_URL=https://sports.vnit.ac.in/api/auth/google/callback

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password

# Logging
LOG_LEVEL=info
```

---

## 📱 FINAL DEPLOYMENT URLs

After setup, your app will be live at:
- **Frontend:** https://sports.vnit.ac.in
- **Backend API:** https://sports.vnit.ac.in/api
- **Admin Login:** https://sports.vnit.ac.in/login
- **Admin Dashboard:** https://sports.vnit.ac.in/admin/dashboard

---

## 🆘 TROUBLESHOOTING

### "Connection refused" errors
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check logs
pm2 logs
```

### "CORS" errors
- Update `CORS_ORIGIN` in .env
- Ensure frontend and backend URLs match

### "MongoDB connection" errors
- Verify connection string
- Check MongoDB IP whitelist
- Ensure credentials are correct

### "Google OAuth" not working
- Verify Client ID and Secret
- Check Redirect URIs in Google Cloud Console
- Clear browser cache and localStorage

---

**Your app is production-ready! 🚀**
