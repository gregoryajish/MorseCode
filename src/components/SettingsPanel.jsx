

const CHEAT_SHEET = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
};

export default function SettingsPanel({
    unit,
    onResetCalibration,
    ttsOptions,
    calibrationSamples,
    requiredSamples,
    gesture
}) {
    return (
        <div className="settings-panel">
            <h3 className="section-title">Configuration & Settings</h3>

            <div className="settings-section">
                <h4>Calibration Status</h4>
                {unit === null ? (
                    <div className="calibration-status warning">
                        <p>Not calibrated yet.</p>
                        <p>Samples: {calibrationSamples} / {requiredSamples}</p>
                        <p className="instruction">
                            Hold a fist {requiredSamples} times to establish your unit speed.
                        </p>
                        <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                            Detected Gesture: <strong style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: gesture === 'fist' ? 'var(--accent)' : '#27272a',
                                color: '#fff',
                                marginLeft: '6px'
                            }}>{gesture.toUpperCase()}</strong>
                        </p>
                    </div>
                ) : (
                    <div className="calibration-status success">
                        <p>Calibrated!</p>
                        <p>Speed Unit: <strong>{Math.round(unit)} ms</strong></p>
                        <button className="settings-btn" onClick={onResetCalibration}>
                            Reset Calibration
                        </button>
                    </div>
                )}
            </div>

            {ttsOptions && (
                <div className="settings-section">
                    <h4>Text-To-Speech Settings</h4>
                    <div className="control-group">
                        <label>
                            <input 
                                type="checkbox" 
                                checked={ttsOptions.enabled}
                                onChange={(e) => ttsOptions.setEnabled(e.target.checked)}
                            />
                            Enable TTS
                        </label>
                    </div>

                    <div className="control-group">
                        <label>Voice:</label>
                        <select 
                            value={ttsOptions.selectedVoice?.name || ''}
                            onChange={(e) => {
                                const voice = ttsOptions.voices.find(v => v.name === e.target.value);
                                if (voice) {
                                    ttsOptions.setSelectedVoice(voice);
                                }
                            }}
                            disabled={!ttsOptions.enabled}
                        >
                            {ttsOptions.voices.map((v, i) => (
                                <option key={i} value={v.name}>
                                    {v.name} ({v.lang})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Speed (Rate): {ttsOptions.rate}x</label>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="2" 
                            step="0.1" 
                            value={ttsOptions.rate}
                            onChange={(e) => ttsOptions.setRate(parseFloat(e.target.value))}
                            disabled={!ttsOptions.enabled}
                        />
                    </div>
                </div>
            )}

            <div className="settings-section cheat-sheet-section">
                <h4>Morse Code Cheat Sheet</h4>
                <div className="cheat-sheet-grid">
                    {Object.entries(CHEAT_SHEET).map(([letter, code]) => (
                        <div key={letter} className="cheat-sheet-item">
                            <span className="letter">{letter}</span>
                            <span className="code">{code}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
