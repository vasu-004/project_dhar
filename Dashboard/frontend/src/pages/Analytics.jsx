import React from 'react';
import LiveStream from '../components/LiveStream';

function Analytics({ events, connected }) {
    return (
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">Live Data Stream</h2>
                <p className="page-subtitle">Real-time weather updates from all cities</p>
            </div>

            {/* Live Stream - Full Width */}
            <div className="analytics-grid">
                <div className="stream-main">
                    <LiveStream events={events} />
                </div>

                {/* Stats Sidebar */}
                <div className="stats-sidebar">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <div className="stat-number">{events.length}</div>
                            <div className="stat-label">Total Events</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            {connected ? '🟢' : '🔴'}
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{connected ? 'Live' : 'Offline'}</div>
                            <div className="stat-label">Connection Status</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🌍</div>
                        <div className="stat-content">
                            <div className="stat-number">
                                {new Set(events.map(e => e.city)).size}
                            </div>
                            <div className="stat-label">Active Cities</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⚡</div>
                        <div className="stat-content">
                            <div className="stat-number">
                                {events[0]?.time || '--:--:--'}
                            </div>
                            <div className="stat-label">Latest Update</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Summary */}
            <div className="event-summary">
                <h3 className="summary-title">Recent Activity</h3>
                <div className="summary-grid">
                    {events.slice(0, 4).map(event => (
                        <div key={event.id} className="summary-item">
                            <div className="summary-city">{event.city}</div>
                            <div className="summary-temp">{event.temp}°C</div>
                            <div className="summary-weather">{event.weather}</div>
                            <div className="summary-time">{event.time}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Analytics;
