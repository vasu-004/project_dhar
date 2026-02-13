import React from 'react';
import { WiDaySunny, WiCloudy, WiRain, WiThunderstorm, WiFog } from 'react-icons/wi';

function WeatherHeroCard({ currentData, cities, selectedCity, setSelectedCity }) {
    const cityData = currentData[selectedCity] || null;

    const getWeatherIcon = (description) => {
        const desc = description?.toLowerCase() || '';
        if (desc.includes('clear') || desc.includes('sunny')) return <WiDaySunny />;
        if (desc.includes('rain')) return <WiRain />;
        if (desc.includes('thunder')) return <WiThunderstorm />;
        if (desc.includes('cloud')) return <WiCloudy />;
        if (desc.includes('fog') || desc.includes('haze') || desc.includes('mist')) return <WiFog />;
        return <WiDaySunny />;
    };

    return (
        <div className="weather-hero-card">
            {/* City Location Header */}
            <div className="hero-location">
                <span className="location-icon">📍</span>
                <span className="location-name">{selectedCity || 'Select City'}</span>
            </div>

            {/* Main Weather Display */}
            <div className="hero-weather-main">
                <div className="hero-icon">
                    {cityData && getWeatherIcon(cityData.weatherDescription)}
                </div>
                <div className="hero-temp">
                    {cityData ? Math.round(cityData.temperature) : '--'}
                    <span className="temp-unit">°C</span>
                </div>
            </div>

            {/* Weather Condition */}
            <div className="hero-condition">
                {cityData?.weatherDescription || 'No data'}
            </div>

            {/* City Tabs */}
            <div className="city-tabs">
                {cities.map(city => (
                    <button
                        key={city}
                        className={`city-tab ${city === selectedCity ? 'active' : ''}`}
                        onClick={() => setSelectedCity(city)}
                    >
                        <span className="tab-city-name">{city}</span>
                        <span className="tab-temp">
                            {currentData[city] ? Math.round(currentData[city].temperature) : '--'}°C
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default WeatherHeroCard;
