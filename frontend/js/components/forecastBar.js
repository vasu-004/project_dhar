// ============================================================
// forecastBar.js — 7-Day Forecast Bar Component
// ============================================================

function createForecastBar() {
    // Mock 7-day forecast
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const icons = ['01d', '02d', '03d', '10d', '04d', '02d', '01d'];
    const temps = [28, 30, 27, 25, 26, 29, 31];

    return `
        <div class="forecast-bar-container">
            <h3 class="section-title">📅 7-Day Forecast</h3>
            <div class="forecast-days">
                ${days.map((day, i) => `
                    <div class="forecast-day">
                        <div class="forecast-day-name">${day}</div>
                        <img 
                            src="https://openweathermap.org/img/wn/${icons[i]}@2x.png" 
                            alt="Weather" 
                            class="forecast-icon"
                        />
                        <div class="forecast-temp">${temps[i]}°C</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
