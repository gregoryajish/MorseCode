// src/utils/gestureClassifier.js

// MediaPipe's hand landmark indices (fixed, always the same order):
// 0 = wrist
// 2 = thumb CMC, 3 = thumb MCP, 4 = thumb tip
// 5 = index MCP, 6 = index PIP, 7 = index DIP, 8 = index tip
// 9 = middle MCP, 10 = middle PIP, 11 = middle DIP, 12 = middle tip
// 13 = ring MCP, 14 = ring PIP, 15 = ring DIP, 16 = ring tip
// 17 = pinky MCP, 18 = pinky PIP, 19 = pinky DIP, 20 = pinky tip

function distance(a, b) {
    if (!a || !b) return 0;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = (a.z != null && b.z != null) ? a.z - b.z : 0;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function countCurledFingers(landmarks) {
    const wrist = landmarks[0];
    if (!wrist) return 0;

    const tips = [8, 12, 16, 20];
    const pipJoints = [6, 10, 14, 18];

    let curledCount = 0;
    for (let i = 0; i < tips.length; i++) {
        const tip = landmarks[tips[i]];
        const pip = landmarks[pipJoints[i]];
        if (!tip || !pip) continue; // skip missing landmarks
        // A finger is "curled" when its tip is closer to the wrist than its PIP joint
        if (distance(tip, wrist) < distance(pip, wrist)) {
            curledCount++;
        }
    }
    return curledCount;
}

function isThumbClearlySeparated(landmarks) {
    const wrist = landmarks[0];
    const thumbBase = landmarks[2];
    const thumbTip = landmarks[4];
    const indexMcp = landmarks[5];
    if (!wrist || !thumbBase || !thumbTip || !indexMcp) return false;

    const thumbReach = distance(thumbTip, wrist);
    const baseReach = distance(thumbBase, wrist);
    const thumbToIndex = distance(thumbTip, indexMcp);

    // Thumb must be substantially farther from wrist than its base
    // AND far from the index finger base (meaning it's sticking out, not tucked)
    return thumbReach > baseReach * 1.6 && thumbToIndex > baseReach * 0.8;
}

// Returns one of: 'fist', 'open', 'thumbsUp', 'none'
export function classifyGesture(landmarks) {
    if (!landmarks || !Array.isArray(landmarks) || landmarks.length < 21) {
        return 'none';
    }

    const curledCount = countCurledFingers(landmarks);

    if (curledCount >= 3) {
        if (isThumbClearlySeparated(landmarks)) {
            return 'thumbsUp';
        }
        return 'fist';
    }
    return 'open';
}

// kept for backward compatibility if anything still imports it
export function isFist(landmarks) {
    return classifyGesture(landmarks) === 'fist';
}