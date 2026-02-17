import { useState, useEffect, useRef, useCallback } from 'react';
// Dynamic URLs - works in development (localhost) and production (VM IP)
const API_BASE = import.meta.env.DEV
    ? 'http://localhost:5000'
    : window.location.protocol + '//' + window.location.hostname + ':5000';

const WS_URL = import.meta.env.DEV
    ? 'ws://localhost:5000'
    : (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.hostname + ':5000';

export function useWeatherData() {
    const [currentData, setCurrentData] = useState({});
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [history, setHistory] = useState([]);
    const [pipeline, setPipeline] = useState(null);
    const [connected, setConnected] = useState(false);
    const [events, setEvents] = useState([]);
    const wsRef = useRef(null);
    const reconnectTimeout = useRef(null);

    // Connect WebSocket
    const connectWS = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            console.log('[WS] Connected');
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);

                if (msg.type === 'INIT') {
                    setCurrentData(msg.data.current || {});
                    setCities(msg.data.cities || []);
                    setPipeline(msg.data.pipeline || null);
                    if (msg.data.cities?.length && !selectedCity) {
                        setSelectedCity(msg.data.cities[0]);
                    }
                }

                if (msg.type === 'WEATHER_UPDATE') {
                    setCurrentData(prev => ({
                        ...prev,
                        [msg.data.city]: msg.data.current
                    }));
                    setPipeline(msg.data.pipeline || null);

                    // Add to events log
                    setEvents(prev => [{
                        id: Date.now(),
                        city: msg.data.city,
                        temp: msg.data.current?.temperature,
                        weather: msg.data.current?.weatherDescription,
                        time: new Date().toLocaleTimeString()
                    }, ...prev].slice(0, 50));
                }
            } catch (err) {
                console.error('[WS] Parse error:', err);
            }
        };

        ws.onclose = () => {
            setConnected(false);
            console.log('[WS] Disconnected — reconnecting in 3s');
            reconnectTimeout.current = setTimeout(connectWS, 3000);
        };

        ws.onerror = () => {
            ws.close();
        };
    }, [selectedCity]);

    // Fetch history for selected city
    const fetchHistory = useCallback(async (city) => {
        if (!city) return;
        try {
            const res = await fetch(`${API_BASE}/api/weather/history?city=${encodeURIComponent(city)}&limit=50`);
            const data = await res.json();
            setHistory(data.records || []);
        } catch {
            setHistory([]);
        }
    }, []);

    // Connect on mount
    useEffect(() => {
        connectWS();
        return () => {
            if (wsRef.current) wsRef.current.close();
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        };
    }, [connectWS]);

    // Fetch history when city changes
    useEffect(() => {
        if (selectedCity) {
            fetchHistory(selectedCity);
            const interval = setInterval(() => fetchHistory(selectedCity), 15000);
            return () => clearInterval(interval);
        }
    }, [selectedCity, fetchHistory]);

    return {
        currentData,
        cities,
        selectedCity,
        setSelectedCity,
        history,
        pipeline,
        connected,
        events
    };
}
