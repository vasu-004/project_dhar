import React from 'react';
import { WiDaySunny, WiCloud } from 'react-icons/wi';

function AirQualityCard() {
    // Mock air quality data
    const airQuality = {
        aqi: 117,
        status: 'Moderate',
        metrics: [
            { label: 'PM10', value: 290.21 },
            { label: 'SO2', value: 2.76 },
            { label: 'O3', value: 117 },
            { label: 'PM2.5', value: 13.59 }
        ]
    };

    const getAQIColor = (aqi) => {
        if (aqi <= 50) return '#22c55e';
        if (aqi <= 100) return '#eab308';
        if (aqi <= 150) return '#f97316';
        if (aqi <= 200) return '#ef4444';
        return '#991b1b';
    };

    return (
        <div className="air-quality-card">
            <h3 className="air-quality-title">Air Quality Index</h3>

            <div className="aqi-display">
                <div className="aqi-icon-container">
                    <div className="aqi-icon">
                        <WiDaySunny style={{ color: '#fbbf24', fontSize: '4rem' }} />
                        <WiCloud style={{ color: '#e0e0e0', fontSize: '3rem', position: 'absolute', bottom: 0 }} />
                    </div>
                </div>
                <div className="aqi-value" style={{ color: getAQIColor(airQuality.aqi) }}>
                    {airQuality.aqi}
                </div>
                <div className="aqi-status">{airQuality.status}</div>
            </div>

            <div className="aqi-metrics">
                {airQuality.metrics.map((metric, idx) => (
                    <div key={idx} className="aqi-metric-item">
                        <div className="aqi-metric-value">{metric.value}</div>
                        <div className="aqi-metric-label">{metric.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AirQualityCard;
