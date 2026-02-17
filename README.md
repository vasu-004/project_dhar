# WeathX - Real-Time Weather Analytics Dashboard

A real-time weather monitoring dashboard with AWS Kinesis + Lambda pipeline simulation.

**Stack:** HTML, CSS, JavaScript (Vanilla) + Python (Flask + SocketIO)

---

## Features

- 🌍 **Multi-City Weather Monitoring** - Track weather across multiple Indian cities
- 📊 **Real-Time Data Pipeline** - Simulates AWS Kinesis → Lambda → DynamoDB architecture  
- 🔄 **Live WebSocket Updates** - Instant push notifications for weather changes
- 📈 **Interactive Charts** - Temperature trends, rain forecast, air quality (Chart.js)
- 🌓 **Dark/Light Themes** - Toggle between elegant dark and light modes
- 📱 **Responsive Design** - Works beautifully on desktop, tablet, and mobile

---

## Architecture

```
OpenWeatherMap API
        ↓
  Weather Fetcher (Python)
        ↓
  Kinesis Stream Simulator
        ↓
  Lambda Processor
        ↓
  In-Memory DataStore
        ↓
  WebSocket → Frontend (Vanilla JS)
```

---

## Quick Start

### Prerequisites
- Python 3.8+
- Modern web browser

### Backend Setup

```bash
# Navigate to backend
cd Dashboard/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your OpenWeatherMap API key (optional - uses mock data if not provided)

# Start the server
python app.py
```

Server will start on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend
cd Dashboard/frontend

# Option 1: Open directly in browser
# Simply open index.html in your web browser

# Option 2: Use Python's HTTP server (recommended)
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

---

## API Endpoints

### REST API
- `GET /api/health` - Health check
- `GET /api/cities` - List monitored cities
- `GET /api/weather/current` - Current weather for all cities
- `GET /api/weather/current?city={name}` - Current weather for specific city
- `GET /api/weather/history?city={name}&limit={n}` - Historical data
- `GET /api/pipeline/status` - Pipeline component status

### WebSocket
- Connect to `ws://localhost:5000`
- Events: `INIT`, `WEATHER_UPDATE`

---

## Environment Variables

Create `.env` file in `Dashboard/backend/`:

```env
# OpenWeatherMap API Key (get free key at https://openweathermap.org/api)
OPENWEATHER_API_KEY=your_api_key_here

# Server Port
PORT=5000

# Cities to monitor (comma-separated)
CITIES=Delhi,Mumbai,Bangalore,Chennai,Kolkata,Hyderabad
```

---

## Project Structure

```
Dashboard/
├── backend/               # Python Flask backend
│   ├── app.py            # Main Flask server
│   ├── data_store.py     # In-memory data storage
│   ├── kinesis_simulator.py  # AWS Kinesis simulator
│   ├── lambda_processor.py   # Lambda function simulator
│   ├── weather_fetcher.py    # OpenWeatherMap fetcher
│   ├── requirements.txt  # Python dependencies
│   └── .env             # Environment configuration
│
└── frontend/            # Vanilla JS frontend
    ├── index.html       # Main HTML file
    ├── css/
    │   └── styles.css   # All application styles
    └── js/
        ├── app.js       # Main application entry
        ├── api.js       # WebSocket & REST client
        ├── router.js    # Client-side routing
        ├── theme.js     # Theme management
        ├── components/  # UI components
        └── pages/       # Page modules
```

---

## Technologies Used

### Backend
- **Flask** - Web framework
- **Flask-SocketIO** - WebSocket support
- **Requests** - HTTP client for OpenWeatherMap API
- **Eventlet** - Async server

### Frontend
- **Vanilla JavaScript** - No frameworks
- **Chart.js** - Data visualization
- **Socket.IO Client** - WebSocket communication
- **CSS Variables** - Theming system

---

## License

MIT License - Feel free to use this project for learning and development.

---

## Acknowledgments

- Weather data from [OpenWeatherMap](https://openweathermap.org/)
- Icons from [OpenWeatherMap Icons](https://openweathermap.org/weather-conditions)
- Inspired by AWS Kinesis + Lambda architecture
