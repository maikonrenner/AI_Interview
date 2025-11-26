# 📖 Interview-IA - Technical Documentation

> Complete technical reference for Interview-IA Standalone Edition

Version: 1.0.0
Last Updated: 2025-01-12
Author: Maikon Renner

---

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Installation & Setup](#installation--setup)
4. [Core Services](#core-services)
5. [User Interface Components](#user-interface-components)
6. [Data Flow & Communication](#data-flow--communication)
7. [API Integration](#api-integration)
8. [Storage & Persistence](#storage--persistence)
9. [Security & Privacy](#security--privacy)
10. [Performance Optimization](#performance-optimization)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Development Guide](#development-guide)
13. [Testing Guide](#testing-guide)
14. [Deployment Guide](#deployment-guide)
15. [API Reference](#api-reference)
16. [Configuration Reference](#configuration-reference)
17. [FAQ](#faq)

---

## Introduction

### What is Interview-IA?

Interview-IA is a standalone desktop application built with Electron that provides real-time AI assistance for programmers. It features:

- **Overlay Interface**: Always-on-top window that doesn't interfere with your work
- **Live Coding Mode**: Screen capture + OCR + AI analysis for instant solutions
- **Voice Transcription**: Ask questions using your voice
- **Auto-Hide**: Automatically hides during screen sharing
- **Local Storage**: All data stored on your device
- **Direct API Integration**: No backend server required

### Technology Stack

```
┌─────────────────────────────────────────────┐
│             Interview-IA Stack              │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend:                                  │
│  ├─ React 18.x                             │
│  ├─ Framer Motion 10.x (animations)        │
│  ├─ React Markdown 9.x (rendering)         │
│  └─ React Syntax Highlighter 15.x          │
│                                             │
│  Backend (Electron Main):                   │
│  ├─ Node.js 16+                            │
│  ├─ Electron 28.x                          │
│  ├─ OpenAI SDK 4.x                         │
│  ├─ Deepgram SDK 3.x                       │
│  └─ Tesseract.js 5.x (OCR)                 │
│                                             │
│  Storage:                                   │
│  ├─ electron-store 8.x                     │
│  ├─ Local JSON files                       │
│  └─ Browser localStorage                   │
│                                             │
│  Build Tools:                               │
│  ├─ Vite 5.x                               │
│  ├─ electron-builder 24.x                  │
│  └─ concurrently 8.x                       │
│                                             │
└─────────────────────────────────────────────┘
```

### System Requirements

**Minimum:**
- OS: Windows 10, macOS 10.13+, Ubuntu 18.04+
- RAM: 4 GB
- Disk: 500 MB free space
- Internet: Broadband (for API calls)

**Recommended:**
- OS: Windows 11, macOS 12+, Ubuntu 22.04+
- RAM: 8 GB
- Disk: 1 GB free space
- Internet: High-speed (for voice transcription)

---

## Architecture Overview

### High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                      Interview-IA Application                  │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            Renderer Process (React UI)              │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Components:                                 │   │    │
│  │  │  - Header (Logo, Timer, Controls)           │   │    │
│  │  │  - ActionBar (Mode Selection)               │   │    │
│  │  │  - MainPanel (Q&A Interface)                │   │    │
│  │  │  - LiveCodingPanel (OCR + Analysis)         │   │    │
│  │  │  - SettingsModal (Configuration)            │   │    │
│  │  │  - TransparencyControl (Opacity)            │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                   │
│                           │ IPC (contextBridge)              │
│                           ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Preload Script (Security Bridge)            │    │
│  │  - Exposes safe APIs to renderer                    │    │
│  │  - Blocks direct Node.js access                     │    │
│  │  - Handles IPC communication                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                   │
│                           │ IPC Events                        │
│                           ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          Main Process (Electron Main)               │    │
│  │                                                      │    │
│  │  ┌────────────────┐  ┌─────────────────────────┐   │    │
│  │  │  AI Service    │  │  Transcription Service  │   │    │
│  │  │  - OpenAI API  │  │  - Deepgram API        │   │    │
│  │  │  - Streaming   │  │  - Real-time STT       │   │    │
│  │  │  - Q&A Logic   │  │  - Multi-language      │   │    │
│  │  └────────────────┘  └─────────────────────────┘   │    │
│  │                                                      │    │
│  │  ┌────────────────┐  ┌─────────────────────────┐   │    │
│  │  │ Storage Service│  │  Window Manager         │   │    │
│  │  │  - Config      │  │  - Screen Capture       │   │    │
│  │  │  - History     │  │  - Auto-Hide            │   │    │
│  │  │  - Cache       │  │  - Shortcuts            │   │    │
│  │  └────────────────┘  └─────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                   │
│                           │ External APIs                     │
│                           ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │             External Services                        │    │
│  │  - OpenAI API (GPT Models)                          │    │
│  │  - Deepgram API (Speech-to-Text)                    │    │
│  │  - OS APIs (Screen Capture, Notifications)          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Process Model

Interview-IA uses Electron's multi-process architecture:

**Main Process:**
- Single instance
- Manages window lifecycle
- Handles all Node.js operations
- Runs AI, Transcription, and Storage services
- Coordinates IPC communication

**Renderer Process:**
- Runs React application
- Handles UI rendering
- Manages user interactions
- Isolated from Node.js (security)

**Preload Script:**
- Bridge between Main and Renderer
- Exposes controlled APIs via `contextBridge`
- Prevents direct Node.js access

### Data Flow Diagram

```
User Action (Click/Shortcut/Voice)
         │
         ▼
   React Component
         │
         │ electronAPI.method()
         ▼
   Preload Script (contextBridge)
         │
         │ ipcRenderer.invoke()
         ▼
   Main Process (IPC Handler)
         │
         ├──► AI Service ──────► OpenAI API ──► Streaming Response
         │                                           │
         ├──► Transcription ────► Deepgram API      │
         │         Service                           │
         │                                           │
         └──► Storage Service ──► electron-store    │
                                                     │
                                                     ▼
         Main Process emits events ◄────────────────┘
                    │
                    │ webContents.send()
                    ▼
            Renderer Process
                    │
                    │ onEvent callback
                    ▼
             React State Update
                    │
                    ▼
               UI Re-render
```

---

## Installation & Setup

### Prerequisites

1. **Node.js & npm**
   ```bash
   node --version  # v16.0.0 or higher
   npm --version   # v7.0.0 or higher
   ```

2. **Git** (optional, for cloning)
   ```bash
   git --version
   ```

3. **API Keys** (required for functionality)
   - OpenAI API key
   - Deepgram API key

### Installation Steps

#### Step 1: Get the Code

**Option A: From Repository**
```bash
git clone https://github.com/maikonrenner/InterviewCo-pilot.git
cd InterviewCo-pilot/AI_Interview
```

**Option B: From ZIP**
1. Download ZIP from GitHub
2. Extract to desired location
3. Navigate to `AI_Interview` folder

#### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# This will install:
# - Electron 28.x
# - React 18.x
# - OpenAI SDK 4.x
# - Deepgram SDK 3.x
# - Tesseract.js 5.x
# - And all other dependencies
```

**Expected Output:**
```
added 620 packages, and audited 621 packages in 2m
159 packages are looking for funding
```

#### Step 3: Configure API Keys

**Get OpenAI API Key:**
1. Visit: https://platform.openai.com/signup
2. Create account or sign in
3. Navigate to: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Name it: "Interview-IA"
6. Copy the key (starts with `sk-...`)
7. **Important**: Save it securely, you won't see it again!

**Get Deepgram API Key:**
1. Visit: https://console.deepgram.com/signup
2. Sign up (no credit card required)
3. Get $200 free credits (750 hours transcription)
4. Navigate to API Keys section
5. Copy your API key

**Configure in Interview-IA:**

**Option A: Via UI (Recommended)**
1. Run Interview-IA: `npm run dev`
2. Click `⋮` (three dots menu)
3. Click "Settings"
4. Paste OpenAI key in "OpenAI API Key" field
5. Paste Deepgram key in "Deepgram API Key" field
6. Select preferred model (gpt-4o-mini recommended)
7. Click "Save Settings"

**Option B: Via Config File**
```bash
# Keys will be stored in:
# Windows: %APPDATA%\AI_Interview\config.json
# macOS: ~/Library/Application Support/AI_Interview/config.json
# Linux: ~/.config/AI_Interview/config.json
```

#### Step 4: Run the Application

**Development Mode:**
```bash
npm run dev

# This will:
# 1. Start Vite dev server (port 3000)
# 2. Launch Electron with hot reload
# 3. Open DevTools automatically
```

**Production Mode:**
```bash
# Build React app
npm run build:renderer

# Run production build
npm start
```

#### Step 5: Verify Setup

1. **Check Window Opens**: Interview-IA window should appear
2. **Check Connection Status**: Header should show "Connected" or "Offline"
3. **Test Question**: Press `Cmd+Shift+Q`, type "test", press Enter
4. **Check Response**: Should see AI thinking, then response

**If Issues:**
- See [Troubleshooting Guide](#troubleshooting-guide)
- Check console for errors (DevTools)

### Post-Installation

**Grant Permissions:**

**macOS:**
```
System Preferences → Security & Privacy → Privacy
- ✅ Screen Recording (for Live Coding)
- ✅ Accessibility (for global shortcuts)
- ✅ Microphone (for voice input)
```

**Windows:**
```
Settings → Privacy
- ✅ Microphone (for voice input)
- ✅ No other permissions needed
```

**Linux:**
```bash
# Grant screen recording permissions
sudo usermod -aG video $USER

# For microphone (if needed)
sudo usermod -aG audio $USER

# Logout and login for changes to take effect
```

---

## Core Services

### AI Service (ai-service.js)

Handles all OpenAI API interactions.

**Location:** `src/main/ai-service.js`

**Responsibilities:**
- Initialize OpenAI client
- Stream responses in real-time
- Extract questions from transcripts
- Analyze screen captures
- Manage conversation history

**Key Methods:**

#### `initialize(apiKey)`

Initializes the OpenAI client.

```javascript
// Usage
aiService.initialize('sk-proj-...');

// Parameters
// - apiKey: string - OpenAI API key

// Returns
// - void

// Throws
// - Error if API key is invalid
```

#### `askQuestion(question, isScreenAnalysis)`

Sends question to OpenAI and streams response.

```javascript
// Usage
const answer = await aiService.askQuestion('How do I reverse a linked list?');

// Parameters
// - question: string - User's question
// - isScreenAnalysis: boolean (optional) - Whether this is from screen analysis

// Returns
// - Promise<string> - Complete AI response

// Events Emitted
// - 'thinking': boolean - AI is processing
// - 'response-start': void - Response started
// - 'response-chunk': string - Each chunk of streaming response
// - 'response-complete': string - Full response
// - 'error': string - Error message
```

**Implementation Details:**

```javascript
class AIService extends EventEmitter {
  constructor() {
    super();
    this.openai = null;
    this.apiKey = null;
    this.conversationHistory = [];
    this.systemPrompt = `...`;
  }

  async askQuestion(question, isScreenAnalysis = false) {
    // 1. Add to history
    this.conversationHistory.push({
      role: 'user',
      content: question
    });

    // 2. Prepare messages
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.conversationHistory
    ];

    // 3. Stream response
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
      stream: true
    });

    // 4. Emit chunks
    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        this.emit('response-chunk', content);
      }
    }

    // 5. Add to history
    this.conversationHistory.push({
      role: 'assistant',
      content: fullResponse
    });

    // 6. Complete
    this.emit('response-complete', fullResponse);
    return fullResponse;
  }
}
```

#### `extractQuestionFromTranscript(transcript)`

Extracts clean question from messy transcript.

```javascript
// Usage
const question = await aiService.extractQuestionFromTranscript(
  'Umm, so like, how do you, you know, reverse a linked list?'
);
// Returns: "How do you reverse a linked list?"

// Parameters
// - transcript: string - Raw transcribed text

// Returns
// - Promise<string> - Cleaned question
```

#### `analyzeScreenCapture(ocrText, context)`

Analyzes code problem from OCR text.

```javascript
// Usage
const analysis = await aiService.analyzeScreenCapture(
  'Two Sum\nGiven an array...',
  {
    detectedLanguage: 'Python',
    detectedPlatform: 'LeetCode'
  }
);

// Parameters
// - ocrText: string - Extracted text from screen
// - context: object - Additional context
//   - detectedLanguage: string (optional)
//   - detectedPlatform: string (optional)
//   - sourceName: string (optional)

// Returns
// - Promise<string> - Full analysis with Intuition, Algorithm, Implementation
```

**System Prompt:**

```javascript
systemPrompt = `You are Interview-IA, an expert programming assistant helping developers solve coding problems.

When answering questions, structure your response in this format:

**Intuition:**
Explain the problem conceptually and the key insight needed to solve it.

**Algorithm:**
Provide step-by-step approach to solve the problem.

**Implementation:**
Provide clean, well-commented code implementation.

Be concise but thorough. Focus on clarity and best practices.`;
```

**Configuration:**

| Option | Default | Description |
|--------|---------|-------------|
| `model` | `gpt-4o-mini` | OpenAI model to use |
| `temperature` | `0.7` | Response creativity (0-2) |
| `max_tokens` | `1500` | Max response length |
| `stream` | `true` | Enable streaming |
| `historyLimit` | `20` | Max conversation turns |

**Performance Optimization:**

1. **History Management**: Keeps last 20 messages only
2. **Streaming**: Real-time response chunks
3. **Context Trimming**: Limits token usage
4. **Error Recovery**: Automatic retry on failure

---

### Transcription Service (transcription-service.js)

Handles Deepgram voice-to-text transcription.

**Location:** `src/main/transcription-service.js`

**Responsibilities:**
- Initialize Deepgram client
- Create live transcription connection
- Handle real-time audio streaming
- Emit transcription events
- Manage connection lifecycle

**Key Methods:**

#### `initialize(apiKey)`

```javascript
transcriptionService.initialize('your-deepgram-key');
```

#### `startListening()`

Starts live transcription connection.

```javascript
// Usage
await transcriptionService.startListening();

// Events Emitted
// - 'listening-started': void
// - 'transcript': object
//   - text: string
//   - isFinal: boolean
//   - confidence: number
//   - language: string
// - 'utterance-end': void
// - 'error': string
```

**Transcription Configuration:**

```javascript
const config = {
  model: 'nova-2',              // Latest Deepgram model
  language: 'multi',            // Auto-detect language
  smart_format: true,           // Auto punctuation/capitalization
  punctuate: true,              // Add punctuation
  interim_results: true,        // Show partial results
  utterance_end_ms: 1000,       // Silence duration to end utterance
  vad_events: true              // Voice activity detection
};
```

#### `sendAudio(audioData)`

Sends audio chunk to Deepgram.

```javascript
// Usage (called from renderer via IPC)
transcriptionService.sendAudio(audioBuffer);

// Parameters
// - audioData: Buffer - Audio data chunk

// Note: Audio must be:
// - Format: Linear PCM
// - Sample rate: 16kHz or 48kHz
// - Channels: Mono (1) or Stereo (2)
// - Bit depth: 16-bit
```

#### `stopListening()`

Stops transcription and closes connection.

```javascript
transcriptionService.stopListening();

// Events Emitted
// - 'listening-stopped': void
```

**Implementation Details:**

```javascript
class TranscriptionService extends EventEmitter {
  async startListening() {
    // Create Deepgram connection
    this.connection = this.deepgram.listen.live({
      model: 'nova-2',
      language: 'multi',
      smart_format: true,
      punctuate: true,
      interim_results: true,
      utterance_end_ms: 1000,
      vad_events: true
    });

    // Listen for events
    this.connection.on(LiveTranscriptionEvents.Open, () => {
      this.isListening = true;
      this.emit('listening-started');
    });

    this.connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel.alternatives[0];
      if (transcript && transcript.transcript) {
        this.emit('transcript', {
          text: transcript.transcript,
          isFinal: data.is_final,
          confidence: transcript.confidence,
          language: data.channel.detected_language || 'en'
        });
      }
    });

    this.connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
      this.emit('utterance-end');
    });

    this.connection.on(LiveTranscriptionEvents.Error, (error) => {
      this.emit('error', error);
    });

    this.connection.on(LiveTranscriptionEvents.Close, () => {
      this.isListening = false;
      this.emit('listening-stopped');
    });
  }
}
```

**Supported Languages:**

| Language | Code | Auto-Detect |
|----------|------|-------------|
| English | `en` | ✅ |
| Spanish | `es` | ✅ |
| French | `fr` | ✅ |
| German | `de` | ✅ |
| Portuguese | `pt` | ✅ |
| Italian | `it` | ✅ |
| Dutch | `nl` | ✅ |
| Japanese | `ja` | ✅ |
| Hindi | `hi` | ✅ |
| Russian | `ru` | ✅ |
| Chinese | `zh` | ✅ |
| Korean | `ko` | ✅ |

**Performance Metrics:**

- **Latency**: 300-500ms
- **Accuracy**: 95-99% (English)
- **Throughput**: Real-time (1x speed)
- **Max Duration**: Unlimited (live streaming)

---

### Storage Service (storage-service.js)

Manages all local data persistence.

**Location:** `src/main/storage-service.js`

**Responsibilities:**
- Store/retrieve configuration
- Manage conversation history
- Handle question/answer cache
- Track session statistics
- Export/import data

**Data Stores:**

Interview-IA uses 3 separate electron-store instances:

1. **configStore** - Application settings
2. **historyStore** - Conversations and sessions
3. **cacheStore** - Cached Q&A pairs

**Storage Locations:**

| Platform | Location |
|----------|----------|
| Windows | `%APPDATA%\AI_Interview\*.json` |
| macOS | `~/Library/Application Support/AI_Interview/*.json` |
| Linux | `~/.config/AI_Interview/*.json` |

#### Configuration Methods

**`getConfig()`**

Returns entire configuration object.

```javascript
const config = storageService.getConfig();
// Returns:
{
  opacity: 0.9,
  alwaysOnTop: true,
  position: { x: 100, y: 100 },
  size: { width: 450, height: 600 },
  autoHideDuringScreenShare: true,
  liveCodingInterval: 8000,
  openaiApiKey: 'sk-...',
  deepgramApiKey: '...',
  selectedModel: 'gpt-4o-mini'
}
```

**`setConfig(key, value)`**

Sets configuration value.

```javascript
storageService.setConfig('opacity', 0.75);
storageService.setConfig('selectedModel', 'gpt-4o');
```

**`setOpenAIKey(apiKey)`**

```javascript
storageService.setOpenAIKey('sk-proj-...');
```

**`setDeepgramKey(apiKey)`**

```javascript
storageService.setDeepgramKey('your-deepgram-key');
```

#### History Methods

**`saveConversation(conversation)`**

Saves conversation to history.

```javascript
const saved = storageService.saveConversation({
  question: 'How do I reverse a linked list?',
  answer: '**Intuition:** ...',
  mode: 'answer_question',
  metadata: {
    model: 'gpt-4o-mini',
    responseTime: 2500
  }
});

// Returns:
{
  id: '1705084800000-abc123def',
  timestamp: '2025-01-12T12:00:00.000Z',
  question: '...',
  answer: '...',
  mode: 'answer_question',
  metadata: { ... }
}
```

**`getConversations(limit)`**

Retrieves recent conversations.

```javascript
const recent = storageService.getConversations(50);
// Returns array of last 50 conversations (newest first)
```

**`searchConversations(query)`**

Searches conversations by keyword.

```javascript
const results = storageService.searchConversations('linked list');
// Returns array of matching conversations
```

**`clearConversations()`**

Deletes all conversation history.

```javascript
storageService.clearConversations();
```

#### Cache Methods

**`cacheQuestion(question, answer)`**

Caches Q&A pair for instant retrieval.

```javascript
storageService.cacheQuestion(
  'How do I reverse a linked list?',
  '**Intuition:** ...'
);

// Stored with MD5 hash of question as key
```

**`getCachedAnswer(question)`**

Retrieves cached answer if exists.

```javascript
const cached = storageService.getCachedAnswer('How do I reverse a linked list?');

if (cached) {
  // Use cached answer (instant, free)
  console.log('Cache hit!');
} else {
  // Call OpenAI API
  console.log('Cache miss');
}
```

**Cache Entry Structure:**

```javascript
{
  question: 'How do I reverse a linked list?',
  answer: '**Intuition:** ...',
  timestamp: '2025-01-12T12:00:00.000Z',
  hitCount: 5,
  lastAccessed: '2025-01-12T14:30:00.000Z'
}
```

**`clearCache()`**

Clears all cached Q&A.

```javascript
storageService.clearCache();
```

**`getCacheStats()`**

Returns cache statistics.

```javascript
const stats = storageService.getCacheStats();
// Returns:
{
  questionCacheSize: 47,
  ocrCacheSize: 12,
  totalHits: 234
}
```

#### Session Methods

**`startSession()`**

Starts new session tracking.

```javascript
const session = storageService.startSession();
// Returns:
{
  id: '1705084800000-xyz789',
  startTime: '2025-01-12T12:00:00.000Z',
  endTime: null,
  duration: 0,
  questionsAsked: 0,
  screensAnalyzed: 0
}
```

**`endSession()`**

Ends current session.

```javascript
const session = storageService.endSession();
// Returns completed session with endTime and duration
```

**`updateSessionStats(stats)`**

Updates current session statistics.

```javascript
storageService.updateSessionStats({
  questionsAsked: 15,
  screensAnalyzed: 3
});
```

**`getSessions(limit)`**

Retrieves recent sessions.

```javascript
const sessions = storageService.getSessions(20);
// Returns last 20 sessions
```

#### Utility Methods

**`exportData()`**

Exports all data to JSON.

```javascript
const data = storageService.exportData();
// Returns:
{
  config: { /* all settings */ },
  history: { /* all conversations */ },
  cache: { /* all cached Q&A */ },
  exportDate: '2025-01-12T12:00:00.000Z'
}
```

**`importData(data)`**

Imports data from JSON.

```javascript
const importedData = JSON.parse(fs.readFileSync('backup.json'));
storageService.importData(importedData);
```

**`reset()`**

Clears ALL data (dangerous!).

```javascript
storageService.reset();
// Deletes config, history, and cache
```

**Data Limits:**

| Store | Limit | Auto-Cleanup |
|-------|-------|--------------|
| Conversations | 100 | Oldest removed first |
| Cache | 100 | Oldest removed first |
| Sessions | Unlimited | Manual cleanup |

---

## User Interface Components

### Component Hierarchy

```
App.jsx (Main Container)
│
├── Header.jsx
│   ├── Logo
│   ├── Connection Status
│   ├── Hide Button
│   ├── Menu Button (⋮)
│   ├── Timer
│   ├── Mic Button
│   └── Exit Button
│
├── ActionBar.jsx
│   ├── Answer Question Button
│   ├── Live Coding Button ⭐
│   ├── Real-time Toggle (conditional)
│   └── Transparency Control
│
├── MainPanel.jsx (conditional render)
│   ├── Panel Header (navigation, close)
│   ├── Question Section
│   ├── Processing Indicator
│   ├── Answer Section
│   │   ├── Intuition
│   │   ├── Algorithm
│   │   └── Implementation (code)
│   └── Question Input
│
├── LiveCodingPanel.jsx (conditional render)
│   ├── Panel Header
│   ├── Capture Section
│   │   ├── Preview Container
│   │   ├── Capture Controls
│   │   └── Source Selector
│   ├── OCR Section
│   ├── Analysis Result
│   └── Status Bar
│
├── TransparencyControl.jsx (conditional render)
│   ├── Slider
│   └── Preset Buttons
│
└── SettingsModal.jsx (conditional render)
    ├── API Configuration
    ├── Behavior Settings
    └── Keyboard Shortcuts List
```

### App.jsx (Main Component)

**Location:** `src/renderer/App.jsx`

**State Management:**

```javascript
const [mode, setMode] = useState('idle'); // idle, answer_question, live_coding
const [opacity, setOpacity] = useState(0.9);
const [isListening, setIsListening] = useState(false);
const [sessionTime, setSessionTime] = useState(0);
const [isConnected, setIsConnected] = useState(false);
const [showSettings, setShowSettings] = useState(false);
const [showTransparencySlider, setShowTransparencySlider] = useState(false);

const [currentQuestion, setCurrentQuestion] = useState('');
const [currentAnswer, setCurrentAnswer] = useState(null);
const [isProcessing, setIsProcessing] = useState(false);

const [capturedScreen, setCapturedScreen] = useState(null);
const [isRealtimeMode, setIsRealtimeMode] = useState(false);
const [liveCodingHistory, setLiveCodingHistory] = useState([]);

const [conversationHistory, setConversationHistory] = useState([]);
```

**Event Listeners Setup:**

```javascript
useEffect(() => {
  setupEventListeners();
  return () => cleanupEventListeners();
}, []);

const setupEventListeners = () => {
  // AI Events
  window.electronAPI.onAIThinking((isThinking) => {
    setIsProcessing(isThinking);
  });

  window.electronAPI.onAIResponseStart(() => {
    setCurrentAnswer({ text: '', thinking: true });
  });

  window.electronAPI.onAIResponseChunk((chunk) => {
    setCurrentAnswer(prev => ({
      ...prev,
      text: (prev?.text || '') + chunk,
      thinking: false
    }));
  });

  window.electronAPI.onAIResponseComplete((response) => {
    setIsProcessing(false);
    const conv = {
      question: currentQuestion,
      answer: response,
      timestamp: new Date().toISOString(),
      mode: mode
    };
    setConversationHistory(prev => [...prev, conv]);
  });

  // Transcription Events
  window.electronAPI.onTranscript((data) => {
    if (data.isFinal) {
      setCurrentQuestion(data.text);
    }
  });

  // Screen Capture Events
  window.electronAPI.onScreenCaptured((data) => {
    setCapturedScreen(data);
  });

  // Shortcut Events
  window.electronAPI.onToggleLiveCoding(() => {
    toggleLiveCodingMode();
  });

  window.electronAPI.onStartVoiceTranscription(() => {
    toggleListening();
  });

  // ... other listeners
};
```

**Key Methods:**

```javascript
const handleQuestionSubmit = async (question) => {
  setCurrentQuestion(question);
  setIsProcessing(true);

  const result = await window.electronAPI.askQuestion(question);

  if (!result.success) {
    alert(result.error);
    setIsProcessing(false);
  }
};

const toggleListening = async () => {
  if (!isListening) {
    const result = await window.electronAPI.startTranscription();
    if (result.success) {
      setIsListening(true);
    }
  } else {
    await window.electronAPI.stopTranscription();
    setIsListening(false);
  }
};

const analyseScreen = async (screenData) => {
  setIsProcessing(true);

  // Perform OCR (in LiveCodingPanel component)
  // Then send to main process
  const result = await window.electronAPI.analyzeScreen(ocrText, context);

  if (result.success) {
    setCurrentAnswer({ text: result.answer });
  }

  setIsProcessing(false);
};
```

### Header.jsx

**Props:**
- `sessionTime` - Number (minutes)
- `isListening` - Boolean
- `isConnected` - Boolean
- `onStartListening` - Function
- `onHide` - Function
- `onExit` - Function
- `onOpenSettings` - Function

**Features:**
- Draggable window region (`data-tauri-drag-region`)
- Pulsing status dot animation
- Mic button with pulse effect when listening
- Timer with tabular numbers

### ActionBar.jsx

**Props:**
- `mode` - String ('idle', 'answer_question', 'live_coding')
- `onModeChange` - Function
- `isRealtimeMode` - Boolean
- `onToggleRealtime` - Function
- `opacity` - Number
- `onOpacityChange` - Function
- `showTransparencySlider` - Boolean

**Conditional Rendering:**
- Real-time button only shows in Live Coding mode
- Transparency slider toggles on/off

### MainPanel.jsx

**Props:**
- `question` - String
- `answer` - Object `{ text, thinking }`
- `isProcessing` - Boolean
- `history` - Array of conversations
- `onQuestionSubmit` - Function
- `onClose` - Function

**Answer Parsing:**

```javascript
const parseAnswer = (answerText) => {
  const sections = {
    intuition: '',
    algorithm: '',
    implementation: ''
  };

  // Regex to extract sections
  const intuitionMatch = answerText.match(/(?:Intuition):?\s*([\s\S]*?)(?=(?:Algorithm|Implementation|$))/i);
  const algorithmMatch = answerText.match(/(?:Algorithm):?\s*([\s\S]*?)(?=(?:Implementation|$))/i);
  const implementationMatch = answerText.match(/(?:Implementation):?\s*([\s\S]*$)/i);

  if (intuitionMatch) sections.intuition = intuitionMatch[1].trim();
  if (algorithmMatch) sections.algorithm = algorithmMatch[1].trim();
  if (implementationMatch) sections.implementation = implementationMatch[1].trim();

  return sections;
};
```

**Code Highlighting:**

Uses `react-syntax-highlighter` with `vscDarkPlus` theme:

```javascript
<SyntaxHighlighter
  style={vscDarkPlus}
  language={match[1]}
  PreTag="div"
>
  {codeString}
</SyntaxHighlighter>
```

### LiveCodingPanel.jsx

**Props:**
- `capturedScreen` - Object `{ dataUrl, sourceName, activeWindow }`
- `isRealtimeMode` - Boolean
- `isProcessing` - Boolean
- `onCapture` - Function
- `onAnalyse` - Function
- `onClear` - Function
- `answer` - Object
- `history` - Array
- `onClose` - Function

**OCR Processing:**

```javascript
const performOCR = async (imageData) => {
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

  const detectedLang = detectProgrammingLanguage(result.data.text);
  setDetectedLanguage(detectedLang);
};
```

**Language Detection:**

```javascript
const detectProgrammingLanguage = (text) => {
  const patterns = {
    'Python': /\b(def|import|from|class|if __name__|print)\b/i,
    'JavaScript': /\b(const|let|var|function|=>|console\.log)\b/i,
    'Java': /\b(public|private|static|void|class|import java)\b/i,
    'C++': /\b(#include|iostream|std::|cout|cin|int main)\b/i,
    'C#': /\b(using|namespace|public|private|static|class)\b/i,
    'Go': /\b(func|package|import|fmt\.Print|var)\b/i,
    'Rust': /\b(fn|let|mut|use|println!|impl)\b/i,
    'SQL': /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN)\b/i
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) return lang;
  }

  return 'Unknown';
};
```

**Platform Detection:**

```javascript
const detectContext = (sourceName) => {
  const platforms = {
    'LeetCode': /leetcode/i,
    'HackerRank': /hackerrank/i,
    'Codeforces': /codeforces/i,
    'CodeChef': /codechef/i,
    'VSCode': /visual studio code|vscode/i,
    'IntelliJ': /intellij|idea/i,
    'PyCharm': /pycharm/i
  };

  for (const [platform, pattern] of Object.entries(platforms)) {
    if (pattern.test(sourceName)) return platform;
  }

  return 'Code Editor';
};
```

### SettingsModal.jsx

**Props:**
- `onClose` - Function

**Form State:**

```javascript
const [config, setConfig] = useState({
  openaiApiKey: '',
  deepgramApiKey: '',
  selectedModel: 'gpt-4o-mini',
  autoHideDuringScreenShare: true,
  liveCodingInterval: 8000,
  opacity: 0.9
});
```

**Save Handler:**

```javascript
const handleSave = async () => {
  setIsSaving(true);
  await window.electronAPI.setConfig(config);
  setTimeout(() => {
    setIsSaving(false);
    onClose();
  }, 500);
};
```

**Keyboard Shortcuts Display:**

```javascript
const shortcuts = [
  { key: 'Cmd+Shift+L', action: 'Toggle Live Coding Mode' },
  { key: 'Cmd+Shift+C', action: 'Capture Screen' },
  { key: 'Cmd+Shift+S', action: 'Send capture for analysis' },
  { key: 'Cmd+Shift+R', action: 'Toggle Real-time mode' },
  { key: 'Cmd+Shift+V', action: 'Activate voice transcription' },
  { key: 'Cmd+Shift+H', action: 'Hide/Show window' },
  { key: 'Cmd+Shift+Q', action: 'Quick question input' },
  { key: 'Cmd+Shift+A', action: 'Open history' },
  { key: 'Cmd+T', action: 'Toggle transparency slider' }
];
```

---

## Data Flow & Communication

### IPC Communication

Interview-IA uses Electron's IPC (Inter-Process Communication) for Main ↔ Renderer communication.

**Communication Pattern:**

```
Renderer Process          Preload Script           Main Process
     │                         │                         │
     │  electronAPI.method()   │                         │
     ├────────────────────────>│                         │
     │                         │  ipcRenderer.invoke()   │
     │                         ├────────────────────────>│
     │                         │                         │
     │                         │                         │ [Processing]
     │                         │                         │
     │                         │  return result          │
     │                         │<────────────────────────┤
     │  Promise resolves       │                         │
     │<────────────────────────┤                         │
     │                         │                         │
     │                         │  webContents.send()     │
     │  onEvent callback       │<────────────────────────┤
     │<────────────────────────┤                         │
     │                         │                         │
```

### IPC Methods (Invoke Pattern)

**Request-Response (Async):**

```javascript
// Renderer
const result = await window.electronAPI.askQuestion('How do I...?');

// Main Process
ipcMain.handle('ask-question', async (event, question) => {
  const answer = await aiService.askQuestion(question);
  return { success: true, answer };
});
```

### IPC Events (Send Pattern)

**One-way Communication:**

```javascript
// Main Process
mainWindow.webContents.send('ai-response-chunk', chunk);

// Renderer
window.electronAPI.onAIResponseChunk((chunk) => {
  setResponse(prev => prev + chunk);
});
```

### Complete IPC API Reference

#### Configuration

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getConfig` | - | `Promise<Object>` | Get all configuration |
| `setConfig` | `config: Object` | `Promise<Boolean>` | Update configuration |
| `setOpacity` | `opacity: Number` | `Promise<Boolean>` | Set window opacity |

#### AI Operations

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `askQuestion` | `question: String` | `Promise<Object>` | Ask AI a question |
| `analyzeScreen` | `ocrText: String`<br>`context: Object` | `Promise<Object>` | Analyze screen capture |
| `extractQuestion` | `transcript: String` | `Promise<Object>` | Extract clean question |

**Return Format:**

```javascript
{
  success: true,
  answer: '**Intuition:** ...',
  fromCache: false  // true if from cache
}

// Or on error:
{
  success: false,
  error: 'AI Service not initialized'
}
```

#### Transcription

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `startTranscription` | - | `Promise<Object>` | Start voice input |
| `stopTranscription` | - | `Promise<Object>` | Stop voice input |
| `sendAudio` | `audioData: Buffer` | `Promise<Object>` | Send audio chunk |

#### Screen Capture

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `captureScreen` | - | `Promise<Boolean>` | Capture active screen |
| `getScreenSources` | - | `Promise<Array>` | List available windows |

**Screen Sources Format:**

```javascript
[
  {
    id: 'window:12345',
    name: 'Google Chrome - LeetCode',
    thumbnail: 'data:image/png;base64,...'
  },
  // ...
]
```

#### History & Cache

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getConversations` | `limit: Number` | `Promise<Array>` | Get recent conversations |
| `searchConversations` | `query: String` | `Promise<Array>` | Search history |
| `clearHistory` | - | `Promise<Boolean>` | Clear all history |
| `getCacheStats` | - | `Promise<Object>` | Get cache statistics |
| `clearCache` | - | `Promise<Boolean>` | Clear cache |

#### Window Controls

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `hideWindow` | - | `Promise<Boolean>` | Hide window |
| `showWindow` | - | `Promise<Boolean>` | Show window |
| `minimizeWindow` | - | `Promise<Boolean>` | Minimize window |
| `closeWindow` | - | `Promise<Boolean>` | Exit application |

### Event Listeners

#### AI Events

| Event | Callback Parameters | Description |
|-------|---------------------|-------------|
| `onAIThinking` | `isThinking: Boolean` | AI processing state |
| `onAIResponseStart` | - | Response started |
| `onAIResponseChunk` | `chunk: String` | Streaming chunk |
| `onAIResponseComplete` | `response: String` | Full response |
| `onAIError` | `error: String` | Error message |

#### Transcription Events

| Event | Callback Parameters | Description |
|-------|---------------------|-------------|
| `onTranscriptionStarted` | - | Transcription started |
| `onTranscript` | `data: Object` | Transcript chunk |
| `onUtteranceEnd` | - | User stopped speaking |
| `onTranscriptionStopped` | - | Transcription stopped |
| `onTranscriptionError` | `error: String` | Transcription error |

**Transcript Data Format:**

```javascript
{
  text: 'How do I reverse a linked list',
  isFinal: true,
  confidence: 0.98,
  language: 'en'
}
```

#### Screen Capture Events

| Event | Callback Parameters | Description |
|-------|---------------------|-------------|
| `onScreenCaptured` | `data: Object` | Screen captured |
| `onCaptureError` | `error: String` | Capture failed |

**Captured Screen Format:**

```javascript
{
  dataUrl: 'data:image/png;base64,...',
  sourceName: 'Google Chrome - LeetCode',
  activeWindow: {
    title: 'LeetCode - Two Sum',
    owner: { name: 'Google Chrome' }
  }
}
```

#### Keyboard Shortcut Events

| Event | Description |
|-------|-------------|
| `onToggleLiveCoding` | Cmd+Shift+L pressed |
| `onAnalyseCapture` | Cmd+Shift+S pressed |
| `onToggleRealtimeMode` | Cmd+Shift+R pressed |
| `onStartVoiceTranscription` | Cmd+Shift+V pressed |
| `onFocusQuestionInput` | Cmd+Shift+Q pressed |
| `onOpenHistory` | Cmd+Shift+A pressed |
| `onToggleTransparencySlider` | Cmd+T pressed |
| `onOpenSettings` | Settings menu clicked |

#### Window Events

| Event | Description |
|-------|-------------|
| `onWindowHidden` | Window hidden (auto or manual) |
| `onWindowShown` | Window shown after hiding |
| `onCacheCleared` | Cache cleared via tray menu |

### Event Cleanup

**Important**: Always remove listeners when component unmounts:

```javascript
useEffect(() => {
  const handleTranscript = (data) => {
    // Handle transcript
  };

  window.electronAPI.onTranscript(handleTranscript);

  return () => {
    window.electronAPI.removeListener('transcript');
  };
}, []);
```

---

## API Integration

### OpenAI API

**SDK Version:** `openai@4.24.0`

**Initialization:**

```javascript
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: 'sk-proj-...'
});
```

**Supported Models:**

| Model | Speed | Quality | Cost per 1M tokens | Recommended For |
|-------|-------|---------|---------------------|-----------------|
| `gpt-4o-mini` | ⚡⚡⚡ | ⭐⭐⭐⭐ | Input: $0.15<br>Output: $0.60 | General use (Default) |
| `gpt-4o` | ⚡⚡ | ⭐⭐⭐⭐⭐ | Input: $2.50<br>Output: $10.00 | Complex problems |
| `gpt-4-turbo` | ⚡⚡ | ⭐⭐⭐⭐⭐ | Input: $10.00<br>Output: $30.00 | Latest features |
| `gpt-3.5-turbo` | ⚡⚡⚡ | ⭐⭐⭐ | Input: $0.50<br>Output: $1.50 | Quick extraction |

**Streaming Request:**

```javascript
const stream = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: 'You are a helpful programming assistant.'
    },
    {
      role: 'user',
      content: 'How do I reverse a linked list?'
    }
  ],
  temperature: 0.7,
  max_tokens: 1500,
  stream: true
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  if (content) {
    console.log(content);
  }
}
```

**Parameters:**

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `model` | String | `gpt-4o-mini` | - | Model to use |
| `temperature` | Number | `0.7` | 0-2 | Creativity (higher = more creative) |
| `max_tokens` | Number | `1500` | 1-4096 | Maximum response length |
| `top_p` | Number | `1.0` | 0-1 | Nucleus sampling |
| `frequency_penalty` | Number | `0.0` | -2 to 2 | Reduce repetition |
| `presence_penalty` | Number | `0.0` | -2 to 2 | Encourage new topics |
| `stream` | Boolean | `true` | - | Enable streaming |

**Rate Limits:**

| Tier | RPM | TPM | Quota |
|------|-----|-----|-------|
| Free Trial | 3 | 40,000 | $5-$18 total |
| Tier 1 | 500 | 10,000,000 | $100/month |
| Tier 2 | 5,000 | 50,000,000 | $500/month |
| Tier 3+ | Custom | Custom | Custom |

**Error Handling:**

```javascript
try {
  const response = await openai.chat.completions.create({...});
} catch (error) {
  if (error.status === 401) {
    console.error('Invalid API key');
  } else if (error.status === 429) {
    console.error('Rate limit exceeded');
  } else if (error.status === 500) {
    console.error('OpenAI server error');
  } else {
    console.error('Unknown error:', error);
  }
}
```

**Cost Calculation:**

```javascript
// Example: 100 questions/day with gpt-4o-mini

