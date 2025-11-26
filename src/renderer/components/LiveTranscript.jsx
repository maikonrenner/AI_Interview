import React from 'react';
import './LiveTranscript.css';

function LiveTranscript({ transcript, interimTranscript, isListening }) {
  // Always show the transcript container (no placeholder)
  return (
    <div className="live-transcript-container">
      <div className="live-transcript-content">
        {transcript && <span className="final-transcript">{transcript}</span>}
        {interimTranscript && (
          <span className="interim-transcript">{interimTranscript}</span>
        )}
        {isListening && !transcript && !interimTranscript && (
          <span className="listening-indicator">Listening...</span>
        )}
      </div>
    </div>
  );
}

export default LiveTranscript;
