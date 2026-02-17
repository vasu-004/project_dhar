import React from 'react';
import { WiDaySunny, WiCloudy, WiRain, WiThunderstorm, WiFog, WiDayRain } from 'react-icons/wi';

function ForecastBar() {
    // Mock 7-day forecast data
    const forecast = [
        { day: 'Fri', icon: 'sunny', temp: 27 },
        { day: 'Mon', icon: 'cloudy', temp: 24 },
        { day: 'Sun', icon: 'rainy', temp: 22 },
        { day: 'Sun', icon: 'rainy', temp: 21 },
        { day: 'Thu', icon: 'rainy', temp: 20 },
        { day: 'Tue', icon: 'sunny', temp: 25 },
        { day: 'Wed', icon: 'rainy', temp: 23 }
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'sunny': return <WiDaySunny />;
            case 'cloudy': return <WiCloudy />;
            case 'rainy': return <WiRain />;
            case 'thunder': return <WiThunderstorm />;
            default: return <WiDaySunny />;
        }
    };

    return (
        <div className="forecast-bar">
            <h3 className="forecast-title">Forecast Weather</h3>
            <div className="forecast-days">
                {forecast.map((day, idx) => (
                    <div key={idx} className="forecast-day">
                        <div className="forecast-day-name">{day.day}</div>
                        <div className="forecast-day-icon">{getIcon(day.icon)}</div>
                        <div className="forecast-day-temp">{day.temp}°</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ForecastBar;
