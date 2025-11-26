/**
 * Detects if the given text is a question based on patterns
 * Based on the working web project implementation
 * @param {string} text - The text to analyze
 * @returns {boolean} - True if text appears to be a question
 */
export function isQuestion(text) {
  if (!text || text.trim().length === 0) return false;

  // Remove speaker labels like [Interviewer]:, [You]:, etc.
  let cleanText = text.trim();
  cleanText = cleanText.replace(/^\[.*?\]:\s*/i, '').trim().toLowerCase();

  if (cleanText.length === 0) return false;

  // 1. Check if ends with question mark
  if (cleanText.endsWith('?')) {
    console.log('✅ Question detected (ends with ?):', text);
    return true;
  }

  // 2. Check for interview question indicators
  const interviewIndicators = [
    'next question', 'second question', 'third question', 'first question',
    'last question', 'final question', 'another question',
    'let\'s look at', 'let\'s move to', 'let\'s talk about',
    'let me ask', 'i want to ask', 'i\'d like to ask',
    'próxima pergunta', 'segunda pergunta', 'terceira pergunta',
    'vamos falar sobre', 'deixe-me perguntar',
    'prochaine question', 'deuxième question', 'parlons de'
  ];

  for (const indicator of interviewIndicators) {
    if (cleanText.includes(indicator)) {
      console.log('✅ Question detected (interview indicator:', indicator + '):', text);
      return true;
    }
  }

  // 3. Check for question keywords (multilingual)
  const questionKeywords = {
    // English
    en: ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can you', 'could you', 'would you',
         'do you', 'did you', 'have you', 'are you', 'is it', 'will you', 'should', 'tell me'],
    // Portuguese
    pt: ['o que', 'como', 'por que', 'porque', 'quando', 'onde', 'quem', 'qual', 'você pode',
         'pode', 'poderia', 'você já', 'já', 'me fale', 'me diga', 'explique'],
    // French
    fr: ['qu\'est-ce', 'comment', 'pourquoi', 'quand', 'où', 'qui', 'quel', 'quelle',
         'pouvez-vous', 'pourriez-vous', 'avez-vous', 'dites-moi', 'expliquez'],
    // Spanish
    es: ['qué', 'cómo', 'por qué', 'cuándo', 'dónde', 'quién', 'cuál', 'puedes', 'puede',
         'podrías', 'has', 'eres', 'dime', 'explica']
  };

  // Flatten all keywords into one array
  const allKeywords = Object.values(questionKeywords).flat();

  // Check if text starts with any question keyword
  for (const keyword of allKeywords) {
    if (cleanText.startsWith(keyword + ' ') || cleanText.startsWith(keyword)) {
      console.log('✅ Question detected (keyword:', keyword + '):', text);
      return true;
    }
  }

  // 4. Additional pattern: "tell me about", "explain", "describe"
  const questionPhrases = ['tell me', 'explain', 'describe', 'walk me through',
                            'me fale sobre', 'explique', 'descreva',
                            'dites-moi', 'décrivez', 'dime sobre', 'describe'];

  for (const phrase of questionPhrases) {
    if (cleanText.includes(phrase)) {
      console.log('✅ Question detected (phrase:', phrase + '):', text);
      return true;
    }
  }

  return false;
}
