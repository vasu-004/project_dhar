import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

// Dynamic URLs - works in development (localhost) and production (VM IP)
const API_BASE = import.meta.env.DEV
    ? 'http://localhost:5000'
    : window.location.protocol + '//' + window.location.hostname + ':5000';

const SOCKET_URL = import.meta.env.DEV
    ? 'http://localhost:5000'
    : window.location.protocol + '//' + window.location.hostname + ':5000';

export function useWeatherData() {
    const [currentData, setCurrentData] = useState({});
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [history, setHistory] = useState([]);
    const [pipeline, setPipeline] = useState(null);
    const [connected, setConnected] = useState(false);
    const [events, setEvents] = useState([]);
    const socketRef = useRef(null);

    // Connect WebSocket via Socket.IO
    const connectSocket = useCallback(() => {
        if (socketRef.current?.connected) return;

        const socket = io(SOCKET_URL, {
            reconnectionAttempts: 8,
            reconnectionDelay: 2000,
            transports: ['polling', 'websocket'], // Smooth upgrade path
            forceNew: true
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            console.log('[Socket.IO] Connected via:', socket.io.engine.transport.name);
        });

        socket.on('connect_error', (err) => {
            console.error('[Socket.IO] Connection error details:', {
                message: err.message,
                type: err.type,
                description: err.description,
                context: err.context
            });
        });

        socket.on('INIT', (msg) => {
            setCurrentData(msg.data.current || {});
            setCities(msg.data.cities || []);
            setPipeline(msg.data.pipeline || null);
            if (msg.data.cities?.length && !selectedCity) {
                setSelectedCity(msg.data.cities[0]);
            }
        });

        socket.on('WEATHER_UPDATE', (msg) => {
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
        });

        socket.on('disconnect', () => {
            setConnected(false);
            console.log('[Socket.IO] Disconnected');
        });

        socket.on('connect_error', (err) => {
            console.error('[Socket.IO] Connection error:', err);
        });
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
        connectSocket();
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [connectSocket]);

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
