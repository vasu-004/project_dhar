import React from 'react';

function TodayHighlights({ currentData, city }) {
    const data = currentData[city] || null;

    const getUVIndex = () => {
        const hour = new Date().getHours();
        if (hour >= 11 && hour <= 14) return 2.0;
        if (hour >= 9 && hour <= 16) return 1.5;
        if (hour >= 6 && hour <= 18) return 1.0;
        return 0.5;
    };

    const getWindDirection = (degrees) => {
        if (degrees === undefined || degrees === null) return 'N';
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    };

    const getRainChance = () => {
        // Generate realistic rain chance based on humidity
        if (data?.humidity) {
            return Math.min(Math.round(data.humidity * 0.8), 95);
        }
        return 20;
    };

    const getWindRotation = (degrees) => {
        return degrees || 0;
    };

    return (
        <div className="today-highlights">
            <h3 className="highlights-title">Today Highlight</h3>

            <div className="highlights-grid">
                {/* Chance of Rain */}
                <div className="highlight-card rain-card">
                    <div className="highlight-header">
                        <span className="highlight-label">Chance of Rain</span>
                        <span className="highlight-percentage">{getRainChance()}%</span>
                    </div>
                    <div className="highlight-content">
                        <div className="rain-chart">
                            <svg width="100%" height="100" viewBox="0 0 200 100" preserveAspectRatio="none">
                                {[15, 30, 25, 45, 65, 40, 30].map((height, i) => (
                                    <rect
                                        key={i}
                                        x={i * 28 + 2}
                                        y={100 - height}
                                        width="24"
                                        height={height}
                                        fill={i === 4 ? 'url(#barGradientActive)' : 'url(#barGradient)'}
                                        rx="6"
                                        className="rain-bar"
                                    />
                                ))}
                                <defs>
                                    <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
                                        <stop offset="100%" stopColor="rgba(139, 92, 246, 0.1)" />
                                    </linearGradient>
                                    <linearGradient id="barGradientActive" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#8B5CF6" />
                                        <stop offset="100%" stopColor="#6366F1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* UV Index */}
                <div className="highlight-card uv-card">
                    <div className="highlight-header">
                        <span className="highlight-label">UV Index</span>
                    </div>
                    <div className="highlight-content uv-content">
                        <div className="uv-circle">
                            <svg width="100" height="100" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="url(#uvGradient)" />
                                <circle cx="50" cy="50" r="30" fill="rgba(255, 255, 255, 0.3)" />
                                <text x="50" y="58" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="bold">
                                    {(data?.uvIndex !== undefined ? data.uvIndex : getUVIndex()).toFixed(1)}
                                </text>
                                <defs>
                                    <linearGradient id="uvGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#FDB813" />
                                        <stop offset="100%" stopColor="#F59E0B" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div className="uv-label">{(data?.uvIndex || getUVIndex()) < 3 ? 'Low' : 'High'}</div>
                    </div>
                </div>

                {/* Wind Status */}
                <div className="highlight-card wind-card">
                    <div className="highlight-header">
                        <span className="highlight-label">Wind Status</span>
                    </div>
                    <div className="highlight-content wind-content">
                        <div className="wind-compass">
                            <svg width="100" height="100" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="2" />
                                <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(139, 92, 246, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
                                <g transform={`rotate(${getWindRotation(data?.windDeg)} 50 50)`}>
                                    <path d="M50 15 L56 35 L50 32 L44 35 Z" fill="url(#windGradient)" />
                                    <circle cx="50" cy="50" r="6" fill="url(#windGradient)" />
                                </g>
                                <text x="50" y="15" textAnchor="middle" fill="rgba(241, 245, 249, 0.5)" fontSize="10" fontWeight="600">N</text>
                                <defs>
                                    <linearGradient id="windGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8B5CF6" />
                                        <stop offset="100%" stopColor="#6366F1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div className="wind-stats">
                            <div className="wind-speed-value">{data?.windSpeed ? data.windSpeed.toFixed(1) : '0.0'}</div>
                            <div className="wind-speed-unit">m/s</div>
                            <div className="wind-direction-label">{getWindDirection(data?.windDeg)}</div>
                        </div>
                    </div>
                </div>

                {/* Humidity */}
                <div className="highlight-card humidity-card">
                    <div className="highlight-header">
                        <span className="highlight-label">Humidity</span>
                    </div>
                    <div className="highlight-content humidity-content">
                        <div className="humidity-visual">
                            <svg width="100" height="120" viewBox="0 0 100 120">
                                <defs>
                                    <linearGradient id="humidityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#60A5FA" />
                                        <stop offset="100%" stopColor="#3B82F6" />
                                    </linearGradient>
                                    <clipPath id="dropClip">
                                        <path d="M50 10 C50 10, 30 35, 30 55 C30 68, 38 80, 50 80 C62 80, 70 68, 70 55 C70 35, 50 10, 50 10 Z" />
                                    </clipPath>
                                </defs>
                                <path d="M50 10 C50 10, 30 35, 30 55 C30 68, 38 80, 50 80 C62 80, 70 68, 70 55 C70 35, 50 10, 50 10 Z"
                                    fill="url(#humidityGradient)" opacity="0.3" />
                                <rect x="30" y={`${80 - (data?.humidity || 0) * 0.7}`} width="40"
                                    height={`${(data?.humidity || 0) * 0.7}`}
                                    fill="url(#humidityGradient)"
                                    clipPath="url(#dropClip)" />
                            </svg>
                        </div>
                        <div className="humidity-value-large">{data?.humidity || 0}<span className="humidity-percent">%</span></div>
                        <div className="humidity-status">{(data?.humidity || 0) > 70 ? 'High' : 'Normal'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TodayHighlights;
