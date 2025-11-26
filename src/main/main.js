const { app, BrowserWindow, ipcMain, globalShortcut, desktopCapturer, Tray, Menu, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');
const activeWin = require('active-win');
const WebSocket = require('ws');

const store = new Store();
let mainWindow = null;
let tray = null;
let isHidden = false;
let screenShareMonitor = null;
let wsConnection = null;

// Default configuration
const DEFAULT_CONFIG = {
  opacity: 0.9,
  alwaysOnTop: true,
  position: { x: 100, y: 100 },
  size: { width: 450, height: 600 },
  autoHideDuringScreenShare: true,
  liveCodingInterval: 8000,
  serverUrl: 'ws://localhost:8004/ws/interview/',
  openaiApiKey: '',
  geminiApiKey: '',
  deepgramApiKey: ''
};

function createWindow() {
  const config = { ...DEFAULT_CONFIG, ...store.get('config', {}) };

  mainWindow = new BrowserWindow({
    width: config.size.width,
    height: config.size.height,
    x: config.position.x,
    y: config.position.y,
    frame: false,
    transparent: true,
    alwaysOnTop: config.alwaysOnTop,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    },
    backgroundColor: '#00000000',
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
  }

  // Window event handlers
  mainWindow.on('move', () => {
    const position = mainWindow.getPosition();
    store.set('config.position', { x: position[0], y: position[1] });
  });

  mainWindow.on('resize', () => {
    const size = mainWindow.getSize();
    store.set('config.size', { width: size[0], height: size[1] });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Connect to Django WebSocket server
  connectToServer();

  // Start monitoring for screen sharing
  if (config.autoHideDuringScreenShare) {
    startScreenShareMonitoring();
  }
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

function connectToServer() {
  const serverUrl = store.get('config.serverUrl', DEFAULT_CONFIG.serverUrl);

  try {
    wsConnection = new WebSocket(serverUrl);

    wsConnection.on('open', () => {
      console.log('Connected to Django server');
      mainWindow?.webContents.send('server-connected');
    });

    wsConnection.on('message', (data) => {
      const message = JSON.parse(data.toString());
      mainWindow?.webContents.send('server-message', message);
    });

    wsConnection.on('error', (error) => {
      console.error('WebSocket error:', error);
      mainWindow?.webContents.send('server-error', error.message);
    });

    wsConnection.on('close', () => {
      console.log('Disconnected from server. Reconnecting in 5s...');
      setTimeout(connectToServer, 5000);
    });
  } catch (error) {
    console.error('Failed to connect to server:', error);
  }
}

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

function hideWindow() {
  if (mainWindow && !isHidden) {
    // Smooth fade out
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
        tray?.setToolTip('AI Interview - Hidden during screen share');
        mainWindow?.webContents.send('window-hidden');
      }
    }, stepDuration);
  }
}

function showWindow() {
  if (mainWindow && isHidden) {
    mainWindow.show();

    // Smooth fade in
    const targetOpacity = store.get('config.opacity', DEFAULT_CONFIG.opacity);
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

function startScreenShareMonitoring() {
  // Monitor for screen sharing applications
  const screenShareApps = [
    'zoom', 'meet', 'teams', 'discord', 'slack', 'obs',
    'skype', 'webex', 'gotomeeting', 'bluejeans'
  ];

  screenShareMonitor = setInterval(async () => {
    try {
      const sources = await desktopCapturer.getSources({ types: ['window'] });
      const activeWindow = await activeWin();

      // Check if any screen sharing app is active
      const isScreenSharing = sources.some(source => {
        const nameLower = source.name.toLowerCase();
        return screenShareApps.some(app => nameLower.includes(app) && nameLower.includes('screen'));
      });

      // Check if screen recording indicator is present (macOS/Windows)
      const hasRecordingIndicator = process.platform === 'darwin'
        ? await checkMacOSRecordingIndicator()
        : await checkWindowsRecordingIndicator();

      if ((isScreenSharing || hasRecordingIndicator) && !isHidden) {
        console.log('Screen sharing detected - hiding window');
        hideWindow();
      } else if (!isScreenSharing && !hasRecordingIndicator && isHidden) {
        console.log('Screen sharing stopped - showing window');
        showWindow();
      }
    } catch (error) {
      console.error('Error monitoring screen share:', error);
    }
  }, 2000); // Check every 2 seconds
}

async function checkMacOSRecordingIndicator() {
  // macOS shows orange dot when screen is being recorded
  // This requires additional native modules or checking system APIs
  return false; // Placeholder
}

async function checkWindowsRecordingIndicator() {
  // Windows shows recording indicator in taskbar
  return false; // Placeholder
}

function stopScreenShareMonitoring() {
  if (screenShareMonitor) {
    clearInterval(screenShareMonitor);
    screenShareMonitor = null;
  }
}

// IPC Handlers
ipcMain.handle('get-config', () => {
  return { ...DEFAULT_CONFIG, ...store.get('config', {}) };
});

ipcMain.handle('set-config', (event, config) => {
  store.set('config', { ...store.get('config', {}), ...config });
  return true;
});

ipcMain.handle('set-opacity', (event, opacity) => {
  if (mainWindow) {
    mainWindow.setOpacity(opacity);
    store.set('config.opacity', opacity);
    return true;
  }
  return false;
});

ipcMain.handle('capture-screen', async () => {
  await captureScreen();
  return true;
});

ipcMain.handle('hide-window', () => {
  hideWindow();
  return true;
});

ipcMain.handle('show-window', () => {
  showWindow();
  return true;
});

ipcMain.handle('send-to-server', (event, data) => {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    wsConnection.send(JSON.stringify(data));
    return true;
  }
  return false;
});

ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize();
  return true;
});

ipcMain.handle('close-window', () => {
  app.quit();
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

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  stopScreenShareMonitoring();
  if (wsConnection) {
    wsConnection.close();
  }
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
