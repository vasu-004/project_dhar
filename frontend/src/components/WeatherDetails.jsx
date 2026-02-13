import React from 'react';

function WeatherDetails({ data }) {
    if (!data) {
        return (
            <div className="details-container">
                <h3 className="section-title">🌤 Weather Details</h3>
                <div className="details-empty">Select a city to view details</div>
            </div>
        );
    }

    const iconUrl = `https://openweathermap.org/img/wn/${data.weatherIcon || '01d'}@2x.png`;

    const formatTime = (iso) => {
        if (!iso) return '--';
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="details-container">
            <h3 className="section-title">🌤 Weather Details — {data.city}</h3>

            <div className="details-header">
                <div className="details-main-temp">
                    <img src={iconUrl} alt={data.weatherDescription} className="weather-icon-large" />
                    <div>
                        <div className="details-temp">{data.temperature}°C</div>
                        <div className="details-desc">{data.weatherDescription}</div>
                    </div>
                </div>
                <div className="details-location">
                    <div>{data.city}, {data.country}</div>
                    <div className="details-coords">
                        {data.coordinates?.lat?.toFixed(2)}°N, {data.coordinates?.lon?.toFixed(2)}°E
                    </div>
                </div>
            </div>

            <div className="details-grid">
                <div className="detail-item">
                    <span className="detail-label">Feels Like</span>
                    <span className="detail-value">{data.feelsLike}°C</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Min / Max</span>
                    <span className="detail-value">{data.tempMin}° / {data.tempMax}°C</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Dew Point</span>
                    <span className="detail-value">{data.dewPoint ?? '--'}°C</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Visibility</span>
                    <span className="detail-value">{data.visibility ? (data.visibility / 1000).toFixed(1) : '--'} km</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Cloud Cover</span>
                    <span className="detail-value">{data.cloudiness}%</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Wind Gust</span>
                    <span className="detail-value">{data.windGust ?? '--'} m/s</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Wind Dir</span>
                    <span className="detail-value">{data.windDirectionLabel} ({data.windDirection}°)</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Sea Level</span>
                    <span className="detail-value">{data.seaLevel ?? '--'} hPa</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Sunrise</span>
                    <span className="detail-value">{formatTime(data.sunrise)}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Sunset</span>
                    <span className="detail-value">{formatTime(data.sunset)}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Comfort Index</span>
                    <span className="detail-value comfort-value">
                        <span className="comfort-bar" style={{ width: `${data.comfortIndex || 0}%` }}></span>
                        {data.comfortIndex ?? '--'}/100
                    </span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Data Source</span>
                    <span className="detail-value">{data.dataSource}</span>
                </div>
            </div>
        </div>
    );
}

export default WeatherDetails;
