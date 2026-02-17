// ============================================================
// metricCard.js — Metric Card Component
// ============================================================

function createMetricCard(title, value, unit, icon, color) {
    const iconMap = {
        humidity: '💧',
        precipitation: '🌧️',
        pressure: '🌡️',
        visibility: '👁️',
        wind: '💨',
        uv: '☀️'
    };

    const displayValue = value !== null && value !== undefined ? value : '—';
    const emoji = iconMap[icon] || '📊';

    return `
        <div class="metric-card" style="--card-accent: ${color}">
            <div class="metric-card-header">
                <span class="metric-icon">${emoji}</span>
                <span class="metric-title">${title}</span>
            </div>
            <div class="metric-value">
                <span class="metric-number">${displayValue}</span>
                ${unit ? `<span class="metric-unit">${unit}</span>` : ''}
            </div>
            <div class="metric-glow" style="background: ${color}"></div>
        </div>
    `;
}
