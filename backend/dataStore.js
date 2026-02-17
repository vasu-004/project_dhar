// ============================================================
// dataStore.js — In-Memory Data Store (Simulates AWS DynamoDB)
// ============================================================
// Stores processed weather records per city with time-series
// history, capped at 100 records per city.
// ============================================================

class DataStore {
    constructor(maxRecordsPerCity = 100) {
        this.maxRecords = maxRecordsPerCity;
        this.cities = {};           // { cityName: [ ...records ] }
        this.latestByCity = {};     // { cityName: latestRecord }
        this.totalRecordsProcessed = 0;
        this.createdAt = new Date().toISOString();
    }

    /**
     * Insert a processed weather record for a city.
     */
    put(cityName, record) {
        if (!this.cities[cityName]) {
            this.cities[cityName] = [];
        }

        this.cities[cityName].push(record);
        this.latestByCity[cityName] = record;
        this.totalRecordsProcessed++;

        // Cap history size
        if (this.cities[cityName].length > this.maxRecords) {
            this.cities[cityName].shift();
        }
    }

    /**
     * Get the latest record for a city.
     */
    getLatest(cityName) {
        return this.latestByCity[cityName] || null;
    }

    /**
     * Get all latest records across all cities.
     */
    getAllLatest() {
        return { ...this.latestByCity };
    }

    /**
     * Get history for a specific city.
     */
    getHistory(cityName, limit = 50) {
        const records = this.cities[cityName] || [];
        return records.slice(-limit);
    }

    /**
     * Get list of all monitored cities.
     */
    getCities() {
        return Object.keys(this.cities);
    }

    /**
     * Get store statistics.
     */
    getStats() {
        return {
            totalCities: Object.keys(this.cities).length,
            totalRecordsProcessed: this.totalRecordsProcessed,
            recordsPerCity: Object.fromEntries(
                Object.entries(this.cities).map(([city, records]) => [city, records.length])
            ),
            storeCreatedAt: this.createdAt,
            uptime: Date.now() - new Date(this.createdAt).getTime()
        };
    }
}

module.exports = DataStore;
