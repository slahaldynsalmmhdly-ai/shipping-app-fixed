import React, { useState, useEffect } from 'react';
import './SavingIndicator.css';
import type { AnimationType } from '../../App';

interface SavingIndicatorProps {
    messages: string[];
    animationType?: AnimationType;
}

const LoadingDots = () => (
    <div className="loading-dots">
        <div className="dot1"></div>
        <div className="dot2"></div>
        <div className="dot3"></div>
    </div>
);

const TruckAnimation = () => (
    <div className="truck-animation-container-saving">
      <svg className="animated-truck-svg-saving" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M198 40 H190 V20 H120 V15 H100 l-10 -5 H70 l-5 5 H50 v25 H30 v-10 H10 l-8 8 v12 h8 v5 h10 v-5 h168 v5 h10 v-5 h2 v-15 z M60 45 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10 z M140 45 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10 z M170 45 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10 z"/>
      </svg>
    </div>
);


const SavingIndicator: React.FC<SavingIndicatorProps> = ({ messages, animationType = 'dots' }) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        if (messages.length > 1) {
            const intervalId = setInterval(() => {
                setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
            }, 2500); // Change message every 2.5 seconds

            return () => clearInterval(intervalId);
        }
    }, [messages]);

    return (
        <div className="saving-indicator-overlay">
             {animationType === 'truck' && <TruckAnimation />}
            <div className="saving-indicator-content">
                {animationType === 'dots' && <LoadingDots />}
                <p key={currentMessageIndex} className="saving-message">
                    {messages[currentMessageIndex] || 'جاري المعالجة...'}
                </p>
            </div>
        </div>
    );
};

export default SavingIndicator;