# 🧪 Interview-IA - Testing Guide

Complete guide to test all features of Interview-IA.

---

## Pre-Test Checklist

Before starting tests, ensure:

- [x] Node.js 16+ installed
- [x] Dependencies installed (`npm install`)
- [x] OpenAI API key ready
- [x] Deepgram API key ready (optional for voice tests)
- [x] Test questions prepared

---

## Test Plan

### 1. Installation Test (5 minutes)

**Objective:** Verify installation completes successfully.

**Steps:**
```bash
cd AI_Interview
npm install
```

**Expected Results:**
- ✅ All packages installed (~620 packages)
- ✅ No fatal errors
- ⚠️ Warnings are OK (deprecated packages)

**Pass Criteria:**
- Installation completes without errors
- `node_modules` folder created
- `package-lock.json` created

---

### 2. Launch Test (2 minutes)

**Objective:** Verify application launches successfully.

**Steps:**
```bash
npm run dev
```

**Expected Results:**
- ✅ Vite dev server starts (port 3000)
- ✅ Electron window opens
- ✅ Interview-IA interface visible
- ✅ Dark theme applied
- ✅ Header shows "Offline" status (no API keys yet)

**Visual Checklist:**
- [ ] Logo visible (top-left)
- [ ] Connection status shows "Offline" (red dot)
- [ ] Timer shows "0 mins"
- [ ] Action buttons present
- [ ] Window is transparent/semi-transparent

**Pass Criteria:**
- Application launches within 3 seconds
- No JavaScript errors in console
- UI fully renders

**Troubleshooting:**
- If fails: Check console for errors
- If port 3000 busy: Kill process or change port in `vite.config.js`

---

### 3. Configuration Test (3 minutes)

**Objective:** Verify settings can be configured.

**Steps:**
1. Click `⋮` (three dots menu)
2. Click "Settings"
3. Enter OpenAI API key: `sk-proj-...`
4. Enter Deepgram API key: `your-key`
5. Select model: `gpt-4o-mini`
6. Click "Save Settings"

**Expected Results:**
- ✅ Settings modal opens
- ✅ Form fields accept input
- ✅ "Save Settings" button works
- ✅ Success message appears
- ✅ Modal closes
- ✅ Status changes to "Connected" (green dot)

**Verification:**
```bash
# Check config file created
# Windows
type "%APPDATA%\AI_Interview\config.json"

# macOS/Linux
cat ~/Library/Application\ Support/AI_Interview/config.json
```

**Pass Criteria:**
- Settings saved successfully
- Status indicator updates
- No errors in console

---

### 4. Answer Question Mode Test (5 minutes)

**Objective:** Verify Q&A functionality works.

**Test Case 4.1: Text Input**

**Steps:**
1. Press `Cmd+Shift+Q` (or Ctrl+Shift+Q)
2. Type: "What is time complexity of binary search?"
3. Press Enter

**Expected Results:**
- ✅ Main panel opens
- ✅ Question displays in "Summarized question" section
- ✅ "Thinking..." indicator appears
- ✅ Response streams in real-time (chunks appear)
- ✅ Full response displayed with:
   - Intuition section
   - Algorithm section (optional)
   - Implementation section (optional)
- ✅ Processing indicator disappears

**Timing:**
- First chunk: <1 second
- Complete response: 2-5 seconds

**Test Case 4.2: Follow-up Question**

**Steps:**
1. In same panel, type: "Show me Python implementation"
2. Press Enter

**Expected Results:**
- ✅ New question added to conversation
- ✅ AI remembers context
- ✅ Response includes Python code
- ✅ Code has syntax highlighting

**Test Case 4.3: Code Copy**

**Steps:**
1. Hover over code block
2. Click "Copy" button

**Expected Results:**
- ✅ Code copied to clipboard
- ✅ Confirmation message (optional)

**Pass Criteria:**
- All 3 test cases pass
- Responses are relevant and well-formatted
- No API errors

**Test Questions:**
```
1. What is time complexity of binary search?
2. How do I reverse a linked list?
3. Explain quicksort algorithm
4. What is the difference between == and === in JavaScript?
5. How do I handle promises in JavaScript?
```

---

### 5. Live Coding Mode Test (10 minutes)

**Objective:** Verify screen capture and OCR work.

**Preparation:**
1. Open LeetCode.com in browser
2. Navigate to any problem (e.g., "Two Sum")
3. Ensure problem description is visible

**Test Case 5.1: Screen Capture**

