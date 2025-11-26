/**
 * AI Service - OpenAI and Google Gemini Integration
 * Handles all AI-related operations without Django backend
 */

const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const EventEmitter = require('events');

class AIService extends EventEmitter {
  constructor() {
    super();
    this.openai = null;
    this.gemini = null;
    this.apiKey = null;
    this.aiProvider = null; // 'openai' or 'gemini'
    this.conversationHistory = [];
    this.interviewContext = null; // Resume + Job Description context
  }

  setInterviewContext(context) {
    this.interviewContext = context;
    console.log('💼 Interview context loaded into AI Service');
  }

  detectLanguage(text) {
    if (!text) return 'English';

    const textLower = text.toLowerCase();

    // Portuguese indicators
    const portugueseWords = ['você', 'qual', 'como', 'quando', 'onde', 'porque', 'posso', 'pode',
                             'que', 'para', 'com', 'seu', 'sua', 'meu', 'minha', 'estou', 'está',
                             'fazer', 'trabalho', 'experiência', 'projeto', 'dados', 'sistema'];
    const ptCount = portugueseWords.filter(word => textLower.includes(word)).length;

    // French indicators
    const frenchWords = ['vous', 'quel', 'quelle', 'comment', 'quand', 'où', 'pourquoi', 'puis',
                         'avec', 'pour', 'votre', 'mon', 'ma', 'suis', 'êtes', 'faire',
                         'travail', 'expérience', 'projet', 'données', 'système'];
    const frCount = frenchWords.filter(word => textLower.includes(word)).length;

    // English indicators
    const englishWords = ['you', 'what', 'how', 'when', 'where', 'why', 'can', 'could',
                          'your', 'my', 'the', 'with', 'work', 'experience', 'project', 'data'];
    const enCount = englishWords.filter(word => textLower.includes(word)).length;

    // Detect mixed languages (code-switching)
    const counts = [
      { lang: 'Portuguese', count: ptCount },
      { lang: 'French', count: frCount },
      { lang: 'English', count: enCount }
    ].filter(item => item.count > 0).sort((a, b) => b.count - a.count);

    // If multiple languages detected (code-switching)
    if (counts.length >= 2 && counts[0].count > 0 && counts[1].count > 0) {
      const ratio = counts[1].count / counts[0].count;
      // If secondary language has at least 30% presence, it's code-switching
      if (ratio >= 0.3) {
        return `${counts[0].lang}+${counts[1].lang}`; // e.g., "French+English"
      }
    }

    // Return single dominant language
    const maxCount = Math.max(ptCount, frCount, enCount);
    if (maxCount === 0) return 'English';
    if (ptCount === maxCount) return 'Portuguese';
    if (frCount === maxCount) return 'French';
    return 'English';
  }

  isSimpleQuestion(question) {
    const questionLower = question.toLowerCase();
    const simplePatterns = [
      /^(do|have|can|are|is|did)\s+you/i,
      /\?(yes|no)/i,
      /experience\s+with/i,
      /expérience\s+(avec|en)/i,
      /experiência\s+com/i
    ];
    return simplePatterns.some(pattern => pattern.test(question)) || question.split(' ').length < 10;
  }

