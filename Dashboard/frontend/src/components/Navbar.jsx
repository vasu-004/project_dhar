import React, { useState } from 'react';
import { useTheme } from '../context/ThemeProvider';

function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo & Branding */}
                <div className="navbar-brand">
                    <div className="logo-weathx">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#gradient1)" />
                            <path d="M2 17L12 22L22 17" stroke="url(#gradient2)" strokeWidth="2" strokeLinecap="round" />
                            <path d="M2 12L12 17L22 12" stroke="url(#gradient2)" strokeWidth="2" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="gradient1" x1="2" y1="2" x2="22" y2="12">
                                    <stop offset="0%" stopColor="#0ea5e9" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                                <linearGradient id="gradient2" x1="2" y1="12" x2="22" y2="22">
                                    <stop offset="0%" stopColor="#f97316" />
                                    <stop offset="100%" stopColor="#ea580c" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="logo-text">
                            <h1 className="logo-title">
                                <span className="logo-weath">Weath</span>
                                <span className="logo-x">X</span>
                            </h1>
                            <p className="logo-subtitle">Weather Analytics Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    <a href="#home" className="nav-link active">Home</a>
                    <a href="#analytics" className="nav-link">Analytics</a>
                    <a href="#about" className="nav-link">About</a>
                </div>

                {/* Theme Toggle & Mobile Menu */}
                <div className="navbar-actions">
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {mobileMenuOpen ? (
                                <>
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
