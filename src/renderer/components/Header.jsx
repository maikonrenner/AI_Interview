import React from 'react';
import { motion } from 'framer-motion';

const MODES = {
  IDLE: 'idle',
  LIVE_CODING: 'live_coding',
  RESUME_BUILDER: 'resume_builder'
};

function Header({
  sessionTime,
  isListening,
  isConnected,
  onStartListening,
  onHide,
  onExit,
  onOpenSettings,
  mode,
  onModeChange,
  isRealtimeMode,
  onToggleRealtime
}) {
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="header" data-tauri-drag-region>
      <div className="header-left">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
              fill="#10B981"
            />
            <circle cx="12" cy="12" r="3" fill="#10B981" />
          </svg>
        </div>
        <div className="brand">
          <span className="brand-name">AI Interview</span>
          <div className="connection-status">
            <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
            <span className="status-text">{isConnected ? 'Connected' : 'Offline'}</span>
          </div>
        </div>
      </div>

      <div className="header-center">
        <button className="hide-btn" onClick={onHide} title="Hide (Cmd+Shift+H)">
          Hide
        </button>

        <div className="header-tabs">
          <motion.button
            className={`header-tab ${mode === MODES.RESUME_BUILDER ? 'active' : ''}`}
            onClick={() => onModeChange(mode === MODES.RESUME_BUILDER ? MODES.IDLE : MODES.RESUME_BUILDER)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Resume Builder - Add CV & Job Description"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Resume Builder</span>
          </motion.button>

          <motion.button
            className={`header-tab ${mode === MODES.LIVE_CODING ? 'active' : ''}`}
            onClick={() => onModeChange(mode === MODES.LIVE_CODING ? MODES.IDLE : MODES.LIVE_CODING)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Live Coding (Cmd+Shift+L)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>Live Coding</span>
            <span className="star">⭐</span>
          </motion.button>

          {mode === MODES.LIVE_CODING && (
            <motion.button
              className={`header-tab realtime ${isRealtimeMode ? 'active' : ''}`}
              onClick={onToggleRealtime}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Real-time Mode (Cmd+Shift+R)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                {isRealtimeMode && <circle cx="12" cy="12" r="3" fill="currentColor" />}
              </svg>
              <span>{isRealtimeMode ? 'Real-time ON' : 'Real-time OFF'}</span>
            </motion.button>
          )}
        </div>
      </div>

      <div className="header-right">
        <button
          className="menu-btn"
          onClick={onOpenSettings}
          title="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>

        <div className="timer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>{formatTime(sessionTime)}</span>
        </div>

        <motion.button
          className={`mic-btn ${isListening ? 'listening' : ''}`}
          onClick={onStartListening}
          title="Start Listening (Cmd+Shift+V)"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={isListening ? {
            boxShadow: [
              '0 0 0 0 rgba(16, 185, 129, 0.7)',
              '0 0 0 10px rgba(16, 185, 129, 0)',
            ]
          } : {}}
          transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          {isListening && <span className="listening-text">Listening...</span>}
        </motion.button>

        <button
          className="exit-btn"
          onClick={onExit}
          title="Exit"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Header;
