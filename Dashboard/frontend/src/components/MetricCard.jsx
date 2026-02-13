import React from 'react';
import { WiThermometer, WiHumidity, WiStrongWind, WiBarometer, WiCloud, WiDaySunny } from 'react-icons/wi';
import { TbTemperatureCelsius } from 'react-icons/tb';

const iconMap = {
    temperature: <WiThermometer />,
    humidity: <WiHumidity />,
    wind: <WiStrongWind />,
    pressure: <WiBarometer />,
    clouds: <WiCloud />,
    comfort: <WiDaySunny />,
    feelsLike: <TbTemperatureCelsius />
};

function MetricCard({ title, value, unit, icon, trend, color, subtext }) {
    const IconComponent = iconMap[icon] || <WiDaySunny />;

    return (
        <div className="metric-card" style={{ '--card-accent': color || '#6366f1' }}>
            <div className="metric-card-header">
                <span className="metric-icon" style={{ color: color || '#6366f1' }}>
                    {IconComponent}
                </span>
                <span className="metric-title">{title}</span>
            </div>
            <div className="metric-value">
                <span className="metric-number">{value ?? '--'}</span>
                <span className="metric-unit">{unit}</span>
            </div>
            {subtext && <div className="metric-subtext">{subtext}</div>}
            {trend !== undefined && trend !== null && (
                <div className={`metric-trend ${trend >= 0 ? 'up' : 'down'}`}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}{unit}
                </div>
            )}
            <div className="metric-glow" style={{ background: color || '#6366f1' }}></div>
        </div>
    );
}

export default MetricCard;
