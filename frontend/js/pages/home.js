// ============================================================
// home.js — Home Page
// ============================================================

function renderHomePage() {
    const container = document.getElementById('main-content');
    if (!container) return;

    const cityData = APIClient.getCurrentCityData();
    const history = APIClient.getHistory();

    container.innerHTML = `
        <div class="home-page">
            <!-- Left Column -->
            <div class="home-left-column">
                <!-- Weather Hero Card -->
                ${createWeatherHeroCard(cityData, AppState.cities, AppState.selectedCity)}
                
                <!-- Detailed Metrics Grid -->
                <div class="detailed-metrics-grid">
                    ${createMetricCard('Humidity', cityData?.humidity, '%', 'humidity', '#06b6d4')}
                    ${createMetricCard('Precipitation', 0, 'mm', 'precipitation', '#3b82f6')}
                    ${createMetricCard('Pressure', cityData?.pressure, 'hPa', 'pressure', '#a855f7')}
                    ${createMetricCard('Visibility', cityData?.visibility ? (cityData.visibility / 1000).toFixed(1) : null, 'km', 'visibility', '#22c55e')}
                    ${createMetricCard('Wind Speed', cityData?.windSpeed, 'm/s', 'wind', '#eab308')}
                    ${createMetricCard('UV Index', 9.10, '', 'uv', '#f97316')}
                </div>
            </div>
            
            <!-- Right Column -->
            <div class="home-right-column">
                <!-- 7-Day Forecast -->
                ${createForecastBar()}
                
                <!-- Temperature Chart -->
                <div class="forecast-chart-container">
                    ${createTemperatureChart(history, AppState.selectedCity)}
                </div>
                
                <!-- Sunrise/Sunset -->
                ${createSunriseSunsetCard(cityData)}
                
                <!-- Air Quality -->
                ${createAirQualityCard()}
                
                <!-- Chance of Rain -->
                ${createChanceOfRainChart()}
            </div>
        </div>
    `;
}
