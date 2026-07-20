

export default function MorseBuffer({ buffer }) {
    return (
        <div className="morse-buffer-container">
            <h3 className="section-title">Current Character Buffer</h3>
            <div className="morse-buffer-display">
                {buffer ? (
                    buffer.split('').map((char, index) => (
                        <span key={index} className={`morse-symbol ${char === '.' ? 'dot' : 'dash'}`}>
                            {char === '.' ? '•' : '—'}
                        </span>
                    ))
                ) : (
                    <span className="morse-buffer-placeholder">Waiting for gesture...</span>
                )}
            </div>
        </div>
    );
}
