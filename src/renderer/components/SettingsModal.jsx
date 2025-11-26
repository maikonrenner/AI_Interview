import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function SettingsModal({ onClose, onSave }) {
  const [config, setConfig] = useState({
    openaiApiKey: '',
    geminiApiKey: '',
    deepgramApiKey: '',
    serverUrl: 'ws://localhost:8004/ws/interview/',
    autoHideDuringScreenShare: true,
    liveCodingInterval: 8000,
    questionDelay: 2500,
    opacity: 0.9
  });

  const [shortcuts, setShortcuts] = useState([
    { key: 'Cmd+Shift+L', action: 'Toggle Live Coding Mode' },
    { key: 'Cmd+Shift+C', action: 'Capture Screen' },
    { key: 'Cmd+Shift+S', action: 'Send capture for analysis' },
    { key: 'Cmd+Shift+R', action: 'Toggle Real-time mode' },
    { key: 'Cmd+Shift+V', action: 'Activate voice transcription' },
    { key: 'Cmd+Shift+H', action: 'Hide/Show window' },
    { key: 'Cmd+Shift+Q', action: 'Quick question input' },
    { key: 'Cmd+Shift+A', action: 'Open history' },
    { key: 'Cmd+T', action: 'Toggle transparency slider' }
  ]);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const loadedConfig = await window.electronAPI.getConfig();
    // Garantir que todos os valores tenham fallback para evitar undefined
    setConfig({
      openaiApiKey: loadedConfig.openaiApiKey || '',
      geminiApiKey: loadedConfig.geminiApiKey || '',
      deepgramApiKey: loadedConfig.deepgramApiKey || '',
      serverUrl: loadedConfig.serverUrl || 'ws://localhost:8004/ws/interview/',
      autoHideDuringScreenShare: loadedConfig.autoHideDuringScreenShare ?? true,
      liveCodingInterval: loadedConfig.liveCodingInterval || 8000,
      questionDelay: loadedConfig.questionDelay || 2500,
      opacity: loadedConfig.opacity ?? 0.9
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await window.electronAPI.setConfig(config);
    setTimeout(() => {
      setIsSaving(false);
      if (onSave) onSave();
      onClose();
    }, 500);
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="settings-modal"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-content">
          <div className="settings-section">
            <h3>API Configuration</h3>

            <div className="form-group">
              <label>OpenAI API Key</label>
              <input
                type="password"
                value={config.openaiApiKey || ''}
                onChange={(e) => handleChange('openaiApiKey', e.target.value)}
                placeholder="sk-..."
              />
              <span className="help-text">
                Required for AI responses. Get from{' '}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                  OpenAI Platform
                </a>
              </span>
            </div>

            <div className="form-group">
              <label>Google Gemini API Key (Alternative)</label>
              <input
                type="password"
                value={config.geminiApiKey || ''}
                onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                placeholder="AIza..."
              />
              <span className="help-text">
                Alternative to OpenAI. Get from{' '}
                <a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank" rel="noopener noreferrer">
                  Google AI Studio
                </a>
              </span>
            </div>

            <div className="form-group">
              <label>Deepgram API Key</label>
              <input
                type="password"
                value={config.deepgramApiKey || ''}
                onChange={(e) => handleChange('deepgramApiKey', e.target.value)}
                placeholder="..."
              />
              <span className="help-text">
                Required for voice transcription. Get from{' '}
                <a href="https://console.deepgram.com/" target="_blank" rel="noopener noreferrer">
                  Deepgram Console
                </a>
              </span>
            </div>
          </div>

          <div className="settings-section">
            <h3>Server Connection</h3>

            <div className="form-group">
              <label>Django Server URL</label>
              <input
                type="text"
                value={config.serverUrl || ''}
                onChange={(e) => handleChange('serverUrl', e.target.value)}
                placeholder="ws://localhost:8004/ws/interview/"
              />
              <span className="help-text">
                WebSocket URL of your AI Interview Co-pilot server
              </span>
            </div>
          </div>

          <div className="settings-section">
            <h3>Behavior</h3>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={config.autoHideDuringScreenShare ?? true}
                  onChange={(e) => handleChange('autoHideDuringScreenShare', e.target.checked)}
                />
                <span>Auto-hide during screen sharing</span>
              </label>
              <span className="help-text">
                Automatically hide window when screen sharing is detected
              </span>
            </div>

            <div className="form-group">
              <label>Live Coding Interval (ms)</label>
              <input
                type="number"
                value={config.liveCodingInterval || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  handleChange('liveCodingInterval', isNaN(val) ? '' : val);
                }}
                min="3000"
                max="30000"
                step="1000"
              />
              <span className="help-text">
                How often to capture screen in real-time mode (default: 8000ms)
              </span>
            </div>

            <div className="form-group">
              <label>Question Auto-Send Delay (ms)</label>
              <input
                type="number"
                value={config.questionDelay || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  handleChange('questionDelay', isNaN(val) ? '' : val);
                }}
                min="1000"
                max="10000"
                step="500"
              />
              <span className="help-text">
                How long to wait before auto-sending detected questions (default: 2500ms)
              </span>
            </div>
          </div>

          <div className="settings-section">
            <h3>Keyboard Shortcuts</h3>
            <div className="shortcuts-list">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="shortcut-item">
                  <span className="shortcut-key">{shortcut.key}</span>
                  <span className="shortcut-action">{shortcut.action}</span>
                </div>
              ))}
            </div>
            <span className="help-text">
              Use Cmd on macOS, Ctrl on Windows/Linux
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default SettingsModal;
