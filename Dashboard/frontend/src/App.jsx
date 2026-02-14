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
                            pipeline={pipeline}
                            connected={connected}
                        />
                    }
                />
                <Route
                    path="/pipeline"
                    element={
                        <>
                            <Navbar />
                            <div className="connection-status">
                                <div className={`status-indicator ${connected ? 'online' : 'offline'}`}>
                                    <span className="status-dot"></span>
                                    {connected ? 'Live Connected' : 'Connecting...'}
                                </div>
                            </div>
                            <Pipeline
                                pipeline={pipeline}
                                connected={connected}
                            />
                            <footer className="footer">
                                <span>WeathX - Weather Analytics Dashboard</span>
                                <span>Powered by AWS Kinesis + Lambda | OpenWeatherMap</span>
                            </footer>
                        </>
                    }
                />
                <Route
                    path="/analytics"
                    element={
                        <>
                            <Navbar />
                            <div className="connection-status">
                                <div className={`status-indicator ${connected ? 'online' : 'offline'}`}>
                                    <span className="status-dot"></span>
                                    {connected ? 'Live Connected' : 'Connecting...'}
                                </div>
                            </div>
                            <Analytics
                                events={events}
                                connected={connected}
                            />
                            <footer className="footer">
                                <span>WeathX - Weather Analytics Dashboard</span>
                                <span>Powered by AWS Kinesis + Lambda | OpenWeatherMap</span>
                            </footer>
                        </>
                    }
                />
            </Routes>
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
