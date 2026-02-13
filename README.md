# Weather Analytics Dashboard

Real-time weather analytics dashboard with AWS Kinesis + Lambda architecture simulation.

## 🚀 Quick Start for VM Deployment

### Prerequisites
- Ubuntu 20.04+ VM with public IP
- SSH access to VM
- OpenWeatherMap API key (free: https://openweathermap.org/api)

### Deploy in 3 Steps

**1. Upload project to VM:**
```bash
scp -r d:\project_dhar\* user@your-vm-ip:/tmp/weather-analytics-deploy/
```

**2. Run deployment script on VM:**
```bash
ssh user@your-vm-ip
cd /tmp/weather-analytics-deploy
sudo bash vm-deploy.sh
```

**3. Access dashboard:**
```
http://your-vm-ip
```

**Complete guide:** [VM-DEPLOYMENT.md](VM-DEPLOYMENT.md)

---

## 📦 What's Included

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend** | Node.js + Express | Weather data pipeline (Kinesis → Lambda → DynamoDB simulation) |
| **Frontend** | React + Vite | Real-time analytics dashboard with WebSocket |
| **Web Server** | Nginx | Reverse proxy + static file serving |
| **Process Manager** | PM2 | Auto-restart, logging, monitoring |

---

## 🌐 Architecture

```
OpenWeatherMap API → Kinesis Stream → Lambda Processor → Data Store → Dashboard
      (Real)           (Simulated)      (Simulated)       (In-memory)   (React)
```

**Data Flow:**
1. Fetches weather every 60 seconds from OpenWeatherMap
2. Queues records in Kinesis stream simulator
3. Lambda processor transforms data + computes metrics
4. Stores in in-memory time-series database
5. WebSocket pushes live updates to React dashboard

---

## 📁 Project Structure

```
project_dhar/
├── backend/                    # Node.js backend
│   ├── server.js              # Express + WebSocket server
│   ├── kinesisSimulator.js    # AWS Kinesis stream simulator
│   ├── lambdaProcessor.js     # AWS Lambda function simulator
│   ├── weatherFetcher.js      # OpenWeatherMap API client
│   ├── dataStore.js           # In-memory DynamoDB simulator
│   └── .env                   # Configuration (API key)
├── frontend/                   # React dashboard
│   ├── src/
│   │   ├── App.jsx            # Main dashboard layout
│   │   ├── components/        # 6 dashboard widgets
│   │   └── hooks/             # WebSocket + REST hook
│   └── dist/                  # Production build
├── vm-deploy.sh               # Automated VM deployment
├── VM-DEPLOYMENT.md           # Complete deployment guide
└── README.md                  # This file
```

---

## ⚙️ Management Commands

### Backend

```bash
# View logs
sudo pm2 logs weather-backend

# Restart
sudo pm2 restart weather-backend

# Status
sudo pm2 status
```

### Nginx

```bash
# Restart
sudo systemctl restart nginx

# Test config
sudo nginx -t

# View logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔧 Configuration

### Change Monitored Cities

Edit `/opt/weather-analytics/backend/.env`:
```env
CITIES=London,Paris,Tokyo,New York,Sydney
```

Restart: `sudo pm2 restart weather-backend`

### Add OpenWeatherMap API Key

Edit `/opt/weather-analytics/backend/.env`:
```env
OPENWEATHER_API_KEY=your_key_here
```

Restart: `sudo pm2 restart weather-backend`

---

## 🌤️ Features

**Dashboard Widgets:**
- Real-time metric cards (Temperature, Humidity, Wind, Pressure, etc.)
- Temperature trend area chart
- Pipeline status visualization (Kinesis → Lambda → DynamoDB flow)
- Weather details panel with comfort index
- Live data stream showing processed events
- City selector for 6 Indian cities

**Derived Metrics:**
- Heat Index
- Wind Chill
- Dew Point
- Comfort Index (0-100)
- Wind Direction Labels

---

## 🔒 Security

**Production checklist:**
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Configure firewall (UFW)
- [ ] Use SSH keys (disable password auth)
- [ ] Keep API keys in `.env` (never commit)
- [ ] Regular updates: `sudo apt-get update && sudo apt-get upgrade`

---

## 📊 API Endpoints

```bash
# Current weather for all cities
GET http://your-vm-ip/api/weather/current

# Current weather for specific city
GET http://your-vm-ip/api/weather/current?city=Delhi

# Historical data
GET http://your-vm-ip/api/weather/history?city=Delhi&limit=50

# Pipeline status
GET http://your-vm-ip/api/pipeline/status

# Health check
GET http://your-vm-ip/api/health
```

---

## 🚨 Troubleshooting

**Dashboard not loading?**
```bash
sudo pm2 logs weather-backend
sudo tail -f /var/log/nginx/error.log
```

**Port 80 in use?**
```bash
sudo lsof -i :80
sudo systemctl stop apache2  # If Apache is running
```

**WebSocket not connecting?**
- Check Nginx WebSocket proxy config in `/etc/nginx/sites-available/weather-analytics`
- Ensure firewall allows port 80

---

## 📚 Documentation

- [VM-DEPLOYMENT.md](VM-DEPLOYMENT.md) - Complete VM deployment guide
- [REAL-DATA-SETUP.md](REAL-DATA-SETUP.md) - OpenWeatherMap API setup
- [AWS-DEPLOYMENT.md](AWS-DEPLOYMENT.md) - (Optional) Deploy to real AWS infrastructure

---

## 💰 Cost Estimate

**OpenWeatherMap API:** Free (1M calls/month)  
**VM Hosting:** $5-10/month (DigitalOcean, AWS, etc.)  
**Total:** ~$5-10/month for production dashboard

---

## 📝 License

MIT License - Free to use and modify!

---

**Built with:** Node.js, React, Express, WebSocket, Nginx, PM2, OpenWeatherMap API
