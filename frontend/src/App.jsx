import React from 'react';
import { useWeatherData } from './hooks/useWeatherData';
import MetricCard from './components/MetricCard';
import TemperatureChart from './components/TemperatureChart';
import PipelineStatus from './components/PipelineStatus';
import CitySelector from './components/CitySelector';
import WeatherDetails from './components/WeatherDetails';
import LiveStream from './components/LiveStream';
import './index.css';

function App() {
    const {
        currentData,
        cities,
        selectedCity,
        setSelectedCity,
        history,
        pipeline,
        connected,
        events
    } = useWeatherData();

    const cityData = currentData[selectedCity] || null;

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <div className="logo">
                        <span className="logo-icon">⚡</span>
                        <div>
                            <h1 className="header-title">Weather Analytics Dashboard</h1>
                            <p className="header-subtitle">AWS Kinesis + Lambda | Real-Time Pipeline</p>
                        </div>
                    </div>
                </div>
                <div className="header-right">
                    <div className={`status-indicator ${connected ? 'online' : 'offline'}`}>
                        <span className="status-dot"></span>
                        {connected ? 'Live Connected' : 'Connecting...'}
                    </div>
                    <div className="header-time">
                        {new Date().toLocaleDateString('en-IN', {
                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        })}
                    </div>
                </div>
            </header>

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

                    {/* Pipeline Status */}
                    <PipelineStatus pipeline={pipeline} connected={connected} />
                </div>

                <div className="content-right">
                    {/* Weather Details */}
                    <WeatherDetails data={cityData} />

                    {/* Live Stream */}
                    <LiveStream events={events} />
                </div>
            </div>

            {/* Footer */}
            <footer className="footer">
                <span>Real-Time Weather Analytics Dashboard</span>
                <span>Powered by AWS Kinesis + Lambda (Simulated) | OpenWeatherMap</span>
            </footer>
        </div>
    );
}

export default App;
