// ============================================================
// app.js — Main Application Entry Point
// ============================================================
// Initializes the application, connects services, renders navbar
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌤️ WeathX Dashboard Initializing...');

    // Initialize theme
    ThemeManager.init();

    // Render navbar
    renderNavbar();

    // Initialize API client and WebSocket
    APIClient.connect();

    // Initialize router
    Router.init();

    // Listen for data updates to refresh current view
    APIClient.on('dataUpdated', () => {
        // Re-render current page
        Router.handleRoute();
    });

    // Listen for city changes to fetch history
    APIClient.on('cityChanged', (city) => {
        // History is already fetched in selectCity
        Router.handleRoute();
    });

    console.log('✨ WeathX Dashboard Ready');
});
