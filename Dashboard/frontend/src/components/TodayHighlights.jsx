import React from 'react';

function TodayHighlights({ currentData, city }) {
    const data = currentData[city] || null;

    const getUVIndex = () => {
        // Calculate approximate UV index based on time of day
        // Real API would provide this, but we'll estimate for now
        const hour = new Date().getHours();
        if (hour >= 10 && hour <= 14) return 9.5;
        if (hour >= 8 && hour <= 16) return 6.5;
        return 2.0;
    };

    const getWindDirection = (degrees) => {
        if (!degrees) return 'N';
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    };

    return (
        <div className="today-highlights">
            <h3 className="highlights-title">Today Highlight</h3>

            <div className="highlights-grid">
                {/* Chance of Rain */}
                <div className="highlight-card">
                    <div className="highlight-header">
                        <span className="highlight-label">Chance of Rain</span>
                    </div>
                    <div className="highlight-content">
                        <div className="rain-chart">
                            <svg width="100%" height="80" viewBox="0 0 200 80">
                                {/* Simple bar chart */}
                                {[20, 40, 30, 50, 70, 45, 35].map((height, i) => (
                                    <rect
                                        key={i}
                                        x={i * 28 + 5}
                                        y={80 - height}
                                        width="20"
                                        height={height}
                                        fill={i === 3 ? '#8B5CF6' : 'rgba(139, 92, 246, 0.3)'}
                                        rx="4"
                                    />
                                ))}
                            </svg>
                        </div>
                    </div>
                </div>

                {/* UV Index */}
                <div className="highlight-card">
                    <div className="highlight-header">
                        <span className="highlight-label">UV Index</span>
                    </div>
                    <div className="highlight-content uv-content">
                        <div className="uv-icon">
                            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                <circle cx="32" cy="32" r="12" fill="#FDB813" />
                                <text x="32" y="38" textAnchor="middle" fill="#1a1a2e" fontSize="14" fontWeight="bold">UV</text>
                            </svg>
                        </div>
                        <div className="uv-value">{getUVIndex().toFixed(1)}</div>
                    </div>
                </div>

                {/* Wind Status */}
                <div className="highlight-card">
                    <div className="highlight-header">
                        <span className="highlight-label">Wind Status</span>
                    </div>
                    <div className="highlight-content wind-content">
                        <div className="wind-visual">
                            <svg width="80" height="80" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="2" />
                                <path d="M40 15 L45 30 L40 27 L35 30 Z" fill="#8B5CF6" />
                                <circle cx="40" cy="40" r="4" fill="#8B5CF6" />
                            </svg>
                        </div>
                        <div className="wind-stats">
                            <div className="wind-speed">{data?.windSpeed ? `${data.windSpeed.toFixed(1)} m/s` : '--'}</div>
                            <div className="wind-direction">{getWindDirection(data?.windDeg)}</div>
                        </div>
                    </div>
                </div>

                {/* Humidity */}
                <div className="highlight-card">
                    <div className="highlight-header">
                        <span className="highlight-label">Humidity</span>
                    </div>
                    <div className="highlight-content humidity-content">
                        <div className="humidity-icon">
                            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                <path d="M20 35c0-8 12-20 12-20s12 12 12 20c0 6-5 11-12 11s-12-5-12-11z" fill="#64B5F6" />
                            </svg>
                        </div>
                        <div className="humidity-value">{data?.humidity ? `${data.humidity}%` : '--'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TodayHighlights;