  buildSystemPrompt(question, resumeSummary, jobSummary) {
    const language = this.detectLanguage(question);

    // Check if code-switching is detected
    const isCodeSwitching = language.includes('+');
    const languageInstruction = isCodeSwitching
      ? `Answer mixing the SAME languages as the question (e.g., if question mixes French and English, mix French and English in your response naturally)`
      : `Answer in the SAME language as the question (French→French, English→English, Portuguese→Portuguese)`;

    return `You are an interview expert assisting Maikon Renner during a job interview. You must generate responses automatically based on:

**CANDIDATE'S CV (YOUR PROFESSIONAL BACKGROUND):**
${resumeSummary || 'No resume information provided'}

**JOB DESCRIPTION (POSITION YOU'RE APPLYING FOR):**
${jobSummary || 'No job description provided'}

**RESPONSE FORMAT - CARL STRUCTURE:**

Every answer MUST follow this complete story structure:

**Context** (Contexto): Where you were, which project, client, team, company. Set the scene.

**Action** (Ação): What YOU did specifically. Tools used, processes implemented, technologies applied. Be concrete and detailed.

**Result** (Resultado): Measurable or qualitative impact. Metrics, improvements, achievements, outcomes.

**Link** (Ligação): How this experience relates to the job you're applying for. Connect your story to the position's requirements.

**CRITICAL RULES:**

1. **⚠️ LANGUAGE - ABSOLUTE PRIORITY**: ${languageInstruction}

2. **⚠️ COMPLETE STORIES**: Always use the CARL format (Context → Action → Result → Link). Never give short, incomplete answers.

3. **⚠️ AUTHENTIC EXPERIENCES ONLY**: Use ONLY information from the CV above. NEVER invent companies, projects, or experiences.

4. **Natural Human Language**: Speak conversationally, as if talking to a colleague. Avoid excessive jargon.

5. **Highlight Key Skills**: Use **bold** for important technologies and skills (2-4 per answer).

6. **Specific Details**: Include real names of companies, technologies, metrics when available in the CV.

7. **If not in CV**: If the question asks about something not in your experience, be honest: "I don't have direct experience with [X], but I have worked with similar [Y]..."

8. **Length**: Aim for 4-6 sentences covering all CARL elements naturally.

**EXAMPLE OF GOOD ANSWER:**

Question: "Do you have experience with Databricks?"

**Context**: At **Keyrus Canada**, I worked on a data engineering project for a retail client migrating their data pipeline to the cloud.

**Action**: I used **Databricks** to develop ETL pipelines that processed over 2TB of data daily, implementing **Delta Lake** for reliable data storage and **Spark** for distributed processing. I also integrated **MLflow** to track machine learning experiments.

**Result**: This reduced data processing time by 60% and enabled the analytics team to generate reports 3x faster, directly impacting business decision-making speed.

**Link**: This experience with **Databricks** and large-scale data engineering aligns perfectly with the data platform modernization goals mentioned in the job description.

Now answer the interviewer's question following this format.`;
  }

  initialize(apiKey, provider = 'openai') {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = apiKey;
    this.aiProvider = provider;

    if (provider === 'gemini') {
      this.gemini = new GoogleGenerativeAI(apiKey);
      console.log('✅ AI Service initialized with Google Gemini');
    } else {
      this.openai = new OpenAI({
        apiKey: apiKey
      });
      console.log('✅ AI Service initialized with OpenAI');
    }
  }

  isInitialized() {
    return this.openai !== null || this.gemini !== null;
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  async extractQuestionFromTranscript(transcript) {
    if (!this.isInitialized()) {
      throw new Error('AI Service not initialized');
    }

    try {
      let extractedQuestion;

      if (this.aiProvider === 'gemini') {
        const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const prompt = `You are a helpful assistant that extracts clear, concise questions from messy transcripts. Return ONLY the clean question, nothing else.

Extract the main question from this transcript:

${transcript}`;

        const result = await model.generateContent(prompt);
        extractedQuestion = result.response.text().trim();
      } else {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that extracts clear, concise questions from messy transcripts. Return ONLY the clean question, nothing else.'
            },
            {
              role: 'user',
              content: `Extract the main question from this transcript:\n\n${transcript}`
            }
          ],
          temperature: 0.3,
          max_tokens: 200
        });

