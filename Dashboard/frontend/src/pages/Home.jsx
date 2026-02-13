import React from 'react';
import WeatherHeroCard from '../components/WeatherHeroCard';
import MetricCard from '../components/MetricCard';
import ForecastBar from '../components/ForecastBar';
import TemperatureChart from '../components/TemperatureChart';
import SunriseSunsetCard from '../components/SunriseSunsetCard';
import AirQualityCard from '../components/AirQualityCard';
import ChanceOfRainChart from '../components/ChanceOfRainChart';

function Home({
    currentData,
    cities,
    selectedCity,
    setSelectedCity,
    history
}) {
    const cityData = currentData[selectedCity] || null;

    return (
        <div className="home-page">
            {/* Left Column */}
            <div className="home-left-column">
                {/* Large Weather Hero Card */}
                <WeatherHeroCard
                    currentData={currentData}
                    cities={cities}
                    selectedCity={selectedCity}
                    setSelectedCity={setSelectedCity}
                />

                {/* Detailed Metrics Grid */}
                <div className="detailed-metrics-grid">
                    <MetricCard
                        title="Humidity"
                        value={cityData?.humidity}
                        unit="%"
                        icon="humidity"
                        color="#06b6d4"
                    />
                    <MetricCard
                        title="Precipitation"
                        value={0}
                        unit="mm"
                        icon="precipitation"
                        color="#3b82f6"
                    />
                    <MetricCard
                        title="Pressure"
                        value={cityData?.pressure}
                        unit="hPa"
                        icon="pressure"
                        color="#a855f7"
                    />
                    <MetricCard
                        title="Visibility"
                        value={cityData?.visibility ? (cityData.visibility / 1000).toFixed(1) : null}
                        unit="km"
                        icon="visibility"
                        color="#22c55e"
                    />
                    <MetricCard
                        title="Wind Speed"
                        value={cityData?.windSpeed}
                        unit="m/s"
                        icon="wind"
                        color="#eab308"
                    />
                    <MetricCard
                        title="UV Index"
                        value={9.10}
                        unit=""
                        icon="uv"
                        color="#f97316"
                    />
                </div>
            </div>

            {/* Right Column */}
            <div className="home-right-column">
                {/* 7-Day Forecast */}
                <ForecastBar />

                {/* Temperature Forecast Chart */}
                <div className="forecast-chart-container">
                    <TemperatureChart history={history} city={selectedCity} />
                </div>

                {/* Sunrise/Sunset */}
                <SunriseSunsetCard data={cityData} />

                {/* Air Quality Index */}
                <AirQualityCard />

                {/* Chance of Rain */}
                <ChanceOfRainChart />
            </div>
        </div>
    );
}

export default Home;
