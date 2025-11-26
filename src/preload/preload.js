const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Configuration
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (config) => ipcRenderer.invoke('set-config', config),
  setOpacity: (opacity) => ipcRenderer.invoke('set-opacity', opacity),

  // Screen capture
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  getScreenSources: () => ipcRenderer.invoke('get-screen-sources'),

  // Window controls
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  showWindow: () => ipcRenderer.invoke('show-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  // AI operations
  askQuestion: (question) => ipcRenderer.invoke('ask-question', question),
  analyzeScreen: (ocrText, context) => ipcRenderer.invoke('analyze-screen', { ocrText, context }),
  extractQuestion: (transcript) => ipcRenderer.invoke('extract-question', transcript),

  // Transcription
  startTranscription: () => ipcRenderer.invoke('start-transcription'),
  stopTranscription: () => ipcRenderer.invoke('stop-transcription'),
  sendAudio: (audioData) => ipcRenderer.invoke('send-audio', audioData),

  // History
  getConversations: (limit) => ipcRenderer.invoke('get-conversations', limit),
  searchConversations: (query) => ipcRenderer.invoke('search-conversations', query),
  clearHistory: () => ipcRenderer.invoke('clear-history'),

  // Cache
  getCacheStats: () => ipcRenderer.invoke('get-cache-stats'),
  clearCache: () => ipcRenderer.invoke('clear-cache'),

  // Interview Context (Resume + Job Description)
  getInterviewContext: () => ipcRenderer.invoke('get-interview-context'),
  setInterviewContext: (context) => ipcRenderer.invoke('set-interview-context', context),
  selectFile: () => ipcRenderer.invoke('select-file'),
  warmup: () => ipcRenderer.invoke('warmup'),

  // Event listeners - AI
  onAIThinking: (callback) => ipcRenderer.on('ai-thinking', (event, isThinking) => callback(isThinking)),
  onAIResponseStart: (callback) => ipcRenderer.on('ai-response-start', callback),
  onAIResponseChunk: (callback) => ipcRenderer.on('ai-response-chunk', (event, chunk) => callback(chunk)),
  onAIResponseComplete: (callback) => ipcRenderer.on('ai-response-complete', (event, response) => callback(response)),
  onAIError: (callback) => ipcRenderer.on('ai-error', (event, error) => callback(error)),

  // Event listeners - Transcription
  onTranscriptionStarted: (callback) => ipcRenderer.on('transcription-started', callback),
  onTranscript: (callback) => ipcRenderer.on('transcript', (event, data) => callback(data)),
  onUtteranceEnd: (callback) => ipcRenderer.on('utterance-end', callback),
  onTranscriptionStopped: (callback) => ipcRenderer.on('transcription-stopped', callback),
  onTranscriptionError: (callback) => ipcRenderer.on('transcription-error', (event, error) => callback(error)),

  // Event listeners - Screen
  onScreenCaptured: (callback) => ipcRenderer.on('screen-captured', (event, data) => callback(data)),
  onCaptureError: (callback) => ipcRenderer.on('capture-error', (event, error) => callback(error)),

  // Event listeners - Shortcuts
  onToggleLiveCoding: (callback) => ipcRenderer.on('toggle-live-coding', callback),
  onAnalyseCapture: (callback) => ipcRenderer.on('analyse-capture', callback),
  onToggleRealtimeMode: (callback) => ipcRenderer.on('toggle-realtime-mode', callback),
  onStartVoiceTranscription: (callback) => ipcRenderer.on('start-voice-transcription', callback),
  onFocusQuestionInput: (callback) => ipcRenderer.on('focus-question-input', callback),
  onOpenHistory: (callback) => ipcRenderer.on('open-history', callback),
  onToggleTransparencySlider: (callback) => ipcRenderer.on('toggle-transparency-slider', callback),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),

  // Event listeners - Window
  onWindowHidden: (callback) => ipcRenderer.on('window-hidden', callback),
  onWindowShown: (callback) => ipcRenderer.on('window-shown', callback),
  onCacheCleared: (callback) => ipcRenderer.on('cache-cleared', callback),

  // Event listeners - Warm-up
  onWarmupProgress: (callback) => ipcRenderer.on('warmup-progress', (event, data) => callback(data)),

  // Server communication (for standalone mode)
  sendToServer: (data) => ipcRenderer.invoke('send-to-server', data),
  onServerConnected: (callback) => ipcRenderer.on('server-connected', callback),
  onServerMessage: (callback) => ipcRenderer.on('server-message', (event, message) => callback(message)),
  onServerError: (callback) => ipcRenderer.on('server-error', (event, error) => callback(error)),

  // Remove listeners
  removeListener: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Platform information
contextBridge.exposeInMainWorld('platform', {
  isMac: process.platform === 'darwin',
  isWindows: process.platform === 'win32',
  isLinux: process.platform === 'linux'
});
