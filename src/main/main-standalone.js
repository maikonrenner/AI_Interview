const { app, BrowserWindow, ipcMain, globalShortcut, desktopCapturer, Tray, Menu, screen } = require('electron');
const path = require('path');
const activeWin = require('active-win');

// Import standalone services
const AIService = require('./ai-service');
const TranscriptionService = require('./transcription-service');
const StorageService = require('./storage-service');

// Initialize services
const aiService = new AIService();
const transcriptionService = new TranscriptionService();
const storageService = new StorageService();

let mainWindow = null;
let tray = null;
let isHidden = false;
let screenShareMonitor = null;
let currentSession = null;

function createWindow() {
  const config = storageService.getConfig();

  mainWindow = new BrowserWindow({
    width: config.size.width,
    height: config.size.height,
    center: true, // Center the window on screen
    frame: false,
    transparent: false, // Changed to false to make window visible
    alwaysOnTop: config.alwaysOnTop,
    resizable: true,
    show: true, // Force window to show
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    },
    backgroundColor: '#1e1e1e', // Changed to dark grey instead of transparent
    skipTaskbar: false
  });

  // Set initial opacity
  mainWindow.setOpacity(config.opacity);

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    mainWindow.webContents.openDevTools({ mode: 'detach' }); // Enable DevTools for debugging
  }

  // Window event handlers
  mainWindow.on('move', () => {
    const position = mainWindow.getPosition();
    storageService.setConfig('position', { x: position[0], y: position[1] });
  });

  mainWindow.on('resize', () => {
    const size = mainWindow.getSize();
    storageService.setConfig('size', { width: size[0], height: size[1] });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Initialize services if API keys are available
  const openaiKey = storageService.getOpenAIKey();
  const geminiKey = storageService.getGeminiKey();
  const deepgramKey = storageService.getDeepgramKey();

  // Priority: Gemini first, then OpenAI
  if (geminiKey) {
    try {
      aiService.initialize(geminiKey, 'gemini');

      // Load interview context
      const interviewContext = storageService.getInterviewContext();
      aiService.setInterviewContext(interviewContext);

      console.log('✅ AI Service ready with Google Gemini');
    } catch (error) {
      console.error('❌ Failed to initialize AI Service with Gemini:', error);
    }
  } else if (openaiKey) {
    try {
      aiService.initialize(openaiKey, 'openai');

      // Load interview context
      const interviewContext = storageService.getInterviewContext();
      aiService.setInterviewContext(interviewContext);

      console.log('✅ AI Service ready with OpenAI');
    } catch (error) {
      console.error('❌ Failed to initialize AI Service with OpenAI:', error);
    }
  }

  if (deepgramKey) {
    try {
      transcriptionService.initialize(deepgramKey);
      console.log('✅ Transcription Service ready');
    } catch (error) {
      console.error('❌ Failed to initialize Transcription Service:', error);
    }
  }

  // Start monitoring for screen sharing
  if (config.autoHideDuringScreenShare) {
    startScreenShareMonitoring();
  }

  // Start session
  currentSession = storageService.startSession();

  // Notify renderer that the app is ready (simulating server connection)
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('server-connected');
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../../public/tray-icon.png');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show AI Interview',
      click: () => showWindow()
    },
    {
      label: 'Hide AI Interview',
      click: () => hideWindow()
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        mainWindow?.webContents.send('open-settings');
      }
    },
    {
      label: 'View History',
      click: () => {
        mainWindow?.webContents.send('open-history');
      }
    },
    { type: 'separator' },
    {
      label: 'Export Data',
      click: () => exportUserData()
    },
    {
      label: 'Clear Cache',
      click: () => {
        storageService.clearCache();
        mainWindow?.webContents.send('cache-cleared');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ]);

  tray.setToolTip('AI Interview - AI Coding Assistant');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      hideWindow();
    } else {
      showWindow();
    }
  });
}

// ==================== AI Service Event Handlers ====================

aiService.on('thinking', (isThinking) => {
  mainWindow?.webContents.send('ai-thinking', isThinking);
});

aiService.on('response-start', () => {
  mainWindow?.webContents.send('ai-response-start');
});

