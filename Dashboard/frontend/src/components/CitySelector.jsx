import React from 'react';

function CitySelector({ cities, selectedCity, onSelect }) {
    return (
        <div className="city-selector">
            <label className="city-label">Monitoring City:</label>
            <div className="city-buttons">
                {cities.map(city => (
                    <button
                        key={city}
                        className={`city-btn ${selectedCity === city ? 'active' : ''}`}
                        onClick={() => onSelect(city)}
                    >
                        {city}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default CitySelector;
