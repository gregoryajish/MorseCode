// src/hooks/useTextToSpeech.js
import { useState, useEffect, useCallback } from 'react';

export default function useTextToSpeech() {
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);
    const [volume, setVolume] = useState(1);
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        const updateVoices = () => {
            const list = window.speechSynthesis.getVoices();
            setVoices(list);

            // Choose a default English voice or first available
            const defaultVoice = list.find(v => v.lang.startsWith('en') && v.default) || 
                                 list.find(v => v.lang.startsWith('en')) || 
                                 list[0];
            setSelectedVoice(prev => prev || defaultVoice || null);
        };

        updateVoices();
        
        // Some browsers load voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }
        
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    const speak = useCallback((text) => {
        if (!enabled || !text) return;
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        window.speechSynthesis.speak(utterance);
    }, [enabled, selectedVoice, rate, pitch, volume]);

    return {
        voices,
        selectedVoice,
        setSelectedVoice,
        rate,
        setRate,
        pitch,
        setPitch,
        volume,
        setVolume,
        enabled,
        setEnabled,
        speak
    };
}
