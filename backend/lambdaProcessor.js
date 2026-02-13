// ============================================================
// lambdaProcessor.js — AWS Lambda Function Simulator
// ============================================================
// Subscribes to the Kinesis stream and processes each record:
// transforms raw OpenWeatherMap data into analytics-ready
// format with derived metrics, then stores in DataStore.
// ============================================================

class LambdaProcessor {
    constructor(kinesisStream, dataStore) {
        this.functionName = 'WeatherDataProcessor';
        this.kinesisStream = kinesisStream;
        this.dataStore = dataStore;
        this.invocationCount = 0;
        this.errorCount = 0;
        this.lastInvocation = null;
        this.status = 'ACTIVE';
        this.averageDuration = 0;
        this._totalDuration = 0;

        // Subscribe to Kinesis stream events (event source mapping)
        this.kinesisStream.on('record', (record) => this._handleRecord(record));

        console.log(`[Lambda] Function "${this.functionName}" deployed and connected to Kinesis stream`);
    }

    /**
     * Process a single Kinesis record (the Lambda handler).
     */
    _handleRecord(record) {
        const startTime = Date.now();
        this.invocationCount++;

        try {
            const rawData = record.data;

            // Transform raw weather data into analytics-ready format
            const processed = this._transformWeatherData(rawData);

            // Store processed data
            this.dataStore.put(processed.city, processed);

            const duration = Date.now() - startTime;
            this._totalDuration += duration;
            this.averageDuration = Math.round(this._totalDuration / this.invocationCount);
            this.lastInvocation = new Date().toISOString();

            console.log(`[Lambda] ✓ Processed: ${processed.city} | Temp: ${processed.temperature}°C | Duration: ${duration}ms`);

            return { statusCode: 200, body: processed };
        } catch (err) {
            this.errorCount++;
            console.error(`[Lambda] ✗ Error processing record:`, err.message);
            return { statusCode: 500, error: err.message };
        }
    }

    /**
     * Transform raw OpenWeatherMap API data into dashboard-ready format.
     */
    _transformWeatherData(raw) {
        const temp = raw.main?.temp ?? 0;
        const feelsLike = raw.main?.feels_like ?? 0;
        const humidity = raw.main?.humidity ?? 0;
        const windSpeed = raw.wind?.speed ?? 0;
        const windDeg = raw.wind?.deg ?? 0;

        return {
            // Identity
            city: raw.name || 'Unknown',
            country: raw.sys?.country || 'N/A',
            cityId: raw.id,
            coordinates: raw.coord || { lon: 0, lat: 0 },

            // Core metrics
            temperature: Math.round(temp * 10) / 10,
            feelsLike: Math.round(feelsLike * 10) / 10,
            tempMin: Math.round((raw.main?.temp_min ?? temp) * 10) / 10,
            tempMax: Math.round((raw.main?.temp_max ?? temp) * 10) / 10,
            humidity,
            pressure: raw.main?.pressure ?? 0,
            seaLevel: raw.main?.sea_level ?? null,
            groundLevel: raw.main?.grnd_level ?? null,

            // Wind
            windSpeed: Math.round(windSpeed * 10) / 10,
            windDirection: windDeg,
            windDirectionLabel: this._degToCompass(windDeg),
            windGust: raw.wind?.gust ? Math.round(raw.wind.gust * 10) / 10 : null,

            // Conditions
            weatherMain: raw.weather?.[0]?.main || 'N/A',
            weatherDescription: raw.weather?.[0]?.description || 'N/A',
            weatherIcon: raw.weather?.[0]?.icon || '01d',
            cloudiness: raw.clouds?.all ?? 0,
            visibility: raw.visibility ?? 10000,

            // Sun
            sunrise: raw.sys?.sunrise ? new Date(raw.sys.sunrise * 1000).toISOString() : null,
            sunset: raw.sys?.sunset ? new Date(raw.sys.sunset * 1000).toISOString() : null,

            // Derived metrics
            feelsLikeDelta: Math.round((temp - feelsLike) * 10) / 10,
            heatIndex: this._calculateHeatIndex(temp, humidity),
            windChill: this._calculateWindChill(temp, windSpeed),
            dewPoint: this._calculateDewPoint(temp, humidity),
            comfortIndex: this._calculateComfortIndex(temp, humidity, windSpeed),

            // Metadata
            timestamp: new Date().toISOString(),
            dataSource: 'OpenWeatherMap',
            rawTimestamp: raw.dt ? new Date(raw.dt * 1000).toISOString() : new Date().toISOString()
        };
    }

    /**
     * Convert wind degrees to compass direction.
     */
    _degToCompass(deg) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
            'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        return directions[Math.round(deg / 22.5) % 16];
    }

    /**
     * Calculate heat index (feels hotter in humidity).
     */
    _calculateHeatIndex(tempC, humidity) {
        if (tempC < 27) return null;
        const t = tempC * 9 / 5 + 32; // to Fahrenheit
        const h = humidity;
        let hi = -42.379 + 2.04901523 * t + 10.14333127 * h
            - 0.22475541 * t * h - 0.00683783 * t * t
            - 0.05481717 * h * h + 0.00122874 * t * t * h
            + 0.00085282 * t * h * h - 0.00000199 * t * t * h * h;
        return Math.round((hi - 32) * 5 / 9 * 10) / 10; // back to Celsius
    }

    /**
     * Calculate wind chill (feels colder in wind).
     */
    _calculateWindChill(tempC, windSpeedMs) {
        const windKph = windSpeedMs * 3.6;
        if (tempC > 10 || windKph < 4.8) return null;
        const wc = 13.12 + 0.6215 * tempC - 11.37 * Math.pow(windKph, 0.16)
            + 0.3965 * tempC * Math.pow(windKph, 0.16);
        return Math.round(wc * 10) / 10;
    }

    /**
     * Calculate dew point.
     */
    _calculateDewPoint(tempC, humidity) {
        const a = 17.27, b = 237.7;
        const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
        return Math.round((b * alpha) / (a - alpha) * 10) / 10;
    }

    /**
     * Calculate comfort index (0-100).
     */
    _calculateComfortIndex(tempC, humidity, windSpeedMs) {
        let score = 100;
        // Temperature penalty
        const idealTemp = 22;
        score -= Math.abs(tempC - idealTemp) * 3;
        // Humidity penalty
        const idealHumidity = 45;
        score -= Math.abs(humidity - idealHumidity) * 0.5;
        // High wind penalty
        if (windSpeedMs > 10) score -= (windSpeedMs - 10) * 2;
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Get Lambda function stats (like CloudWatch metrics).
     */
    getStats() {
        return {
            functionName: this.functionName,
            status: this.status,
            invocationCount: this.invocationCount,
            errorCount: this.errorCount,
            successRate: this.invocationCount > 0
                ? Math.round((1 - this.errorCount / this.invocationCount) * 100) : 100,
            averageDurationMs: this.averageDuration,
            lastInvocation: this.lastInvocation
        };
    }
}

module.exports = LambdaProcessor;
