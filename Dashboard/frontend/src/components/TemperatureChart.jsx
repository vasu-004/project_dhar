import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';

function TemperatureChart({ history, city }) {
    const cityHistory = history && history[city] ? history[city] : [];
    const data = cityHistory.map((record, i) => ({
        time: new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: record.temperature,
        feelsLike: record.feelsLike,
        humidity: record.humidity,
        index: i
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="chart-tooltip">
                    <p className="tooltip-time">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color }}>
                            {p.name}: {p.value}{p.name === 'Humidity' ? '%' : '°C'}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (data.length === 0) {
        return (
            <div className="chart-container">
                <h3 className="section-title">📈 Temperature Trends — {city || 'Select City'}</h3>
                <div className="chart-empty">
                    <p>Waiting for data points...</p>
                    <span className="pulse-dot"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <h3 className="section-title">📈 Temperature Trends — {city}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="feelsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="humidGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }} />
                    <Area
                        type="monotone" dataKey="temperature" stroke="#f97316"
                        fill="url(#tempGradient)" strokeWidth={2.5}
                        name="Temperature" dot={false} animationDuration={500}
                    />
                    <Area
                        type="monotone" dataKey="feelsLike" stroke="#a855f7"
                        fill="url(#feelsGradient)" strokeWidth={2}
                        name="Feels Like" dot={false} animationDuration={500}
                    />
                    <Area
                        type="monotone" dataKey="humidity" stroke="#06b6d4"
                        fill="url(#humidGradient)" strokeWidth={1.5}
                        name="Humidity" dot={false} animationDuration={500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default TemperatureChart;
