/**
 * WeathX - Charting Logic (Vanilla JS with Chart.js)
 */

let weatherChart = null;

function initChart() {
    const ctx = document.getElementById('weatherChart').getContext('2d');

    weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }, {
                label: 'Humidity (%)',
                data: [],
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } }
                }
            }
        }
    });

    // Chart Type Switcher
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            weatherChart.config.type = type;
            weatherChart.update();
        });
    });
}

window.updateChart = function (history) {
    if (!weatherChart) initChart();

    const labels = history.map(h => new Date(h.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const temps = history.map(h => h.temperature);
    const humidity = history.map(h => h.humidity);

    weatherChart.data.labels = labels;
    weatherChart.data.datasets[0].data = temps;
    weatherChart.data.datasets[1].data = humidity;
    weatherChart.update();
};

// Auto-init on analytics page view (triggered from app.js switchPage)
// But we can also init early
initChart();
