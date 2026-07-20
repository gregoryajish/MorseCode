// src/components/SignalIndicator.jsx
import { useEffect, useState, useRef } from 'react';

export default function SignalIndicator({ gesture, unit }) {
    const isActive = gesture === 'fist';
    const [holdTime, setHoldTime] = useState(0);
    const intervalRef = useRef(null);
    const startRef = useRef(null);

    useEffect(() => {
        if (isActive) {
            startRef.current = performance.now();
            intervalRef.current = setInterval(() => {
                setHoldTime(performance.now() - startRef.current);
            }, 30);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setHoldTime(0);
        };
    }, [isActive]);

    // Thresholds
    const dashThreshold = unit ? unit * 1.8 : 360;

    return (
        <div className="signal-indicator-container">
            <div className={`status-pill ${isActive ? 'active' : ''}`}>
                <span className="dot"></span>
                <span className="label">
                    {isActive 
                        ? (holdTime >= dashThreshold ? 'DASH (—)' : 'DOT (•)') 
                        : 'SIGNAL INACTIVE'}
                </span>
            </div>

            {isActive && unit && (
                <div className="signal-bar-wrapper">
                    <div 
                        className="signal-bar-progress"
                        style={{ 
                            width: `${Math.min(100, (holdTime / dashThreshold) * 100)}%`,
                            backgroundColor: holdTime >= dashThreshold ? 'var(--accent)' : '#10b981'
                        }}
                    ></div>
                    <span className="hold-time-text">
                        {Math.round(holdTime)}ms / {Math.round(dashThreshold)}ms
                    </span>
                </div>
            )}
        </div>
    );
}
