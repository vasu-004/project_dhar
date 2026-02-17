// ============================================================
// weatherHeroCard.js — Large Weather Hero Card Component
// ============================================================

function createWeatherHeroCard(cityData, cities, selectedCity) {
    if (!cityData) {
        return `
            <div class="weather-hero-card">
                <div class="hero-empty">
                    <span>⏳</span>
                    <span>Loading weather data...</span>
                </div>
            </div>
        `;
    }

    const iconUrl = `https://openweathermap.org/img/wn/${cityData.weatherIcon}@4x.png`;

    return `
        <div class="weather-hero-card">
            <!-- City Selector -->
            <div class="city-selector">
                <span class="city-label">Select City</span>
                <div class="city-buttons">
                    ${cities.map(city => `
                        <button 
                            class="city-btn ${city === selectedCity ? 'active' : ''}" 
                            onclick="APIClient.selectCity('${city}')"
                        >
                            ${city}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <!-- Main Weather Display -->
            <div class="hero-main">
                <div class="hero-icon">
                    <img src="${iconUrl}" alt="${cityData.weatherDescription}" />
                </div>
                <div class="hero-info">
                    <div class="hero-temp">${cityData.temperature}°C</div>
                    <div class="hero-desc">${cityData.weatherDescription}</div>
                    <div class="hero-feels">Feels like ${cityData.feelsLike}°C</div>
                </div>
            </div>
            
            <!-- Location Info -->
            <div class="hero-location">
                <div class="location-name">📍 ${cityData.city}</div>
                <div class="location-coords">${cityData.latitude}°N, ${cityData.longitude}°E</div>
            </div>
        </div>
    `;
}
