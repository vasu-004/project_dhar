import React, { useState } from 'react';

function HourlyForecast({ history, city }) {
    const [activeTab, setActiveTab] = useState('today');

    // Get hourly data from history (last 24 hours for today, or more for week)
    const getHourlyData = () => {
        if (!history || !history[city] || history[city].length === 0) {
            return [];
        }

        const data = history[city];
        const now = new Date();

        if (activeTab === 'today') {
            // Show next 7 hours from current data
            return data.slice(0, 7).map((item, index) => {
                const hour = (now.getHours() + index) % 24;
                return {
                    time: `${hour}PM`,
                    temp: item.temperature,
                    condition: item.condition,
                    icon: getWeatherIcon(item.condition)
                };
            });
        } else {
            // Week view - show daily temps
            return data.slice(0, 7).map((item, index) => {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const date = new Date(now);
                date.setDate(date.getDate() + index);
                return {
                    time: days[date.getDay()],
                    temp: item.temperature,
                    condition: item.condition,
                    icon: getWeatherIcon(item.condition)
                };
            });
        }
    };

    const getWeatherIcon = (condition) => {
        if (!condition) return '☀️';
        const cond = condition.toLowerCase();
        if (cond.includes('cloud')) return '☁️';
        if (cond.includes('rain')) return '🌧️';
        if (cond.includes('clear')) return '☀️';
        if (cond.includes('storm')) return '⛈️';
        return '☀️';
    };

    const hourlyData = getHourlyData();

    return (
        <div className="hourly-forecast-container">
            <div className="hourly-forecast-header">
                <div className="hourly-tabs">
                    <button
                        className={`hourly-tab ${activeTab === 'today' ? 'active' : ''}`}
                        onClick={() => setActiveTab('today')}
                    >
                        Today
                    </button>
                    <span className="tab-divider">/</span>
                    <button
                        className={`hourly-tab ${activeTab === 'week' ? 'active' : ''}`}
                        onClick={() => setActiveTab('week')}
                    >
                        Week
                    </button>
                </div>
            </div>

            <div className="hourly-forecast-scroll">
                {hourlyData.length > 0 ? (
                    hourlyData.map((item, index) => (
                        <div key={index} className="hourly-item">
                            <div className="hourly-time">{item.time}</div>
                            <div className="hourly-icon">
                                <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                                    <circle cx="24" cy="24" r="8" fill="#FDB813" />
                                    <path d="M24 4v8m0 24v8m20-20h-8m-24 0H4" stroke="#FDB813" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="hourly-temp">{Math.round(item.temp)}°</div>
                        </div>
                    ))
                ) : (
                    <div className="hourly-empty">No forecast data available</div>
                )}
            </div>
        </div>
    );
}

export default HourlyForecast;
