// src/hooks/useCalibration.js
import { useState, useRef, useCallback } from 'react';

function useCalibration(requiredSamples = 3) {
    const [unit, setUnit] = useState(null); // ms, null until calibrated
    const [samplesCollected, setSamplesCollected] = useState(0);
    const holdStartRef = useRef(null);
    const durationsRef = useRef([]);

    // call this every time gesture changes, during calibration only
    const recordGestureChange = useCallback((gesture) => {
        if (gesture === 'fist' && holdStartRef.current === null) {
            // fist just started
            holdStartRef.current = performance.now();
        } else if (gesture !== 'fist' && holdStartRef.current !== null) {
            // fist just ended — record how long it was held
            const duration = performance.now() - holdStartRef.current;
            holdStartRef.current = null;

            durationsRef.current.push(duration);
            setSamplesCollected(durationsRef.current.length);

            if (durationsRef.current.length >= requiredSamples) {
                const avg =
                    durationsRef.current.reduce((a, b) => a + b, 0) /
                    durationsRef.current.length;
                setUnit(avg);
            }
        }
    }, [requiredSamples]);

    const resetCalibration = useCallback(() => {
        durationsRef.current = [];
        holdStartRef.current = null;
        setSamplesCollected(0);
        setUnit(null);
    }, []);

    return { unit, samplesCollected, requiredSamples, recordGestureChange, resetCalibration };
}

export default useCalibration;