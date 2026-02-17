// ============================================================
// chanceOfRainChart.js — Chance of Rain Chart Component
// ============================================================

let rainChartInstance = null;

function createChanceOfRainChart() {
    // Mock hourly rain data
    setTimeout(() => {
        renderRainChart();
    }, 100);

    return `
        <div class="chart-container">
            <h3 class="section-title">🌧️ Chance of Rain (Next 12hrs)</h3>
            <canvas id="rain-chart"></canvas>
        </div>
    `;
}

function renderRainChart() {
    const canvas = document.getElementById('rain-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy previous chart instance
    if (rainChartInstance) {
        rainChartInstance.destroy();
    }

    // Mock data
    const hours = [];
    const chances = [];
    for (let i = 0; i < 12; i++) {
        const hour = (new Date().getHours() + i) % 24;
        hours.push(`${hour}:00`);
        chances.push(Math.floor(Math.random() * 60));
    }

    rainChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: hours,
            datasets: [{
                label: 'Rain Chance (%)',
                data: chances,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: '#3b82f6',
                borderWidth: 1
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
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(241, 245, 249, 0.6)',
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(241, 245, 249, 0.6)'
                    }
                }
            }
        }
    });
}
