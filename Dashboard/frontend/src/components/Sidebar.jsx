import React from 'react';

function Sidebar() {
    return (
        <div className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M16 4L8 8V16L16 20L24 16V8L16 4Z" fill="url(#logoGradient)" />
                        <defs>
                            <linearGradient id="logoGradient" x1="8" y1="4" x2="24" y2="20">
                                <stop offset="0%" stopColor="#8B5CF6" />
                                <stop offset="100%" stopColor="#6366F1" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <span className="sidebar-title">SkySense</span>
            </div>

            <div className="sidebar-nav">
                <button className="sidebar-nav-item active" title="Weather">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                </button>
                <button className="sidebar-nav-item" title="Analytics">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M16 8v8m-4-10v12m-4-6v6" />
                    </svg>
                </button>
                <button className="sidebar-nav-item" title="Pipeline">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M9 9h6m-6 6h6" />
                    </svg>
                </button>
                <button className="sidebar-nav-item" title="Settings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6M1 12h6m6 0h6" />
                    </svg>
                </button>
            </div>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
