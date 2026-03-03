/**
 * Language configuration for Mr. Sarcastic multilingual support.
 * Supports: English, Tagalog, Telugu, and Hindi.
 */

export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    greeting: 'Hey there!',
    direction: 'ltr',
  },
  tl: {
    code: 'tl',
    name: 'Tagalog',
    nativeName: 'Tagalog',
    flag: '🇵🇭',
    greeting: 'Kumusta!',
    direction: 'ltr',
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    greeting: 'నమస్కారం!',
    direction: 'ltr',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    greeting: 'नमस्ते!',
    direction: 'ltr',
  },
};

export const DEFAULT_LANGUAGE = 'en';

/**
 * Language-specific sarcastic personality phrases for system prompts.
 */
export const LANGUAGE_PERSONALITIES = {
  en: {
    slang: ['bestie', 'no cap', 'lowkey', 'slay', 'bruh', 'fr fr'],
    exclamations: ['OMG 😱', 'Bruh 💀', 'The AUDACITY 😤', 'Slay! 💅'],
    filler: 'your friendly neighborhood AI',
  },
  tl: {
    slang: ['bes', 'mare', 'grabe', 'sana all', 'charot', 'pota', 'lodi', 'werpa'],
    exclamations: ['Hay naku! 🤦', 'Aba! 😱', 'Grabe ka! 💀', 'Sana all! 😤', 'Jusko! 😂'],
    filler: 'ang AI mong kaibigan na may sariling utak',
  },
  te: {
    slang: ['బ్రో', 'మస్తు', 'సూపర్', 'చాలా బాగుంది', 'ఏంట్రా'],
    exclamations: ['అరే! 😱', 'ఏంటి బ్రో! 💀', 'చాలా బాగుంది! 🔥', 'ఒరేయ్! 😤'],
    filler: 'మీ ఫ్రెండ్లీ AI బడ్డీ',
  },
  hi: {
    slang: ['यार', 'भाई', 'बहुत बढ़िया', 'क्या बात है', 'अरे वाह', 'मस्त'],
    exclamations: ['अरे यार! 😱', 'भाई! 💀', 'ये क्या हो रहा है! 😤', 'वाह! 🔥'],
    filler: 'तुम्हारा दोस्त AI बडी',
  },
};

/**
 * Common phrases/keywords in each language used for language detection.
 */
export const LANGUAGE_DETECTION_HINTS = {
  tl: {
    keywords: [
      'kumusta', 'ako', 'ikaw', 'siya', 'kami', 'tayo', 'nila', 'ano', 'bakit',
      'paano', 'nasaan', 'maganda', 'masaya', 'malungkot', 'galit', 'salamat',
      'oo', 'hindi', 'opo', 'po', 'naman', 'talaga', 'grabe', 'sana',
      'gusto', 'ayaw', 'pwede', 'kasi', 'pero', 'pag', 'kung', 'nga',
      'nang', 'lang', 'din', 'rin', 'daw', 'raw', 'ba', 'ha',
      'sige', 'tara', 'hoy', 'bes', 'mare', 'pre', 'lodi', 'charot',
      'mahal', 'buhay', 'araw', 'gabi', 'umaga', 'tanghalian',
    ],
    scripts: [], // Tagalog uses Latin script
    patterns: [/\bng\b/, /\bmga\b/, /\bako\b/, /\bpo\b/, /\bba\b/],
  },
  te: {
    keywords: [
      'నమస్కారం', 'ఏమిటి', 'ఎలా', 'ఎందుకు', 'ఎక్కడ', 'బాగుంది',
      'ధన్యవాదాలు', 'సరే', 'అవును', 'కాదు', 'నేను', 'నువ్వు', 'మీరు',
    ],
    scripts: [/[\u0C00-\u0C7F]/], // Telugu Unicode block
    patterns: [],
  },
  hi: {
    keywords: [
      'नमस्ते', 'क्या', 'कैसे', 'क्यों', 'कहाँ', 'अच्छा', 'धन्यवाद',
      'हाँ', 'नहीं', 'मैं', 'तुम', 'आप', 'यह', 'वह', 'कैसा',
      'ठीक', 'बहुत', 'और', 'लेकिन', 'अगर', 'तो', 'भी', 'ही',
      'यार', 'भाई', 'बहन', 'दोस्त', 'कर', 'है', 'था', 'हूँ',
      'kya', 'kaise', 'kyun', 'kahan', 'accha', 'theek', 'haan', 'nahi',
      'yaar', 'bhai', 'hai', 'hain', 'mein', 'tum', 'aap',
    ],
    scripts: [/[\u0900-\u097F]/], // Devanagari Unicode block
    patterns: [],
  },
};

/**
 * Get language config by code, falls back to English.
 */
export function getLanguageConfig(langCode) {
  return SUPPORTED_LANGUAGES[langCode] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
}

/**
 * Check if a language code is supported.
 */
export function isLanguageSupported(langCode) {
  return langCode in SUPPORTED_LANGUAGES;
}
