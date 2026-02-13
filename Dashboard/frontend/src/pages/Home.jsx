import React from 'react';
import MetricCard from '../components/MetricCard';
import TemperatureChart from '../components/TemperatureChart';
import CitySelector from '../components/CitySelector';
import WeatherDetails from '../components/WeatherDetails';

function Home({
    currentData,
    cities,
    selectedCity,
    setSelectedCity,
    history
}) {
    const cityData = currentData[selectedCity] || null;

    return (
        <div className="page-container">
            {/* City Selector */}
            <CitySelector
                cities={cities}
                selectedCity={selectedCity}
                onSelect={setSelectedCity}
            />

            {/* Metric Cards */}
            <section className="metrics-grid">
                <MetricCard
                    title="Temperature"
                    value={cityData?.temperature}
                    unit="°C"
                    icon="temperature"
                    color="#f97316"
                    subtext={cityData ? `Min ${cityData.tempMin}° / Max ${cityData.tempMax}°` : null}
                />
                <MetricCard
                    title="Humidity"
                    value={cityData?.humidity}
                    unit="%"
                    icon="humidity"
                    color="#06b6d4"
                    subtext={cityData ? `Dew Point: ${cityData.dewPoint}°C` : null}
                />
                <MetricCard
                    title="Wind Speed"
                    value={cityData?.windSpeed}
                    unit="m/s"
                    icon="wind"
                    color="#22c55e"
                    subtext={cityData ? `Direction: ${cityData.windDirectionLabel}` : null}
                />
                <MetricCard
                    title="Pressure"
                    value={cityData?.pressure}
                    unit="hPa"
                    icon="pressure"
                    color="#a855f7"
                    subtext={cityData?.seaLevel ? `Sea Level: ${cityData.seaLevel} hPa` : null}
                />
                <MetricCard
                    title="Feels Like"
                    value={cityData?.feelsLike}
                    unit="°C"
                    icon="feelsLike"
                    color="#ec4899"
                    subtext={cityData ? `Delta: ${cityData.feelsLikeDelta}°C` : null}
                />
                <MetricCard
                    title="Comfort"
                    value={cityData?.comfortIndex}
                    unit="/100"
                    icon="comfort"
                    color="#eab308"
                    subtext={cityData?.weatherDescription || null}
                />
            </section>

            {/* Main Content Grid */}
            <div className="content-grid">
                <div className="content-left">
                    {/* Temperature Chart */}
                    <TemperatureChart history={history} city={selectedCity} />
                </div>

                <div className="content-right">
                    {/* Weather Details */}
                    <WeatherDetails data={cityData} />
                </div>
            </div>
        </div>
    );
}

export default Home;
