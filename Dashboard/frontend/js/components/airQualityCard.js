// ============================================================
// airQualityCard.js — Air Quality Index Card Component
// ============================================================

function createAirQualityCard() {
    // Mock data (as in React version)
    const aqi = 42;
    const status = 'Good';
    const color = '#22c55e';

    return `
        <div class="chart-container">
            <h3 class="section-title">🌿 Air Quality Index</h3>
            <div class="aqi-display">
                <div class="aqi-value" style="color: ${color}">${aqi}</div>
                <div class="aqi-status">${status}</div>
                <div class="aqi-bar">
                    <div class="aqi-fill" style="width: ${aqi}%; background: ${color}"></div>
                </div>
                <div class="aqi-desc">Air quality is satisfactory</div>
            </div>
        </div>
    `;
}
