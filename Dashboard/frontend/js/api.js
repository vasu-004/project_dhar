// ============================================================
// api.js — API Client & WebSocket Manager
// ============================================================
// Manages WebSocket connection, REST API calls, and app state
// ============================================================

const API_BASE = 'http://localhost:5000';
const WS_URL = 'ws://localhost:5000';

const AppState = {
    currentData: {},
    cities: [],
    selectedCity: '',
    history: {},
    pipeline: null,
    connected: false,
    events: []
};

const APIClient = {
    socket: null,
    reconnectTimeout: null,
    listeners: {},

    // Initialize WebSocket connection
    connect() {
        if (this.socket?.connected) return;

        this.socket = io(WS_URL, {
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            AppState.connected = true;
            console.log('[WS] Connected');
            this.emit('connected', true);
            this.updateConnectionStatus();
        });

        this.socket.on('disconnect', () => {
            AppState.connected = false;
            console.log('[WS] Disconnected — reconnecting...');
            this.emit('connected', false);
            this.updateConnectionStatus();
        });

        this.socket.on('INIT', (msg) => {
            console.log('[WS] Received INIT', msg);
            AppState.currentData = msg.data.current || {};
            AppState.cities = msg.data.cities || [];
            AppState.pipeline = msg.data.pipeline || null;

            if (AppState.cities.length && !AppState.selectedCity) {
                AppState.selectedCity = AppState.cities[0];
            }

            this.emit('init', msg.data);
            this.emit('dataUpdated');
        });

        this.socket.on('WEATHER_UPDATE', (msg) => {
            const city = msg.data.city;
            AppState.currentData[city] = msg.data.current;
            AppState.pipeline = msg.data.pipeline;

            // Add to events log
            AppState.events.unshift({
                id: Date.now(),
                city: city,
                temp: msg.data.current?.temperature,
                weather: msg.data.current?.weatherDescription,
                time: new Date().toLocaleTimeString()
            });

            // Keep only last 50 events
            if (AppState.events.length > 50) {
                AppState.events = AppState.events.slice(0, 50);
            }

            this.emit('weatherUpdate', msg.data);
            this.emit('dataUpdated');
        });
    },

    // Event emitter
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    },

    // Update connection status in UI
    updateConnectionStatus() {
        const container = document.getElementById('connection-status');
        if (!container) return;

        const statusClass = AppState.connected ? 'online' : 'offline';
        const statusText = AppState.connected ? 'Live Connected' : 'Connecting...';

        container.innerHTML = `
            <div class="status-indicator ${statusClass}">
                <span class="status-dot"></span>
                ${statusText}
            </div>
        `;
    },

    // Fetch history for a city
    async fetchHistory(city, limit = 50) {
        try {
            const res = await fetch(`${API_BASE}/api/weather/history?city=${encodeURIComponent(city)}&limit=${limit}`);
            const data = await res.json();
            AppState.history[city] = data.records || [];
            this.emit('historyUpdated', { city, records: data.records });
            return data.records;
        } catch (err) {
            console.error('[API] Error fetching history:', err);
            return [];
        }
    },

    // Select a city
    selectCity(city) {
        AppState.selectedCity = city;
        this.fetchHistory(city);
        this.emit('cityChanged', city);
        this.emit('dataUpdated');
    },

    // Get current data for selected city
    getCurrentCityData() {
        return AppState.currentData[AppState.selectedCity] || null;
    },

    // Get history for selected city
    getHistory() {
        return AppState.history[AppState.selectedCity] || [];
    }
};
