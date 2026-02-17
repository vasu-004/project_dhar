// ============================================================
// navbar.js — Navigation Bar Component
// ============================================================

function renderNavbar() {
    const container = document.getElementById('navbar-container');
    if (!container) return;

    const currentTheme = ThemeManager.getTheme();

    container.innerHTML = `
        <nav class="navbar">
            <div class="navbar-container">
                <!-- Logo & Branding -->
                <div class="navbar-brand">
                    <div class="logo-weathx">
                        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#gradient1)" />
                            <path d="M2 17L12 22L22 17" stroke="url(#gradient2)" stroke-width="2" stroke-linecap="round" />
                            <path d="M2 12L12 17L22 12" stroke="url(#gradient2)" stroke-width="2" stroke-linecap="round" />
                            <defs>
                                <linearGradient id="gradient1" x1="2" y1="2" x2="22" y2="12">
                                    <stop offset="0%" stop-color="#0ea5e9" />
                                    <stop offset="100%" stop-color="#06b6d4" />
                                </linearGradient>
                                <linearGradient id="gradient2" x1="2" y1="12" x2="22" y2="22">
                                    <stop offset="0%" stop-color="#f97316" />
                                    <stop offset="100%" stop-color="#ea580c" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div class="logo-text">
                            <h1 class="logo-title">
                                <span class="logo-weath">Weath</span><span class="logo-x">X</span>
                            </h1>
                            <p class="logo-subtitle">Weather Analytics Dashboard</p>
                        </div>
                    </div>
                </div>

                <!-- Navigation Links -->
                <div class="navbar-links">
                    <a href="#/" class="nav-link">Home</a>
                    <a href="#/pipeline" class="nav-link">Pipeline</a>
                    <a href="#/analytics" class="nav-link">Analytics</a>
                </div>

                <!-- Theme Toggle -->
                <div class="navbar-actions">
                    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
                        ${currentTheme === 'dark' ? getSunIcon() : getMoonIcon()}
                    </button>
                </div>
            </div>
        </nav>
    `;

    // Attach theme toggle event
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const newTheme = ThemeManager.toggle();
        const button = document.getElementById('theme-toggle');
        button.innerHTML = newTheme === 'dark' ? getSunIcon() : getMoonIcon();
    });

    // Update active link based on current route
    Router.updateActiveLinks();
}

function getSunIcon() {
    return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    `;
}

function getMoonIcon() {
    return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    `;
}
