// ============================================================
// sunriseSunsetCard.js — Sunrise/Sunset Card Component
// ============================================================

function createSunriseSunsetCard(data) {
    if (!data || !data.sunrise || !data.sunset) {
        return `
            <div class="chart-container">
                <h3 class="section-title">🌅 Sunrise & Sunset</h3>
                <div class="chart-empty">
                    <span>🌇</span>
                    <span>No sunrise/sunset data</span>
                </div>
            </div>
        `;
    }

    const sunrise = new Date(data.sunrise * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const sunset = new Date(data.sunset * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
        <div class="chart-container">
            <h3 class="section-title">🌅 Sunrise & Sunset</h3>
            <div class="sun-times">
                <div class="sun-time-item">
                    <span class="sun-icon">🌅</span>
                    <div class="sun-info">
                        <div class="sun-label">Sunrise</div>
                        <div class="sun-value">${sunrise}</div>
                    </div>
                </div>
                <div class="sun-time-item">
                    <span class="sun-icon">🌇</span>
                    <div class="sun-info">
                        <div class="sun-label">Sunset</div>
                        <div class="sun-value">${sunset}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
