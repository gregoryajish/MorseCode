// src/hooks/useMorseTimer.js
import { useState, useRef, useCallback, useMemo } from 'react';
import { decodeMorse } from '../utils/morseTable';

function useMorseTimer(unit) {
    const [currentBuffer, setCurrentBuffer] = useState('');
    const [morseLog, setMorseLog] = useState([]);
    const [decodedText, setDecodedText] = useState('');

    const bufferRef = useRef('');
    const holdStartRef = useRef(null);
    const letterGapTimeoutRef = useRef(null);

    // Memoize thresholds so they don't cause useCallback deps to change every render
    const thresholds = useMemo(() => ({
        dash: unit ? unit * 1.8 : 0,
        letterGap: unit ? unit * 3 : 0,
    }), [unit]);

    function updateBuffer(newValue) {
        bufferRef.current = newValue;
        setCurrentBuffer(newValue);
    }

    const finalizeLetterIfPending = useCallback(() => {
        if (bufferRef.current.length > 0) {
            const pattern = bufferRef.current;
            const letter = decodeMorse(pattern);

            setMorseLog((log) => [...log, pattern]);
            setDecodedText((text) => text + letter);
            updateBuffer('');
        }
    }, []);

    const handleGestureChange = useCallback(
        (gesture) => {
            if (!unit) return;

            if (gesture === 'fist') {
                clearTimeout(letterGapTimeoutRef.current);
                holdStartRef.current = performance.now();
            } else {
                if (holdStartRef.current !== null) {
                    const holdDuration = performance.now() - holdStartRef.current;
                    holdStartRef.current = null;

                    const symbol = holdDuration >= thresholds.dash ? '-' : '.';
                    updateBuffer(bufferRef.current + symbol);
                }

                clearTimeout(letterGapTimeoutRef.current);
                letterGapTimeoutRef.current = setTimeout(() => {
                    finalizeLetterIfPending();
                }, thresholds.letterGap);
            }
        },
        [unit, thresholds, finalizeLetterIfPending]
    );

    const insertSpace = useCallback(() => {
        if (!unit) return;

        clearTimeout(letterGapTimeoutRef.current);
        finalizeLetterIfPending();

        setDecodedText((text) => {
            if (text.length > 0 && !text.endsWith(' ')) {
                return text + ' ';
            }
            return text;
        });
    }, [unit, finalizeLetterIfPending]);

    const resetTimer = useCallback(() => {
        updateBuffer('');
        setMorseLog([]);
        setDecodedText('');
        holdStartRef.current = null;
        clearTimeout(letterGapTimeoutRef.current);
    }, []);

    return {
        currentBuffer,
        morseLog,
        decodedText,
        handleGestureChange,
        insertSpace,
        resetTimer,
    };
}

export default useMorseTimer;