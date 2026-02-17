#!/bin/bash
# ============================================================
# VM Deployment Script
# Weather Analytics Dashboard - Python/Flask + Vanilla JS
# ============================================================
# Works on: Amazon Linux, Ubuntu, Debian, RHEL, CentOS
# ============================================================

set -e  # Exit on error

echo "============================================"
echo "Weather Analytics Dashboard - VM Deployment"
echo "Python/Flask + Vanilla JavaScript"
echo "============================================"
echo ""

# Configuration
INSTALL_DIR="/opt/weather-analytics"
BACKEND_PORT=5000
FRONTEND_PORT=80
PYTHON_VERSION="3.9"

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

# ---- Step 2: Install Python 3 ----
echo "📦 Step 2: Installing Python ${PYTHON_VERSION}..."
if command -v python3 &> /dev/null; then
    echo "   ✓ Python3 already installed: $(python3 --version)"
    
    # Ensure venv package is installed on Ubuntu/Debian systems
    if [ "$PKG_MGR" = "apt" ]; then
        PYTHON_VER=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        if ! dpkg -l | grep -q "python${PYTHON_VER}-venv"; then
            echo "   Installing python${PYTHON_VER}-venv package..."
            $PKG_INSTALL python${PYTHON_VER}-venv > /dev/null 2>&1
        fi
    fi
else
    if [ "$PKG_MGR" = "yum" ]; then
        $PKG_INSTALL python3 python3-pip python3-devel > /dev/null 2>&1
    else
        $PKG_INSTALL python3 python3-pip python3-venv > /dev/null 2>&1
    fi
    echo "   ✓ Python3 installed: $(python3 --version)"
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

# ---- Step 4: Setup Application Directory ----
echo "📁 Step 4: Setting up application directory..."

# Determine where project files are
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/Dashboard/backend/app.py" ]; then
    # Script is run from project directory  
    echo "   Using files from: $SCRIPT_DIR"
    mkdir -p $INSTALL_DIR
    cp -r $SCRIPT_DIR/Dashboard/* $INSTALL_DIR/
    echo "   ✓ Project files copied"
elif [ -d "/tmp/weather-analytics-deploy/backend" ]; then
    # Files uploaded to /tmp
    echo "   Using files from: /tmp/weather-analytics-deploy"
    mkdir -p $INSTALL_DIR
    cp -r /tmp/weather-analytics-deploy/* $INSTALL_DIR/
    echo "   ✓ Project files copied"
else
    echo "   ❌ Project files not found!"
    echo "   Please run this script from project root, or upload Dashboard/ to:"
    echo "   /tmp/weather-analytics-deploy/"
    exit 1
fi
echo ""

# ---- Step 5: Setup Python Virtual Environment ----
echo "📦 Step 5: Setting up Python virtual environment..."
cd $INSTALL_DIR/backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "   ✓ Virtual environment created"
fi

source venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
echo "   ✓ Python dependencies installed"
deactivate
echo ""

# ---- Step 6: Configure Environment ----
echo "⚙️  Step 6: Configuring environment..."
cd $INSTALL_DIR/backend

if [ ! -f .env ] || ! grep -q "OPENWEATHER_API_KEY=.\\+" .env; then
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

# Secret Key for Flask-SocketIO
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
EOF
else
    echo "   ✓ .env already configured"
fi
echo ""

# ---- Step 7: Create Systemd Service ----
echo "⚙️  Step 7: Creating systemd service..."

cat > /etc/systemd/system/weather-backend.service <<EOF
[Unit]
Description=Weather Analytics Backend (Flask + SocketIO)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR/backend
Environment="PATH=$INSTALL_DIR/backend/venv/bin"
ExecStart=$INSTALL_DIR/backend/venv/bin/python app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable weather-backend.service
echo "   ✓ Systemd service created"
echo ""

# ---- Step 8: Configure Nginx ----
echo "⚙️  Step 8: Configuring Nginx..."

if [ "$PKG_MGR" = "yum" ]; then
    # Amazon Linux / RHEL - use conf.d
    cat > /etc/nginx/conf.d/weather-analytics.conf <<EOF
server {
    listen $FRONTEND_PORT;
    server_name _;
    
    # Frontend - Serve static files
    location / {
        root $INSTALL_DIR/frontend;
        try_files \$uri \$uri/ /index.html;
        index index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API - Proxy to Flask
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
    
    # WebSocket - Proxy to Flask-SocketIO
    location /socket.io/ {
        proxy_pass http://localhost:$BACKEND_PORT/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_read_timeout 86400;
        proxy_buffering off;
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
        root $INSTALL_DIR/frontend;
        try_files \$uri \$uri/ /index.html;
        index index.html;
        
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
    
    location /socket.io/ {
        proxy_pass http://localhost:$BACKEND_PORT/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_read_timeout 86400;
        proxy_buffering off;
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

# ---- Step 9: Start Backend ----
echo "🚀 Step 9: Starting backend service..."
systemctl restart weather-backend.service
systemctl status weather-backend.service --no-pager
echo "   ✓ Backend started"
echo ""

# ---- Step 10: Configure Firewall ----
echo "🔥 Step 10: Configuring firewall..."
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
echo "  • Stack:        Python/Flask + Vanilla JS"
echo ""
echo "Services Status:"
systemctl status weather-backend --no-pager | head -5
echo ""
echo "Useful Commands:"
echo "  • View backend logs:   journalctl -u weather-backend -f"
echo "  • Restart backend:     systemctl restart weather-backend"
echo "  • Check backend:       systemctl status weather-backend"
echo "  • Check Nginx:         nginx -t && systemctl status nginx"
echo ""
echo "Access your dashboard at:"
echo "  http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR-VM-IP')"
echo ""
echo "============================================"
