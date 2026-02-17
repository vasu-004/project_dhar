// ============================================================
// temperatureChart.js — Temperature History Chart Component
// ============================================================

let temperatureChartInstance = null;

function createTemperatureChart(history, city) {
    if (!history || history.length === 0) {
        return `
            <div class="chart-container">
                <h3 class="section-title">📈 Temperature Trend</h3>
                <div class="chart-empty">
                    <span>📊</span>
                    <span>No historical data available yet</span>
                </div>
            </div>
        `;
    }

    // Create container with canvas
    setTimeout(() => {
        renderTemperatureChart(history, city);
    }, 100);

    return `
        <div class="chart-container">
            <h3 class="section-title">📈 Temperature Trend - ${city}</h3>
            <canvas id="temperature-chart"></canvas>
        </div>
    `;
}

function renderTemperatureChart(history, city) {
    const canvas = document.getElementById('temperature-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy previous chart instance
    if (temperatureChartInstance) {
        temperatureChartInstance.destroy();
    }

    // Prepare data (last 20 records for readability)
    const data = history.slice(-20);
    const labels = data.map(r => {
        const date = new Date(r.timestamp * 1000);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });
    const temperatures = data.map(r => r.temperature);

    // Create chart
    temperatureChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#06b6d4'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#f1f5f9',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(241, 245, 249, 0.6)',
                        callback: function (value) {
                            return value + '°C';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(241, 245, 249, 0.6)',
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}
