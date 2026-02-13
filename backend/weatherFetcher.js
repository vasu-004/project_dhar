// ============================================================
// weatherFetcher.js — OpenWeatherMap Data Fetcher
// ============================================================
// Periodically fetches real weather data from OpenWeatherMap
// API and pushes it into the Kinesis stream. Falls back to
// realistic mock data if no API key is configured.
// ============================================================

const axios = require('axios');

class WeatherFetcher {
    constructor(kinesisStream, options = {}) {
        this.kinesisStream = kinesisStream;
        this.apiKey = options.apiKey || '';
        this.cities = options.cities || ['Delhi', 'Mumbai', 'Bangalore'];
        this.intervalMs = options.intervalMs || 60000; // 60 seconds
        this.intervalHandle = null;
        this.fetchCount = 0;
        this.lastFetch = null;
        this.status = 'IDLE';
        this.useMockData = !this.apiKey;

        if (this.useMockData) {
            console.log('[Fetcher] ⚠ No API key — using realistic mock weather data');
        } else {
            console.log(`[Fetcher] ✓ API key configured — will fetch real data for: ${this.cities.join(', ')}`);
        }
    }

    /**
     * Start the periodic fetch cycle.
     */
    start() {
        this.status = 'RUNNING';
        console.log(`[Fetcher] Started — fetching every ${this.intervalMs / 1000}s for ${this.cities.length} cities`);

        // Fetch immediately, then on interval
        this._fetchAll();
        this.intervalHandle = setInterval(() => this._fetchAll(), this.intervalMs);
    }

    /**
     * Stop the fetch cycle.
     */
    stop() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
        this.status = 'STOPPED';
        console.log('[Fetcher] Stopped');
    }

    /**
     * Fetch weather data for all configured cities.
     */
    async _fetchAll() {
        for (const city of this.cities) {
            try {
                const data = this.useMockData
                    ? this._generateMockData(city)
                    : await this._fetchFromAPI(city);

                // Push into Kinesis stream
                this.kinesisStream.putRecord(data, city);
                this.fetchCount++;
                this.lastFetch = new Date().toISOString();
            } catch (err) {
                console.error(`[Fetcher] Error fetching ${city}:`, err.message);
            }
        }
    }

    /**
     * Fetch real data from OpenWeatherMap API.
     */
    async _fetchFromAPI(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;
        const response = await axios.get(url, { timeout: 10000 });
        return response.data;
    }

    /**
     * Generate realistic mock weather data for a city.
     */
    _generateMockData(city) {
        const cityData = this._getCityDefaults(city);
        const now = Math.floor(Date.now() / 1000);
        const hour = new Date().getHours();

        // Temperature varies by time of day
        const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 5;
        const baseTemp = cityData.baseTemp + tempVariation + (Math.random() - 0.5) * 3;

        const conditions = [
            { main: 'Clear', description: 'clear sky', icon: hour >= 6 && hour < 18 ? '01d' : '01n' },
            { main: 'Clouds', description: 'scattered clouds', icon: hour >= 6 && hour < 18 ? '03d' : '03n' },
            { main: 'Clouds', description: 'broken clouds', icon: hour >= 6 && hour < 18 ? '04d' : '04n' },
            { main: 'Rain', description: 'light rain', icon: hour >= 6 && hour < 18 ? '10d' : '10n' },
            { main: 'Haze', description: 'haze', icon: hour >= 6 && hour < 18 ? '50d' : '50n' }
        ];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];

        return {
            coord: cityData.coord,
            weather: [condition],
            main: {
                temp: Math.round(baseTemp * 10) / 10,
                feels_like: Math.round((baseTemp - 1 + Math.random() * 2) * 10) / 10,
                temp_min: Math.round((baseTemp - 2) * 10) / 10,
                temp_max: Math.round((baseTemp + 2) * 10) / 10,
                pressure: 1010 + Math.round(Math.random() * 15),
                humidity: cityData.baseHumidity + Math.round((Math.random() - 0.5) * 20),
                sea_level: 1013 + Math.round(Math.random() * 5),
                grnd_level: 1008 + Math.round(Math.random() * 5)
            },
            visibility: 5000 + Math.round(Math.random() * 5000),
            wind: {
                speed: Math.round((2 + Math.random() * 8) * 10) / 10,
                deg: Math.round(Math.random() * 360),
                gust: Math.round((5 + Math.random() * 10) * 10) / 10
            },
            clouds: { all: Math.round(Math.random() * 100) },
            dt: now,
            sys: {
                country: 'IN',
                sunrise: now - (now % 86400) + 6 * 3600 + 1800,
                sunset: now - (now % 86400) + 18 * 3600 + 1800
            },
            timezone: 19800,
            id: cityData.id,
            name: city
        };
    }

    /**
     * Default coordinates and baseline weather for Indian cities.
     */
    _getCityDefaults(city) {
        const defaults = {
            'Delhi': { id: 1273294, coord: { lon: 77.22, lat: 28.67 }, baseTemp: 25, baseHumidity: 50 },
            'Mumbai': { id: 1275339, coord: { lon: 72.88, lat: 19.08 }, baseTemp: 30, baseHumidity: 70 },
            'Bangalore': { id: 1277333, coord: { lon: 77.60, lat: 12.98 }, baseTemp: 24, baseHumidity: 55 },
            'Chennai': { id: 1264527, coord: { lon: 80.27, lat: 13.08 }, baseTemp: 32, baseHumidity: 75 },
            'Kolkata': { id: 1275004, coord: { lon: 88.37, lat: 22.57 }, baseTemp: 28, baseHumidity: 65 },
            'Hyderabad': { id: 1269843, coord: { lon: 78.47, lat: 17.38 }, baseTemp: 27, baseHumidity: 55 }
        };
        return defaults[city] || { id: 9999, coord: { lon: 0, lat: 0 }, baseTemp: 25, baseHumidity: 50 };
    }

    /**
     * Get fetcher stats.
     */
    getStats() {
        return {
            status: this.status,
            useMockData: this.useMockData,
            cities: this.cities,
            fetchCount: this.fetchCount,
            lastFetch: this.lastFetch,
            intervalMs: this.intervalMs
        };
    }
}

module.exports = WeatherFetcher;
