# Morse Gesture Engine

A modern React web application that translates hand gestures into Morse Code in real-time using Computer Vision & AI. Built with [MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker).

## Features

- **Real-Time Hand Tracking**: Leverages MediaPipe's GPU-accelerated hand landmarker for smooth, 30+ FPS tracking directly in the browser.
- **Gesture Classification**: Uses custom 3D distance heuristics for robust, rotation-invariant gesture detection.
  - **Fist**: Hold a fist to signal. A short hold registers as a DOT (`•`), and a longer hold registers as a DASH (`-`).
  - **Thumbs Up / Virtual Button**: Make a thumbs-up gesture or virtually "click" the SPACE button on the screen to insert a space between words.
- **Adaptive Calibration**: Before translating, the app asks you to make 3 quick fists. It measures your natural speed and customizes the dot/dash timing thresholds specifically for you.
- **Live Translation & Logging**: See your current morse buffer, a log of completed letters, and the final decoded text.
- **Text-to-Speech (TTS)**: Reads out characters as they are decoded, and allows you to play back the entire decoded message.
- **Modern UI**: A responsive, glassmorphism-inspired dashboard for a sleek user experience.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- A webcam

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd morse-hand-gesture
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5174/` (or the port specified in your console).

## How to Use

1. **Allow Camera Access**: When you first load the page, grant camera permissions.
2. **Calibrate**: Follow the on-screen instructions to hold a fist 3 times. The app will calculate your average "unit" speed (e.g., 200ms).
3. **Signal**: 
   - Make a quick fist for a **DOT**.
   - Hold a fist slightly longer for a **DASH**.
   - Keep your hand open for a short gap (to complete a letter).
4. **Space**: To insert a space between words, either make a **Thumbs Up** gesture, or hover your index finger over the virtual **SPACE** button on the top right of the camera feed.
5. **Listen**: Click the "Speak Message" button to hear your translated text.

## Tech Stack
- **React 18** (Vite)
- **MediaPipe Tasks Vision** (`@mediapipe/tasks-vision`)
- **Vanilla CSS** (Glassmorphism & CSS Variables)
- **Web Speech API** for Text-to-Speech

## License

This project is licensed under the MIT License.
