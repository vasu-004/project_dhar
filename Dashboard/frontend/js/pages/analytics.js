// ============================================================
// analytics.js — Analytics/Live Stream Page
// ============================================================

function renderAnalyticsPage() {
    const container = document.getElementById('main-content');
    if (!container) return;

    container.innerHTML = `
        <div class="analytics-page">
            <h2 class="page-title">Live Analytics Stream</h2>
            <p class="page-subtitle">
                Real-time weather updates as they flow through the pipeline
            </p>
            
            ${createLiveStream(AppState.events, AppState.connected)}
            
            <div class="analytics-stats">
                <h3 class="section-title">📊 Stream Statistics</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${AppState.events.length}</div>
                        <div class="stat-label">Total Events</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${AppState.cities.length}</div>
                        <div class="stat-label">Active Cities</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${AppState.connected ? 'Live' : 'Offline'}</div>
                        <div class="stat-label">Connection</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${AppState.pipeline?.kinesis?.recordCount || 0}</div>
                        <div class="stat-label">Total Records</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
