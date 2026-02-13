#!/bin/bash
# ============================================================
# VM Deployment Script
# Weather Analytics Dashboard - Complete Setup
# ============================================================
# Works on: Amazon Linux, Ubuntu, Debian, RHEL, CentOS
# ============================================================

set -e  # Exit on error

echo "============================================"
echo "Weather Analytics Dashboard - VM Deployment"
echo "============================================"
echo ""

# Configuration
INSTALL_DIR="/opt/weather-analytics"
BACKEND_PORT=5000
FRONTEND_PORT=80
NODE_VERSION="20"

# Detect package manager
if command -v yum &> /dev/null; then
    PKG_MGR="yum"
    PKG_UPDATE="yum update -y -q"
    PKG_INSTALL="yum install -y -q"
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_SITES_ENABLED=""
elif command -v apt-get &> /dev/null; then
    PKG_MGR="apt"
    PKG_UPDATE="apt-get update -qq && apt-get upgrade -y -qq"
    PKG_INSTALL="apt-get install -y"
    NGINX_CONF_DIR="/etc/nginx/sites-available"
    NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
else
    echo "❌ Unsupported system. Neither yum nor apt-get found."
    exit 1
fi

echo "Detected package manager: $PKG_MGR"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root: sudo bash vm-deploy.sh"
    exit 1
fi

echo "✓ Running as root"
echo ""

# ---- Step 1: System Update ----
echo "📦 Step 1: Updating system packages..."
eval $PKG_UPDATE > /dev/null 2>&1
echo "   ✓ System updated"
echo ""

# ---- Step 2: Install Node.js ----
echo "📦 Step 2: Installing Node.js $NODE_VERSION..."
if command -v node &> /dev/null; then
    echo "   ✓ Node.js already installed: $(node -v)"
