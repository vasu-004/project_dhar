import React from 'react';
import { WiDaySunny, WiCloudy, WiRain, WiThunderstorm, WiFog, WiDayRain } from 'react-icons/wi';

function ForecastBar() {
    // Generate 7-day forecast data with real dates
    const generateForecast = () => {
        const forecastData = [];
        const today = new Date();
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const icons = ['sunny', 'cloudy', 'rainy', 'rainy', 'rainy', 'sunny', 'rainy'];
        const temps = [27, 24, 22, 21, 20, 25, 23];
        
        for (let i = 1; i <= 7; i++) {
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + i);
            const dayName = daysOfWeek[futureDate.getDay()];
            
            forecastData.push({
                day: dayName,
                icon: icons[i - 1],
                temp: temps[i - 1]
            });
        }
        
        return forecastData;
    };
    
    const forecast = generateForecast();

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
