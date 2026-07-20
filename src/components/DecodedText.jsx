

export default function DecodedText({ text, morseLog, onClear, onSpeak }) {
    const handleCopy = () => {
        if (text) {
            navigator.clipboard.writeText(text);
        }
    };

    return (
        <div className="decoded-text-container">
            <h3 className="section-title">Decoded Message</h3>
            <div className="decoded-text-box">
                {text ? (
                    <span className="decoded-text-content">{text}</span>
                ) : (
                    <span className="decoded-text-placeholder">Decoded text will appear here...</span>
                )}
                <span className="blinking-cursor">|</span>
            </div>

            <div className="decoded-text-actions">
                <button 
                    className="action-button primary" 
                    onClick={onSpeak} 
                    disabled={!text}
                    title="Speak text"
                >
                    🔊 Speak
                </button>
                <button 
                    className="action-button secondary" 
                    onClick={handleCopy} 
                    disabled={!text}
                    title="Copy to clipboard"
                >
                    📋 Copy
                </button>
                <button 
                    className="action-button danger" 
                    onClick={onClear} 
                    disabled={!text && morseLog.length === 0}
                    title="Clear text"
                >
                    🗑️ Clear
                </button>
            </div>

            {morseLog.length > 0 && (
                <div className="raw-morse-log">
                    <h4>Sequence Log</h4>
                    <div className="log-scroll">
                        {morseLog.map((pattern, idx) => (
                            <span key={idx} className="log-item">{pattern}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
