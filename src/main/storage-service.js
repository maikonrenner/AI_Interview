/**
 * Storage Service - Local data persistence
 * Stores conversation history, cache, and user data
 */

const Store = require('electron-store');
const crypto = require('crypto');

class StorageService {
  constructor() {
    // Main configuration store
    this.configStore = new Store({
      name: 'config',
      defaults: {
        opacity: 0.9,
        alwaysOnTop: true,
        position: { x: 100, y: 100 },
        size: { width: 450, height: 600 },
        autoHideDuringScreenShare: true,
        liveCodingInterval: 8000,
        openaiApiKey: '',
        geminiApiKey: '',
        deepgramApiKey: '',
        selectedModel: 'gpt-4o-mini'
      }
    });

    // Conversation history store
    this.historyStore = new Store({
      name: 'history',
      defaults: {
        conversations: [],
        sessions: []
      }
    });

    // Cache store for quick responses
    this.cacheStore = new Store({
      name: 'cache',
      defaults: {
        questionCache: {},
        ocrCache: {}
      }
    });

    // Interview context store (Resume + Job Description)
    this.interviewStore = new Store({
      name: 'interview-context',
      defaults: {
        resumeText: '',
        jobDescription: '',
        companyName: '',
        jobTitle: '',
        resumeSummary: '',
        jobSummary: ''
      }
    });

    console.log('✅ Storage Service initialized');
  }

  // ==================== Configuration ====================

  getConfig() {
    return this.configStore.store;
  }

  setConfig(key, value) {
    this.configStore.set(key, value);
  }

  getConfigValue(key, defaultValue = null) {
    return this.configStore.get(key, defaultValue);
  }

  // ==================== API Keys ====================

  setOpenAIKey(apiKey) {
    this.configStore.set('openaiApiKey', apiKey);
  }

  getOpenAIKey() {
    return this.configStore.get('openaiApiKey', '');
  }

  setGeminiKey(apiKey) {
    this.configStore.set('geminiApiKey', apiKey);
  }

  getGeminiKey() {
    return this.configStore.get('geminiApiKey', '');
  }

  setDeepgramKey(apiKey) {
    this.configStore.set('deepgramApiKey', apiKey);
  }

  getDeepgramKey() {
    return this.configStore.get('deepgramApiKey', '');
  }

  hasRequiredKeys() {
    return (this.getOpenAIKey() || this.getGeminiKey()) && this.getDeepgramKey();
  }

  // ==================== Conversation History ====================

  saveConversation(conversation) {
    const conversations = this.historyStore.get('conversations', []);

    const newConversation = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      question: conversation.question,
      answer: conversation.answer,
      mode: conversation.mode || 'answer_question',
      metadata: conversation.metadata || {}
    };

    conversations.push(newConversation);

    // Keep only last 100 conversations
    if (conversations.length > 100) {
      conversations.shift();
    }