aiService.on('response-chunk', (chunk) => {
  mainWindow?.webContents.send('ai-response-chunk', chunk);
});

aiService.on('response-complete', (response) => {
  mainWindow?.webContents.send('ai-response-complete', response);
});

aiService.on('error', (error) => {
  mainWindow?.webContents.send('ai-error', error);
});

// ==================== Transcription Service Event Handlers ====================

transcriptionService.on('listening-started', () => {
  mainWindow?.webContents.send('transcription-started');
});

transcriptionService.on('transcript', (data) => {
  mainWindow?.webContents.send('transcript', data);
});

transcriptionService.on('utterance-end', () => {
  mainWindow?.webContents.send('utterance-end');
});

transcriptionService.on('listening-stopped', () => {
  mainWindow?.webContents.send('transcription-stopped');
});

transcriptionService.on('error', (error) => {
  mainWindow?.webContents.send('transcription-error', error);
});

// ==================== Global Shortcuts ====================

function registerGlobalShortcuts() {
  // Cmd/Ctrl + Shift + L: Toggle Live Coding Mode
  globalShortcut.register('CommandOrControl+Shift+L', () => {
    mainWindow?.webContents.send('toggle-live-coding');
  });

  // Cmd/Ctrl + Shift + C: Capture Screen
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    captureScreen();
  });

  // Cmd/Ctrl + Shift + S: Send capture for analysis
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    mainWindow?.webContents.send('analyse-capture');
  });

  // Cmd/Ctrl + Shift + R: Toggle Real-time mode
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    mainWindow?.webContents.send('toggle-realtime-mode');
  });

  // Cmd/Ctrl + Shift + V: Activate voice transcription
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    mainWindow?.webContents.send('start-voice-transcription');
  });

  // Cmd/Ctrl + Shift + H: Hide/Show window
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (isHidden || !mainWindow?.isVisible()) {
      showWindow();
    } else {
      hideWindow();
    }
  });

  // Cmd/Ctrl + Shift + Q: Quick question input
  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    showWindow();
    mainWindow?.webContents.send('focus-question-input');
  });

  // Cmd/Ctrl + Shift + A: Open history
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    mainWindow?.webContents.send('open-history');
  });

  // Cmd/Ctrl + T: Toggle transparency slider
  globalShortcut.register('CommandOrControl+T', () => {
    mainWindow?.webContents.send('toggle-transparency-slider');
  });
}

// ==================== Screen Capture ====================

async function captureScreen() {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });

    // Get active window
    const activeWindow = await activeWin();

    // Find the active window source or use primary screen
    let selectedSource = sources.find(source =>
      source.name === activeWindow?.title || source.name === activeWindow?.owner?.name
    );

    if (!selectedSource) {
      selectedSource = sources.find(source => source.name.includes('Screen 1') || source.name.includes('Entire Screen'));
    }

    if (selectedSource) {
      const thumbnail = selectedSource.thumbnail.toDataURL();
      mainWindow?.webContents.send('screen-captured', {
        dataUrl: thumbnail,
        sourceName: selectedSource.name,
        activeWindow: activeWindow
      });
    }
  } catch (error) {
    console.error('Error capturing screen:', error);
    mainWindow?.webContents.send('capture-error', error.message);
  }
}

// ==================== Window Management ====================

function hideWindow() {
  if (mainWindow && !isHidden) {
    const startOpacity = mainWindow.getOpacity();
    const steps = 10;
    const stepDuration = 30;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      const newOpacity = startOpacity * (1 - currentStep / steps);
      mainWindow.setOpacity(Math.max(0, newOpacity));

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        mainWindow.hide();
        isHidden = true;
        tray?.setToolTip('AI Interview - Hidden');
        mainWindow?.webContents.send('window-hidden');
      }
    }, stepDuration);
  }
}

function showWindow() {
  if (mainWindow && isHidden) {
    mainWindow.show();

    const targetOpacity = storageService.getConfigValue('opacity', 0.9);
    const steps = 10;
    const stepDuration = 30;

    let currentStep = 0;
    mainWindow.setOpacity(0);

    const fadeInterval = setInterval(() => {
      currentStep++;
      const newOpacity = targetOpacity * (currentStep / steps);
      mainWindow.setOpacity(Math.min(targetOpacity, newOpacity));

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        isHidden = false;
        tray?.setToolTip('AI Interview - AI Coding Assistant');
        mainWindow?.webContents.send('window-shown');
      }
    }, stepDuration);
  }
}