// Average tokens per question:
// - User message: ~50 tokens
// - System prompt: ~100 tokens
// - AI response: ~300 tokens
// Total: ~450 tokens per question

const inputTokens = 100 * 150;  // 15,000 tokens
const outputTokens = 100 * 300;  // 30,000 tokens

const costInput = (inputTokens / 1000000) * 0.15;   // $0.00225
const costOutput = (outputTokens / 1000000) * 0.60; // $0.018

const totalCost = costInput + costOutput;  // $0.02025/day
// Monthly: ~$0.61
```

### Deepgram API

**SDK Version:** `@deepgram/sdk@3.2.0`

**Initialization:**

```javascript
const { createClient } = require('@deepgram/sdk');

const deepgram = createClient('your-api-key');
```

**Live Transcription:**

```javascript
const connection = deepgram.listen.live({
  model: 'nova-2',                // Latest model
  language: 'multi',              // Auto-detect
  smart_format: true,             // Auto punctuation
  punctuate: true,                // Add punctuation
  interim_results: true,          // Show partial results
  utterance_end_ms: 1000,         // 1 second silence
  vad_events: true,               // Voice activity detection
  encoding: 'linear16',           // Audio encoding
  sample_rate: 16000,             // 16kHz
  channels: 1                     // Mono
});

