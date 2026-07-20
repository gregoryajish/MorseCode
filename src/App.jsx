// src/App.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import CameraFeed from './components/CameraFeed';
import SignalIndicator from './components/SignalIndicator';
import MorseBuffer from './components/MorseBuffer';
import DecodedText from './components/DecodedText';
import SettingsPanel from './components/SettingsPanel';
import useCalibration from './hooks/useCalibration';
import useMorseTimer from './hooks/useMorseTimer';
import useTextToSpeech from './hooks/useTextToSpeech';

function App() {
  const [gesture, setGesture] = useState('none');
  const prevGestureRef = useRef('none');
  const { unit, samplesCollected, requiredSamples, recordGestureChange, resetCalibration } = useCalibration(3);
  const { currentBuffer, morseLog, decodedText, handleGestureChange, insertSpace, resetTimer } = useMorseTimer(unit);
  const tts = useTextToSpeech();
  const { speak } = tts;

  // Stable callback for CameraFeed — never changes reference
  const onGestureChange = useCallback((newGesture) => {
    setGesture(newGesture);
  }, []);

  // Route TRANSITIONS only — ignore duplicate values and dependency-triggered re-runs
  useEffect(() => {
    // Only act when the gesture actually changed
    if (gesture === prevGestureRef.current) return;
    prevGestureRef.current = gesture;

    console.log(`🖐️ Gesture transition: → ${gesture} | calibrated: ${unit !== null}`);

    if (unit === null) {
      // Calibration phase: record fist hold/release transitions
      recordGestureChange(gesture);
    } else {
      // Morse phase
      if (gesture === 'thumbsUp') {
        insertSpace();
      } else {
        handleGestureChange(gesture);
      }
    }
  }, [gesture, unit, recordGestureChange, handleGestureChange, insertSpace]);

  // Read aloud characters as they are decoded
  const prevTextLenRef = useRef(0);
  useEffect(() => {
    if (decodedText.length > prevTextLenRef.current) {
      const lastChar = decodedText[decodedText.length - 1];
      if (lastChar === ' ') {
        speak('Space');
      } else {
        speak(lastChar);
      }
    }
    prevTextLenRef.current = decodedText.length;
  }, [decodedText, speak]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Morse Gesture Engine</h1>
        <p className="app-subtitle">Translate hand gestures into Morse Code using Computer Vision & AI</p>
      </header>

      <main className="dashboard-layout">
        <section className="feed-column">
          <div className="card camera-card">
            <CameraFeed onGestureChange={onGestureChange} onVirtualSpace={insertSpace} />
          </div>

          <div className="card indicator-card">
            <SignalIndicator gesture={gesture} unit={unit} />
          </div>
        </section>

        <section className="controls-column">
          <div className="card buffer-card">
            <MorseBuffer buffer={currentBuffer} />
          </div>

          <div className="card decoded-card">
            <DecodedText
              text={decodedText}
              morseLog={morseLog}
              onClear={resetTimer}
              onSpeak={() => speak(decodedText)}
            />
          </div>

          <div className="card settings-card">
            <SettingsPanel
              unit={unit}
              onResetCalibration={resetCalibration}
              ttsOptions={tts}
              calibrationSamples={samplesCollected}
              requiredSamples={requiredSamples}
              gesture={gesture}
            />
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Built with MediaPipe Tasks Vision & React</p>
      </footer>
    </div>
  );
}

export default App;