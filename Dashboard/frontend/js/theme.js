// ============================================================
// theme.js — Theme Management
// ============================================================
// Handles dark/light theme switching and persistence
// ============================================================

const ThemeManager = {
    STORAGE_KEY: 'weathx-theme',

    init() {
        // Load saved theme or default to dark
        const savedTheme = localStorage.getItem(this.STORAGE_KEY) || 'dark';
        this.setTheme(savedTheme);
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.STORAGE_KEY, theme);
    },

    getTheme() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    },

    toggle() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        return newTheme;
    }
};
