import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import TransparencyControl from './TransparencyControl';

const MODES = {
  IDLE: 'idle',
  LIVE_CODING: 'live_coding',
  RESUME_BUILDER: 'resume_builder'
};

function ActionBar({
  mode,
  onModeChange,
  isRealtimeMode,
  onToggleRealtime,
  opacity,
  onOpacityChange,
  showTransparencySlider,
  onToggleTransparencySlider
}) {
  const transparencySectionRef = useRef(null);

  // Close transparency slider when clicking outside
  useEffect(() => {
    if (!showTransparencySlider) return;

    const handleClickOutside = (event) => {
      if (transparencySectionRef.current && !transparencySectionRef.current.contains(event.target)) {
        onToggleTransparencySlider();
      }
    };

    // Add event listener with a small delay to avoid immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTransparencySlider, onToggleTransparencySlider]);

  return (
    <div className="action-bar">
      <div className="menu-container">
        <div className="menu-label">Menu:</div>
        <div className="tabs-container">
          <motion.button
            className={`tab ${mode === MODES.RESUME_BUILDER ? 'active' : ''}`}
            onClick={() => onModeChange(mode === MODES.RESUME_BUILDER ? MODES.IDLE : MODES.RESUME_BUILDER)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Resume Builder - Add CV & Job Description"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Resume Builder</span>
          </motion.button>

          <motion.button
            className={`tab ${mode === MODES.LIVE_CODING ? 'active' : ''}`}
            onClick={() => onModeChange(mode === MODES.LIVE_CODING ? MODES.IDLE : MODES.LIVE_CODING)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Live Coding (Cmd+Shift+L)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>Live Coding</span>
            <span className="star">⭐</span>
          </motion.button>
        </div>

        {mode === MODES.LIVE_CODING && (
          <motion.button
            className={`tab realtime ${isRealtimeMode ? 'active' : ''}`}
            onClick={onToggleRealtime}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Real-time Mode (Cmd+Shift+R)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              {isRealtimeMode && <circle cx="12" cy="12" r="3" fill="currentColor" />}
            </svg>
            <span>{isRealtimeMode ? 'Real-time ON' : 'Real-time OFF'}</span>
          </motion.button>
        )}
      </div>

      <div className="transparency-section" ref={transparencySectionRef}>
        {showTransparencySlider && (
          <TransparencyControl
            opacity={opacity}
            onOpacityChange={onOpacityChange}
          />
        )}
        <button
          className="transparency-toggle"
          onClick={onToggleTransparencySlider}
          title="Toggle Transparency (Cmd+T)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" opacity="0.3" />
          </svg>
          <span>{Math.round(opacity * 100)}%</span>
        </button>
      </div>
    </div>
  );
}

export default ActionBar;
