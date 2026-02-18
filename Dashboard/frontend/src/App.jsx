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
            <div style={{ position: 'fixed', top: 0, left: 0, padding: '4px 10px', background: '#f97316', color: 'white', fontSize: '12px', zIndex: 9999 }}>
                HTML Dashboard Active | City: {selectedCity || 'None'} | Connected: {isConnected ? 'YES' : 'NO'}
            </div>
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
