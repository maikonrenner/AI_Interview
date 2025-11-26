import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js';

function LiveCodingPanel({
  capturedScreen,
  isRealtimeMode,
  isProcessing,
  onCapture,
  onAnalyse,
  onClear,
  answer,
  history,
  onClose
}) {
  const [ocrText, setOcrText] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState('');
  const [selectedSource, setSelectedSource] = useState(null);
  const [screenSources, setScreenSources] = useState([]);
  const [showSourceSelector, setShowSourceSelector] = useState(false);

  useEffect(() => {
    if (capturedScreen) {
      performOCR(capturedScreen.dataUrl);
      detectContext(capturedScreen.sourceName);
    }
  }, [capturedScreen]);

  useEffect(() => {
    loadScreenSources();
  }, []);

  const loadScreenSources = async () => {
    const sources = await window.electronAPI.getScreenSources();
    setScreenSources(sources);
  };

  const performOCR = async (imageData) => {
    try {
      setOcrProgress(0);

      const result = await Tesseract.recognize(
        imageData,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      setOcrText(result.data.text);
      setOcrProgress(100);

      // Detect programming language from code
      const detectedLang = detectProgrammingLanguage(result.data.text);
      setDetectedLanguage(detectedLang);

    } catch (error) {
      console.error('OCR error:', error);
      setOcrText('Failed to extract text from image');
    }
  };

  const detectProgrammingLanguage = (text) => {
    const languagePatterns = {
      'Python': /\b(def|import|from|class|if __name__|print)\b/i,
      'JavaScript': /\b(const|let|var|function|=>|console\.log)\b/i,
      'Java': /\b(public|private|static|void|class|import java)\b/i,
      'C++': /\b(#include|iostream|std::|cout|cin|int main)\b/i,
      'C#': /\b(using|namespace|public|private|static|class)\b/i,
      'Go': /\b(func|package|import|fmt\.Print|var)\b/i,
      'Rust': /\b(fn|let|mut|use|println!|impl)\b/i,
      'SQL': /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN)\b/i
    };

    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    return 'Unknown';
  };

  const detectContext = (sourceName) => {
    const platformPatterns = {
      'LeetCode': /leetcode/i,
      'HackerRank': /hackerrank/i,
      'Codeforces': /codeforces/i,
      'CodeChef': /codechef/i,
      'VSCode': /visual studio code|vscode/i,
      'IntelliJ': /intellij|idea/i,
      'PyCharm': /pycharm/i,
      'Sublime': /sublime/i,
      'Atom': /atom/i
    };

    for (const [platform, pattern] of Object.entries(platformPatterns)) {
      if (pattern.test(sourceName)) {
        setDetectedPlatform(platform);
        return;
      }
    }

    setDetectedPlatform('Code Editor');
  };

  const handleAnalyse = () => {
    if (capturedScreen) {
      onAnalyse(capturedScreen);
    }
  };

  const handleSelectSource = async (source) => {
    setSelectedSource(source);
    setShowSourceSelector(false);
    // Trigger capture of specific source
    // This would require modification to capture specific window
  };

  return (
    <motion.div
      className="live-coding-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="panel-header">
        <div className="title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Live Coding Mode</span>
          <span className="star">⭐</span>
        </div>
        <button className="close-btn" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="panel-content">
        <div className="capture-section">
          <div className="preview-container">
            {capturedScreen ? (
              <div className="preview-wrapper">
                <img
                  src={capturedScreen.dataUrl}
                  alt="Captured screen"
                  className="screen-preview"
                />
                <div className="preview-overlay">
                  <div className="detection-info">
                    {detectedPlatform && (
                      <span className="badge">{detectedPlatform}</span>
                    )}
                    {detectedLanguage && detectedLanguage !== 'Unknown' && (
                      <span className="badge lang">{detectedLanguage}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="preview-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <p>No screen captured yet</p>
                <p className="hint">Press Cmd+Shift+C to capture</p>
              </div>
            )}
          </div>

          <div className="capture-controls">
            <button
              className="capture-btn primary"
              onClick={onCapture}
              title="Capture Screen (Cmd+Shift+C)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Capture Screen
            </button>

            <button
              className="capture-btn"
              onClick={() => setShowSourceSelector(!showSourceSelector)}
              title="Select Window"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              Select Window
            </button>

            {capturedScreen && (
              <>
                <button
                  className="capture-btn success"
                  onClick={handleAnalyse}
                  disabled={isProcessing}
                  title="Analyse This (Cmd+Shift+S)"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {isProcessing ? 'Analysing...' : 'Analyse This'}
                </button>

                <button
                  className="capture-btn danger"
                  onClick={onClear}
                  title="Clear"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Clear
                </button>
              </>
            )}
          </div>

          <AnimatePresence>
            {showSourceSelector && (
              <motion.div
                className="source-selector"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h4>Select Window to Capture:</h4>
                <div className="source-grid">
                  {screenSources.map(source => (
                    <div
                      key={source.id}
                      className="source-item"
                      onClick={() => handleSelectSource(source)}
                    >
                      <img src={source.thumbnail} alt={source.name} />
                      <span className="source-name">{source.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {ocrText && ocrProgress === 100 && (
          <div className="ocr-section">
            <h4>Extracted Text:</h4>
            <div className="ocr-text">
              <pre>{ocrText.substring(0, 500)}{ocrText.length > 500 ? '...' : ''}</pre>
            </div>
          </div>
        )}

        {ocrProgress > 0 && ocrProgress < 100 && (
          <div className="ocr-progress">
            <span>Extracting text... {ocrProgress}%</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${ocrProgress}%` }} />
            </div>
          </div>
        )}

        {answer && (
          <div className="analysis-result">
            <h4>AI Analysis:</h4>
            <div className="result-content">
              <p>{answer.text}</p>
            </div>
          </div>
        )}

        <div className="status-bar">
          <div className="status-item">
            <span className="label">Detected:</span>
            <span className="value">{detectedLanguage} - {detectedPlatform}</span>
          </div>
          <div className="status-item">
            <span className="label">Status:</span>
            <span className="value">
              {isProcessing ? '⏳ Analysing...' :
               isRealtimeMode ? '🔄 Real-time active' :
               capturedScreen ? '✅ Ready to analyse' :
               '⏸️ Waiting for capture'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default LiveCodingPanel;
