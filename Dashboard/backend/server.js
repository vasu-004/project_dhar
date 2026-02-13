// ============================================================
// server.js — Main Express + WebSocket Server
// ============================================================
// Orchestrates the full AWS-simulated pipeline:
//   OpenWeatherMap → Kinesis → Lambda → DataStore → Dashboard
// Exposes REST APIs and WebSocket for the React frontend.
// ============================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');

const KinesisSimulator = require('./kinesisSimulator');
const LambdaProcessor = require('./lambdaProcessor');
const DataStore = require('./dataStore');
const WeatherFetcher = require('./weatherFetcher');

// ---- Configuration ----
const PORT = process.env.PORT || 5000;
const CITIES = (process.env.CITIES || 'Delhi,Mumbai,Bangalore,Chennai,Kolkata,Hyderabad')
    .split(',')
    .map(c => c.trim());
const API_KEY = process.env.OPENWEATHER_API_KEY || '';

// ---- Initialize AWS-Simulated Pipeline ----
console.log('═══════════════════════════════════════════════════');
console.log('  Real-Time Weather Analytics Dashboard');
console.log('  AWS Kinesis + Lambda Simulator');
console.log('═══════════════════════════════════════════════════');
console.log('');

// 1. Data Store (simulates DynamoDB)
const dataStore = new DataStore();

// 2. Kinesis Stream
const kinesisStream = new KinesisSimulator('WeatherDataStream', 2);

// 3. Lambda Processor (connected to Kinesis and DataStore)
const lambdaProcessor = new LambdaProcessor(kinesisStream, dataStore);

// 4. Weather Fetcher (feeds data into Kinesis)
const weatherFetcher = new WeatherFetcher(kinesisStream, {
    apiKey: API_KEY,
    cities: CITIES,
    intervalMs: 60000  // Fetch every 60 seconds
});

// ---- Express App ----
const app = express();
app.use(cors());
app.use(express.json());

// ---- REST API Routes ----

// Get current weather for all cities or a specific city
app.get('/api/weather/current', (req, res) => {
    const { city } = req.query;
    if (city) {
        const data = dataStore.getLatest(city);
        if (!data) return res.status(404).json({ error: `No data for city: ${city}` });
        return res.json(data);
    }
    res.json(dataStore.getAllLatest());
});

// Get historical weather data for a city
app.get('/api/weather/history', (req, res) => {
    const { city, limit } = req.query;
    if (!city) return res.status(400).json({ error: 'city parameter required' });
    const history = dataStore.getHistory(city, parseInt(limit) || 50);
    res.json({ city, count: history.length, records: history });
});

// Get all monitored cities
app.get('/api/cities', (req, res) => {
    res.json({ cities: CITIES, activeCities: dataStore.getCities() });
});

// Get pipeline status (Kinesis + Lambda + DataStore)
app.get('/api/pipeline/status', (req, res) => {
    res.json({
        pipeline: 'Real-Time Weather Analytics',
        components: {
            kinesis: kinesisStream.describeStream(),
            lambda: lambdaProcessor.getStats(),
            dataStore: dataStore.getStats(),
            fetcher: weatherFetcher.getStats()
        },
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ---- HTTP + WebSocket Server ----
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Track connected clients
const wsClients = new Set();

wss.on('connection', (ws) => {
    wsClients.add(ws);
    console.log(`[WebSocket] Client connected (total: ${wsClients.size})`);

    // Send initial data
    ws.send(JSON.stringify({
        type: 'INIT',
        data: {
            cities: CITIES,
            current: dataStore.getAllLatest(),
            pipeline: {
                kinesis: kinesisStream.describeStream(),
                lambda: lambdaProcessor.getStats(),
                dataStore: dataStore.getStats(),
                fetcher: weatherFetcher.getStats()
            }
        }
    }));

    ws.on('close', () => {
        wsClients.delete(ws);
        console.log(`[WebSocket] Client disconnected (total: ${wsClients.size})`);
    });
});

// Push updates to all WebSocket clients when Lambda processes a record
kinesisStream.on('record', (record) => {
    // Small delay to let Lambda process first
    setTimeout(() => {
        const message = JSON.stringify({
            type: 'WEATHER_UPDATE',
            data: {
                city: record.partitionKey,
                current: dataStore.getLatest(record.partitionKey),
                pipeline: {
                    kinesis: kinesisStream.describeStream(),
                    lambda: lambdaProcessor.getStats(),
                    dataStore: dataStore.getStats()
                }
            },
            timestamp: new Date().toISOString()
        });

        wsClients.forEach(client => {
            if (client.readyState === 1) { // OPEN
                client.send(message);
            }
        });
    }, 50);
});

// ---- Start Everything ----
server.listen(PORT, () => {
    console.log('');
    console.log(`[Server] ✓ HTTP + WebSocket server running on http://localhost:${PORT}`);
    console.log(`[Server] ✓ REST API: http://localhost:${PORT}/api/weather/current`);
    console.log(`[Server] ✓ WebSocket: ws://localhost:${PORT}`);
    console.log(`[Server] ✓ Pipeline Status: http://localhost:${PORT}/api/pipeline/status`);
    console.log('');

    // Start the weather fetch cycle
    weatherFetcher.start();
});