connection.on(LiveTranscriptionEvents.Transcript, (data) => {
  console.log(data.channel.alternatives[0].transcript);
});
```

**Supported Languages:**

Over 36 languages including:
- English (en, en-US, en-GB, en-AU)
- Spanish (es, es-419, es-ES)
- French (fr, fr-CA)
- German (de)
- Portuguese (pt, pt-BR)
- Italian (it)
- Dutch (nl)
- Japanese (ja)
- Korean (ko)
- Chinese (zh, zh-CN, zh-TW)
- Hindi (hi)
- Russian (ru)
- Arabic (ar)
- Turkish (tr)
- Polish (pl)
- Swedish (sv)
- And many more...

**Models:**

| Model | Description | Cost per minute | Accuracy |
|-------|-------------|-----------------|----------|
| `nova-2` | Latest, best accuracy | $0.0043 | 95-99% |
| `nova` | Previous version | $0.0043 | 94-98% |
| `base` | General purpose | $0.0040 | 90-95% |
| `enhanced` | Higher accuracy | $0.0045 | 95-98% |

**Audio Requirements:**

```
Format: Linear PCM (raw audio)
Sample Rate: 16000 Hz (recommended) or 8000/48000
Bit Depth: 16-bit
Channels: 1 (mono) or 2 (stereo)
Encoding: linear16, flac, opus, etc.
```

**Sending Audio:**

```javascript
// From MediaRecorder (browser)
mediaRecorder.ondataavailable = (event) => {
  if (event.data.size > 0) {
    connection.send(event.data);
  }
};