    this.historyStore.set('conversations', conversations);
    return newConversation;
  }

  getConversations(limit = 50) {
    const conversations = this.historyStore.get('conversations', []);
    return conversations.slice(-limit).reverse();
  }

  getConversationById(id) {
    const conversations = this.historyStore.get('conversations', []);
    return conversations.find(conv => conv.id === id);
  }

  clearConversations() {
    this.historyStore.set('conversations', []);
  }

  searchConversations(query) {
    const conversations = this.historyStore.get('conversations', []);
    const lowerQuery = query.toLowerCase();

    return conversations.filter(conv =>
      conv.question.toLowerCase().includes(lowerQuery) ||
      conv.answer.toLowerCase().includes(lowerQuery)
    ).reverse();
  }

  // ==================== Sessions ====================

  startSession() {
    const session = {
      id: this.generateId(),
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      questionsAsked: 0,
      screensAnalyzed: 0
    };

    const sessions = this.historyStore.get('sessions', []);
    sessions.push(session);
    this.historyStore.set('sessions', sessions);
    this.historyStore.set('currentSessionId', session.id);

    return session;
  }

  endSession() {
    const sessionId = this.historyStore.get('currentSessionId');
    if (!sessionId) return null;

    const sessions = this.historyStore.get('sessions', []);
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);

    if (sessionIndex !== -1) {
      const session = sessions[sessionIndex];
      session.endTime = new Date().toISOString();
      session.duration = new Date(session.endTime) - new Date(session.startTime);

      sessions[sessionIndex] = session;
      this.historyStore.set('sessions', sessions);
      this.historyStore.delete('currentSessionId');

      return session;
    }

    return null;
  }

  updateSessionStats(stats) {
    const sessionId = this.historyStore.get('currentSessionId');
    if (!sessionId) return;

    const sessions = this.historyStore.get('sessions', []);
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);

    if (sessionIndex !== -1) {
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        ...stats
      };
      this.historyStore.set('sessions', sessions);
    }
  }

  getSessions(limit = 20) {
    const sessions = this.historyStore.get('sessions', []);
    return sessions.slice(-limit).reverse();
  }

  // ==================== Cache ====================

  cacheQuestion(question, answer) {
    const hash = this.hashString(question);
    const cache = this.cacheStore.get('questionCache', {});

    cache[hash] = {
      question: question,
      answer: answer,
      timestamp: new Date().toISOString(),
      hitCount: (cache[hash]?.hitCount || 0) + 1
    };

    this.cacheStore.set('questionCache', cache);
  }

  getCachedAnswer(question) {
    const hash = this.hashString(question);
    const cache = this.cacheStore.get('questionCache', {});
    const cached = cache[hash];

    if (cached) {
      // Update hit count
      cached.hitCount = (cached.hitCount || 0) + 1;
      cached.lastAccessed = new Date().toISOString();
      cache[hash] = cached;
      this.cacheStore.set('questionCache', cache);

      return cached.answer;
    }

    return null;
  }

  clearCache() {
    this.cacheStore.set('questionCache', {});
    this.cacheStore.set('ocrCache', {});
  }

  getCacheStats() {
    const questionCache = this.cacheStore.get('questionCache', {});
    const ocrCache = this.cacheStore.get('ocrCache', {});

    return {
      questionCacheSize: Object.keys(questionCache).length,
      ocrCacheSize: Object.keys(ocrCache).length,
      totalHits: Object.values(questionCache).reduce((sum, item) => sum + (item.hitCount || 0), 0)
    };
  }

  // ==================== Utilities ====================

  hashString(str) {
    return crypto.createHash('md5').update(str.toLowerCase().trim()).digest('hex');
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  exportData() {
    return {
      config: this.configStore.store,
      history: this.historyStore.store,
      cache: this.cacheStore.store,
      exportDate: new Date().toISOString()
    };
  }

  importData(data) {
    if (data.config) {
      Object.keys(data.config).forEach(key => {
        this.configStore.set(key, data.config[key]);
      });
    }

    if (data.history) {
      Object.keys(data.history).forEach(key => {
        this.historyStore.set(key, data.history[key]);
      });
    }

    if (data.cache) {
      Object.keys(data.cache).forEach(key => {
        this.cacheStore.set(key, data.cache[key]);
      });
    }
  }

  // ==================== Interview Context ====================

  getInterviewContext() {
    return {
      resumeText: this.interviewStore.get('resumeText', ''),
      jobDescription: this.interviewStore.get('jobDescription', ''),
      companyName: this.interviewStore.get('companyName', ''),
      jobTitle: this.interviewStore.get('jobTitle', ''),
      resumeSummary: this.interviewStore.get('resumeSummary', ''),
      jobSummary: this.interviewStore.get('jobSummary', '')
    };
  }

  setInterviewContext(context) {
    if (context.resumeText !== undefined) {
      this.interviewStore.set('resumeText', context.resumeText);
    }
    if (context.jobDescription !== undefined) {
      this.interviewStore.set('jobDescription', context.jobDescription);
    }
    if (context.companyName !== undefined) {
      this.interviewStore.set('companyName', context.companyName);
    }
    if (context.jobTitle !== undefined) {
      this.interviewStore.set('jobTitle', context.jobTitle);
    }
    if (context.resumeSummary !== undefined) {
      this.interviewStore.set('resumeSummary', context.resumeSummary);
    }
    if (context.jobSummary !== undefined) {
      this.interviewStore.set('jobSummary', context.jobSummary);
    }

    console.log('💼 Interview context updated');
  }

  reset() {
    this.configStore.clear();
    this.historyStore.clear();
    this.cacheStore.clear();
    this.interviewStore.clear();
    console.log('🗑️ All data cleared');
  }
}

module.exports = StorageService;
