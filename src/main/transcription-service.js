/**
 * Transcription Service - Standalone Deepgram Integration
 * Handles voice-to-text transcription without Django backend
 */

const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');
const EventEmitter = require('events');

class TranscriptionService extends EventEmitter {
  constructor() {
    super();
    this.deepgram = null;
    this.connection = null;
    this.apiKey = null;
    this.isListening = false;
    this.mediaRecorder = null;
    this.audioStream = null;
  }

  initialize(apiKey) {
    if (!apiKey) {
      throw new Error('Deepgram API key is required');
    }

    this.apiKey = apiKey;
    this.deepgram = createClient(apiKey);
    console.log('✅ Transcription Service initialized');
  }

  isInitialized() {
    return this.deepgram !== null;
  }

  async startListening() {
    if (!this.isInitialized()) {
      throw new Error('Transcription Service not initialized');
    }

    if (this.isListening) {
      console.warn('⚠️ Already listening');
      return;
    }

    try {
      console.log('🎤 Starting transcription...');

      // Create live transcription connection
      this.connection = this.deepgram.listen.live({
        model: 'nova-2',
        language: 'multi', // Auto-detect multiple languages
        smart_format: true,
        punctuate: true,
        interim_results: true,
        utterance_end_ms: 1000,
        vad_events: true
      });

      // Setup event listeners
      this.connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('✅ Deepgram connection opened');
        this.isListening = true;
        this.emit('listening-started');
      });

      this.connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const transcript = data.channel.alternatives[0];

        if (transcript && transcript.transcript) {
          const text = transcript.transcript;
          const isFinal = data.is_final;

          console.log(`📝 ${isFinal ? 'Final' : 'Interim'}: ${text}`);

          this.emit('transcript', {
            transcript: text,
            is_final: isFinal,
            confidence: transcript.confidence,
            language: data.channel.detected_language || 'en'
          });
        }
      });

      this.connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
        console.log('🔚 Utterance ended');
        this.emit('utterance-end');
      });

      this.connection.on(LiveTranscriptionEvents.Error, (error) => {
        console.error('❌ Deepgram error:', error);
        this.emit('error', error);
      });

      this.connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('🔌 Deepgram connection closed');
        this.isListening = false;
        this.emit('listening-stopped');
      });

      // Note: Audio capture should be handled by the renderer process
      // and sent to main process, which will forward to Deepgram

    } catch (error) {
      console.error('❌ Error starting transcription:', error);
      this.isListening = false;
      throw error;
    }
  }

  sendAudio(audioData) {
    if (!this.connection || !this.isListening) {
      console.warn('⚠️ Not connected or not listening');
      return;
    }

    try {
      // Convert array to Buffer if needed
      const buffer = Buffer.isBuffer(audioData) ? audioData : Buffer.from(audioData);
      this.connection.send(buffer);
    } catch (error) {
      console.error('❌ Error sending audio:', error);
      this.emit('error', error);
    }
  }

  stopListening() {
    if (!this.isListening) {
      console.warn('⚠️ Not currently listening');
      return;
    }

    console.log('🛑 Stopping transcription...');

    if (this.connection) {
      this.connection.finish();
      this.connection = null;
    }

    this.isListening = false;
    this.emit('listening-stopped');
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized(),
      isListening: this.isListening
    };
  }
}

module.exports = TranscriptionService;
