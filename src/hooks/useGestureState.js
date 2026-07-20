// src/hooks/useGestureState.js
import { useState, useRef, useCallback } from 'react';
import { classifyGesture } from '../utils/gestureClassifier';

export default function useGestureState(requiredStableFrames = 3) {
    const [gesture, setGesture] = useState('none');

    const candidateGestureRef = useRef('none');
    const candidateCountRef = useRef(0);
    const stableGestureRef = useRef('none');

    const updateLandmarks = useCallback((landmarks) => {
        let newGesture = 'none';
        if (landmarks && landmarks.length > 0 && landmarks[0]) {
            newGesture = classifyGesture(landmarks[0]);
        }

        if (newGesture === candidateGestureRef.current) {
            candidateCountRef.current++;
        } else {
            candidateGestureRef.current = newGesture;
            candidateCountRef.current = 1;
        }

        if (
            candidateCountRef.current >= requiredStableFrames &&
            stableGestureRef.current !== newGesture
        ) {
            stableGestureRef.current = newGesture;
            setGesture(newGesture);
        }
    }, [requiredStableFrames]);

    return { gesture, updateLandmarks };
}