// From file
const fs = require('fs');
const audioData = fs.readFileSync('audio.wav');
connection.send(audioData);
```

**Response Format:**

```javascript
{
  channel: {
    alternatives: [
      {
        transcript: 'How do I reverse a linked list',
        confidence: 0.98765,
        words: [
          { word: 'How', start: 0.0, end: 0.2, confidence: 0.99 },
          // ...
        ]
      }
    ],
    detected_language: 'en'
  },
  is_final: true,
  speech_final: true,
  duration: 2.5
}
```

**Cost Calculation:**

```javascript
// Example: 1 hour/day voice transcription

const minutesPerDay = 60;
const costPerMinute = 0.0043;

const dailyCost = minutesPerDay * costPerMinute;  // $0.258
const monthlyCost = dailyCost * 30;  // $7.74
```

**Free Credits:**

- **$200 free credits** on signup
- No credit card required
- ~46,512 minutes (~775 hours)
- Perfect for testing and moderate use

**Error Handling:**

```javascript
connection.on(LiveTranscriptionEvents.Error, (error) => {
  console.error('Deepgram error:', error);

  if (error.message.includes('401')) {
    console.error('Invalid API key');
  } else if (error.message.includes('429')) {
    console.error('Rate limit exceeded');
  } else if (error.message.includes('insufficient funds')) {
    console.error('Out of credits');
  }
});
```

---

## Storage & Persistence

### electron-store

Interview-IA uses `electron-store` for persistent local storage.

**Features:**
- ✅ JSON-based storage
- ✅ Atomic writes (no corruption)
- ✅ Schema validation (optional)
- ✅ Encryption support
- ✅ Migration support
- ✅ Defaults support

**Storage Location:**

```javascript
// Windows
C:\Users\<username>\AppData\Roaming\AI_Interview\

