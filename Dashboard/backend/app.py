# ============================================================
# app.py — Main Flask + WebSocket Server
# ============================================================
# Orchestrates the full AWS-simulated pipeline:
#   OpenWeatherMap → Kinesis → Lambda → DataStore → Dashboard
# Exposes REST APIs and WebSocket for the frontend.
# ============================================================

import os
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit

from data_store import DataStore
from kinesis_simulator import KinesisSimulator
from lambda_processor import LambdaProcessor
from weather_fetcher import WeatherFetcher

# Load environment variables
load_dotenv()

# Configuration
PORT = int(os.getenv('PORT', 5000))
CITIES = [c.strip() for c in os.getenv('CITIES', 'Delhi,Mumbai,Chennai,Kolkata,Hyderabad').split(',')]
API_KEY = os.getenv('OPENWEATHER_API_KEY', '')

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'weather-dashboard-secret-key')
CORS(app)

# Initialize SocketIO (using threading mode for Python 3.12 compatibility)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# ---- Initialize AWS-Simulated Pipeline ----
print('═══════════════════════════════════════════════════')
print('  Real-Time Weather Analytics Dashboard')
print('  AWS Kinesis + Lambda Simulator (Python)')
print('═══════════════════════════════════════════════════')
print('')

# 1. Data Store (simulates DynamoDB)
data_store = DataStore()

# 2. Kinesis Stream
kinesis_stream = KinesisSimulator('WeatherDataStream', 2)

# 3. Lambda Processor (connected to Kinesis and DataStore)
lambda_processor = LambdaProcessor(kinesis_stream, data_store)

# 4. Weather Fetcher (feeds data into Kinesis)
weather_fetcher = WeatherFetcher(
    kinesis_stream,
    api_key=API_KEY,
    cities=CITIES,
    interval_sec=60  # Fetch every 60 seconds
)

# Track connected WebSocket clients
connected_clients = set()


# ---- REST API Routes ----

@app.route('/api/weather/current', methods=['GET'])
def get_current_weather():
    """Get current weather for all cities or a specific city."""
    city = request.args.get('city')
    
    if city:
        data = data_store.get_latest(city)
        if not data:
            return jsonify({'error': f'No data for city: {city}'}), 404
        return jsonify(data)
    
    return jsonify(data_store.get_all_latest())


@app.route('/api/weather/history', methods=['GET'])
def get_weather_history():
    """Get historical weather data for a city."""
    city = request.args.get('city')
    
    if not city:
        return jsonify({'error': 'city parameter required'}), 400
    
    limit = int(request.args.get('limit', 50))
    history = data_store.get_history(city, limit)
    
    return jsonify({
        'city': city,
        'count': len(history),
        'records': history
    })


@app.route('/api/cities', methods=['GET'])
def get_cities():
    """Get all monitored cities."""
    return jsonify({
        'cities': CITIES,
        'activeCities': data_store.get_cities()
    })


@app.route('/api/pipeline/status', methods=['GET'])
def get_pipeline_status():
    """Get pipeline status (Kinesis + Lambda + DataStore + Fetcher)."""
    return jsonify({
        'pipeline': 'Real-Time Weather Analytics',
        'components': {
            'kinesis': kinesis_stream.describe_stream(),
            'lambda': lambda_processor.get_stats(),
            'dataStore': data_store.get_stats(),
            'fetcher': weather_fetcher.get_stats()
        },
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'uptime': data_store.get_stats()['uptime'],
        'timestamp': datetime.now().isoformat()
    })


# ---- WebSocket Events ----

@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    connected_clients.add(request.sid)
    print(f'[WebSocket] Client connected (total: {len(connected_clients)})')
    
    # Send initial data
    emit('INIT', {
        'type': 'INIT',
        'data': {
            'cities': CITIES,
            'current': data_store.get_all_latest(),
            'pipeline': {
                'kinesis': kinesis_stream.describe_stream(),
                'lambda': lambda_processor.get_stats(),
                'dataStore': data_store.get_stats(),
                'fetcher': weather_fetcher.get_stats()
            }
        }
    })


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    connected_clients.discard(request.sid)
    print(f'[WebSocket] Client disconnected (total: {len(connected_clients)})')


# ---- Broadcast Weather Updates ----

def on_kinesis_record(record):
    """Broadcast updates to all WebSocket clients when Kinesis receives a record."""
    # Small delay to let Lambda process first
    socketio.sleep(0.05)
    
    city = record['partitionKey']
    message = {
        'type': 'WEATHER_UPDATE',
        'data': {
            'city': city,
            'current': data_store.get_latest(city),
            'pipeline': {
                'kinesis': kinesis_stream.describe_stream(),
                'lambda': lambda_processor.get_stats(),
                'dataStore': data_store.get_stats()
            }
        },
        'timestamp': datetime.now().isoformat()
    }
    
    socketio.emit('WEATHER_UPDATE', message, broadcast=True)


# Subscribe to Kinesis events for broadcasting
kinesis_stream.on('record', on_kinesis_record)


# ---- Start Everything ----

if __name__ == '__main__':
    print('')
    print(f'[Server] ✓ HTTP + WebSocket server starting on http://localhost:{PORT}')
    print(f'[Server] ✓ REST API: http://localhost:{PORT}/api/weather/current')
    print(f'[Server] ✓ WebSocket: ws://localhost:{PORT}')
    print(f'[Server] ✓ Pipeline Status: http://localhost:{PORT}/api/pipeline/status')
    print('')
    
    # Start the weather fetch cycle
    weather_fetcher.start()
    
    # Run the Flask-SocketIO server
    socketio.run(app, host='0.0.0.0', port=PORT, debug=False)
