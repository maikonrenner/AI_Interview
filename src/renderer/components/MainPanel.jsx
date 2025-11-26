import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function MainPanel({
  question,
  answer,
  isProcessing,
  history,
  onClose
}) {
  const [historyIndex, setHistoryIndex] = useState(history.length);
  const answerRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when answer updates
    if (answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer]);

  const navigateHistory = (direction) => {
    const newIndex = historyIndex + direction;
    if (newIndex >= 0 && newIndex < history.length) {
      setHistoryIndex(newIndex);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    // Show toast notification
  };

  const parseAnswer = (answerText) => {
    if (!answerText) return { intuition: '', algorithm: '', implementation: '' };

    const sections = {
      intuition: '',
      algorithm: '',
      implementation: ''
    };

    const intuitionMatch = answerText.match(/(?:Intuition|INTUITION):?\s*([\s\S]*?)(?=(?:Algorithm|ALGORITHM|Implementation|IMPLEMENTATION|$))/i);
    const algorithmMatch = answerText.match(/(?:Algorithm|ALGORITHM):?\s*([\s\S]*?)(?=(?:Implementation|IMPLEMENTATION|$))/i);
    const implementationMatch = answerText.match(/(?:Implementation|IMPLEMENTATION):?\s*([\s\S]*$)/i);

    if (intuitionMatch) sections.intuition = intuitionMatch[1].trim();
    if (algorithmMatch) sections.algorithm = algorithmMatch[1].trim();
    if (implementationMatch) sections.implementation = implementationMatch[1].trim();

    // If no sections found, treat as single answer
    if (!sections.intuition && !sections.algorithm && !sections.implementation) {
      sections.intuition = answerText;
    }

    return sections;
  };

  const sections = answer ? parseAnswer(answer.text) : null;

  return (
    <motion.div
      className="main-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="panel-header">
        <div className="navigation">
          <button
            onClick={() => navigateHistory(-1)}
            disabled={historyIndex <= 0}
            title="Previous"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="history-indicator">{historyIndex + 1} / {history.length + 1}</span>
          <button
            onClick={() => navigateHistory(1)}
            disabled={historyIndex >= history.length}
            title="Next"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <button className="close-btn" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="panel-content" ref={answerRef}>
        {question && (
          <div className="question-section">
            <h3>Summarized question:</h3>
            <p className="question-text">{question}</p>
          </div>
        )}

        {isProcessing && !answer && (
          <div className="processing">
            <div className="thinking-indicator">
              <span>Thinking</span>
              <div className="dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {sections && (
          <div className="answer-section">
            <h3>
              Answer <span className="star">⭐</span>
            </h3>

            {sections.intuition && (
              <div className="answer-subsection">
                <h4>Intuition:</h4>
                <ReactMarkdown>{sections.intuition}</ReactMarkdown>
              </div>
            )}

            {sections.algorithm && (
              <div className="answer-subsection">
                <h4>Algorithm:</h4>
                <ReactMarkdown>{sections.algorithm}</ReactMarkdown>
              </div>
            )}

            {sections.implementation && (
              <div className="answer-subsection">
                <h4>Implementation:</h4>
                <div className="code-block">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');

                        return !inline && match ? (
                          <div className="code-container">
                            <div className="code-header">
                              <span className="language">{match[1]}</span>
                              <button
                                className="copy-btn"
                                onClick={() => copyCode(codeString)}
                                title="Copy code"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                                Copy
                              </button>
                            </div>
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {sections.implementation}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {answer?.thinking && (
              <div className="thinking-indicator small">
                <span>Generating more...</span>
                <div className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MainPanel;