// ==================== Screen Share Monitoring ====================

function startScreenShareMonitoring() {
  const screenShareApps = [
    'zoom', 'meet', 'teams', 'discord', 'slack', 'obs',
    'skype', 'webex', 'gotomeeting', 'bluejeans'
  ];

  screenShareMonitor = setInterval(async () => {
    try {
      const sources = await desktopCapturer.getSources({ types: ['window'] });

      const isScreenSharing = sources.some(source => {
        const nameLower = source.name.toLowerCase();
        return screenShareApps.some(app => nameLower.includes(app) && nameLower.includes('screen'));
      });

      if (isScreenSharing && !isHidden) {
        console.log('Screen sharing detected - hiding window');
        hideWindow();
      } else if (!isScreenSharing && isHidden) {
        console.log('Screen sharing stopped - showing window');
        showWindow();
      }
    } catch (error) {
      console.error('Error monitoring screen share:', error);
    }
  }, 2000);
}

function stopScreenShareMonitoring() {
  if (screenShareMonitor) {
    clearInterval(screenShareMonitor);
    screenShareMonitor = null;
  }
}

// ==================== IPC Handlers ====================

// Configuration
ipcMain.handle('get-config', () => {
  return storageService.getConfig();
});

ipcMain.handle('set-config', (event, config) => {
  Object.keys(config).forEach(key => {
    storageService.setConfig(key, config[key]);
  });

  // Reinitialize services if API keys changed
  // Priority: Gemini first, then OpenAI
  if (config.geminiApiKey) {
    try {
      aiService.initialize(config.geminiApiKey, 'gemini');

      // Reload interview context
      const interviewContext = storageService.getInterviewContext();
      aiService.setInterviewContext(interviewContext);

      console.log('✅ AI Service reinitialized with Google Gemini');
    } catch (error) {
      console.error('Failed to initialize AI Service with Gemini:', error);
    }
  } else if (config.openaiApiKey) {
    try {
      aiService.initialize(config.openaiApiKey, 'openai');

      // Reload interview context
      const interviewContext = storageService.getInterviewContext();
      aiService.setInterviewContext(interviewContext);

      console.log('✅ AI Service reinitialized with OpenAI');
    } catch (error) {
      console.error('Failed to initialize AI Service with OpenAI:', error);
    }
  }

  if (config.deepgramApiKey) {
    try {
      transcriptionService.initialize(config.deepgramApiKey);
    } catch (error) {
      console.error('Failed to initialize Transcription Service:', error);
    }
  }

  return true;
});

// Opacity
ipcMain.handle('set-opacity', (event, opacity) => {
  if (mainWindow) {
    mainWindow.setOpacity(opacity);
    storageService.setConfig('opacity', opacity);
    return true;
  }
  return false;
});

// Screen capture
ipcMain.handle('capture-screen', async () => {
  await captureScreen();
  return true;
});

ipcMain.handle('get-screen-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 300, height: 200 }
    });

    return sources.map(source => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL()
    }));
  } catch (error) {
    console.error('Error getting screen sources:', error);
    return [];
  }
});

// Window controls
ipcMain.handle('hide-window', () => {
  hideWindow();
  return true;
});

ipcMain.handle('show-window', () => {
  showWindow();
  return true;
});

ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize();
  return true;
});

ipcMain.handle('close-window', () => {
  app.quit();
  return true;
});

