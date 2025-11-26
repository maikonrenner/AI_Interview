# 🚀 Interview-IA - Standalone Edition

> **100% Independent AI Programming Assistant** - No Django server required!

![Interview-IA Banner](https://img.shields.io/badge/Interview_IA-Standalone-10B981?style=for-the-badge&logo=electron)
![Electron](https://img.shields.io/badge/Electron-28.x-47848F?style=flat-square&logo=electron)
![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?style=flat-square&logo=openai)
![Deepgram](https://img.shields.io/badge/Deepgram-Nova--3-6b7280?style=flat-square)

---

## 🎉 What's New in Standalone Edition

### ✅ Completely Independent
- **No Django server needed** - Runs 100% standalone
- **Direct API integration** - OpenAI and Deepgram APIs built-in
- **Local storage** - Conversation history, cache, and settings stored locally
- **Portable** - Single executable, run anywhere

### ⚡ Key Features

1. **Direct OpenAI Integration**
   - GPT-4, GPT-4o, GPT-4o-mini support
   - Streaming responses in real-time
   - Automatic question extraction
   - Code analysis and debugging

2. **Built-in Deepgram Transcription**
   - Real-time voice-to-text
   - Multi-language support
   - Speaker diarization
   - High accuracy with Nova-3 model

3. **Local Data Management**
   - Conversation history (last 100 conversations)
   - Question/answer cache for instant responses
   - Session tracking and analytics
   - Export/import functionality

4. **All Original Features**
   - ✅ Live Coding Mode with OCR
   - ✅ Auto-hide during screen sharing
   - ✅ Adjustable transparency
   - ✅ Global keyboard shortcuts
   - ✅ Dark theme UI

---

## 📦 Installation

### Quick Start

```bash
# 1. Navigate to Interview-IA directory
cd AI_Interview

# 2. Install dependencies
npm install

# 3. Run in development mode
npm run dev
```

### First-Time Setup

1. **Install Node.js** (16.x or higher)
   - Download from: https://nodejs.org/

2. **Get API Keys** (Required):

   **OpenAI API Key:**
   - Sign up: https://platform.openai.com/signup
   - Create API key: https://platform.openai.com/api-keys
   - Copy your key (starts with `sk-...`)

   **Deepgram API Key:**
   - Sign up: https://console.deepgram.com/signup
   - Get $200 free credits (750 hours of transcription)
   - Copy your API key

3. **Configure API Keys:**
   - Launch Interview-IA
   - Click `⋮` menu → Settings
   - Enter your OpenAI API key
   - Enter your Deepgram API key
   - Click "Save Settings"

4. **Start Using!**
   - Press `Cmd+Shift+Q` to ask a question
   - Press `Cmd+Shift+L` for Live Coding mode
   - Press `Cmd+Shift+V` for voice input

---

## 🚀 Usage Guide

### Mode 1: Answer Question

Perfect for quick coding questions, debugging help, or explanations.

**Steps:**
1. Press `Cmd+Shift+Q` or click "Answer Question"
2. Type your question (or press `Cmd+Shift+V` for voice)
3. Press Enter or click Send
4. Wait for AI response (streaming in real-time)
5. Copy code, ask follow-ups, or navigate history

**Example Questions:**
- "How do I reverse a linked list in Python?"
- "Explain time complexity of quicksort"
- "Debug this code: [paste code]"
- "Optimize this algorithm for better performance"

### Mode 2: Live Coding (⭐ Star Feature)

Analyze code problems from your screen using OCR + AI.

**Steps:**
1. Press `Cmd+Shift+L` or click "Live Coding"
2. Open coding problem (LeetCode, HackerRank, etc.)
3. Press `Cmd+Shift+C` to capture screen
4. Press `Cmd+Shift+S` to analyze
5. AI extracts problem text via OCR
6. AI provides:
   - **Intuition**: Concept explanation
   - **Algorithm**: Step-by-step approach
   - **Implementation**: Complete code solution

**Real-time Mode:**
- Press `Cmd+Shift+R` to enable
- Screen captured automatically every 8 seconds
- Perfect for coding competitions
- Detects new problems automatically

### Voice Transcription

Ask questions using your voice instead of typing.

**Steps:**
1. Press `Cmd+Shift+V` to start listening
2. Speak your question clearly
3. Interview-IA transcribes in real-time
4. Question automatically submitted when you stop talking
5. AI generates response

**Supported Languages:**
- English, Spanish, French, German
- Portuguese, Italian, Dutch
- Japanese, Hindi, Russian
- And many more (auto-detected)

---

## ⚙️ Configuration

### Settings Panel

Access via `⋮` menu or click Settings.

**API Configuration:**
```
OpenAI API Key: sk-proj-...
Deepgram API Key: ...
Selected Model: gpt-4o-mini (Fast & Cost-effective)
```

**Behavior Options:**
- ✅ Auto-hide during screen sharing (Enabled)
- Live Coding Interval: 8000ms (8 seconds)

**Available Models:**
- `gpt-4o-mini` - Fast, affordable (Recommended)
- `gpt-4o` - Latest, powerful
- `gpt-4-turbo` - Fast GPT-4
- `gpt-3.5-turbo` - Legacy, fast

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+L` | Toggle Live Coding Mode |
| `Cmd+Shift+C` | Capture Screen |
| `Cmd+Shift+S` | Analyze Captured Screen |
| `Cmd+Shift+R` | Toggle Real-time Mode |
| `Cmd+Shift+V` | Start/Stop Voice Input |
| `Cmd+Shift+H` | Hide/Show Window |
| `Cmd+Shift+Q` | Quick Question Input |
| `Cmd+Shift+A` | View History |
| `Cmd+T` | Toggle Transparency |

> **Note**: Use `Ctrl` instead of `Cmd` on Windows/Linux

---

## 💾 Data Management

### Conversation History

Interview-IA automatically saves your conversations locally.

**Features:**
- Last 100 conversations stored
- Search by question or answer
- View conversation details
- Clear history anytime

**Access History:**
1. Press `Cmd+Shift+A`
2. Browse conversations by date
3. Search using keywords
4. Click to view full conversation

### Cache System

Frequently asked questions are cached for instant responses.

**Benefits:**
- ⚡ **100x-500x Faster**: <50ms vs 2-5 seconds
- 💰 **Cost Savings**: No API calls for cached answers
- 📊 **Smart Matching**: Similar questions use same cache

**Cache Stats:**
- View cache size and hit count in Settings
- Clear cache manually anytime
- Auto-cleanup after 100 entries

### Export/Import Data

Backup your data or transfer to another device.

**Export Data:**
1. Click System Tray icon
2. Select "Export Data"
3. Save JSON file

**Import Data:**
```json
{
  "config": { /* your settings */ },
  "history": { /* conversations */ },
  "cache": { /* cached answers */ },
  "exportDate": "2025-01-12T..."
}
```

---

## 🏗️ Architecture

### Standalone Services

Interview-IA uses 3 core services running in the Electron main process:

```
┌─────────────────────────────────────────┐
│         Interview-IA (Standalone)       │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │      AI Service                   │ │
│  │  - OpenAI API Integration         │ │
│  │  - Question extraction            │ │
│  │  - Code analysis                  │ │
│  │  - Streaming responses            │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Transcription Service            │ │
│  │  - Deepgram API Integration       │ │
│  │  - Real-time voice-to-text        │ │
│  │  - Multi-language support         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Storage Service                  │ │
│  │  - Local data persistence         │ │
│  │  - Conversation history           │ │
│  │  - Cache management               │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Technology Stack

**Core:**
- Electron 28.x (Desktop framework)
- Node.js (Main process)
- React 18.x (UI renderer)

**APIs:**
- OpenAI SDK 4.x (GPT models)
- Deepgram SDK 3.x (Speech-to-text)
- Tesseract.js 5.x (OCR)

**Storage:**
- electron-store (Persistent settings)
- Local JSON files (History, cache)

**UI:**
- Framer Motion (Animations)
- React Markdown (Response rendering)
- React Syntax Highlighter (Code display)

---

## 💰 Cost Estimation

### OpenAI Pricing (Pay-per-use)

**GPT-4o-mini** (Recommended):
- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens
- **Average cost per question**: $0.001-0.005

**GPT-4o**:
- Input: $2.50 / 1M tokens
- Output: $10.00 / 1M tokens
- **Average cost per question**: $0.02-0.05

**Typical Usage:**
- 100 questions/day with GPT-4o-mini: **~$0.30/day** ($9/month)
- 100 questions/day with GPT-4o: **~$3/day** ($90/month)

### Deepgram Pricing

**Free Tier:**
- $200 free credits
- ~750 hours of transcription
- No credit card required

**Pay-as-you-go:**
- Nova-2: $0.0043 / minute
- ~$0.26 / hour

**Typical Usage:**
- 1 hour of voice input/day: **~$0.26/day** ($8/month)
- Free tier lasts 750 hours (~25 hours/day for 30 days)

### Total Cost Estimate

**Light Usage** (20 questions + 15 min voice/day):
- OpenAI: $0.06/day
- Deepgram: $0.06/day
- **Total: ~$3.60/month**

**Heavy Usage** (100 questions + 1 hour voice/day):
- OpenAI (GPT-4o-mini): $0.30/day
- Deepgram: $0.26/day
- **Total: ~$17/month**

---

## 🐛 Troubleshooting

### "AI Service not initialized"

**Cause**: OpenAI API key not configured or invalid.

**Solution**:
1. Open Settings (`⋮` menu)
2. Enter valid OpenAI API key
3. Click "Save Settings"
4. Restart Interview-IA

### "Transcription Service not initialized"

**Cause**: Deepgram API key not configured or invalid.

**Solution**:
1. Open Settings
2. Enter valid Deepgram API key
3. Click "Save Settings"
4. Press `Cmd+Shift+V` to test

### OpenAI API Error: Rate Limit

**Cause**: Exceeded API usage limits.

**Solution**:
1. Wait 1-2 minutes
2. Switch to `gpt-4o-mini` (higher limits)
3. Check usage: https://platform.openai.com/usage

### OpenAI API Error: Insufficient Quota

**Cause**: No credits on OpenAI account.

**Solution**:
1. Add payment method: https://platform.openai.com/account/billing
2. Add credits (minimum $5)
3. Wait 5-10 minutes for activation

### OCR Not Extracting Text

**Cause**: Poor image quality or font issues.

**Solution**:
1. Capture specific window instead of full screen
2. Increase font size in code editor
3. Use high contrast theme (dark text on light bg)
4. Ensure text is clearly visible

### Voice Not Working

**Cause**: Microphone permissions not granted.

**Solution**:
- **macOS**: System Preferences → Security & Privacy → Microphone → Enable Interview-IA
- **Windows**: Settings → Privacy → Microphone → Allow apps
- **Linux**: Check PulseAudio/ALSA permissions

---

## 📚 Development

### Running from Source

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Build React app
npm run build:renderer

# Run production build
npm start
```

### Building Installers

```bash
# Build for current platform
npm run package

# Build for Windows
npm run package:win

# Build for macOS
npm run package:mac

# Build for Linux
npm run package:linux
```

### Project Structure

```
AI_Interview/
├── src/
│   ├── main/
│   │   ├── main-standalone.js      # Main process (entry point)
│   │   ├── ai-service.js           # OpenAI integration
│   │   ├── transcription-service.js# Deepgram integration
│   │   └── storage-service.js      # Local data management
│   ├── preload/
│   │   └── preload.js              # IPC bridge (security)
│   └── renderer/
│       ├── components/             # React UI components
│       ├── styles/                 # CSS styles
│       ├── App.jsx                 # Main React app
│       └── main.jsx                # React entry point
├── public/                         # Assets (icons)
├── dist/                           # Built React app
├── release/                        # Packaged installers
├── package.json                    # Dependencies & scripts
├── vite.config.js                  # Vite config
└── README-STANDALONE.md            # This file
```

---

## 🔒 Security & Privacy

### API Key Storage

- Stored locally using `electron-store`
- Never sent to external servers (except OpenAI/Deepgram)
- Encrypted at rest (OS-level encryption)
- Can be cleared via Settings

### Data Privacy

- **All data stored locally** on your device
- No telemetry or analytics sent
- No user tracking
- Open source - verify yourself!

### Screen Capture

- Only captures when you trigger (button or shortcut)
- Processed locally with Tesseract.js
- Sent to OpenAI only when you click "Analyze"
- Images not stored permanently

---

## 🆚 Standalone vs Django Version

| Feature | Standalone | Django Version |
|---------|-----------|----------------|
| **Setup Complexity** | ✅ Simple (npm install) | ❌ Complex (Django + Python) |
| **Dependencies** | ✅ Minimal (Node.js only) | ❌ Many (Python, Django, etc.) |
| **API Integration** | ✅ Direct (OpenAI, Deepgram) | ⚠️ Via Django server |
| **Data Storage** | ✅ Local (electron-store) | ⚠️ PostgreSQL/SQLite |
| **Performance** | ✅ Fast (no network overhead) | ⚠️ WebSocket latency |
| **Portability** | ✅ Single executable | ❌ Requires server running |
| **Cost** | ✅ API costs only | ⚠️ API + hosting costs |

**Recommendation**: Use **Standalone** for personal use, simplicity, and portability.

---

## 📝 License

MIT License - Free for personal and commercial use.

---

## 👨‍💻 Author

**Maikon Renner**
- GitHub: [@maikonrenner](https://github.com/maikonrenner)
- Project: [AI Interview Co-pilot](https://github.com/maikonrenner/InterviewCo-pilot)

---

## 🙏 Acknowledgments

- OpenAI - GPT models powering intelligent responses
- Deepgram - Real-time voice transcription
- Electron - Cross-platform desktop framework
- Tesseract.js - Client-side OCR
- React - UI library

---

## ⭐ Support

If you find Interview-IA helpful:
- ⭐ Star the repository on GitHub
- 🐛 Report bugs and suggest features
- 📢 Share with fellow developers
- 💖 Consider sponsoring development

---

**Happy Coding with Interview-IA! 🚀✨**

*No servers, no hassle, just pure AI assistance.*