// macOS
/Users/<username>/Library/Application Support/AI_Interview/

// Linux
/home/<username>/.config/AI_Interview/
```

**Files:**

```
AI_Interview/
├── config.json       # Application settings
├── history.json      # Conversations and sessions
└── cache.json        # Cached Q&A pairs
```

### config.json Structure

```json
{
  "opacity": 0.9,
  "alwaysOnTop": true,
  "position": {
    "x": 100,
    "y": 100
  },
  "size": {
    "width": 450,
    "height": 600
  },
  "autoHideDuringScreenShare": true,
  "liveCodingInterval": 8000,
  "openaiApiKey": "sk-proj-...",
  "deepgramApiKey": "...",
  "selectedModel": "gpt-4o-mini"
}
```

### history.json Structure

```json
{
  "conversations": [
    {
      "id": "1705084800000-abc123",
      "timestamp": "2025-01-12T12:00:00.000Z",
      "question": "How do I reverse a linked list?",
      "answer": "**Intuition:**\n...",
      "mode": "answer_question",
      "metadata": {
        "model": "gpt-4o-mini",
        "responseTime": 2500
      }
    }
  ],
  "sessions": [
    {
      "id": "1705084800000-xyz789",
      "startTime": "2025-01-12T12:00:00.000Z",
      "endTime": "2025-01-12T13:30:00.000Z",
      "duration": 5400000,
      "questionsAsked": 15,
      "screensAnalyzed": 3
    }
  ],
  "currentSessionId": "1705084800000-xyz789"
}
```

### cache.json Structure

```json
{
  "questionCache": {
    "5d41402abc4b2a76b9719d911017c592": {
      "question": "How do I reverse a linked list?",
      "answer": "**Intuition:**\n...",
      "timestamp": "2025-01-12T12:00:00.000Z",
      "hitCount": 5,
      "lastAccessed": "2025-01-12T14:30:00.000Z"
    }
  },
  "ocrCache": {}
}
```

### Data Backup & Restore

**Manual Backup:**

```javascript
// Export all data
const data = storageService.exportData();
const json = JSON.stringify(data, null, 2);
fs.writeFileSync('interview-ia-backup.json', json);
```

**Restore:**

```javascript
// Import data
const json = fs.readFileSync('interview-ia-backup.json', 'utf8');
const data = JSON.parse(json);
storageService.importData(data);
```

**Automated Backup:**

You can implement automated backups in main process:

```javascript
// Backup every 24 hours
setInterval(() => {
  const data = storageService.exportData();
  const date = new Date().toISOString().split('T')[0];
  const filename = `interview-ia-backup-${date}.json`;

  fs.writeFileSync(
    path.join(app.getPath('documents'), 'Interview-IA-Backups', filename),
    JSON.stringify(data, null, 2)
  );

  console.log('Backup created:', filename);
}, 24 * 60 * 60 * 1000);
```

### Data Privacy

**What is stored locally:**
- ✅ API keys (encrypted by OS)
- ✅ Conversation history
- ✅ Cached Q&A
- ✅ Session statistics
- ✅ Window position/size
- ✅ User preferences

**What is NOT stored:**
- ❌ Screen captures (temporary only)
- ❌ Audio recordings
- ❌ Personal identifying information
- ❌ Telemetry or usage analytics

**Clearing Data:**

```javascript
// Clear specific data
storageService.clearConversations();
storageService.clearCache();

