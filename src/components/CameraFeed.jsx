// src/components/CameraFeed.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import useHandDetection from '../hooks/useHandDetection';
import useGestureState from '../hooks/useGestureState';

export default function CameraFeed({ onGestureChange, onVirtualSpace }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const handLandmarker = useHandDetection();
    const { gesture, updateLandmarks } = useGestureState(3);
    const [cameraError, setCameraError] = useState(null);
    const lastTimestampRef = useRef(0);
    const isHoveringSpaceRef = useRef(false);

    // Notify parent whenever gesture changes
    const prevGestureRef = useRef(gesture);
    useEffect(() => {
        if (gesture !== prevGestureRef.current) {
            prevGestureRef.current = gesture;
            if (onGestureChange) {
                onGestureChange(gesture);
            }
        }
    }, [gesture, onGestureChange]);

    const drawLandmarks = useCallback((results, canvas, isHovering) => {
        const ctx = canvas.getContext('2d');
        if (!videoRef.current || !ctx) return;

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- Draw Virtual Space Button ---
        // Note: canvas is flipped horizontally, so drawing at x=20 appears on visual top-right
        const btnWidth = 120;
        const btnHeight = 60;
        const rawBtnX = 20;
        const rawBtnY = 20;

        ctx.fillStyle = isHovering ? 'rgba(236, 72, 153, 0.8)' : 'rgba(236, 72, 153, 0.3)';
        ctx.fillRect(rawBtnX, rawBtnY, btnWidth, btnHeight);
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.strokeRect(rawBtnX, rawBtnY, btnWidth, btnHeight);
        
        ctx.save();
        ctx.translate(rawBtnX + btnWidth / 2, rawBtnY + btnHeight / 2);
        ctx.scale(-1, 1); // Un-mirror for text readability
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SPACE', 0, 0);
        ctx.restore();
        // ---------------------------------

        if (results.landmarks.length === 0) return;

        const hand = results.landmarks[0];

        // Draw connections between joints for better visibility
        const connections = [
            [0,1],[1,2],[2,3],[3,4],    // thumb
            [0,5],[5,6],[6,7],[7,8],    // index
            [0,9],[9,10],[10,11],[11,12], // middle
            [0,13],[13,14],[14,15],[15,16], // ring
            [0,17],[17,18],[18,19],[19,20], // pinky
            [5,9],[9,13],[13,17]          // palm
        ];

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.lineWidth = 2;
        for (const [a, b] of connections) {
            if (hand[a] && hand[b]) {
                ctx.beginPath();
                ctx.moveTo(hand[a].x * canvas.width, hand[a].y * canvas.height);
                ctx.lineTo(hand[b].x * canvas.width, hand[b].y * canvas.height);
                ctx.stroke();
            }
        }

        for (const point of hand) {
            ctx.beginPath();
            ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#a855f7';
            ctx.fill();
        }
    }, []);

    // Start the camera
    useEffect(() => {
        let stream = null;
        let isCancelled = false;

        async function startCamera() {
            try {
                setCameraError(null);
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 }
                });

                if (isCancelled) {
                    mediaStream.getTracks().forEach(track => track.stop());
                    return;
                }

                stream = mediaStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.muted = true;
                    videoRef.current.playsInline = true;
                    await videoRef.current.play();
                    console.log('✅ Camera stream started');
                }
            } catch (err) {
                if (isCancelled) return;
                if (err.name === 'AbortError') return; // React strict mode double-mount

                console.error('❌ Camera error:', err);
                if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    setCameraError('Camera is already in use by another application or tab.');
                } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setCameraError('Camera access was denied. Please grant permission.');
                } else {
                    setCameraError(`Failed to access camera: ${err.message}`);
                }
            }
        }
        startCamera();

        return () => {
            isCancelled = true;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Detection loop
    useEffect(() => {
        if (!handLandmarker) return;

        let animationId;
        let running = true;

        function detectFrame() {
            if (!running) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (video && canvas && video.readyState >= 2) {
                // MediaPipe requires strictly increasing timestamps
                const now = performance.now();
                if (now > lastTimestampRef.current) {
                    lastTimestampRef.current = now;
                    try {
                        const results = handLandmarker.detectForVideo(video, now);
                        
                        // Virtual Space Button logic
                        let isHovering = false;
                        if (results.landmarks.length > 0) {
                            const indexTip = results.landmarks[0][8];
                            if (indexTip) {
                                const px = indexTip.x * canvas.width;
                                const py = indexTip.y * canvas.height;
                                // Button bounds (with some padding): x [20, 140], y [20, 80]
                                const inBounds = px >= 20 && px <= 140 && py >= 20 && py <= 80;

                                if (inBounds) {
                                    isHovering = true;
                                    if (!isHoveringSpaceRef.current) {
                                        isHoveringSpaceRef.current = true;
                                        if (onVirtualSpace) {
                                            onVirtualSpace();
                                        }
                                    }
                                }
                            }
                        }
                        
                        if (!isHovering && isHoveringSpaceRef.current) {
                            isHoveringSpaceRef.current = false;
                        }

                        drawLandmarks(results, canvas, isHoveringSpaceRef.current);
                        updateLandmarks(results.landmarks);
                    } catch (err) {
                        // Silently ignore occasional frame errors
                        console.warn('Frame detection error:', err.message);
                    }
                }
            }

            animationId = requestAnimationFrame(detectFrame);
        }

        detectFrame();

        return () => {
            running = false;
            cancelAnimationFrame(animationId);
        };
    }, [handLandmarker, updateLandmarks, drawLandmarks, onVirtualSpace]);

    return (
        <div className="camera-feed-viewport">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
            />
            <canvas
                ref={canvasRef}
                className="camera-canvas"
            />
            {cameraError && (
                <div className="loading-overlay">
                    <span style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</span>
                    <p style={{ fontWeight: 'bold', color: '#ef4444', margin: '0 0 8px 0', textAlign: 'center', padding: '0 16px' }}>
                        {cameraError}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0, textAlign: 'center', padding: '0 24px' }}>
                        Close other apps using the camera, then refresh this page.
                    </p>
                </div>
            )}
            {!cameraError && !handLandmarker && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Loading AI Model...</p>
                </div>
            )}
        </div>
    );
}