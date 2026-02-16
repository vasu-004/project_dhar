import React from 'react';
import { WiDaySunny, WiSunrise, WiSunset } from 'react-icons/wi';

function SunriseSunsetCard({ data }) {
    const formatTime = (timestamp) => {
        if (!timestamp) return '--:--';
        // Handle both ISO strings and Unix timestamps (seconds)
        const date = typeof timestamp === 'string'
            ? new Date(timestamp)
            : new Date(timestamp * 1000);
        if (isNaN(date.getTime())) return '--:--';
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className="sunrise-sunset-card">
            <div className="sun-icon-large">
                <WiDaySunny />
            </div>
            <div className="sun-times">
                <div className="sun-time-item">
                    <WiSunrise className="sun-time-icon" />
                    <span className="sun-time-label">Sunrise</span>
                    <span className="sun-time-value">{formatTime(data?.sunrise)}</span>
                </div>
                <div className="sun-time-item">
                    <WiSunset className="sun-time-icon" />
                    <span className="sun-time-label">Sunset</span>
                    <span className="sun-time-value">{formatTime(data?.sunset)}</span>
                </div>
            </div>
        </div>
    );
}

export default SunriseSunsetCard;
