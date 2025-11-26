import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import LiveCodingPanel from './components/LiveCodingPanel';
import SettingsModal from './components/SettingsModal';
import LiveTranscript from './components/LiveTranscript';
import LLMSuggestion from './components/LLMSuggestion';
import ResumeBuilder from './components/ResumeBuilder';
import { isQuestion } from './utils/questionDetector';
import './styles/App.css';

const MODES = {
  IDLE: 'idle',
  LIVE_CODING: 'live_coding',
  RESUME_BUILDER: 'resume_builder'
};

function App() {
  const [mode, setMode] = useState(MODES.IDLE);
  const [opacity, setOpacity] = useState(0.9);
  const [isListening, setIsListening] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTransparencySlider, setShowTransparencySlider] = useState(false);
  const [questionDelay, setQuestionDelay] = useState(2500);
  const [liveCodingInterval, setLiveCodingInterval] = useState(8000);

  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [capturedScreen, setCapturedScreen] = useState(null);
  const [isRealtimeMode, setIsRealtimeMode] = useState(false);
  const [liveCodingHistory, setLiveCodingHistory] = useState([]);

  const [conversationHistory, setConversationHistory] = useState([]);

  // Live transcription states
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [autoSendTimeout, setAutoSendTimeout] = useState(null);

  const sessionTimerRef = useRef(null);
  const realtimeIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const isRecordingRef = useRef(false);

  // Load configuration on mount
  useEffect(() => {
    loadConfig();
    setupEventListeners();
    startSessionTimer();

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      if (realtimeIntervalRef.current) clearInterval(realtimeIntervalRef.current);
      cleanupEventListeners();
    };
  }, []);

  // Restart realtime interval when liveCodingInterval changes
  useEffect(() => {
    if (isRealtimeMode && realtimeIntervalRef.current) {
      // Clear old interval
      clearInterval(realtimeIntervalRef.current);

      // Start new interval with updated timing
      realtimeIntervalRef.current = setInterval(() => {
        window.electronAPI.captureScreen();
      }, liveCodingInterval);
    }
  }, [liveCodingInterval, isRealtimeMode]);

  const loadConfig = async () => {
    const config = await window.electronAPI.getConfig();
    setOpacity(config.opacity || 0.9);
    setQuestionDelay(config.questionDelay || 2500);
    setLiveCodingInterval(config.liveCodingInterval || 8000);
  };

  const setupEventListeners = () => {
    window.electronAPI.onServerConnected(() => {
      setIsConnected(true);
      console.log('Connected to Django server');
    });

    window.electronAPI.onServerMessage((message) => {
      handleServerMessage(message);
    });

    window.electronAPI.onServerError((error) => {
      console.error('Server error:', error);
      setIsConnected(false);
    });

    window.electronAPI.onScreenCaptured((data) => {
      handleScreenCaptured(data);
    });

    window.electronAPI.onToggleLiveCoding(() => {
      toggleLiveCodingMode();
    });

    window.electronAPI.onAnalyseCapture(() => {
      if (capturedScreen) {
        analyseScreen(capturedScreen);
      }
    });

    window.electronAPI.onToggleRealtimeMode(() => {
      toggleRealtimeMode();
    });

    window.electronAPI.onStartVoiceTranscription(() => {
      toggleListening();
    });

    window.electronAPI.onFocusQuestionInput(() => {
      // Question input is now handled through live transcription
      // No need to change mode
    });

    window.electronAPI.onToggleTransparencySlider(() => {
      setShowTransparencySlider(prev => !prev);
    });

    window.electronAPI.onOpenSettings(() => {
      setShowSettings(true);
    });

    // Transcription event listeners
    window.electronAPI.onTranscriptionStarted(() => {
      console.log('Transcription started');
      setIsListening(true);
    });

    window.electronAPI.onTranscript((data) => {
      handleTranscript(data);
    });

    window.electronAPI.onTranscriptionStopped(() => {
      console.log('Transcription stopped');
      setIsListening(false);
      setLiveTranscript('');
      setInterimTranscript('');
    });

    window.electronAPI.onTranscriptionError((error) => {
      console.error('Transcription error:', error);
      setIsListening(false);
    });

    window.electronAPI.onWindowHidden(() => {
      console.log('Window hidden during screen share');
    });

    window.electronAPI.onWindowShown(() => {
      console.log('Window shown - screen share ended');
    });

    // AI streaming event listeners
    window.electronAPI.onAIResponseStart(() => {
      console.log('AI response started');
      setIsProcessing(true);
      setCurrentAnswer({ text: '', thinking: false, streaming: true });
    });

    window.electronAPI.onAIResponseChunk((chunk) => {
      console.log('AI chunk received:', chunk);
      setCurrentAnswer(prev => ({
        ...prev,
        text: (prev?.text || '') + chunk,
        thinking: false,
        streaming: true
      }));
    });

    window.electronAPI.onAIResponseComplete((fullResponse) => {
      console.log('AI response complete');
      setIsProcessing(false);
      setCurrentAnswer(prev => ({
        ...prev,
        thinking: false,
        streaming: false
      }));
    });
  };

  const cleanupEventListeners = () => {
    window.electronAPI.removeListener('server-connected');
    window.electronAPI.removeListener('server-message');
    window.electronAPI.removeListener('screen-captured');
    window.electronAPI.removeListener('ai-response-start');
    window.electronAPI.removeListener('ai-response-chunk');
    window.electronAPI.removeListener('ai-response-complete');
    window.electronAPI.removeListener('ai-thinking');
    window.electronAPI.removeListener('ai-error');
    window.electronAPI.removeListener('transcription-started');
    window.electronAPI.removeListener('transcript');
    window.electronAPI.removeListener('transcription-stopped');
    window.electronAPI.removeListener('transcription-error');
    window.electronAPI.removeListener('toggle-live-coding');
    window.electronAPI.removeListener('analyse-capture');
    window.electronAPI.removeListener('toggle-realtime-mode');
    window.electronAPI.removeListener('start-voice-transcription');
    window.electronAPI.removeListener('focus-question-input');
    window.electronAPI.removeListener('toggle-transparency-slider');
    window.electronAPI.removeListener('open-settings');
    window.electronAPI.removeListener('window-hidden');
    window.electronAPI.removeListener('window-shown');
  };

  const startSessionTimer = () => {
    sessionTimerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 60000); // Update every minute
  };

  const handleServerMessage = (message) => {
    console.log('Server message:', message);

    if (message.type === 'transcription') {
      // Handle live transcription
      setCurrentQuestion(prev => prev + ' ' + message.text);
    } else if (message.type === 'question_extracted') {
      // Question extracted from transcription
      setCurrentQuestion(message.question);
    }
    // AI response handlers removed - now handled by IPC events (onAIResponseStart, onAIResponseChunk, onAIResponseComplete)
    // This prevents duplicate processing of chunks
  };

  // Handle transcription data from Deepgram
  const handleTranscript = (data) => {
    console.log('Transcript received:', data);

    if (data.is_final) {
      // Final transcript - add to live transcript
      const newTranscript = liveTranscript + data.transcript + ' ';
      setLiveTranscript(newTranscript);
      setInterimTranscript('');

      // Check if it's a question and auto-send
      handleAutoSend(newTranscript);
    } else {
      // Interim transcript - show in real-time
      setInterimTranscript(data.transcript);
    }
  };

  // Handle auto-send when question detected
  const handleAutoSend = (text) => {
    if (!text || !isQuestion(text)) {
      return;
    }

    console.log('✅ Question detected! Setting up auto-send...');

    // Clear any existing timeout
    if (autoSendTimeout) {
      clearTimeout(autoSendTimeout);
    }

    // Set timeout to auto-send after configured delay
    const timeout = setTimeout(async () => {
      console.log('🚀 Auto-sending question:', text);

      // Send question to AI
      await handleQuestionSubmit(text);

      // Clear transcript
      setLiveTranscript('');
      setInterimTranscript('');
      setAutoSendTimeout(null);
    }, questionDelay);

    setAutoSendTimeout(timeout);
  };

  const handleScreenCaptured = (data) => {
    console.log('Screen captured:', data.sourceName);
    setCapturedScreen(data);

    if (mode === MODES.LIVE_CODING) {
      // Automatically show in Live Coding panel
    }
  };

  const toggleLiveCodingMode = () => {
    if (mode === MODES.LIVE_CODING) {
      setMode(MODES.IDLE);
      setIsRealtimeMode(false);
      if (realtimeIntervalRef.current) {
        clearInterval(realtimeIntervalRef.current);
      }
    } else {
      setMode(MODES.LIVE_CODING);
    }
  };

  const toggleRealtimeMode = () => {
    if (!isRealtimeMode) {
      // Start real-time capture using configured interval
      realtimeIntervalRef.current = setInterval(() => {
        window.electronAPI.captureScreen();
      }, liveCodingInterval);
      setIsRealtimeMode(true);
    } else {
      if (realtimeIntervalRef.current) {
        clearInterval(realtimeIntervalRef.current);
      }
      setIsRealtimeMode(false);
    }
  };

  const analyseScreen = async (screenData) => {
    if (!screenData) return;

    setIsProcessing(true);

    // Send to server for OCR and AI analysis
    const success = await window.electronAPI.sendToServer({
      type: 'analyse_screen',
      image: screenData.dataUrl,
      sourceName: screenData.sourceName,
      activeWindow: screenData.activeWindow
    });

    if (success) {
      console.log('Screen sent for analysis');
    } else {
      console.error('Failed to send screen for analysis');
      setIsProcessing(false);
    }
  };

  const toggleListening = async () => {
    if (!isListening) {
      try {
        console.log('🎤 Starting microphone capture...');

        // Start transcription service first
        await window.electronAPI.startTranscription();

        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        // Set recording flag immediately
        isRecordingRef.current = true;

        // Create MediaRecorder
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm'
        });
        mediaRecorderRef.current = mediaRecorder;

        // Handle audio data and send to main process
        mediaRecorder.addEventListener('dataavailable', async (event) => {
          if (event.data.size > 0 && isRecordingRef.current) {
            console.log('📦 Audio data available:', event.data.size, 'bytes');

            // Convert blob to array buffer
            const arrayBuffer = await event.data.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            // Send audio data to main process
            await window.electronAPI.sendAudio(Array.from(uint8Array));
          }
        });

        // Start recording with 1 second intervals
        mediaRecorder.start(1000);
        console.log('✅ Microphone recording started');

      } catch (error) {
        console.error('❌ Error starting transcription:', error);
        isRecordingRef.current = false;
        alert('Failed to start microphone: ' + error.message);
      }
    } else {
      // Stop transcription
      console.log('🛑 Stopping transcription...');

      // Clear recording flag immediately
      isRecordingRef.current = false;

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }

      await window.electronAPI.stopTranscription();
    }
  };

  const handleOpacityChange = async (newOpacity) => {
    setOpacity(newOpacity);
    await window.electronAPI.setOpacity(newOpacity);
  };

  const handleQuestionSubmit = async (question) => {
    if (!question.trim()) return;

    setCurrentQuestion(question);
    // Keep in IDLE mode - answer will be shown in live transcript area
    setIsProcessing(true);
    setCurrentAnswer({ text: '', thinking: true, streaming: false });

    try {
      // Call AI service - streaming will be handled by event listeners
      await window.electronAPI.askQuestion(question);

      // Note: The response is handled by the AI streaming event listeners
      // onAIResponseStart, onAIResponseChunk, onAIResponseComplete

    } catch (error) {
      console.error('Error submitting question:', error);
      setIsProcessing(false);
      setCurrentAnswer(null);
      alert('Failed to get answer: ' + error.message);
    }
  };

  const handleHide = async () => {
    await window.electronAPI.hideWindow();
  };

  const handleExit = async () => {
    if (confirm('Are you sure you want to exit AI Interview?')) {
      await window.electronAPI.closeWindow();
    }
  };

  return (
    <div className="app-container">
      <Header
        sessionTime={sessionTime}
        isListening={isListening}
        isConnected={isConnected}
        onStartListening={toggleListening}
        onHide={handleHide}
        onExit={handleExit}
        onOpenSettings={() => setShowSettings(true)}
        mode={mode}
        onModeChange={setMode}
        isRealtimeMode={isRealtimeMode}
        onToggleRealtime={toggleRealtimeMode}
      />

      {/* Live Transcription Display */}
      <LiveTranscript
        transcript={liveTranscript}
        interimTranscript={interimTranscript}
        isListening={isListening}
      />

      {/* LLM Suggestion */}
      {mode === MODES.IDLE && (
        <LLMSuggestion
          question={currentQuestion}
          answer={currentAnswer}
          isProcessing={isProcessing}
          onClose={() => {
            setCurrentQuestion('');
            setCurrentAnswer(null);
            setIsProcessing(false);
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {mode === MODES.LIVE_CODING && (
          <LiveCodingPanel
            key="live-coding-panel"
            capturedScreen={capturedScreen}
            isRealtimeMode={isRealtimeMode}
            isProcessing={isProcessing}
            onCapture={() => window.electronAPI.captureScreen()}
            onAnalyse={analyseScreen}
            onClear={() => setCapturedScreen(null)}
            answer={currentAnswer}
            history={liveCodingHistory}
            onClose={() => setMode(MODES.IDLE)}
          />
        )}

        {mode === MODES.RESUME_BUILDER && (
          <ResumeBuilder
            key="resume-builder-panel"
            onClose={() => setMode(MODES.IDLE)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            onSave={loadConfig}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
