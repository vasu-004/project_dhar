import React from 'react';

function OtherCities({ currentData, cities }) {
    // Map cities to display names matching the reference
    const cityMap = {
        'Delhi': { display: 'USA', flag: '🇺🇸' },
        'Mumbai': { display: 'Dubai - UAE', flag: '🇦🇪' },
        'Bangalore': { display: 'China Nuevo', flag: '🇨🇳' },
        'Chennai': { display: 'Canada', flag: '🇨🇦' },
        'Coimbatore': { display: 'Coimbatore', flag: '🇮🇳' }
    };

    const getWeatherIcon = (condition) => {
        if (!condition) return '☀️';
        const cond = condition.toLowerCase();
        if (cond.includes('cloud')) return '⛅';
        if (cond.includes('rain')) return '🌧️';
        if (cond.includes('clear')) return '☀️';
        if (cond.includes('storm')) return '⛈️';
        return '☀️';
    };

    // Filter to show only specific cities
    const displayCities = cities.filter(city => cityMap[city]).slice(0, 5);

    return (
        <div className="other-cities">
            <div className="other-cities-header">
                <h3 className="other-cities-title">Other Cities</h3>
                <button className="show-all-btn">Show All</button>
            </div>

            <div className="other-cities-grid">
                {displayCities.map((city) => {
                    const data = currentData[city];
                    const cityInfo = cityMap[city];

                    return (
                        <div key={city} className="city-weather-card">
                            <div className="city-info">
                                <div className="city-temp">{data ? `${Math.round(data.temperature)}°` : '--°'}</div>
                                <div className="city-feels">
                                    {data?.feelsLike ? `HIGH ${Math.round(data.feelsLike)}°` : 'HIGH --°'}
                                </div>
                            </div>
                            <div className="city-details">
                                <div className="city-icon">
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                        <circle cx="24" cy="24" r="10" fill="#FDB813" opacity="0.9" />
                                        <circle cx="24" cy="24" r="6" fill="#FFF9E6" />
                                    </svg>
                                </div>
                                <div className="city-name-container">
                                    <div className="city-name">{cityInfo?.display || city}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default OtherCities;
