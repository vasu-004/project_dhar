import React, { useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell,
    ScatterChart, Scatter, ZAxis, LineChart, Line
} from 'recharts';

const CHART_TYPES = [
    { id: 'area', name: 'Area', icon: '📈' },
    { id: 'bar', name: 'Bar', icon: '📊' },
    { id: 'scatter', name: 'Scatter', icon: '🎯' },
    { id: 'pie', name: 'Pie', icon: '🥧' },
    { id: 'bubble', name: 'Bubble', icon: '🫧' }
];

const COLORS = ['#f97316', '#a855f7', '#06b6d4', '#22c55e', '#eab308'];

function TemperatureChart({ history, city }) {
    const [chartType, setChartType] = useState('area');

    // Data transformation for different charts
    const chartData = history.map((record, i) => ({
        time: new Date(record.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: record.temperature,
        feelsLike: record.feelsLike,
        humidity: record.humidity,
        precipitation: record.precipitation || 0,
        condition: record.weatherMain || 'Unknown',
        index: i
    }));

    // Data for Pie Chart (Distribution of conditions)
    const getPieData = () => {
        const counts = {};
        chartData.forEach(d => {
            counts[d.condition] = (counts[d.condition] || 0) + 1;
        });
        return Object.keys(counts).map(key => ({
            name: key,
            value: counts[key]
        }));
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="chart-tooltip">
                    <p className="tooltip-time">{label || payload[0].payload.name}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color || p.fill }}>
                            {p.name}: {p.value}{p.name.includes('Humidity') ? '%' : (p.name.includes('Temp') ? '°C' : '')}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className="chart-container">
                <h3 className="section-title">📊 Weather Analytics — {city || 'Select City'}</h3>
                <div className="chart-empty">
                    <p>Waiting for data points...</p>
                    <span className="pulse-dot"></span>
                </div>
            </div>
        );
    }

    const renderChart = () => {
        switch (chartType) {
            case 'bar':
                return (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                        <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="temperature" fill="#f97316" name="Temperature" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="humidity" fill="#06b6d4" name="Humidity" radius={[4, 4, 0, 0]} />
                    </BarChart>
                );

            case 'scatter':
                return (
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis type="number" dataKey="temperature" name="Temp" unit="°C" stroke="rgba(255,255,255,0.4)" />
                        <YAxis type="number" dataKey="humidity" name="Humidity" unit="%" stroke="rgba(255,255,255,0.4)" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Scatter name="Temp vs Humidity" data={chartData} fill="#a855f7" />
                    </ScatterChart>
                );

            case 'pie':
                const pieData = getPieData();
                return (
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                );

            case 'bubble':
                return (
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis type="number" dataKey="temperature" name="Temp" unit="°C" stroke="rgba(255,255,255,0.4)" />
                        <YAxis type="number" dataKey="humidity" name="Humidity" unit="%" stroke="rgba(255,255,255,0.4)" />
                        <ZAxis type="number" dataKey="precipitation" range={[50, 400]} name="Precipitation" unit="mm" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Scatter name="Temp/Hum/Prec Bubble" data={chartData} fill="#06b6d4" />
                    </ScatterChart>
                );

            default: // area
                return (
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                        <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Area type="monotone" dataKey="temperature" stroke="#f97316" fill="url(#tempGradient)" strokeWidth={2} name="Temperature" />
                        <Area type="monotone" dataKey="humidity" stroke="#06b6d4" fill="transparent" strokeWidth={2} name="Humidity" />
                    </AreaChart>
                );
        }
    };

    return (
        <div className="chart-container">
            <div className="chart-header-actions">
                <h3 className="section-title">📊 Weather Analytics — {city}</h3>
                <div className="chart-type-switcher">
                    {CHART_TYPES.map(type => (
                        <button
                            key={type.id}
                            className={`chart-type-btn ${chartType === type.id ? 'active' : ''}`}
                            onClick={() => setChartType(type.id)}
                            title={type.name}
                        >
                            <span className="type-icon">{type.icon}</span>
                            <span className="type-name">{type.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}

export default TemperatureChart;