// AI operations
ipcMain.handle('ask-question', async (event, question) => {
  try {
    if (!aiService.isInitialized()) {
      throw new Error('AI Service not initialized. Please configure your OpenAI or Google Gemini API key in Settings.');
    }

    // Check cache first
    const cached = storageService.getCachedAnswer(question);
    if (cached) {
      console.log('✅ Using cached answer');

      // Emit streaming events for cached answer (for UX consistency)
      if (mainWindow) {
        mainWindow.webContents.send('ai-response-start');

        // Split into words for smooth streaming display
        const words = cached.split(' ');
        const wordChunks = [];
        for (let i = 0; i < words.length; i += 3) {
          wordChunks.push(words.slice(i, i + 3).join(' ') + ' ');
        }

        // Send chunks with small delay to simulate streaming
        for (const chunk of wordChunks) {
          mainWindow.webContents.send('ai-response-chunk', chunk);
          await new Promise(resolve => setTimeout(resolve, 30)); // 30ms delay
        }

        mainWindow.webContents.send('ai-response-complete', cached);
      }

      return { success: true, answer: cached, fromCache: true };
    }

    const answer = await aiService.askQuestion(question);

    // Save to history and cache
    storageService.saveConversation({ question, answer, mode: 'answer_question' });
    storageService.cacheQuestion(question, answer);

    // Update session stats
    storageService.updateSessionStats({
      questionsAsked: (currentSession?.questionsAsked || 0) + 1
    });

    return { success: true, answer, fromCache: false };
  } catch (error) {
    console.error('Error asking question:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('analyze-screen', async (event, { ocrText, context }) => {
  try {
    if (!aiService.isInitialized()) {
      throw new Error('AI Service not initialized. Please configure your OpenAI or Google Gemini API key in Settings.');
    }

    const answer = await aiService.analyzeScreenCapture(ocrText, context);

    // Save to history
    storageService.saveConversation({
      question: `Screen Analysis: ${context.detectedPlatform || 'Unknown'} - ${context.detectedLanguage || 'Unknown'}`,
      answer,
      mode: 'live_coding',
      metadata: context
    });

    // Update session stats
    storageService.updateSessionStats({
      screensAnalyzed: (currentSession?.screensAnalyzed || 0) + 1
    });

    return { success: true, answer };
  } catch (error) {
    console.error('Error analyzing screen:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('extract-question', async (event, transcript) => {
  try {
    if (!aiService.isInitialized()) {
      throw new Error('AI Service not initialized');
    }

    const question = await aiService.extractQuestionFromTranscript(transcript);
    return { success: true, question };
  } catch (error) {
    console.error('Error extracting question:', error);
    return { success: false, error: error.message };
  }
});

// Transcription
ipcMain.handle('start-transcription', async () => {
  try {
    if (!transcriptionService.isInitialized()) {
      throw new Error('Transcription Service not initialized. Please configure your Deepgram API key in Settings.');
    }

    await transcriptionService.startListening();
    return { success: true };
  } catch (error) {
    console.error('Error starting transcription:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-transcription', () => {
  try {
    transcriptionService.stopListening();
    return { success: true };
  } catch (error) {
    console.error('Error stopping transcription:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('send-audio', (event, audioData) => {
  try {
    transcriptionService.sendAudio(audioData);
    return { success: true };
  } catch (error) {
    console.error('Error sending audio:', error);
    return { success: false, error: error.message };
  }
});

// History
ipcMain.handle('get-conversations', (event, limit) => {
  return storageService.getConversations(limit);
});

ipcMain.handle('search-conversations', (event, query) => {
  return storageService.searchConversations(query);
});

ipcMain.handle('clear-history', () => {
  storageService.clearConversations();
  return true;
});

// Cache
ipcMain.handle('get-cache-stats', () => {
  return storageService.getCacheStats();
});

ipcMain.handle('clear-cache', () => {
  storageService.clearCache();
  return true;
});

// Interview Context (Resume + Job Description)
ipcMain.handle('get-interview-context', () => {
  return storageService.getInterviewContext();
});

ipcMain.handle('set-interview-context', (event, context) => {
  storageService.setInterviewContext(context);

  // Update AI Service with new context
  if (aiService.isInitialized()) {
    aiService.setInterviewContext(context);
  }

  return true;
});

// Warm-up: Generate summaries for optimal performance
ipcMain.handle('warmup', async () => {
  try {
    console.log('🔥 Starting warm-up...');

    if (!aiService.isInitialized()) {
      throw new Error('AI Service not initialized. Please configure your OpenAI or Google Gemini API key in Settings.');
    }

    // Get interview context
    const context = storageService.getInterviewContext();
    const { resumeText, jobDescription } = context;

    if (!resumeText && !jobDescription) {
      return {
        success: false,
        message: 'Please add your resume and/or job description in the Resume Builder first'
      };
    }

    // Notify start
    mainWindow?.webContents.send('warmup-progress', {
      stage: 'resume',
      status: 'loading',
      message: 'Generating resume summary...'
    });

    // Run warm-up
    const results = await aiService.warmup(resumeText, jobDescription);

    // Save summaries to storage
    if (results.resumeSummary) {
      storageService.setInterviewContext({
        resumeSummary: results.resumeSummary
      });

      mainWindow?.webContents.send('warmup-progress', {
        stage: 'resume',
        status: 'completed',
        message: 'Resume summary ready!'
      });
    }

    if (results.jobSummary) {
      storageService.setInterviewContext({
        jobSummary: results.jobSummary
      });

      mainWindow?.webContents.send('warmup-progress', {
        stage: 'job',
        status: 'completed',
        message: 'Job description summary ready!'
      });
    }

    // Update AI service with new context
    const updatedContext = storageService.getInterviewContext();
    aiService.setInterviewContext(updatedContext);

    console.log('✅ Warm-up completed successfully!');

    return {
      success: results.success,
      message: results.success
        ? 'All resources loaded successfully! Ready for optimal performance.'
        : `Warm-up completed with errors: ${results.errors.join(', ')}`,
      resumeSummary: results.resumeSummary,
      jobSummary: results.jobSummary,
      errors: results.errors
    };

  } catch (error) {
    console.error('❌ Warm-up failed:', error);
    mainWindow?.webContents.send('warmup-progress', {
      stage: 'error',
      status: 'error',
      message: error.message
    });
    return {
      success: false,
      message: `Warm-up failed: ${error.message}`,
      error: error.message
    };
  }
});

ipcMain.handle('select-file', async () => {
  const { dialog } = require('electron');
  const fs = require('fs').promises;

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Documents', extensions: ['txt', 'md', 'pdf', 'docx', 'doc'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const filePath = result.filePaths[0];
      let content = '';

      // For now, only support text files (PDF/DOCX would need additional libraries)
      if (filePath.endsWith('.txt') || filePath.endsWith('.md')) {
        content = await fs.readFile(filePath, 'utf-8');
      } else {
        return {
          success: false,
          error: 'Only .txt and .md files are currently supported. For PDF/DOCX, please copy the text and paste it manually.'
        };
      }

      return { success: true, content, filePath };
    } catch (error) {
      console.error('Error reading file:', error);
      return { success: false, error: error.message };
    }
  }

  return { success: false, error: 'No file selected' };
});

// Server communication handler (for standalone mode compatibility)
ipcMain.handle('send-to-server', async (event, data) => {
  try {
    const { type } = data;

    switch (type) {
      case 'ask_question':
        return await ipcMain.emit('ask-question', event, data.question);

      case 'analyse_screen':
        // Handle screen analysis
        return true;

      case 'start_transcription':
        return await ipcMain.emit('start-transcription', event);

      case 'stop_transcription':
        return ipcMain.emit('stop-transcription', event);

      default:
        console.log('Unknown message type:', type);
        return false;
    }
  } catch (error) {
    console.error('Error in send-to-server:', error);
    return false;
  }
});

// Export data
function exportUserData() {
  const data = storageService.exportData();
  const dataStr = JSON.stringify(data, null, 2);

  const { dialog } = require('electron');
  dialog.showSaveDialog(mainWindow, {
    title: 'Export AI Interview Data',
    defaultPath: `ai-interview-export-${Date.now()}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }]
  }).then(result => {
    if (!result.canceled && result.filePath) {
      const fs = require('fs');
      fs.writeFileSync(result.filePath, dataStr);
      console.log('✅ Data exported successfully');
    }
  });
}

// ==================== App Lifecycle ====================

app.whenReady().then(() => {
  createWindow();
  // createTray(); // Tray icon disabled - icon removed
  registerGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // End session
  if (currentSession) {
    storageService.endSession();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  stopScreenShareMonitoring();

  // Stop services
  if (transcriptionService.isListening) {
    transcriptionService.stopListening();
  }
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