**Steps:**
1. Press `Cmd+Shift+L` (activate Live Coding)
2. Press `Cmd+Shift+C` (capture screen)

**Expected Results:**
- ✅ Live Coding panel opens
- ✅ Screen captured (shows in preview)
- ✅ Preview displays correct window
- ✅ Detected info shows:
   - Platform badge (e.g., "LeetCode")
   - Language badge (if code visible)

**Test Case 5.2: OCR Processing**

**Steps:**
1. After capture, click "Analyse This"
2. OR press `Cmd+Shift+S`

**Expected Results:**
- ✅ "Extracting text..." indicator appears
- ✅ Progress bar fills (0% → 100%)
- ✅ OCR completes within 2-3 seconds
- ✅ Extracted text displays (first 500 chars)
- ✅ Text is readable and accurate

**Test Case 5.3: AI Analysis**

**Steps:**
1. Wait for AI analysis (automatic after OCR)

**Expected Results:**
- ✅ "Analysing..." indicator appears
- ✅ AI response streams in
- ✅ Response includes:
   - Problem understanding
   - Algorithm approach
   - Code implementation
- ✅ Response time: 3-8 seconds

**Test Case 5.4: Real-time Mode**

**Steps:**
1. Click "Real-time OFF" button
2. OR press `Cmd+Shift+R`
3. Wait 8 seconds
4. Change problem on LeetCode
5. Wait another 8 seconds

**Expected Results:**
- ✅ Button changes to "Real-time ON"
- ✅ Status bar shows "Real-time active"
- ✅ Screen auto-captures every 8 seconds
- ✅ New problem detected automatically
- ✅ New analysis generated

**Test Case 5.5: Clear Capture**

**Steps:**
1. Click "Clear" button

**Expected Results:**
- ✅ Preview cleared
- ✅ OCR text removed
- ✅ Analysis removed
- ✅ Ready for new capture

**Pass Criteria:**
- All 5 test cases pass
- OCR accuracy >80%
- AI analysis is relevant
- No crashes or freezes

**Test Sites:**
- LeetCode.com
- HackerRank.com
- Codeforces.com
- CodeChef.com

---

### 6. Voice Transcription Test (5 minutes)

**Objective:** Verify voice input works.

**Prerequisites:**
- Microphone connected
- Microphone permissions granted

**Test Case 6.1: Start Listening**

**Steps:**
1. Press `Cmd+Shift+V` (or click mic button)

**Expected Results:**
- ✅ Mic button pulsates
- ✅ "Listening..." text appears
- ✅ No error messages

**Test Case 6.2: Voice Input**

**Steps:**
1. Speak clearly: "How do I reverse a linked list in Python"
2. Wait 1 second after speaking

**Expected Results:**
- ✅ Interim transcription appears (during speech)
- ✅ Final transcription appears (after pause)
- ✅ Text is accurate (>90%)
- ✅ Question auto-submitted after utterance ends

**Test Case 6.3: Stop Listening**

**Steps:**
1. Press `Cmd+Shift+V` again

**Expected Results:**
- ✅ Mic button stops pulsating
- ✅ Transcription stops
- ✅ Connection closed gracefully

**Pass Criteria:**
- Voice recognized correctly
- Latency <500ms
- No audio glitches

**Test Phrases:**
```
1. "How do I reverse a linked list"
2. "Explain binary search algorithm"
3. "What is time complexity of quicksort"
4. "Show me Python code for bubble sort"
```

---

### 7. Keyboard Shortcuts Test (5 minutes)

**Objective:** Verify all shortcuts work.

**Test Matrix:**

| Shortcut | Expected Action | Pass |
|----------|----------------|------|
| `Cmd+Shift+Q` | Focus question input | [ ] |
| `Cmd+Shift+L` | Toggle Live Coding | [ ] |
| `Cmd+Shift+C` | Capture screen | [ ] |
| `Cmd+Shift+S` | Analyse capture | [ ] |
| `Cmd+Shift+R` | Toggle Real-time | [ ] |
| `Cmd+Shift+V` | Toggle voice | [ ] |
| `Cmd+Shift+H` | Hide window | [ ] |
| `Cmd+Shift+A` | Open history (future) | [ ] |
| `Cmd+T` | Toggle transparency | [ ] |

**Pass Criteria:**
- All shortcuts respond
- No conflicts with OS shortcuts
- Actions execute correctly

---

### 8. Transparency Control Test (3 minutes)

**Objective:** Verify opacity control works.

