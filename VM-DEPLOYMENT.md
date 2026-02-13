# 🚀 VM Deployment Guide

Complete guide to deploy your Weather Analytics Dashboard on a Linux VM.

## 📋 VM Requirements

- **OS**: Ubuntu 20.04+ (or Debian-based Linux)
- **RAM**: 1 GB minimum (2 GB recommended)
- **CPU**: 1 vCPU minimum
- **Disk**: 10 GB minimum
- **Network**: Public IP with open ports 80 (HTTP), 443 (HTTPS), 22 (SSH)

## 🎯 Quick Deploy (3 Steps)

### Step 1: Upload Project to VM

**From your Windows machine:**

```powershell
# Option A: Using SCP
scp -r d:\project_dhar\* user@your-vm-ip:/tmp/weather-analytics-deploy/

# Option B: Using WinSCP GUI
# Download WinSCP → Connect to VM → Upload entire project_dhar folder
```

**Or use Git (if you have a repo):**

```bash
# On VM
git clone https://github.com/your-username/weather-analytics.git /tmp/weather-analytics-deploy
```

### Step 2: Run Deployment Script

**SSH into your VM:**

```bash
ssh user@your-vm-ip
```

**Run the deployment script:**

```bash
cd /tmp/weather-analytics-deploy
sudo bash vm-deploy.sh
```

The script will:
1. ✅ Update system packages
2. ✅ Install Node.js 20
3. ✅ Install Nginx web server
4. ✅ Install PM2 process manager
5. ✅ Install backend dependencies
6. ✅ Build frontend optimized bundle
7. ✅ Configure Nginx reverse proxy
8. ✅ Start backend with PM2
9. ✅ Configure firewall (UFW)
10. ✅ Setup auto-start on reboot

### Step 3: Access Your Dashboard

```
http://YOUR-VM-IP
```

**Done!** Your dashboard is now live! 🎉

## 🔧 What Gets Installed

| Component | Purpose | Technology |
|-----------|---------|------------|
| **Node.js** | Backend runtime | v20 LTS |
| **Nginx** | Web server + reverse proxy | Latest stable |
| **PM2** | Process manager (auto-restart) | Latest |
| **Backend** | Weather data pipeline | Express + WebSocket |
| **Frontend** | Dashboard UI | React (production build) |

## 📂 Installation Paths

```
/opt/weather-analytics/          ← Main application
├── backend/
│   ├── server.js                ← Backend server
│   ├── .env                     ← Configuration (API key)
│   └── node_modules/
└── frontend/
    └── dist/                    ← Production build (served by Nginx)

/etc/nginx/sites-available/weather-analytics  ← Nginx config
```

## 🌐 Architecture After Deployment

```
Internet → Nginx (Port 80)
              ↓
              ├─→ Frontend (React app) → /
              ├─→ Backend API → /api/*
              └─→ WebSocket → /ws

PM2 keeps backend running 24/7 (auto-restart on crash/reboot)
```

## ⚙️ Configuration

### Add OpenWeatherMap API Key

**Option 1: During deployment**
- The script will prompt you for the API key

**Option 2: After deployment**

```bash
sudo nano /opt/weather-analytics/backend/.env
```

Add your key:
```env
OPENWEATHER_API_KEY=your_key_here
```

Restart backend:
```bash
sudo pm2 restart weather-backend
```

### Change Monitored Cities

```bash
sudo nano /opt/weather-analytics/backend/.env
```

Edit the `CITIES` variable:
```env
CITIES=London,Paris,Tokyo,New York,Sydney
```

Restart:
```bash
sudo pm2 restart weather-backend
```

## 🛠️ Management Commands

### Backend Management

```bash
# View backend logs (live)
sudo pm2 logs weather-backend

# View logs (last 100 lines)
sudo pm2 logs weather-backend --lines 100

# Restart backend
sudo pm2 restart weather-backend

# Stop backend
sudo pm2 stop weather-backend

# Check status
sudo pm2 status

# View detailed info
sudo pm2 info weather-backend
```

### Nginx Management

```bash
# Check status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### Frontend Updates

After making frontend code changes:

```bash
cd /opt/weather-analytics/frontend
npm run build
sudo systemctl reload nginx
```

### Backend Updates

After making backend code changes:

```bash
cd /opt/weather-analytics/backend
sudo pm2 restart weather-backend
```

## 🔒 Security Hardening (Optional)

### 1. Enable HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate (replace your-domain.com)
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

### 2. Setup Firewall

```bash
# Allow only HTTP, HTTPS, SSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 3. Secure SSH

