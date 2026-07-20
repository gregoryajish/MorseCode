// src/hooks/useHandDetection.js
import { useEffect, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

function useHandDetection() {
    const [handLandmarker, setHandLandmarker] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function loadModel() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                );

                if (cancelled) return;

                const landmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numHands: 1,
                });

                if (cancelled) return;

                setHandLandmarker(landmarker);
                console.log('✅ Hand landmarker model loaded successfully');
            } catch (err) {
                console.error('❌ Failed to load hand landmarker model:', err);
            }
        }

        loadModel();

        return () => {
            cancelled = true;
        };
    }, []);

    return handLandmarker;
}

export default useHandDetection;
