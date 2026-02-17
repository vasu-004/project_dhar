import React from 'react';

function ChanceOfRainChart() {
    // Mock chance of rain data for the week
    const rainData = [
        { day: 'Thu', chance: 89 },
        { day: 'Wed', chance: 76 },
        { day: 'Sun', chance: 82 },
        { day: 'Sat', chance: 78 },
        { day: 'Fri', chance: 0 },
        { day: 'Mon', chance: 0 },
        { day: 'Tue', chance: 0 }
    ];

    const maxChance = 100;

    return (
        <div className="chance-rain-chart">
            <h3 className="rain-chart-title">Chance of Rain</h3>
            <div className="rain-bars">
                {rainData.map((item, idx) => (
                    <div key={idx} className="rain-bar-item">
                        <div className="rain-bar-day">{item.day}</div>
                        <div className="rain-bar-container">
                            <div
                                className="rain-bar-fill"
                                style={{
                                    width: `${(item.chance / maxChance) * 100}%`,
                                    backgroundColor: item.chance > 0 ? '#3b82f6' : '#374151'
                                }}
                            >
                                <span className="rain-bar-value">{item.chance}</span>
                            </div>
                        </div>
                        <div className="rain-bar-scale">
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChanceOfRainChart;
