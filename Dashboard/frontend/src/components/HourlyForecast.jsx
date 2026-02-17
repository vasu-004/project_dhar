import React, { useState, useEffect } from 'react';

function HourlyForecast({ history, city, currentData }) {
    const [activeTab, setActiveTab] = useState('today');
    const [forecastData, setForecastData] = useState([]);

    useEffect(() => {
        generateForecastData();
    }, [history, city, currentData, activeTab]);

    const generateForecastData = () => {
        const now = new Date();
        const currentTemp = currentData[city]?.temperature || 20;

        if (activeTab === 'today') {
            // Generate hourly forecast for next 7 hours
            const hourlyData = [];
            for (let i = 0; i < 7; i++) {
                const hour = (now.getHours() + i) % 24;
                const isPM = hour >= 12;
                const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
                const tempVariation = Math.sin(i * 0.5) * 2;

                hourlyData.push({
                    time: `${displayHour}${isPM ? 'PM' : 'AM'}`,
                    temp: Math.round(currentTemp + tempVariation),
                    condition: i % 3 === 0 ? 'clear' : 'cloudy',
                    hour: hour
                });
            }
            setForecastData(hourlyData);
        } else {
            // Generate weekly forecast
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const weeklyData = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(now);
                date.setDate(date.getDate() + i);
                const tempVariation = Math.sin(i * 0.7) * 3;

                weeklyData.push({
                    time: days[date.getDay()],
                    temp: Math.round(currentTemp + tempVariation),
                    condition: i % 2 === 0 ? 'clear' : 'cloudy',
                    day: i
                });
            }
            setForecastData(weeklyData);
        }
    };

    const getWeatherIcon = (condition, size = 32) => {
        if (condition.includes('clear')) {
            return (
                <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="10" fill="url(#sunGradient)" />
                    <path d="M24 4v6m0 28v6m20-20h-6m-28 0H4m32.5-12.5l-4.2 4.2m-16.6 16.6l-4.2 4.2m25-4.2l-4.2-4.2m-16.6-16.6l-4.2-4.2"
                        stroke="url(#sunGradient)" strokeWidth="3" strokeLinecap="round" />
                    <defs>
                        <linearGradient id="sunGradient" x1="14" y1="14" x2="34" y2="34">
                            <stop offset="0%" stopColor="#FDB813" />
                            <stop offset="100%" stopColor="#FFCF4A" />
                        </linearGradient>
                    </defs>
                </svg>
            );
        } else {
            return (
                <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
                    <path d="M38 28c0-5.5-4.5-10-10-10-4.3 0-8 2.8-9.3 6.7-3.7.5-6.7 3.7-6.7 7.5 0 4.1 3.4 7.5 7.5 7.5h17c3.6 0 6.5-2.9 6.5-6.5 0-3.4-2.6-6.3-6-6.5z"
                        fill="url(#cloudGradient)" />
                    <defs>
                        <linearGradient id="cloudGradient" x1="12" y1="18" x2="38" y2="40">
                            <stop offset="0%" stopColor="#93C5FD" />
                            <stop offset="100%" stopColor="#60A5FA" />
                        </linearGradient>
                    </defs>
                </svg>
            );
        }
    };

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
                {forecastData.length > 0 ? (
                    forecastData.map((item, index) => (
                        <div key={index} className="hourly-item">
                            <div className="hourly-time">{item.time}</div>
                            <div className="hourly-icon">
                                {getWeatherIcon(item.condition)}
                            </div>
                            <div className="hourly-temp">{item.temp}°</div>
                        </div>
                    ))
                ) : (
                    <div className="hourly-empty">Loading forecast...</div>
                )}
            </div>
        </div>
    );
}

export default HourlyForecast;