**Test Case 8.1: Slider Control**

**Steps:**
1. Press `Cmd+T`
2. Drag slider to 25%
3. Drag to 50%
4. Drag to 75%
5. Drag to 100%

**Expected Results:**
- ✅ Transparency slider appears
- ✅ Window opacity changes in real-time
- ✅ Slider value displays (25%, 50%, etc.)
- ✅ Window is semi-transparent at 25-75%
- ✅ Window is opaque at 100%

**Test Case 8.2: Preset Buttons**

**Steps:**
1. Click "25%" button
2. Click "50%" button
3. Click "90%" button

**Expected Results:**
- ✅ Window opacity jumps to selected value
- ✅ Slider updates to match

**Pass Criteria:**
- Opacity changes smoothly
- Settings persist after restart

---

### 9. Auto-Hide Test (5 minutes)

**Objective:** Verify auto-hide during screen sharing works.

**Prerequisites:**
- Zoom, Teams, or Meet installed

**Test Case 9.1: Manual Hide**

**Steps:**
1. Press `Cmd+Shift+H`

**Expected Results:**
- ✅ Window fades out smoothly (300ms)
- ✅ Window becomes invisible
- ✅ Tray icon shows "Hidden"

**Test Case 9.2: Manual Show**

**Steps:**
1. Press `Cmd+Shift+H` again
2. OR click tray icon → "Show Interview-IA"

**Expected Results:**
- ✅ Window fades in smoothly
- ✅ Window returns to previous position
- ✅ Previous state restored

**Test Case 9.3: Auto-Hide (Zoom)**

**Steps:**
1. Open Zoom
2. Start screen sharing
3. Observe Interview-IA

**Expected Results:**
- ✅ Interview-IA detects screen sharing
- ✅ Automatically hides within 2 seconds
- ✅ Tray icon updates

**Test Case 9.4: Auto-Show**

**Steps:**
1. Stop screen sharing in Zoom

**Expected Results:**
- ✅ Interview-IA detects sharing stopped
- ✅ Automatically shows within 2 seconds
- ✅ Returns to previous position

**Pass Criteria:**
- Auto-hide triggers reliably
- No false positives
- Smooth transitions

---

### 10. Cache Test (5 minutes)

**Objective:** Verify caching improves performance.

**Test Case 10.1: First Question**

**Steps:**
1. Ask: "What is binary search?"
2. Note response time

**Expected Results:**
- ✅ Response time: 2-5 seconds
- ✅ Full response received

**Test Case 10.2: Cached Question**

**Steps:**
1. Ask SAME question: "What is binary search?"
2. Note response time

**Expected Results:**
- ✅ Response time: <100ms
- ✅ Same answer returned
- ✅ No API call made (check network tab)

**Test Case 10.3: Cache Stats**

**Steps:**
1. Click `⋮` → Settings
2. Scroll to cache section (if available)
3. Check cache statistics

**Expected Results:**
- ✅ Cache size shows: 1 entry
- ✅ Hit count shows: 1

**Test Case 10.4: Clear Cache**

**Steps:**
1. Right-click tray icon
2. Click "Clear Cache"

**Expected Results:**
- ✅ Confirmation message
- ✅ Cache cleared
- ✅ Same question now takes 2-5 seconds

**Pass Criteria:**
- Cache provides 100x+ speedup
- Cache invalidates correctly
- No stale data served

---

### 11. History Test (3 minutes)

**Objective:** Verify conversation history saves.

**Test Case 11.1: Save Conversations**

**Steps:**
1. Ask 3 different questions
2. Close Interview-IA
3. Reopen Interview-IA
4. Check history file

**Expected Results:**
- ✅ All 3 conversations saved
- ✅ Timestamps recorded
- ✅ Questions and answers complete

**Verification:**
```bash
# Check history file
# Windows
type "%APPDATA%\AI_Interview\history.json"

# macOS/Linux
cat ~/Library/Application\ Support/AI_Interview/history.json
```

**Expected JSON:**
```json
{
  "conversations": [
    {
      "id": "...",
      "timestamp": "2025-01-12T...",
      "question": "...",
      "answer": "...",
      "mode": "answer_question"
    }
  ]
}
```

**Test Case 11.2: History Navigation**

**Steps:**
1. Open question panel
2. Click `←` (previous) button
3. Click `→` (next) button

**Expected Results:**
- ✅ Can navigate through history
- ✅ Questions and answers display
- ✅ Counter updates (1/3, 2/3, etc.)

