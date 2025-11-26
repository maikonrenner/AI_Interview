# Interview-IA Setup Guide

This guide will help you set up Interview-IA from scratch.

## Prerequisites

1. **Node.js & npm**
   ```bash
   node --version  # Should be 16.x or higher
   npm --version   # Should be 7.x or higher
   ```

2. **Python & Django Backend**
   - AI Interview Co-pilot server must be running
   - Default: `http://localhost:8004`

3. **API Keys**
   - OpenAI API Key (for AI responses)
   - Deepgram API Key (for voice transcription)

## Installation Steps

### 1. Install Dependencies

```bash
cd AI_Interview
npm install
```

This will install:
- Electron 28.x
- React 18.x
- Framer Motion (animations)
- Tesseract.js (OCR)
- WebSocket client
- And other dependencies

### 2. Configure Backend Server

Ensure the AI Interview Co-pilot Django server is running:

```bash
cd ../  # Go back to ai-interview-copilot root
python manage.py runserver 8004
```

Verify WebSocket endpoint is accessible:
- URL: `ws://localhost:8004/ws/interview/`

### 3. Configure API Keys (Optional)

You can either:

**Option A**: Create `.env` file
```bash
# AI_Interview/.env
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
SERVER_URL=ws://localhost:8004/ws/interview/
```

**Option B**: Configure via Settings UI after launch
- Launch app
- Click `⋮` menu
- Enter API keys in Settings modal

### 4. Run Development Mode

```bash
npm run dev
```

This starts:
1. Vite dev server on `http://localhost:3000`
2. Electron app with hot reload

### 5. Build for Production

```bash
# Build React app
npm run build:renderer

# Package Electron app (platform-specific)
npm run package

# Create installers
npm run make
```

## Troubleshooting

### "Module not found" errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### WebSocket connection fails

1. Check Django server is running: `http://localhost:8004`
2. Verify WebSocket route in Django `routing.py`
3. Check firewall settings

### Electron won't start

```bash
# Reinstall Electron
npm install electron@latest --save-dev
```

### Build fails

```bash
# Clear build cache
rm -rf dist/ out/ .webpack/

# Rebuild
npm run build:renderer
npm run package
```

## Platform-Specific Notes

### macOS

**Permissions Required:**
- Screen Recording (for capture)
- Accessibility (for global shortcuts)

Grant in: System Preferences → Security & Privacy

### Windows

**Antivirus:**
- Some antivirus may flag Electron apps
- Add exception for AI_Interview.exe

### Linux

**Dependencies:**
```bash
sudo apt-get install libgtk-3-0 libnotify4 libnss3 libxss1
```

## Next Steps

1. Read [README.md](./README.md) for usage guide
2. Configure keyboard shortcuts
3. Test Live Coding mode with LeetCode
4. Customize transparency and positioning

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/maikonrenner/InterviewCo-pilot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/maikonrenner/InterviewCo-pilot/discussions)
- **Documentation**: See README.md

---

Happy Coding! 🚀