else
    if [ "$PKG_MGR" = "yum" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash - > /dev/null 2>&1 || true
        $PKG_INSTALL nodejs > /dev/null 2>&1
    else
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - > /dev/null 2>&1
        $PKG_INSTALL nodejs > /dev/null 2>&1
    fi
    echo "   ✓ Node.js installed: $(node -v)"
fi
echo ""

# ---- Step 3: Install Nginx ----
echo "📦 Step 3: Installing Nginx..."
if command -v nginx &> /dev/null; then
    echo "   ✓ Nginx already installed"
else
    $PKG_INSTALL nginx > /dev/null 2>&1
    systemctl enable nginx > /dev/null 2>&1
    echo "   ✓ Nginx installed"
fi
echo ""

# ---- Step 4: Install PM2 (Process Manager) ----
echo "📦 Step 4: Installing PM2..."
if command -v pm2 &> /dev/null; then
    echo "   ✓ PM2 already installed"
else
    npm install -g pm2 > /dev/null 2>&1
    pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true
    echo "   ✓ PM2 installed"
fi
echo ""

# ---- Step 5: Setup Application Directory ----
echo "📁 Step 5: Setting up application directory..."

# Determine where project files are
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/backend/package.json" ]; then
    # Script is run from project directory  
    echo "   Using files from: $SCRIPT_DIR"
    mkdir -p $INSTALL_DIR
    cp -r $SCRIPT_DIR/* $INSTALL_DIR/
    echo "   ✓ Project files copied"
elif [ -d "/tmp/weather-analytics-deploy/backend" ]; then
    # Files uploaded to /tmp
    echo "   Using files from: /tmp/weather-analytics-deploy"
    mkdir -p $INSTALL_DIR
    cp -r /tmp/weather-analytics-deploy/* $INSTALL_DIR/
    echo "   ✓ Project files copied"
else
    echo "   ❌ Project files not found!"
    echo "   Please run this script from project directory, or upload files to:"
    echo "   /tmp/weather-analytics-deploy/"
    exit 1
fi
echo ""

# ---- Step 6: Install Backend Dependencies ----
echo "📦 Step 6: Installing backend dependencies..."
cd $INSTALL_DIR/backend
npm install --production > /dev/null 2>&1
echo "   ✓ Backend dependencies installed"
echo ""

# ---- Step 7: Build Frontend ----
echo "📦 Step 7: Building frontend..."
cd $INSTALL_DIR/frontend
npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1
echo "   ✓ Frontend built to dist/"
echo ""

# ---- Step 8: Configure Environment ----
echo "⚙️  Step 8: Configuring environment..."
cd $INSTALL_DIR/backend

if [ ! -f .env ] || ! grep -q "OPENWEATHER_API_KEY=.\+" .env; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "OpenWeatherMap API Key Required"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Get a FREE API key at: https://openweathermap.org/api"
    echo ""
    read -p "Enter your OpenWeatherMap API key (or press Enter to use mock data): " API_KEY
    
    if [ -z "$API_KEY" ]; then
        API_KEY=""
        echo "   ⚠ No API key - will use mock data"
    else
        echo "   ✓ API key configured"
    fi
    
    cat > .env <<EOF
# OpenWeatherMap API Key
OPENWEATHER_API_KEY=$API_KEY

# Server Port
PORT=$BACKEND_PORT

# Cities to monitor
CITIES=Delhi,Mumbai,Bangalore,Chennai,Kolkata,Hyderabad
EOF
else
    echo "   ✓ .env already configured"
fi
echo ""

# ---- Step 9: Configure Nginx ----
echo "⚙️  Step 9: Configuring Nginx..."

if [ "$PKG_MGR" = "yum" ]; then
    # Amazon Linux / RHEL - use conf.d
    cat > /etc/nginx/conf.d/weather-analytics.conf <<EOF
server {
    listen $FRONTEND_PORT;
    server_name _;
    
    # Frontend - Serve built React app
    location / {
        root $INSTALL_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API - Proxy to Node.js
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
    
    # WebSocket - Proxy to Node.js
    location /ws {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_read_timeout 86400;
    }
}
EOF
else
    # Ubuntu / Debian - use sites-available/enabled
    cat > /etc/nginx/sites-available/weather-analytics <<EOF
server {
    listen $FRONTEND_PORT;
    server_name _;
    
    location / {
        root $INSTALL_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
    
    location /ws {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_read_timeout 86400;
    }
}
EOF
    ln -sf /etc/nginx/sites-available/weather-analytics /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
fi

# Test and reload Nginx
nginx -t
systemctl reload nginx
echo "   ✓ Nginx configured and reloaded"
echo ""

# ---- Step 10: Start Backend with PM2 ----
echo "🚀 Step 10: Starting backend with PM2..."
cd $INSTALL_DIR/backend

# Stop if already running
pm2 delete weather-backend 2>/dev/null || true

# Start backend
pm2 start server.js --name weather-backend
pm2 save
echo "   ✓ Backend started with PM2"
echo ""

# ---- Step 11: Configure Firewall ----
echo "🔥 Step 11: Configuring firewall..."
if command -v firewall-cmd &> /dev/null; then
    # Amazon Linux / RHEL firewalld
    firewall-cmd --permanent --add-port=80/tcp > /dev/null 2>&1 || true
    firewall-cmd --permanent --add-port=443/tcp > /dev/null 2>&1 || true
    firewall-cmd --reload > /dev/null 2>&1 || true
    echo "   ✓ Firewall configured (firewalld)"
elif command -v ufw &> /dev/null; then
    # Ubuntu ufw
    ufw allow 80/tcp > /dev/null 2>&1
    ufw allow 443/tcp > /dev/null 2>&1
    ufw allow 22/tcp > /dev/null 2>&1
    ufw --force enable > /dev/null 2>&1
    echo "   ✓ Firewall configured (ufw)"
else
    echo "   ⚠ No firewall detected, skipping"
fi
echo ""

# ---- Deployment Complete ----
echo "============================================"
echo "✅ Deployment Complete!"
echo "============================================"
echo ""
echo "Application Details:"
echo "  • Install Dir:  $INSTALL_DIR"
echo "  • Backend:      http://localhost:$BACKEND_PORT"
echo "  • Frontend:     http://your-vm-ip:$FRONTEND_PORT"
echo ""
echo "Services Status:"
pm2 status
echo ""
echo "Useful Commands:"
echo "  • View backend logs:  pm2 logs weather-backend"
echo "  • Restart backend:    pm2 restart weather-backend"
echo "  • Check Nginx:        nginx -t && systemctl status nginx"
echo "  • View app status:    pm2 status"
echo ""
echo "Access your dashboard at:"
echo "  http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR-VM-IP')"
echo ""
echo "============================================"
