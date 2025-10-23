
import React from 'react';
import './BottomNav.css';
import type { Screen } from '../../App';

interface BottomNavProps {
    activeScreen: Screen;
    onNavigateHome: () => void;
    onNavigateHistory: () => void;
    onNavigateLiveTracking: () => void;
    onOpenSettings: () => void;
    className?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigateHome, onNavigateHistory, onNavigateLiveTracking, onOpenSettings, className }) => {
    return (
        <footer className={`bottom-nav ${className || ''}`}>
            <button className={`nav-item ${activeScreen === 'home' ? 'active' : ''}`} aria-label="الرئيسية" onClick={onNavigateHome}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <p>الرئيسية</p>
            </button>
            <button className={`nav-item ${activeScreen === 'liveTracking' ? 'active' : ''}`} aria-label="تتبع مباشر" onClick={onNavigateLiveTracking}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0115 0" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12a4.5 4.5 0 019 0" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 12a1.5 1.5 0 013 0" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v9m-4 0h8" />
                </svg>
                <p>تتبع</p>
            </button>
            <button className={`nav-item ${activeScreen === 'history' ? 'active' : ''}`} aria-label="سجل الشحنات" onClick={onNavigateHistory}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p>السجل</p>
            </button>
            <button className={`nav-item ${activeScreen === 'settings' ? 'active' : ''}`} aria-label="الإعدادات" onClick={onOpenSettings}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
                <p>الإعدادات</p>
            </button>
        </footer>
    );
};

export default BottomNav;