// Clear ALL data (nuclear option)
storageService.reset();
```

---

## Security & Privacy

### Security Model

Interview-IA follows Electron security best practices:

**1. Context Isolation ✅**

```javascript
webPreferences: {
  nodeIntegration: false,      // Disable Node.js in renderer
  contextIsolation: true,      // Isolate renderer context
  preload: path.join(__dirname, 'preload.js')
}
```

**2. Preload Script ✅**

```javascript
// Only expose safe APIs
contextBridge.exposeInMainWorld('electronAPI', {
  askQuestion: (q) => ipcRenderer.invoke('ask-question', q),
  // NOT: require, process, fs, etc.
});
```

**3. Content Security Policy ✅**

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'">
```

**4. No Remote Content ✅**

All assets (HTML, CSS, JS) loaded locally. No CDN dependencies in production.

**5. API Key Protection ✅**

- Stored via `electron-store` (OS-level encryption)
- Never exposed to renderer process
- Never logged or transmitted (except to APIs)
- Can be cleared anytime

### Privacy Policy

**Data Collection:**

Interview-IA does NOT collect:
- ❌ Personal information
- ❌ Usage statistics
- ❌ Telemetry
- ❌ Analytics
- ❌ Crash reports
- ❌ Screen captures (only temporary)

**Data Storage:**

