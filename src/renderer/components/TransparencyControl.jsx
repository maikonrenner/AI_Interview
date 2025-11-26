import React from 'react';
import { motion } from 'framer-motion';

function TransparencyControl({ opacity, onOpacityChange }) {
  const handleChange = (e) => {
    const value = parseFloat(e.target.value);
    onOpacityChange(value);
  };

  return (
    <motion.div
      className="transparency-control"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <div className="control-header">
        <span>Transparency</span>
        <span className="value">{Math.round(opacity * 100)}%</span>
      </div>
      <div className="slider-container">
        <span className="slider-label">0%</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={opacity}
          onChange={handleChange}
          className="opacity-slider"
        />
        <span className="slider-label">100%</span>
      </div>
      <div className="preset-buttons">
        <button onClick={() => onOpacityChange(0.25)}>25%</button>
        <button onClick={() => onOpacityChange(0.5)}>50%</button>
        <button onClick={() => onOpacityChange(0.75)}>75%</button>
        <button onClick={() => onOpacityChange(0.9)}>90%</button>
        <button onClick={() => onOpacityChange(1.0)}>100%</button>
      </div>
    </motion.div>
  );
}

export default TransparencyControl;
