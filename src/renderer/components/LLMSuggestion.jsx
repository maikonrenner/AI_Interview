import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

function LLMSuggestion({ question, answer, isProcessing, onClose }) {
  // Don't show if no question and not processing
  if (!question && !isProcessing) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="llm-suggestion"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {question && (
          <div className="suggestion-question">
            <strong>Question:</strong> {question}
          </div>
        )}

        <div className="suggestion-content">
          {isProcessing && !answer?.text ? (
            <div className="suggestion-thinking">
              <div className="thinking-indicator">
                <div className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>Thinking...</span>
              </div>
            </div>
          ) : answer?.text ? (
            <div className="suggestion-answer">
              <ReactMarkdown>{answer.text}</ReactMarkdown>
              {answer.streaming && (
                <span className="streaming-indicator">▊</span>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default LLMSuggestion;
