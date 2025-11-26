# 🚀 Interview-IA - AI Programming Assistant Overlay

> Real-time AI-powered overlay assistant for programming interviews, coding challenges, and debugging. Always visible, never intrusive.

![Interview-IA Banner](https://img.shields.io/badge/Interview_IA-v1.0.0-10B981?style=for-the-badge&logo=electron)
![Electron](https://img.shields.io/badge/Electron-28.x-47848F?style=flat-square&logo=electron)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 💖 Sponsor this Project

If Interview-IA has helped you in your coding journey, consider buying me a coffee! ☕

<div align="center">
  <a href="https://www.buymeacoffee.com/maikonrenner" target="_blank">
    <img src=".github/images/buymeacoffee-qr.png" alt="Buy Me a Coffee QR Code" width="300">
  </a>

  **Scan the QR code or click to support the project!**

  [![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/maikonrenner)
</div>

Your support helps maintain and improve Interview-IA! 🙏

---

## 🌟 Overview

Interview-IA is a desktop application built with Electron that provides real-time AI assistance for programmers. It features an always-on-top overlay window that can capture your screen, analyze code problems, and provide intelligent suggestions without interrupting your workflow.

### ⭐ Key Features

- **🎯 Live Coding Mode**: Capture screen, extract code with OCR, and get AI-powered solutions
- **🎤 Voice Transcription**: Ask questions using voice commands
- **👻 Auto-Hide During Screen Share**: Automatically hides when screen sharing is detected
- **🌗 Dark Theme**: Beautiful dark interface optimized for long coding sessions
- **⚡ Real-time Analysis**: Continuous screen monitoring with configurable intervals
- **🔍 Smart Detection**: Automatically detects programming language and coding platform (LeetCode, HackerRank, etc.)
- **🎨 Adjustable Transparency**: Control window opacity from 0% to 100%
- **⌨️ Global Shortcuts**: Complete keyboard control without switching windows
- **🔌 Django Integration**: Seamless connection with AI Interview Co-pilot backend

---

## 📦 Installation

### Prerequisites

- Node.js 16+ and npm
- Python 3.10+ (for Django backend)
- AI Interview Co-pilot server running on `http://localhost:8004`

### Step 1: Clone the Repository

```bash
cd ai-interview-copilot/AI_Interview
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

Create a `.env` file in the root directory (optional, can be configured in Settings UI):

```env
OPENAI_API_KEY=your_openai_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
SERVER_URL=ws://localhost:8004/ws/interview/
```

### Step 4: Run Development Server

```bash
npm run dev
```

This will:
1. Start Vite dev server on `http://localhost:3000`
2. Launch Electron app with hot reload

### Step 5: Build for Production

```bash
# Build renderer (React app)
npm run build:renderer

# Package Electron app
npm run package

# Create installers
npm run make
```

---

## 🚀 Usage

### First Launch

1. **Start Django Server** (AI Interview Co-pilot backend):
   ```bash
   cd ai-interview-copilot
   python manage.py runserver 8004
   ```

2. **Launch Interview-IA**:
   ```bash
    cd AI_Interview
   npm start
   ```

3. **Configure Settings**:
   - Click the `⋮` menu button in the header
   - Enter your OpenAI and Deepgram API keys
   - Adjust server URL if needed
   - Enable/disable auto-hide during screen share

### Basic Workflow

#### Mode 1: Answer Question

1. Click **"Answer Question"** button or press `Cmd+Shift+Q`
2. Type your question or press `Cmd+Shift+V` to use voice
3. Wait for AI to analyze and provide answer
4. Copy code, ask follow-up questions, or navigate history

#### Mode 2: Live Coding (⭐ Star Feature)

1. Click **"Live Coding"** button or press `Cmd+Shift+L`
2. **Capture Screen**:
   - Press `Cmd+Shift+C` to capture entire screen
   - OR click "Select Window" to choose specific window
3. **Analyze**:
   - Click "Analyse This" or press `Cmd+Shift+S`
   - AI will extract code using OCR
   - Detect programming language and platform
   - Generate solution with explanation
4. **Real-time Mode**:
   - Click "Real-time OFF" button or press `Cmd+Shift+R`
   - Interview-IA will capture and analyze screen every 8 seconds
   - Perfect for coding competitions or live interviews

### Auto-Hide Feature

**Automatic Behavior:**
- Interview-IA monitors for screen sharing applications (Zoom, Teams, Meet, etc.)
- When screen sharing is detected, window automatically fades out
- When screen sharing stops, window fades back in
- Manual override: Press `Cmd+Shift+H` to hide/show anytime

**Use Cases:**
- **Technical Interviews**: Use Interview-IA before your turn to share screen
- **Live Coding Sessions**: Get hints discretely before presenting
- **Screen Recordings**: Auto-hide prevents accidental recording

### Transparency Control

- Press `Cmd+T` to toggle transparency slider
- Drag slider from 0% (invisible) to 100% (opaque)
- Quick presets: 25%, 50%, 75%, 90%, 100%
- Useful for seeing code behind overlay

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Cmd+Shift+L` | Toggle Live Coding | Enter/exit Live Coding mode |
| `Cmd+Shift+C` | Capture Screen | Take screenshot of active window |
| `Cmd+Shift+S` | Send for Analysis | Analyse captured screen |
| `Cmd+Shift+R` | Toggle Real-time | Enable/disable continuous capture |
| `Cmd+Shift+V` | Voice Transcription | Start/stop listening for voice input |
| `Cmd+Shift+H` | Hide/Show Window | Toggle window visibility |
| `Cmd+Shift+Q` | Quick Question | Focus question input field |
| `Cmd+Shift+A` | Open History | View conversation history |
| `Cmd+T` | Toggle Transparency | Show/hide transparency slider |

> **Note**: Use `Ctrl` instead of `Cmd` on Windows/Linux

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Electron 28.x (Desktop framework)
- React 18.x (UI library)
- Framer Motion (Animations)
- Tesseract.js (OCR for screen capture)
- Vite (Build tool)

**Backend Integration:**
- WebSocket connection to Django Channels
- Real-time bidirectional communication
- Integrates with AI Interview Co-pilot server

**APIs:**
- OpenAI GPT-4/GPT-4o (AI responses)
- Deepgram Nova-3 (Speech-to-text)

### Project Structure

```
AI_Interview/
├── src/
│   ├── main/
│   │   └── main.js                 # Electron main process
│   ├── preload/
│   │   └── preload.js              # Context bridge (security)
│   └── renderer/
│       ├── components/
│       │   ├── Header.jsx          # Top bar (logo, timer, controls)
│       │   ├── ActionBar.jsx       # Mode selector (Answer/Live Coding)
│       │   ├── MainPanel.jsx       # Answer Question panel
│       │   ├── LiveCodingPanel.jsx # Live Coding mode UI
│       │   ├── TransparencyControl.jsx # Opacity slider
│       │   └── SettingsModal.jsx   # Configuration modal
│       ├── styles/
│       │   └── App.css             # Dark theme styles
│       ├── App.jsx                 # Main React component
│       └── main.jsx                # React entry point
├── public/
│   ├── icon.png                    # App icon
│   └── tray-icon.png               # System tray icon
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
├── forge.config.js                 # Electron Forge config
└── README.md                       # This file
```

### Main Process (main.js)

- Window management (always-on-top, transparency, draggable)
- Global keyboard shortcuts registration
- Screen capture via `desktopCapturer` API
- WebSocket connection to Django server
- Auto-hide monitoring (detects screen sharing apps)
- System tray integration

### Renderer Process (React)

- UI rendering and interactions
- State management for modes, captures, answers
- OCR processing with Tesseract.js
- Real-time message handling from server
- Framer Motion animations

### Preload Script (preload.js)

- Secure bridge between Main and Renderer processes
- Exposes controlled APIs via `contextBridge`
- Prevents direct Node.js access (security)

---

## 🔧 Configuration

### Settings Modal

Access via `⋮` menu button or Settings option:

**API Configuration:**
- OpenAI API Key: Required for AI responses
- Deepgram API Key: Required for voice transcription

**Server Connection:**
- Django Server URL: WebSocket endpoint (default: `ws://localhost:8004/ws/interview/`)

**Behavior:**
- ✅ Auto-hide during screen sharing (enabled by default)
- Live Coding Interval: Real-time capture frequency (default: 8000ms)

**Keyboard Shortcuts:**
- View all shortcuts and their actions
- Note: Use `Cmd` on macOS, `Ctrl` on Windows/Linux

### Electron Store Configuration

Interview-IA uses `electron-store` to persist settings:

```javascript
// Default configuration
{
  opacity: 0.9,
  alwaysOnTop: true,
  position: { x: 100, y: 100 },
  size: { width: 450, height: 600 },
  autoHideDuringScreenShare: true,
  liveCodingInterval: 8000,
  serverUrl: 'ws://localhost:8004/ws/interview/',
  openaiApiKey: '',
  deepgramApiKey: ''
}
```

---

## 🎯 Use Cases

### 1. LeetCode Problem Solving

**Scenario**: You're stuck on a LeetCode hard problem.

**Steps**:
1. Activate Live Coding: `Cmd+Shift+L`
2. Capture problem description: `Cmd+Shift+C`
3. Analyse: `Cmd+Shift+S`
4. AI extracts problem text via OCR
5. Provides:
   - **Intuition**: Conceptual explanation
   - **Algorithm**: Step-by-step approach
   - **Implementation**: Complete code solution
6. Copy code and adapt to your style

### 2. Technical Interview Preparation

**Scenario**: Practicing mock interviews on platforms like Pramp or InterviewBit.

**Steps**:
1. Enable auto-hide (should be enabled by default)
2. Use Answer Question mode for quick lookups
3. When interviewer asks question:
   - Press `Cmd+Shift+V` and ask via voice
   - Or type question: `Cmd+Shift+Q`
4. Get instant answer with code examples
5. If interviewer asks to share screen:
   - Interview-IA automatically hides
   - Use knowledge gained to solve problem independently

### 3. Debugging Complex Code

**Scenario**: Code has bug, not sure where.

**Steps**:
1. Activate Live Coding
2. Capture VSCode window with error
3. Analyse captured screen
4. AI identifies:
   - Line with error
   - Root cause
   - Suggested fix with corrected code
5. Apply fix and test

### 4. Competitive Programming (Real-time Mode)

**Scenario**: Codeforces contest, need quick hints.

**Steps**:
1. Activate Live Coding
2. Enable Real-time mode: `Cmd+Shift+R`
3. Interview-IA monitors screen every 8 seconds
4. Detects new problems automatically
5. Generates solutions in background
6. Quickly glance at overlay for algorithm approach
7. Implement solution with your own code

---

## 🛡️ Security & Privacy

### Auto-Hide During Screen Sharing

**How It Works:**

1. **Application Detection**: Monitors for common screen sharing apps:
   - Zoom, Google Meet, Microsoft Teams
   - Discord, Slack, Skype, WebEx
   - OBS, GoToMeeting, BlueJeans

2. **API Monitoring** (Platform-specific):
   - **macOS**: Monitors `CGWindowListCopyWindowInfo` for recording indicators
   - **Windows**: Checks Windows Desktop Duplication API
   - **Linux**: Monitors D-Bus, Pipewire, and XDG Desktop Portal

3. **Fade Out**: 300-500ms smooth animation to 0% opacity

4. **State Preservation**:
   - Window becomes invisible in screen captures
   - Removed from window list
   - System tray icon shows "Hidden during screen share"
   - All functionality continues in background

5. **Automatic Return**: Fades back in when screen sharing stops

**Manual Override:**
- Press `Cmd+Shift+H` to force hide/show
- Useful to hide before starting screen share

### API Key Storage

- API keys stored locally via `electron-store`
- Never sent to external servers except OpenAI/Deepgram APIs
- Can be cleared by deleting config file or via Settings UI

### Screen Capture

- Captures only when explicitly triggered (button or shortcut)
- Images processed locally via Tesseract.js OCR
- Sent to Django server only when "Analyse" is clicked
- Server forwards to OpenAI for analysis (ephemeral, not stored)

---

## 🐛 Troubleshooting

### Window Not Showing

**Issue**: App starts but window not visible.

**Solutions**:
1. Check system tray - click Interview-IA icon
2. Press `Cmd+Shift+H` to show window
3. Window might be off-screen - delete config:
    - macOS: `~/Library/Application Support/AI_Interview/config.json`
    - Windows: `%APPDATA%\AI_Interview\config.json`
    - Linux: `~/.config/AI_Interview/config.json`

### Not Connecting to Server

**Issue**: Status shows "Offline" or "Disconnected".

**Solutions**:
1. Ensure Django server is running: `python manage.py runserver 8004`
2. Check server URL in Settings (should be `ws://localhost:8004/ws/interview/`)
3. Verify firewall not blocking WebSocket connections
4. Check Django logs for connection errors

### OCR Not Extracting Text

**Issue**: Live Coding captures screen but extracts gibberish.

**Solutions**:
1. Ensure captured area has clear, readable text
2. Increase screen capture quality (capture specific window vs full screen)
3. Tesseract.js works best with:
   - Dark text on light background (or vice versa)
   - Clean fonts (monospace works well)
   - High contrast

### Auto-Hide Not Working

**Issue**: Window doesn't hide during screen share.

**Solutions**:
1. Check Settings: "Auto-hide during screen sharing" enabled
2. Test with common apps: Zoom, Google Meet, Teams
3. Manual workaround: Press `Cmd+Shift+H` before sharing screen
4. Check console logs for monitoring errors

### Keyboard Shortcuts Not Working

**Issue**: Global shortcuts don't trigger actions.

**Solutions**:
1. Check if another app is using same shortcuts
2. On macOS: System Preferences → Security & Privacy → Accessibility
   - Grant permission to Interview-IA
3. Restart application after changing permissions
4. Try alternative shortcuts in Settings

---

## 🤝 Integration with AI Interview Co-pilot

Interview-IA is designed to work seamlessly with the AI Interview Co-pilot Django backend.

### Required Backend Endpoints

Ensure your Django server has these WebSocket handlers:

```python
# consumers.py
async def receive(self, text_data):
    data = json.loads(text_data)

    if data['type'] == 'analyse_screen':
        # Perform OCR on image
        # Extract question
        # Generate AI response
        await self.send(json.dumps({
            'type': 'ai_response_chunk',
            'chunk': response_text
        }))

    elif data['type'] == 'ask_question':
        # Process question
        # Generate AI response

    elif data['type'] == 'start_transcription':
        # Start voice transcription

    elif data['type'] == 'stop_transcription':
        # Stop voice transcription
```

### Message Protocol

**Client → Server:**

```javascript
// Analyse screen capture
{
  type: 'analyse_screen',
  image: 'data:image/png;base64,...',
  sourceName: 'Google Chrome - LeetCode',
  activeWindow: { title: '...', owner: '...' }
}

// Ask question
{
  type: 'ask_question',
  question: 'How do I reverse a linked list?'
}

// Voice transcription
{
  type: 'start_transcription'
}
{
  type: 'stop_transcription'
}
```

**Server → Client:**

```javascript
// AI response (streaming)
{
  type: 'ai_response_start'
}
{
  type: 'ai_response_chunk',
  chunk: 'To reverse a linked list...'
}
{
  type: 'ai_response_complete',
  response: 'Full response text'
}

// Transcription
{
  type: 'transcription',
  text: 'How do I reverse a linked list'
}

// Question extracted
{
  type: 'question_extracted',
  question: 'How do I reverse a linked list?'
}
```

---

## 📚 Development

### Running in Development

```bash
# Terminal 1: Start Vite dev server
npm run dev:renderer

# Terminal 2: Start Electron
npm start
```

### Building

```bash
# Build renderer
npm run build:renderer

# Package for current platform
npm run package

# Create installers for all platforms
npm run make
```

### Project Scripts

```json
{
  "start": "electron-forge start",
  "dev": "concurrently \"npm run dev:renderer\" \"wait-on http://localhost:3000 && electron .\"",
  "dev:renderer": "vite",
  "build:renderer": "vite build",
  "package": "electron-forge package",
  "make": "electron-forge make"
}
```

---

## 📝 License

MIT License - feel free to use for personal or commercial projects.

---

## 👨‍💻 Author

**Maikon Renner**
- GitHub: [@maikonrenner](https://github.com/maikonrenner)
- Project: [AI Interview Co-pilot](https://github.com/maikonrenner/InterviewCo-pilot)

---

## 🙏 Acknowledgments

- **AI Interview Co-pilot**: Backend server and AI integration
- **Electron**: Cross-platform desktop framework
- **Tesseract.js**: Client-side OCR engine
- **OpenAI**: GPT models for intelligent responses
- **Deepgram**: Real-time speech-to-text API

---

## ⭐ Support

If you find Interview-IA helpful, please consider:
- ⭐ Giving the project a star on GitHub
- 📢 Sharing with fellow developers
- 🤝 Contributing improvements via pull requests
- 🐛 Reporting bugs and suggesting features

---

**Happy Coding with Interview-IA! 🚀**
