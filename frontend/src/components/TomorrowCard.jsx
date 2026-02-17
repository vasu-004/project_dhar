import React from 'react';

function TomorrowCard({ history, city }) {
    // Get tomorrow's forecast from history data
    const getTomorrowData = () => {
        if (!history || !history[city] || history[city].length < 2) {
            return null;
        }

        // Use second data point as "tomorrow"
        return history[city][1];
    };

    const tomorrowData = getTomorrowData();

    if (!tomorrowData) {
        return (
            <div className="tomorrow-card">
                <div className="tomorrow-header">
                    <span className="tomorrow-label">Tomorrow</span>
                    <span className="tomorrow-temp">--°</span>
                </div>
                <div className="tomorrow-info">Loading...</div>
            </div>
        );
    }

    const hasRain = tomorrowData.condition && tomorrowData.condition.toLowerCase().includes('rain');

    return (
        <div className="tomorrow-card">
            <div className="tomorrow-header">
                <span className="tomorrow-label">Tomorrow</span>
                <span className="tomorrow-temp">{Math.round(tomorrowData.temperature)}°</span>
            </div>
            <div className="tomorrow-weather">
                <div className="tomorrow-icon">
                    {hasRain ? (
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <path d="M38 26c0-6.6-5.4-12-12-12-5.2 0-9.6 3.4-11.2 8-4.4.6-7.8 4.4-7.8 9 0 5 4 9 9 9h20c4.4 0 8-3.6 8-8 0-4.2-3.2-7.6-7.4-7.9z" fill="#64B5F6" />
                            <path d="M20 38l-2 6m8-6l-2 6m8-6l-2 6" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <circle cx="24" cy="24" r="8" fill="#FDB813" />
                            <path d="M24 8v4m0 24v4m16-16h-4m-24 0H8" stroke="#FDB813" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    )}
                </div>
                <div className="tomorrow-condition">
                    {tomorrowData.condition || 'Clear'}
                </div>
            </div>
        </div>
    );
}

export default TomorrowCard;