All data stored locally:
- ✅ Conversation history (on your device)
- ✅ API keys (encrypted by OS)
- ✅ Preferences (local files)
- ✅ Cache (local files)

**Data Transmission:**

Data sent to external services:
- **OpenAI**: Questions and context (required for AI)
- **Deepgram**: Audio data (required for transcription)
- **No other services**

**Data Retention:**

- Conversations: Last 100 (auto-cleanup)
- Cache: Last 100 entries (auto-cleanup)
- Sessions: Unlimited (manual cleanup)
- API keys: Until manually deleted

**User Control:**

You can delete all data anytime:
```javascript
storageService.reset();  // Clears everything
```

### API Key Security

**Storage:**

API keys stored using `electron-store`:
- Windows: DPAPI encryption
- macOS: Keychain encryption
- Linux: libsecret encryption

**Access:**

- Only main process can access
- Renderer process cannot access
- Never transmitted except to APIs
- Not logged or displayed

**Rotation:**

To rotate API keys:
1. Generate new key in OpenAI/Deepgram console
2. Update in Interview-IA Settings
3. Delete old key from provider console

### Screen Sharing Detection

**How Auto-Hide Works:**

1. **Process Monitoring**:
   - Checks running processes every 2 seconds
   - Detects: Zoom, Teams, Meet, Discord, etc.
   - Looks for "screen" or "sharing" in process names

2. **Window List API**:
   - Uses `desktopCapturer.getSources()`
   - Checks window titles for sharing indicators

3. **Fade Out**:
   - Smooth opacity transition (300ms)
   - Window becomes invisible
   - Removed from window list

4. **Automatic Return**:
   - Detects when sharing stops
   - Fades back in
   - Restores to previous position

**Manual Override:**

Press `Cmd+Shift+H` anytime to force hide/show.

**Disable:**

Settings → "Auto-hide during screen sharing" → OFF

---

## Performance Optimization

### Optimization Strategies

**1. Streaming Responses**

Instead of waiting for complete response:

```javascript
// ❌ Bad: Wait for complete response
const answer = await getAnswer();  // 10 seconds
displayAnswer(answer);

// ✅ Good: Stream chunks
aiService.on('response-chunk', (chunk) => {
  displayChunk(chunk);  // Instant feedback
});
```

**2. Question Caching**

Frequently asked questions cached:

```javascript
// ❌ Bad: Always call API
const answer = await openai.askQuestion(q);  // 2-5 seconds, $0.002

// ✅ Good: Check cache first
const cached = storageService.getCachedAnswer(q);
if (cached) {
  return cached;  // <50ms, FREE
}
```

**3. Conversation History Limit**

Keep only recent messages:

```javascript
// Limit to last 20 messages (10 turns)
if (this.conversationHistory.length > 20) {
  this.conversationHistory = this.conversationHistory.slice(-20);
}
```

**4. OCR Optimization**

```javascript
// Use Tesseract worker for parallel processing
const worker = await Tesseract.createWorker();
await worker.loadLanguage('eng');
await worker.initialize('eng');

// Process multiple captures in parallel
const results = await Promise.all(
  captures.map(img => worker.recognize(img))
);
```