        extractedQuestion = response.choices[0].message.content.trim();
      }

      console.log('✅ Question extracted:', extractedQuestion);
      return extractedQuestion;

    } catch (error) {
      console.error('❌ Error extracting question:', error);
      throw error;
    }
  }

  async analyzeScreenCapture(ocrText, context = {}) {
    if (!this.isInitialized()) {
      throw new Error('AI Service not initialized');
    }

    const { detectedLanguage, detectedPlatform, sourceName } = context;

    let prompt = `I captured this text from a coding screen:\n\n${ocrText}\n\n`;

    if (detectedPlatform) {
      prompt += `Platform: ${detectedPlatform}\n`;
    }

    if (detectedLanguage && detectedLanguage !== 'Unknown') {
      prompt += `Programming Language: ${detectedLanguage}\n`;
    }

    prompt += `\nPlease analyze this and provide:\n1. What problem is being asked\n2. The solution approach\n3. Complete code implementation`;

    try {
      // Use 'live_coding' mode to force programming assistant prompt
      return await this.askQuestion(prompt, false, 'live_coding');
    } catch (error) {
      console.error('❌ Error analyzing screen:', error);
      throw error;
    }
  }

  async generateResumeSummary(resumeText) {
    if (!this.isInitialized()) {
      throw new Error('AI Service not initialized');
    }

    try {
      console.log('📄 Generating resume summary...');

      const prompt = `Please provide a DETAILED and COMPREHENSIVE summary of the following resume. Include ALL relevant information.

**REQUIRED SECTIONS:**
1. **Professional Profile**: Current role, years of experience, expertise areas
2. **Work Experience**: ALL companies, positions, dates, and KEY responsibilities/achievements
3. **Technical Skills**: Complete list of programming languages, frameworks, databases, tools, platforms
4. **Education**: Degrees, institutions, years
5. **Certifications**: All certifications and training
6. **Projects**: Notable projects with technologies used
7. **Languages**: All spoken languages and proficiency levels

**IMPORTANT:**
- Extract EVERY technology, tool, framework mentioned
- Include ALL companies with FULL context
- Include ALL metrics and achievements
- Use bullet points for maximum clarity
- DO NOT summarize or condense - extract EVERYTHING

Resume:
${resumeText}`;

      let summary;

      if (this.aiProvider === 'gemini') {
        const model = this.gemini.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
          systemInstruction: 'You are an assistant that creates detailed, structured summaries of resumes for interview preparation.'
        });

        const result = await model.generateContent(prompt);
        summary = result.response.text().trim();
      } else {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an assistant that creates detailed, structured summaries of resumes for interview preparation.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 3000
        });

        summary = response.choices[0].message.content.trim();
      }

      console.log('✅ Resume summary generated:', summary.substring(0, 200) + '...');
      return summary;

    } catch (error) {
      console.error('❌ Error generating resume summary:', error);
      throw error;
    }
  }

  async generateJobSummary(jobDescription) {
    if (!this.isInitialized()) {
      throw new Error('AI Service not initialized');
    }

    try {
      console.log('💼 Generating job description summary...');

      const prompt = `Please provide a DETAILED and COMPREHENSIVE summary of the following job description. Include ALL relevant information.

**REQUIRED SECTIONS:**
1. **Position Overview**: Job title, level, employment type, location
2. **Company Information**: Company name, industry, size, culture
3. **Key Responsibilities**: ALL main duties and tasks
4. **Required Qualifications**: Education, years of experience, technical skills, soft skills
5. **Preferred Qualifications**: Nice-to-have skills, certifications
6. **Technical Stack**: Complete list of technologies, tools, databases, cloud platforms
7. **Benefits & Compensation**: Salary range, benefits, perks

**IMPORTANT:**
- Be VERY specific about technologies and tools
- Include ALL required and preferred qualifications
- Include metrics and expectations if mentioned
- Use bullet points for clarity

Job Description:
${jobDescription}`;

      let summary;

      if (this.aiProvider === 'gemini') {
        const model = this.gemini.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
          systemInstruction: 'You are an assistant that creates detailed, structured summaries of job descriptions for interview preparation.'
        });

        const result = await model.generateContent(prompt);
        summary = result.response.text().trim();
      } else {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an assistant that creates detailed, structured summaries of job descriptions for interview preparation.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        });

        summary = response.choices[0].message.content.trim();
      }

      console.log('✅ Job description summary generated:', summary.substring(0, 200) + '...');
      return summary;

    } catch (error) {
      console.error('❌ Error generating job description summary:', error);
      throw error;
    }
  }

  async warmup(resumeText, jobDescription) {
    if (!this.isInitialized()) {
      throw new Error('AI Service not initialized');
    }

    try {
      console.log('🔥 Starting warm-up process...');

      const results = {
        resumeSummary: null,
        jobSummary: null,
        success: true,
        errors: []
      };

      // Generate resume summary
      if (resumeText && resumeText.trim()) {
        try {
          results.resumeSummary = await this.generateResumeSummary(resumeText);
          console.log('✅ Resume summary ready');
        } catch (error) {
          console.error('❌ Resume summary failed:', error);
          results.errors.push(`Resume: ${error.message}`);
        }
      } else {
        console.log('⚠️  No resume text provided');
        results.resumeSummary = 'No resume provided';
      }

      // Generate job description summary
      if (jobDescription && jobDescription.trim()) {
        try {
          results.jobSummary = await this.generateJobSummary(jobDescription);
          console.log('✅ Job description summary ready');
        } catch (error) {
          console.error('❌ Job description summary failed:', error);
          results.errors.push(`Job: ${error.message}`);
        }
      } else {
        console.log('⚠️ No job description provided');
        results.jobSummary = 'No job description provided';
      }

      // Update interview context
      if (results.resumeSummary || results.jobSummary) {
        this.interviewContext = {
          resumeSummary: results.resumeSummary,
          jobSummary: results.jobSummary
        };
        console.log('💼 Interview context updated with summaries');
      }

      results.success = results.errors.length === 0;
      console.log('🔥 Warm-up completed!', results.success ? '✅' : '⚠️');

      return results;

    } catch (error) {
      console.error('❌ Warm-up failed:', error);
      throw error;
    }
  }

  async askQuestion(question, isScreenAnalysis = false, mode = 'interview') {
    if (!this.isInitialized()) {
      throw new Error('AI Service not initialized');
    }

    try {
      // Add question to history
      this.conversationHistory.push({
        role: 'user',
        content: question
      });

      // Keep history limited to last 20 messages
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      // Build system prompt based on mode
      let systemPrompt;

      if (mode === 'live_coding') {
        systemPrompt = `You are an expert programming assistant helping developers solve coding problems.

When answering questions, structure your response in this format:

**Intuition:**
Explain the problem conceptually and the key insight needed to solve it.

**Algorithm:**
Provide step-by-step approach to solve the problem.

**Implementation:**
Provide clean, well-commented code implementation.

Be concise but thorough. Focus on clarity and best practices.`;
      } else if (this.interviewContext && (this.interviewContext.resumeSummary || this.interviewContext.jobSummary)) {
        const { resumeSummary, jobSummary } = this.interviewContext;
        systemPrompt = this.buildSystemPrompt(question, resumeSummary, jobSummary);

        const detectedLang = this.detectLanguage(question);
        console.log(`🌍 Detected language: ${detectedLang}`);
      } else {
        systemPrompt = `You are a helpful interview assistant.

IMPORTANT: The user hasn't added their resume or job description yet.
Encourage them to:
1. Click on "Resume Builder" button
2. Add their CV and Job Description
3. Generate summaries to get personalized, context-aware interview responses

For now, provide a general answer, but remind them that adding their resume will give much better, personalized responses based on their actual experience.`;
      }

      this.emit('thinking', true);
      let fullResponse = '';

      if (this.aiProvider === 'gemini') {
        // Use Google Gemini
        console.log('🤖 Sending request to Google Gemini...');

        const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        // Build chat history for Gemini format
        const chatHistory = [];
        for (let i = 0; i < this.conversationHistory.length - 1; i++) {
          const msg = this.conversationHistory[i];
          chatHistory.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }

        const chat = model.startChat({
          history: chatHistory,
          systemInstruction: systemPrompt,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
          }
        });

        this.emit('response-start');

        // Stream response
        const result = await chat.sendMessageStream(question);

        for await (const chunk of result.stream) {
          const content = chunk.text();
          if (content) {
            fullResponse += content;
            this.emit('response-chunk', content);
          }
        }
      } else {
        // Use OpenAI
        console.log('🤖 Sending request to OpenAI...');

        const messages = [
          { role: 'system', content: systemPrompt },
          ...this.conversationHistory
        ];

        const stream = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1500,
          stream: true
        });

        this.emit('response-start');

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            this.emit('response-chunk', content);
          }
        }
      }

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: fullResponse
      });

      console.log('✅ Response complete');
      this.emit('response-complete', fullResponse);
      this.emit('thinking', false);

      return fullResponse;

    } catch (error) {
      console.error('❌ Error asking question:', error);
      this.emit('thinking', false);
      this.emit('error', error.message);
      throw error;
    }
  }

  async generateCodeExplanation(code, language) {
    if (!this.isInitialized()) {
      throw new Error('AI Service not initialized');
    }

    const prompt = `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

    try {
      return await this.askQuestion(prompt);
    } catch (error) {
      console.error('❌ Error explaining code:', error);
      throw error;
    }
  }

  async debugCode(code, language, errorMessage) {
    if (!this.isInitialized()) {
      throw new Error('AI Service not initialized');
    }

    const prompt = `I have a bug in my ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nError: ${errorMessage}\n\nPlease help me fix it.`;

    try {
      return await this.askQuestion(prompt);
    } catch (error) {
      console.error('❌ Error debugging code:', error);
      throw error;
    }
  }

  async optimizeCode(code, language) {
    if (!this.isInitialized()) {
      throw new Error('AI Service not initialized');
    }

    const prompt = `Optimize this ${language} code for better performance and readability:\n\n\`\`\`${language}\n${code}\n\`\`\``;

    try {
      return await this.askQuestion(prompt);
    } catch (error) {
      console.error('❌ Error optimizing code:', error);
      throw error;
    }
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  setSystemPrompt(prompt) {
    this.systemPrompt = prompt;
  }
}

module.exports = AIService;
