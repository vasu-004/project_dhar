/**
 * WeathX - Core Application Logic (Vanilla JS)
 */

// Configuration
const SOCKET_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : `http://${window.location.hostname}:5000`;

const CITIES = ['Delhi', 'Mumbai', 'London', 'New York', 'Tokyo'];

// State
let state = {
    selectedCity: 'Delhi',
    weatherData: {}, // Map of city -> current data
    history: [],     // History for selected city
    connected: false,
    currentPage: 'home'
};

// DOM Elements
const elements = {
    liveClock: document.getElementById('live-clock'),
    cityTabs: document.getElementById('city-tabs'),
    pages: document.querySelectorAll('.page'),
    navLinks: document.querySelectorAll('.nav-link'),
    connBadge: document.getElementById('conn-badge'),
    forecastGrid: document.getElementById('forecast-grid'),
    pipelineFlow: document.getElementById('pipeline-flow'),
    chartCityName: document.getElementById('chart-city-name')
};

// Initialize WebSocket
const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling']
});

socket.on('connect', () => {
    console.log('Connected to backend');
    state.connected = true;
    updateConnectionUI();
});

socket.on('disconnect', () => {
    console.log('Disconnected from backend');
    state.connected = false;
    updateConnectionUI();
});

socket.on('INIT', (msg) => {
    console.log('Received INIT:', msg);
    state.weatherData = msg.data.current || {};
    // Populate cities if not already done
    if (elements.cityTabs.children.length === 0) {
        msg.data.cities.forEach(city => {
            const btn = document.createElement('button');
            btn.className = `city-btn ${city === state.selectedCity ? 'active' : ''}`;
            btn.textContent = city;
            btn.addEventListener('click', () => selectCity(city));
            elements.cityTabs.appendChild(btn);
        });
    }
    if (state.weatherData[state.selectedCity]) {
        updateCityUI(state.weatherData[state.selectedCity]);
        updatePipelineUI(msg.data.pipeline);
    }
});

socket.on('WEATHER_UPDATE', (msg) => {
    console.log('New weather data:', msg);
    const data = msg.data.current;
    state.weatherData[msg.data.city] = data;
    if (msg.data.city === state.selectedCity) {
        updateCityUI(data);
        updatePipelineUI(msg.data.pipeline);
    }
});

// Update UI Functions
function updateConnectionUI() {
    if (elements.connBadge) {
        elements.connBadge.className = `connection-badge ${state.connected ? 'online' : 'offline'}`;
        elements.connBadge.textContent = state.connected ? '● Live' : '○ Offline';
    }
}

function updateCityUI(data) {
    document.getElementById('val-temp').textContent = `${Math.round(data.temperature)}°C`;
    document.getElementById('val-feels').textContent = `Feels like: ${Math.round(data.feelsLike)}°C`;
    document.getElementById('val-humidity').textContent = `${data.humidity}%`;
    document.getElementById('val-condition').textContent = data.weatherMain;
    document.getElementById('val-desc').textContent = data.weatherDescription;
    document.getElementById('val-precip').textContent = `${data.precipitation || 0} mm`;

    renderForecast(data.forecast);
}

function renderForecast(forecast) {
    if (!elements.forecastGrid || !forecast) return;
    elements.forecastGrid.innerHTML = forecast.map(f => `
        <div class="forecast-card">
            <span class="forecast-time">${f.time}</span>
            <div class="forecast-icon"><i data-lucide="${getIconName(f.main)}"></i></div>
            <span class="forecast-temp">${Math.round(f.temp)}°C</span>
        </div>
    `).join('');
    lucide.createIcons();
}

function updatePipelineUI(pipeline) {
    if (!elements.pipelineFlow || !pipeline) return;

    const stages = [
        { name: 'Data Source', subtitle: 'OpenWeatherMap', icon: 'cloud-lightning', status: pipeline.sourceStatus, stats: `${pipeline.fetchCount} fetches` },
        { name: 'Kinesis Stream', subtitle: 'WeatherDataStream', icon: 'zap', status: pipeline.kinesisStatus, stats: `${pipeline.recordCount} records` },
        { name: 'Lambda Processor', subtitle: 'WeatherDataProcessor', icon: 'code', status: pipeline.lambdaStatus, stats: `${pipeline.recordCount} invocations` },
        { name: 'Data Store', subtitle: 'In-Memory DB', icon: 'database', status: pipeline.storeStatus, stats: `${pipeline.recordCount} records` }
    ];

    elements.pipelineFlow.innerHTML = stages.map((s, i) => `
        <div class="pipeline-stage ${s.status}">
            <div class="stage-icon"><i data-lucide="${s.icon}"></i></div>
            <div class="stage-info">
                <div class="stage-name">${s.name}</div>
                <div class="stage-subtitle">${s.subtitle}</div>
                <div class="stage-stats">${s.stats}</div>
            </div>
            <div class="stage-indicator ${s.status}"></div>
        </div>
        ${i < stages.length - 1 ? '<div class="pipeline-arrow"><i data-lucide="chevron-right"></i></div>' : ''}
    `).join('');

    document.getElementById('val-lambda-dur').textContent = `${pipeline.lambda.averageDurationMs}ms`;
    document.getElementById('val-last-inv').textContent = pipeline.lambda.lastInvocation
        ? new Date(pipeline.lambda.lastInvocation).toLocaleTimeString()
        : 'N/A';

    lucide.createIcons();
}

// Navigation & Tabs
function initNavigation() {
    elements.navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const page = link.getAttribute('data-page');
            switchPage(page);
        });
    });
}

function switchPage(pageId) {
    state.currentPage = pageId;
    elements.pages.forEach(p => p.classList.remove('active'));
    elements.navLinks.forEach(l => l.classList.remove('active'));

    document.getElementById(`page-${pageId}`).classList.add('active');
    document.querySelector(`.nav-link[data-page="${pageId}"]`).classList.add('active');

    if (pageId === 'analytics') {
        fetchHistory(state.selectedCity);
    }
}

function selectCity(city) {
    state.selectedCity = city;
    document.querySelectorAll('.city-btn').forEach(b => {
        b.classList.toggle('active', b.textContent === city);
    });

    if (state.weatherData[city]) {
        updateCityUI(state.weatherData[city]);
        updatePipelineUI(state.weatherData[city].pipeline);
    }

    if (state.currentPage === 'analytics') {
        fetchHistory(city);
    }
}

// Utilities
function getIconName(condition) {
    const map = {
        'Clear': 'sun',
        'Clouds': 'cloud',
        'Rain': 'cloud-rain',
        'Thunderstorm': 'cloud-lightning',
        'Drizzle': 'cloud-drizzle',
        'Snow': 'snowflake'
    };
    return map[condition] || 'cloud';
}

function updateClock() {
    const now = new Date();
    elements.liveClock.textContent = now.toLocaleTimeString();
}

async function fetchHistory(city) {
    elements.chartCityName.textContent = city;
    try {
        const res = await fetch(`${SOCKET_URL}/api/weather/history?city=${city}`);
        const data = await res.json();
        state.history = data;
        if (window.updateChart) {
            window.updateChart(data);
        }
    } catch (err) {
        console.error('Failed to fetch history:', err);
    }
}

// Init
initNavigation();
setInterval(updateClock, 1000);
updateClock();
