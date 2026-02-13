import React from 'react';
import Sidebar from '../components/Sidebar';
import HourlyForecast from '../components/HourlyForecast';
import TomorrowCard from '../components/TomorrowCard';
import TodayHighlights from '../components/TodayHighlights';
import OtherCities from '../components/OtherCities';

function Home({
    currentData,
    cities,
    selectedCity,
    setSelectedCity,
    history
}) {
    const cityData = currentData[selectedCity] || currentData['Coimbatore'] || null;
    const mainCity = selectedCity || 'Coimbatore';

    // Get current date and time
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    // Get sunrise and sunset times
    const getSunTime = (timestamp) => {
        if (!timestamp) return '--:--';
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const calculateDayLength = () => {
        if (!cityData?.sunrise || !cityData?.sunset) return '--h --m';
        const lengthMs = (cityData.sunset - cityData.sunrise) * 1000;
        const hours = Math.floor(lengthMs / (1000 * 60 * 60));
        const minutes = Math.floor((lengthMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="new-home-layout">
            <Sidebar />

            <div className="main-content">
                {/* Search Bar */}
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search City..."
                    />
                    <div className="user-profile">
                        <span className="user-name">User Name</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="dashboard-grid">
                    {/* Left Column */}
                    <div className="dashboard-left">
                        {/* Main Weather Card */}
                        <div className="main-weather-card">
                            <div className="location-selector">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>India</span>
                            </div>

                            <div className="main-weather-info">
                                <div className="weather-left">
                                    <div className="day-date">
                                        <h2 className="day-name">{dayName}</h2>
                                        <p className="date-text">{dateStr}</p>
                                    </div>
                                    <div className="temperature-display">
                                        <span className="temp-value">{cityData ? `${Math.round(cityData.temperature)}°C` : '--°C'}</span>
                                        <div className="temp-range">
                                            <span className="temp-high">High: {cityData?.feelsLike ? `${Math.round(cityData.feelsLike)}°` : '--°'}</span>
                                            <span className="temp-low">Low: {cityData ? `${Math.round(cityData.temperature - 3)}°` : '--°'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="weather-right">
                                    <div className="weather-condition-display">
                                        <div className="condition-icon-large">
                                            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                                                <circle cx="60" cy="60" r="25" fill="url(#sunGradient)" />
                                                <path d="M60 15v15m0 60v15m45-45h-15m-60 0H15" stroke="url(#sunGradient)" strokeWidth="5" strokeLinecap="round" />
                                                <path d="M88 32l-10 10m-36-10l10 10m26 46l-10-10m-36 10l10-10" stroke="url(#sunGradient)" strokeWidth="5" strokeLinecap="round" />
                                                <defs>
                                                    <linearGradient id="sunGradient" x1="35" y1="35" x2="85" y2="85">
                                                        <stop offset="0%" stopColor="#FDB813" />
                                                        <stop offset="100%" stopColor="#FFCF4A" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                        <p className="condition-text">{cityData?.condition || 'Cloudy'}</p>
                                        <p className="feels-like">Feels Like {cityData?.feelsLike ? `${Math.round(cityData.feelsLike)}°` : '--°'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hourly Forecast */}
                        <HourlyForecast history={history} city={mainCity} />

                        {/* Sunrise/Sunset & Tomorrow */}
                        <div className="sun-tomorrow-row">
                            {/* Sunrise/Sunset Card */}
                            <div className="sunrise-sunset-card">
                                <div className="sun-times">
                                    <div className="sun-time-item">
                                        <span className="sun-label">Sunrise</span>
                                        <div className="sun-time">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="4" fill="#FDB813" />
                                                <path d="M12 4v2m0 12v2m8-8h-2M6 12H4" stroke="#FDB813" strokeWidth="2" />
                                            </svg>
                                            <span>{getSunTime(cityData?.sunrise)}</span>
                                        </div>
                                        <span className="sun-label-small">AM</span>
                                    </div>

                                    <div className="sun-time-item">
                                        <span className="sun-label">Sunset</span>
                                        <div className="sun-time">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="4" fill="#F97316" />
                                                <path d="M12 4v2m0 12v2m8-8h-2M6 12H4" stroke="#F97316" strokeWidth="2" />
                                            </svg>
                                            <span>{getSunTime(cityData?.sunset)}</span>
                                        </div>
                                        <span className="sun-label-small">PM</span>
                                    </div>
                                </div>

                                <div className="day-length">
                                    <span className="day-length-label">Lenght of day</span>
                                    <span className="day-length-value">{calculateDayLength()}</span>
                                </div>
                            </div>

                            {/* Tomorrow Card */}
                            <TomorrowCard history={history} city={mainCity} />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="dashboard-right">
                        {/* Today's Highlights */}
                        <TodayHighlights currentData={currentData} city={mainCity} />

                        {/* Other Cities */}
                        <OtherCities currentData={currentData} cities={cities} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