**Pass Criteria:**
- All conversations saved
- Navigation works
- Data persists after restart

---

### 12. Performance Test (5 minutes)

**Objective:** Verify performance meets targets.

**Metrics to Measure:**

| Metric | Target | Actual | Pass |
|--------|--------|--------|------|
| Launch time | <3s | ___ | [ ] |
| First AI chunk | <1s | ___ | [ ] |
| Full AI response | <5s | ___ | [ ] |
| Cache retrieval | <100ms | ___ | [ ] |
| Screen capture | <500ms | ___ | [ ] |
| OCR processing | <3s | ___ | [ ] |
| Voice latency | <500ms | ___ | [ ] |

**Measurement Tools:**

**Browser DevTools:**
1. Open DevTools (Cmd+Option+I)
2. Network tab → See API timings
3. Performance tab → Record and analyze

**Console Timing:**
```javascript
console.time('operation');
// ... operation ...
console.timeEnd('operation');
```

**Pass Criteria:**
- All metrics within 150% of target
- No operation exceeds 10 seconds
- Memory usage <500 MB

---

### 13. Error Handling Test (5 minutes)

**Objective:** Verify errors are handled gracefully.

**Test Case 13.1: Invalid API Key**

**Steps:**
1. Settings → OpenAI Key: "invalid-key"
2. Ask a question

**Expected Results:**
- ✅ Error message displays
- ✅ Error is descriptive: "Invalid API key"
- ✅ Application doesn't crash

**Test Case 13.2: Network Offline**

**Steps:**
1. Disconnect internet
2. Ask a question

**Expected Results:**
- ✅ Error message: "Network error"
- ✅ Retry option available
- ✅ Application remains responsive

**Test Case 13.3: Rate Limit**

**Steps:**
1. Ask 10 questions rapidly
2. (With free tier API key)

**Expected Results:**
- ✅ Error message: "Rate limit exceeded"
- ✅ Suggestion to wait or upgrade
- ✅ Previous responses still visible

**Pass Criteria:**
- No crashes
- Error messages clear and actionable
- Application recoverable

---

### 14. Cross-Platform Test

**Objective:** Verify works on all platforms.

**Windows 10/11:**
- [ ] Installation works
- [ ] Application launches
- [ ] All features work
- [ ] Shortcuts work (Ctrl+Shift+...)
- [ ] Paths correct (%APPDATA%)

**macOS (10.13+):**
- [ ] Installation works
- [ ] Application launches
- [ ] All features work
- [ ] Shortcuts work (Cmd+Shift+...)
- [ ] Paths correct (~/Library/)
- [ ] Permissions (Screen, Mic, Accessibility)

**Linux (Ubuntu 18.04+):**
- [ ] Installation works
- [ ] Application launches
- [ ] All features work
- [ ] Shortcuts work (Ctrl+Shift+...)
- [ ] Paths correct (~/.config/)
- [ ] Dependencies installed

---

## Test Results Summary

**Date:** ___________
**Tester:** ___________
**Version:** 1.0.0

### Test Summary

| Category | Tests | Passed | Failed | %Pass |
|----------|-------|--------|--------|-------|
| Installation | 1 | ___ | ___ | ___ |
| Launch | 1 | ___ | ___ | ___ |
| Configuration | 1 | ___ | ___ | ___ |
| Answer Question | 3 | ___ | ___ | ___ |
| Live Coding | 5 | ___ | ___ | ___ |
| Voice Transcription | 3 | ___ | ___ | ___ |
| Shortcuts | 9 | ___ | ___ | ___ |
| Transparency | 2 | ___ | ___ | ___ |
| Auto-Hide | 4 | ___ | ___ | ___ |
| Cache | 4 | ___ | ___ | ___ |
| History | 2 | ___ | ___ | ___ |
| Performance | 7 | ___ | ___ | ___ |
| Error Handling | 3 | ___ | ___ | ___ |
| **TOTAL** | **45** | ___ | ___ | ___ |

### Overall Result

- [ ] **PASS** (>90% tests passed)
- [ ] **PARTIAL** (70-90% tests passed)
- [ ] **FAIL** (<70% tests passed)

### Critical Bugs Found

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Recommendations

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## Automated Testing (Future)

**Unit Tests:**
```bash
npm test
```

**Integration Tests:**
```bash
npm run test:integration
```

**E2E Tests:**
```bash
npm run test:e2e
```

---

**Happy Testing! 🧪**
