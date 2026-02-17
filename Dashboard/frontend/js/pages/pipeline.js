// ============================================================
// pipeline.js — Pipeline Status Page
// ============================================================

function renderPipelinePage() {
    const container = document.getElementById('main-content');
    if (!container) return;

    container.innerHTML = `
        <div class="pipeline-page">
            <h2 class="page-title">AWS Pipeline Simulation</h2>
            <p class="page-subtitle">
                Real-time data flow: OpenWeatherMap → Kinesis → Lambda → DataStore
            </p>
            
            ${createPipelineStatus(AppState.pipeline, AppState.connected)}
            
            <div class="pipeline-description">
                <h3 class="section-title">📚 About This Pipeline</h3>
                <div class="description-content">
                    <p>
                        This dashboard simulates a production-grade AWS data pipeline architecture:
                    </p>
                    <ul>
                        <li><strong>Weather Fetcher:</strong> Polls OpenWeatherMap API every 60 seconds</li>
                        <li><strong>Kinesis Stream:</strong> Distributes data across shards for parallel processing</li>
                        <li><strong>Lambda Processor:</strong> Transforms raw weather data into analytics format</li>
                        <li><strong>DataStore:</strong> Maintains time-series history for each monitored city</li>
                    </ul>
                    <p>
                        All components communicate via event-driven architecture, providing real-time updates
                        to connected clients via WebSocket.
                    </p>
                </div>
            </div>
        </div>
    `;
}
