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

    return (
        <div className="app">
            {/* Navigation Bar */}
            <Navbar />

            {/* Connection Status */}
            <div className="connection-status">
                <div className={`status-indicator ${connected ? 'online' : 'offline'}`}>
                    <span className="status-dot"></span>
                    {connected ? 'Live Connected' : 'Connecting...'}
                </div>
            </div>

            {/* Routes */}
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
                            pipeline={pipeline}
                            connected={connected}
                        />
                    }
                />
                <Route
                    path="/analytics"
                    element={
                        <Analytics
                            events={events}
                            connected={connected}
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