**5. React Optimization**

```javascript
// Memoize expensive computations
const parsedAnswer = useMemo(() => {
  return parseAnswer(answer.text);
}, [answer.text]);

// Virtualize long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={conversations.length}
  itemSize={100}
>
  {ConversationItem}
</FixedSizeList>
```

### Performance Metrics

**Target Metrics:**

| Operation | Target | Actual |
|-----------|--------|--------|
| Window launch | <2s | ~1.5s |
| Question submit | Instant | ~50ms |
| AI first chunk | <1s | ~500ms |
| AI complete | <5s | 2-4s |
| Cache hit | <100ms | <50ms |
| Screen capture | <500ms | ~300ms |
| OCR complete | <3s | 2-3s |
| Voice transcription | <500ms | 300-500ms |

**Monitoring:**

```javascript
// Add timing to operations
const start = Date.now();
const answer = await aiService.askQuestion(q);
const duration = Date.now() - start;

console.log(`Response time: ${duration}ms`);

// Store in metadata
storageService.saveConversation({
  question: q,
  answer: answer,
  metadata: { responseTime: duration }
});
```

### Memory Management

**Electron Memory Usage:**

Typical memory footprint:
- Main process: 50-100 MB
- Renderer process: 100-150 MB
- Total: 150-250 MB

**Optimization:**

```javascript
// Clear old conversation history
setInterval(() => {
  const conversations = storageService.getConversations();
  if (conversations.length > 100) {
    storageService.clearConversations();
  }
}, 60 * 60 * 1000);  // Every hour

// Clear cache periodically
setInterval(() => {
  storageService.clearCache();
}, 24 * 60 * 60 * 1000);  // Every 24 hours
```

**DevTools Monitoring:**

Open DevTools (Cmd+Option+I):
- Memory tab → Take heap snapshot
- Performance tab → Record and analyze
- Network tab → Check API call timings

---

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. "AI Service not initialized"

**Cause:** OpenAI API key missing or invalid.

**Solution:**
1. Click `⋮` → Settings
2. Enter valid OpenAI API key
3. Click "Save Settings"
4. Restart Interview-IA (if needed)

**Verification:**
```bash
# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-proj-..." \
  | jq '.data[0].id'
```

#### 2. "Transcription Service not initialized"

**Cause:** Deepgram API key missing or invalid.

**Solution:**
1. Get API key from: https://console.deepgram.com
2. Click `⋮` → Settings
3. Enter Deepgram API key
4. Click "Save Settings"

**Verification:**
```bash
# Test API key
curl -X POST https://api.deepgram.com/v1/listen \
  -H "Authorization: Token YOUR_KEY" \
  -H "Content-Type: audio/wav" \
  --data-binary @test.wav
```

#### 3. OpenAI API Error: Rate Limit (429)

**Cause:** Exceeded API rate limits.

**Solution:**
- Wait 1-2 minutes
- Switch to `gpt-4o-mini` (higher limits)
- Upgrade to Tier 2+ (paid account)

**Rate Limits by Tier:**

| Tier | RPM | TPM | Cost |
|------|-----|-----|------|
| Free | 3 | 40K | $5-$18 total |
| Tier 1 | 500 | 10M | $100/mo |
| Tier 2 | 5K | 50M | $500/mo |

#### 4. OpenAI API Error: Insufficient Quota (402)

**Cause:** No credits in OpenAI account.

**Solution:**
1. Visit: https://platform.openai.com/account/billing
2. Add payment method
3. Add minimum $5 credits
4. Wait 5-10 minutes for activation

#### 5. OCR Extracts Gibberish

**Cause:** Poor image quality, unclear text, or complex fonts.

**Solution:**
- **Capture specific window** instead of full screen
- **Increase font size** in code editor
- Use **high contrast theme** (dark text on light bg)
- Ensure text is **clearly visible** and **unobstructed**

**OCR Best Practices:**
- ✅ Monospace fonts (Consolas, Menlo, Monaco)
- ✅ Font size 14px or larger
- ✅ High contrast (90%+)
- ✅ Clear, uncompressed screenshots
- ❌ Avoid: Cursive fonts, low contrast, small text

#### 6. Voice Not Working

**Cause:** Microphone permissions not granted.

**macOS Solution:**
```
System Preferences → Security & Privacy → Privacy → Microphone
✅ Enable Interview-IA
```

**Windows Solution:**
```
Settings → Privacy → Microphone
✅ Allow desktop apps to access microphone
```

**Linux Solution:**
```bash
# Check microphone
arecord -l

# Test recording
arecord -d 5 test.wav

# Grant permissions
sudo usermod -aG audio $USER
```

**Verification:**
- Click mic button in Interview-IA
- Speak "test one two three"
- Should see transcription appear

#### 7. Window Not Showing

**Cause:** Window positioned off-screen or hidden.

**Solution 1: Show via Tray**
- Click Interview-IA icon in system tray
- Select "Show Interview-IA"

**Solution 2: Reset Position**
```bash
# Delete config file

# Windows
del "%APPDATA%\AI_Interview\config.json"

# macOS
rm ~/Library/Application\ Support/AI_Interview/config.json

# Linux
rm ~/.config/AI_Interview/config.json

# Restart Interview-IA
```

**Solution 3: Use Shortcut**
- Press `Cmd+Shift+H` (or Ctrl+Shift+H)
- Window should appear

#### 8. Auto-Hide Not Working

**Cause:** Screen sharing detection not working.

**Solution:**
- Ensure "Auto-hide during screen sharing" is enabled (Settings)
- Test with common apps: Zoom, Teams, Google Meet
- Manual workaround: Press `Cmd+Shift+H` before sharing

**Supported Apps:**
- Zoom
- Google Meet
- Microsoft Teams
- Discord
- Slack
- OBS Studio
- Skype
- WebEx
- GoToMeeting
- BlueJeans

#### 9. High Memory Usage

**Cause:** Large conversation history or cache.

**Solution:**
```javascript
// Clear history
window.electronAPI.clearHistory();

// Clear cache
window.electronAPI.clearCache();

// Or via tray menu:
// Right-click tray icon → Clear Cache
```

**Normal Memory Usage:**
- Main process: 50-100 MB
- Renderer: 100-150 MB
- Total: 150-250 MB

**High Usage (>500 MB):**
- Clear data as above
- Restart application
- Check for memory leaks (DevTools)

#### 10. Slow OCR Performance

**Cause:** Large image size or complex text.

**Solution:**
- Capture **specific window** (smaller image)
- Use **Tesseract worker** (parallel processing)
- **Resize image** before OCR:

```javascript
// Resize to max 1920x1080
const maxWidth = 1920;
const maxHeight = 1080;

if (img.width > maxWidth || img.height > maxHeight) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
  canvas.width = img.width * ratio;
  canvas.height = img.height * ratio;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  img = canvas.toDataURL();
}
```

### Debugging

**Enable Debug Logs:**

```javascript
// In main-standalone.js
console.log('DEBUG:', message);

// Check console:
// - Cmd+Option+I (macOS)
// - Ctrl+Shift+I (Windows/Linux)
```

**View Logs:**

```bash
# Electron logs location:

# Windows
%USERPROFILE%\AppData\Roaming\AI_Interview\logs\

# macOS
~/Library/Logs/AI_Interview/

# Linux
~/.config/AI_Interview/logs/
```

**Network Inspection:**

Open DevTools → Network tab:
- See OpenAI API calls
- Check request/response
- Verify API keys (redacted)
- Check error messages

---

*This documentation is part of Interview-IA Standalone Edition v1.0.0*
*For updates and support, visit: https://github.com/maikonrenner/InterviewCo-pilot*
