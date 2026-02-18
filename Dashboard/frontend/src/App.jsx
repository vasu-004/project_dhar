import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider';
import { useWeatherData } from './hooks/useWeatherData';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Pipeline from './pages/Pipeline';
import Analytics from './pages/Analytics';
import './index.css';

function AppContent() {
    const {
        currentData,
        cities,
        selectedCity,
        setSelectedCity,
        history,
        fetchHistory,
        pipeline,
        connected,
        events
    } = useWeatherData();

    const isConnected = connected;
    const pipelineStatus = pipeline;
    const liveStream = events;

    console.log('[DEBUG] AppContent Rendering', { isConnected, selectedCity, cityDataCount: Object.keys(currentData).length });

    return (
        <div className="app">
            <Navbar />

            {/* Connection Status */}
            <div className="connection-status">
                <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`}>
                    <span className="status-dot"></span>
                    {isConnected ? 'Live Connected' : 'Connecting...'}
                </div>
            </div>

            <Routes>
                <Route
                    path="/"
                    element={
                        <Home
                            currentData={currentData}
                            cities={cities}
                            selectedCity={selectedCity}
                            setSelectedCity={setSelectedCity}
                            history={history}
                            fetchHistory={fetchHistory}
                        />
                    }
                />
                <Route
                    path="/pipeline"
                    element={
                        <Pipeline
                            pipeline={pipelineStatus}
                            connected={isConnected}
                        />
                    }
                />
                <Route
                    path="/analytics"
                    element={
                        <Analytics
                            events={liveStream}
                            connected={isConnected}
                        />
                    }
                />
            </Routes>

            {/* Footer */}
            <footer className="footer">
                <span>WeathX - Weather Analytics Dashboard</span>
                <span>Powered by AWS Kinesis + Lambda | OpenWeatherMap</span>
            </footer>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AppContent />
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