Edit `/etc/ssh/sshd_config`:
```bash
PermitRootLogin no
PasswordAuthentication no  # Use SSH keys only
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

## 📊 Monitoring

### Check Application Health

```bash
# Backend health check
curl http://localhost:5000/api/health

# Frontend check
curl http://localhost/

# Full pipeline status
curl http://localhost:5000/api/pipeline/status
```

### Resource Usage

```bash
# PM2 monitoring dashboard
sudo pm2 monit

# System resources
htop

# Disk usage
df -h
```

## 🚨 Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
sudo pm2 logs weather-backend --lines 50

# Common issues:
# - Port 5000 already in use: sudo lsof -i :5000
# - Missing dependencies: cd /opt/weather-analytics/backend && npm install
# - Environment issues: Check /opt/weather-analytics/backend/.env
```

### Nginx Errors

```bash
# Check configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Common issues:
# - Port 80 in use: sudo lsof -i :80
# - Permissions: Check /opt/weather-analytics/frontend/dist exists
```

### Dashboard Not Loading

```bash
# Check if frontend is built
ls -la /opt/weather-analytics/frontend/dist/

# Rebuild if needed
cd /opt/weather-analytics/frontend
npm run build

# Check Nginx serves static files
curl http://localhost/index.html
```

### WebSocket Connection Fails

```bash
# Check Nginx WebSocket config
sudo nano /etc/nginx/sites-available/weather-analytics

# Should have:
# proxy_http_version 1.1;
# proxy_set_header Upgrade $http_upgrade;
# proxy_set_header Connection "upgrade";

# Restart Nginx
sudo systemctl restart nginx
```

## 🔄 Update Deployment

To update your application:

```bash
# 1. Upload new code to VM
scp -r d:\project_dhar\* user@your-vm-ip:/tmp/weather-analytics-deploy/

# 2. SSH to VM and replace files
sudo cp -r /tmp/weather-analytics-deploy/backend/* /opt/weather-analytics/backend/
sudo cp -r /tmp/weather-analytics-deploy/frontend/* /opt/weather-analytics/frontend/

# 3. Rebuild frontend
cd /opt/weather-analytics/frontend
npm install
npm run build

# 4. Restart services
sudo pm2 restart weather-backend
sudo systemctl reload nginx
```

## 🗑️ Uninstall

To completely remove the application:

```bash
# Stop services
sudo pm2 delete weather-backend
sudo pm2 save

# Remove application
sudo rm -rf /opt/weather-analytics

# Remove Nginx config
sudo rm /etc/nginx/sites-enabled/weather-analytics
sudo rm /etc/nginx/sites-available/weather-analytics
sudo systemctl reload nginx

# Optional: Remove installed packages
# (Only if not used by other applications)
# sudo apt-get remove nodejs nginx
```

## 💰 VM Provider Recommendations

| Provider | Free Tier | Monthly Cost | Speed |
|----------|-----------|--------------|-------|
| **AWS EC2** | 12 months free (t2.micro) | $5-10/month after | Fast |
| **Google Cloud** | $300 credit (90 days) | $5-15/month | Fast |
| **DigitalOcean** | $200 credit (60 days) | $6/month (Basic) | Fast |
| **Azure** | $200 credit (30 days) | $8-15/month | Fast |
| **Oracle Cloud** | Always Free (ARM) | Free forever | Medium |
| **Vultr** | No free tier | $6/month | Fast |

**Recommendation**: DigitalOcean (easiest setup) or Oracle Cloud (free forever)

## 📈 Performance Optimization

### Enable Nginx Gzip Compression

Edit `/etc/nginx/nginx.conf`:
```nginx
gzip on;
gzip_types text/css application/javascript application/json;
gzip_min_length 1000;
```

### PM2 Clustering (for better performance)

```bash
sudo pm2 delete weather-backend
sudo pm2 start /opt/weather-analytics/backend/server.js -i max --name weather-backend
sudo pm2 save
```

This uses all CPU cores!

---

**Questions?** Check the logs first: `sudo pm2 logs weather-backend`
