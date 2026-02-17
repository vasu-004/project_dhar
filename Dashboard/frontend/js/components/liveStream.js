// ============================================================
// liveStream.js — Live Event Stream Component
// ============================================================

function createLiveStream(events, connected) {
    return `
        <div class="livestream-container">
            <h3 class="section-title">
                📡 Live Data Stream
                <span class="stream-badge">Real-time</span>
            </h3>
            
            ${events.length === 0 ? `
                <div class="stream-empty">
                    <span>📡</span>
                    <span>Waiting for weather updates...</span>
                </div>
            ` : `
                <div class="livestream-feed">
                    ${events.map(event => `
                        <div class="stream-event">
                            <span class="event-time">${event.time}</span>
                            <span class="event-city">${event.city}</span>
                            <span class="event-data">${event.temp}°C • ${event.weather}</span>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}
