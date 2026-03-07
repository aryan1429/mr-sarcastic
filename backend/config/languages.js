/**
 * Language configuration for Mr. Sarcastic multilingual support.
 * Supports: English, Tagalog, Telugu, Hindi, Spanish, French, German, Portuguese,
 * Japanese, Korean, Arabic, Russian, Chinese (Mandarin), and Italian.
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
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    greeting: '¡Hola!',
    direction: 'ltr',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    greeting: 'Salut!',
    direction: 'ltr',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    greeting: 'Hallo!',
    direction: 'ltr',
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    greeting: 'Olá!',
    direction: 'ltr',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    greeting: 'やあ！',
    direction: 'ltr',
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    greeting: '안녕!',
    direction: 'ltr',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    greeting: '!أهلاً',
    direction: 'rtl',
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    greeting: 'Привет!',
    direction: 'ltr',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    greeting: '你好！',
    direction: 'ltr',
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    greeting: 'Ciao!',
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
  es: {
    slang: ['tío', 'tía', 'mola', 'guay', 'flipar', 'qué fuerte', 'mazo', 'pana'],
    exclamations: ['¡Madre mía! 😱', '¡No me digas! 💀', '¡Qué fuerte! 😤', '¡Vaya! 🔥'],
    filler: 'tu colega IA con actitud',
  },
  fr: {
    slang: ['mec', 'meuf', 'grave', 'trop bien', 'ouf', 'chanmé', 'stylé', 'kiffer'],
    exclamations: ['Oh là là! 😱', 'Trop fort! 💀', 'C\'est abusé! 😤', 'Grave! 🔥'],
    filler: 'ton pote IA avec du caractère',
  },
  de: {
    slang: ['Alter', 'krass', 'geil', 'Digga', 'Bock', 'mega', 'nice', 'Ehrenmann'],
    exclamations: ['Alter! 😱', 'Krass! 💀', 'Echt jetzt?! 😤', 'Mega! 🔥'],
    filler: 'dein freundlicher KI-Kumpel',
  },
  pt: {
    slang: ['mano', 'cara', 'massa', 'top', 'show', 'firmeza', 'tá ligado', 'véi'],
    exclamations: ['Caramba! 😱', 'Eita! 💀', 'Que absurdo! 😤', 'Demais! 🔥'],
    filler: 'seu parceiro IA com atitude',
  },
  ja: {
    slang: ['マジ', 'やばい', 'すごい', 'ウケる', 'エモい', 'それな', 'わろた'],
    exclamations: ['マジで?! 😱', 'やばっ! 💀', 'ちょっと! 😤', 'すげー! 🔥'],
    filler: '君のフレンドリーAIバディ',
  },
  ko: {
    slang: ['대박', '헐', '레알', '갓', 'ㅋㅋㅋ', '존맛', '인정', '찐'],
    exclamations: ['헐! 😱', '대박! 💀', '진짜?! 😤', '미쳤다! 🔥'],
    filler: '너의 친한 AI 친구',
  },
  ar: {
    slang: ['يا زلمة', 'والله', 'يا سلام', 'خلص', 'يلا', 'حبيبي', 'أخوي'],
    exclamations: ['يا إلهي! 😱', 'مش معقول! 💀', 'والله العظيم! 😤', 'ياسلام! 🔥'],
    filler: 'صديقك الذكي الاصطناعي',
  },
  ru: {
    slang: ['чувак', 'круто', 'жесть', 'кайф', 'огонь', 'зашибись', 'братан'],
    exclamations: ['Ого! 😱', 'Жесть! 💀', 'Серьёзно?! 😤', 'Огонь! 🔥'],
    filler: 'твой дружелюбный ИИ-приятель',
  },
  zh: {
    slang: ['兄弟', '牛逼', '厉害', '绝了', '666', '真的假的', '太秀了'],
    exclamations: ['天哪! 😱', '绝了! 💀', '不是吧?! 😤', '太强了! 🔥'],
    filler: '你的AI好朋友',
  },
  it: {
    slang: ['amico', 'bello', 'figo', 'mitico', 'dai', 'cavolo', 'ammazza'],
    exclamations: ['Madonna! 😱', 'Assurdo! 💀', 'Ma dai! 😤', 'Che figata! 🔥'],
    filler: 'il tuo amico IA con carattere',
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
  es: {
    keywords: [
      'hola', 'gracias', 'por favor', 'cómo', 'qué', 'dónde', 'cuándo', 'quién',
      'bueno', 'malo', 'bien', 'estoy', 'tengo', 'quiero', 'puedo', 'necesito',
      'amigo', 'hermano', 'también', 'pero', 'porque', 'entonces', 'siempre',
      'nunca', 'mucho', 'poco', 'todo', 'nada', 'algo', 'alguien',
    ],
    scripts: [],
    patterns: [/¿/, /¡/, /\bño\b/, /\bción\b/],
  },
  fr: {
    keywords: [
      'bonjour', 'salut', 'merci', 'comment', 'pourquoi', 'quoi', 'je suis',
      'oui', 'non', 'très', 'bien', 'mal', 'avec', 'sans', 'dans',
      'aussi', 'mais', 'parce que', 'alors', 'toujours', 'jamais', 'beaucoup',
      'peu', 'tout', 'rien', 'quelque', "c'est", "j'ai", 'est-ce que',
    ],
    scripts: [],
    patterns: [/\bqu'/, /\bl'/, /\bd'/, /\bje\s/, /\bne\s.*\bpas\b/],
  },
  de: {
    keywords: [
      'hallo', 'danke', 'bitte', 'wie', 'was', 'wo', 'wann', 'warum',
      'gut', 'schlecht', 'ich', 'bin', 'habe', 'kann', 'muss', 'will',
      'auch', 'aber', 'weil', 'dann', 'immer', 'nie', 'viel', 'wenig',
      'alles', 'nichts', 'jemand', 'niemand', 'nein', 'ja', 'doch',
    ],
    scripts: [],
    patterns: [/\bich\b/, /\bein\b/, /\bdie\b/, /\bder\b/, /\bdas\b/, /ß/],
  },
  pt: {
    keywords: [
      'olá', 'obrigado', 'obrigada', 'por favor', 'como', 'que', 'onde', 'quando',
      'bom', 'mau', 'bem', 'estou', 'tenho', 'quero', 'posso', 'preciso',
      'amigo', 'irmão', 'também', 'mas', 'porque', 'então', 'sempre',
      'nunca', 'muito', 'pouco', 'tudo', 'nada', 'alguém', 'ninguém',
    ],
    scripts: [],
    patterns: [/\bção\b/, /\bões\b/, /ã/, /õ/, /\beu\s/],
  },
  ja: {
    keywords: [
      'こんにちは', 'ありがとう', 'はい', 'いいえ', 'すみません', 'おはよう',
      'さようなら', 'お願い', 'わたし', 'あなた', 'なに', 'どこ', 'いつ',
      'なぜ', 'どう', 'すごい', 'やばい', 'かわいい', 'おもしろい',
    ],
    scripts: [/[\u3040-\u309F]/, /[\u30A0-\u30FF]/, /[\u4E00-\u9FFF]/], // Hiragana, Katakana, Kanji
    patterns: [],
  },
  ko: {
    keywords: [
      '안녕하세요', '감사합니다', '네', '아니요', '죄송합니다', '뭐',
      '어디', '언제', '왜', '어떻게', '좋아', '싫어', '대박', '헐',
    ],
    scripts: [/[\uAC00-\uD7AF]/, /[\u1100-\u11FF]/], // Hangul syllables and Jamo
    patterns: [],
  },
  ar: {
    keywords: [
      'مرحبا', 'شكرا', 'من فضلك', 'كيف', 'ماذا', 'أين', 'متى', 'لماذا',
      'نعم', 'لا', 'أنا', 'أنت', 'هو', 'هي', 'جيد', 'سيء',
      'أهلا', 'سلام', 'حبيبي', 'يلا', 'إن شاء الله', 'الحمد لله',
    ],
    scripts: [/[\u0600-\u06FF]/], // Arabic Unicode block
    patterns: [],
  },
  ru: {
    keywords: [
      'привет', 'спасибо', 'пожалуйста', 'как', 'что', 'где', 'когда', 'почему',
      'да', 'нет', 'я', 'ты', 'он', 'она', 'хорошо', 'плохо',
      'здравствуйте', 'до свидания', 'братан', 'круто', 'класс',
    ],
    scripts: [/[\u0400-\u04FF]/], // Cyrillic Unicode block
    patterns: [],
  },
  zh: {
    keywords: [
      '你好', '谢谢', '请', '怎么', '什么', '哪里', '什么时候', '为什么',
      '是', '不是', '我', '你', '他', '她', '好', '不好',
      '太好了', '厉害', '兄弟', '朋友',
    ],
    scripts: [/[\u4E00-\u9FFF]/], // CJK Unified Ideographs
    patterns: [],
  },
  it: {
    keywords: [
      'ciao', 'grazie', 'per favore', 'come', 'cosa', 'dove', 'quando', 'perché',
      'buono', 'cattivo', 'bene', 'sono', 'ho', 'voglio', 'posso', 'devo',
      'amico', 'fratello', 'anche', 'ma', 'perché', 'allora', 'sempre',
      'mai', 'molto', 'poco', 'tutto', 'niente', 'qualcuno', 'nessuno',
    ],
    scripts: [],
    patterns: [/\bche\b/, /\bnon\b/, /\bè\b/, /\bdel\b/, /\bdella\b/],
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
