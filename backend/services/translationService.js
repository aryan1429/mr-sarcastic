/**
 * Translation & multilingual response service for Mr. Sarcastic.
 * Provides language-aware prompt generation and response formatting.
 * 
 * Uses Groq LLM for dynamic translation when needed, and pre-built
 * templates for common UI strings and greetings.
 */

import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_PERSONALITIES,
  DEFAULT_LANGUAGE,
  getLanguageConfig,
} from '../config/languages.js';

/**
 * Common UI strings translated into all supported languages.
 */
const UI_STRINGS = {
  en: {
    welcome: "Hey there! I'm Mr Sarcastic, your friendly neighborhood AI with a sense of humor and a love for good music. What's on your mind today?",
    thinking: "Mr. Sarcastic is thinking of something witty...",
    error: "Oops! Something went wrong with my sarcasm circuits. Try again!",
    moodChanged: "Mood Changed!",
    chatCleared: "Chat Cleared",
    songPick: "Song Pick for you",
    recommendedSong: "Recommended Song",
    playNow: "Play Now",
    songsPage: "Songs Page",
    changeLanguage: "Change Language",
    changeMood: "Change Mood",
    currentMood: "Current Mood",
    typeMessage: "Type your message here...",
  },
  tl: {
    welcome: "Uy, kumusta! Ako si Mr. Sarcastic, ang AI mong kaibigan na may sariling utak at pagmamahal sa magandang musika. Anong nasa isip mo ngayon? 😏",
    thinking: "Nag-iisip si Mr. Sarcastic ng nakakatawang sagot...",
    error: "Ay! May nasira sa sarcasm circuits ko. Subukan mo ulit!",
    moodChanged: "Binago ang Mood!",
    chatCleared: "Na-clear ang Chat",
    songPick: "Kanta para sa'yo",
    recommendedSong: "Inirerekomendang Kanta",
    playNow: "I-play Ngayon",
    songsPage: "Pahina ng mga Kanta",
    changeLanguage: "Palitan ang Wika",
    changeMood: "Palitan ang Mood",
    currentMood: "Kasalukuyang Mood",
    typeMessage: "I-type ang iyong mensahe dito...",
  },
  te: {
    welcome: "హాయ్! నేను Mr. Sarcastic ని, మీ ఫ్రెండ్లీ AI బడ్డీ. హాస్యం మరియు మంచి సంగీతం అంటే నాకు చాలా ఇష్టం. ఈ రోజు ఏమి చెప్పాలనుకుంటున్నారు? 😏",
    thinking: "Mr. Sarcastic ఏదో తమాషా ఆలోచిస్తున్నాడు...",
    error: "అయ్యో! నా sarcasm circuits లో ఏదో తేడా వచ్చింది. మళ్ళీ ప్రయత్నించండి!",
    moodChanged: "మూడ్ మార్చబడింది!",
    chatCleared: "చాట్ క్లియర్ చేయబడింది",
    songPick: "మీ కోసం పాట",
    recommendedSong: "సిఫార్సు చేసిన పాట",
    playNow: "ఇప్పుడు ప్లే చేయండి",
    songsPage: "పాటల పేజీ",
    changeLanguage: "భాష మార్చండి",
    changeMood: "మూడ్ మార్చండి",
    currentMood: "ప్రస్తుత మూడ్",
    typeMessage: "మీ సందేశాన్ని ఇక్కడ టైప్ చేయండి...",
  },
  hi: {
    welcome: "अरे, नमस्ते! मैं Mr. Sarcastic हूँ, तुम्हारा दोस्त AI जिसे हास्य और अच्छे संगीत से प्यार है। आज क्या चल रहा है? 😏",
    thinking: "Mr. Sarcastic कुछ मज़ेदार सोच रहा है...",
    error: "अरे! मेरे sarcasm circuits में कुछ गड़बड़ हो गई। फिर से कोशिश करो!",
    moodChanged: "मूड बदल गया!",
    chatCleared: "चैट साफ़ हो गई",
    songPick: "तुम्हारे लिए गाना",
    recommendedSong: "सुझाया गया गाना",
    playNow: "अभी चलाओ",
    songsPage: "गानों का पेज",
    changeLanguage: "भाषा बदलो",
    changeMood: "मूड बदलो",
    currentMood: "अभी का मूड",
    typeMessage: "अपना संदेश यहाँ टाइप करो...",
  },
};

/**
 * Get a translated UI string.
 * @param {string} key - The string key
 * @param {string} langCode - Language code
 * @returns {string}
 */
export function getUIString(key, langCode = DEFAULT_LANGUAGE) {
  const strings = UI_STRINGS[langCode] || UI_STRINGS[DEFAULT_LANGUAGE];
  return strings[key] || UI_STRINGS[DEFAULT_LANGUAGE][key] || key;
}

/**
 * Get all UI strings for a language (used by frontend).
 * @param {string} langCode
 * @returns {object}
 */
export function getAllUIStrings(langCode = DEFAULT_LANGUAGE) {
  return UI_STRINGS[langCode] || UI_STRINGS[DEFAULT_LANGUAGE];
}

/**
 * Build a language instruction block to inject into the Groq system prompt.
 * This tells the LLM what language to respond in and how.
 *
 * @param {string} langCode - Target language code
 * @param {boolean} autoDetected - Whether the language was auto-detected
 * @returns {string}
 */
export function buildLanguagePrompt(langCode, autoDetected = false) {
  if (langCode === DEFAULT_LANGUAGE) {
    return ''; // No extra instructions needed for English
  }

  const langConfig = getLanguageConfig(langCode);
  const personality = LANGUAGE_PERSONALITIES[langCode];

  if (!langConfig || !personality) {
    return '';
  }

  const slangExamples = personality.slang.join(', ');
  const exclamationExamples = personality.exclamations.join(', ');

  return `

🌐 LANGUAGE INSTRUCTION — CRITICAL:
The user is communicating in **${langConfig.name} (${langConfig.nativeName})**.
You MUST respond ENTIRELY in **${langConfig.name}**.

LANGUAGE RULES:
- Write your ENTIRE response in ${langConfig.name}
- Use natural, conversational ${langConfig.name} — not overly formal or textbook-style
- Incorporate popular ${langConfig.name} slang and expressions: ${slangExamples}
- Use culturally appropriate exclamations: ${exclamationExamples}
- Keep your sarcastic personality but adapt it to ${langConfig.name} culture
- If the user mixes ${langConfig.name} with English (code-switching), you can do the same naturally
- Do NOT translate word-by-word from English — speak like a NATIVE ${langConfig.name} speaker
- ${personality.filler} — that's who you are in ${langConfig.name}!
${autoDetected ? `- The language was auto-detected from the user's message, so match their language style` : `- The user has explicitly chosen ${langConfig.name}, so respond in it consistently`}

NOW RESPOND IN ${langConfig.name.toUpperCase()}:`;
}

/**
 * Get mood-specific text in the target language.
 * Used for song recommendations and UI feedback.
 *
 * @param {string} mood
 * @param {string} langCode
 * @returns {string}
 */
export function getMoodTextInLanguage(mood, langCode) {
  const moodTexts = {
    en: {
      sad: "feeling a bit down, so here's a track that gets it 🥺",
      happy: "in a good mood! Here's an upbeat banger to keep it going 🎉",
      angry: "feeling some rage — channel that energy into this 🔥",
      energetic: "PUMPED UP! Here's a high-energy track 💪",
      chill: "wanting to relax — here's a smooth vibe ✌️",
      neutral: "in the mood for some music",
    },
    tl: {
      sad: "medyo malungkot, kaya eto isang kanta na naiintindihan ka 🥺",
      happy: "masaya ngayon! Eto isang upbeat na kanta para tuloy-tuloy ang good vibes 🎉",
      angry: "galit ngayon — i-channel mo yang energy sa kantang 'to 🔥",
      energetic: "SOBRANG HYPER! Eto isang high-energy track 💪",
      chill: "gusto mag-relax — eto smooth na kanta para sa'yo ✌️",
      neutral: "trip mag-music ngayon",
    },
    te: {
      sad: "కొంచెం బాధగా ఉంది, అందుకే ఈ పాట 🥺",
      happy: "బాగా హ్యాపీగా ఉంది! ఈ పాట వినండి 🎉",
      angry: "కోపంగా ఉంది — ఈ energy ని ఈ పాటలో పెట్టు 🔥",
      energetic: "చాలా ENERGETIC! ఈ high-energy track 💪",
      chill: "relax అవ్వాలనుంది — ఈ smooth vibe ✌️",
      neutral: "music mood లో ఉన్నావ్",
    },
    hi: {
      sad: "थोड़ा उदास लग रहा है, ये गाना सुनो 🥺",
      happy: "बहुत खुश हो! ये upbeat गाना सुनो 🎉",
      angry: "गुस्सा आ रहा है — ये energy इस गाने में डालो 🔥",
      energetic: "बहुत PUMPED हो! ये high-energy track सुनो 💪",
      chill: "relax करना है — ये smooth vibe सुनो ✌️",
      neutral: "music सुनने का मन है",
    },
  };

  const langMoods = moodTexts[langCode] || moodTexts[DEFAULT_LANGUAGE];
  return langMoods[mood] || langMoods['neutral'] || moodTexts[DEFAULT_LANGUAGE]['neutral'];
}

/**
 * Format a song recommendation message in the target language.
 *
 * @param {object} song - Song object
 * @param {string} mood - Detected mood
 * @param {string} langCode - Target language
 * @returns {string}
 */
export function formatSongRecommendationInLanguage(song, mood, langCode) {
  const moodText = getMoodTextInLanguage(mood, langCode);

  const templates = {
    en: `🎵 **Song Pick for you:** "${song.title}" by ${song.artist}\n⏱️ Duration: ${song.duration} | 🎭 Mood: ${song.mood}`,
    tl: `🎵 **Kanta para sa'yo:** "${song.title}" ni ${song.artist}\n⏱️ Tagal: ${song.duration} | 🎭 Mood: ${song.mood}`,
    te: `🎵 **మీ కోసం పాట:** "${song.title}" - ${song.artist}\n⏱️ వ్యవధి: ${song.duration} | 🎭 మూడ్: ${song.mood}`,
    hi: `🎵 **तुम्हारे लिए गाना:** "${song.title}" - ${song.artist}\n⏱️ अवधि: ${song.duration} | 🎭 मूड: ${song.mood}`,
  };

  return templates[langCode] || templates[DEFAULT_LANGUAGE];
}

export default {
  getUIString,
  getAllUIStrings,
  buildLanguagePrompt,
  getMoodTextInLanguage,
  formatSongRecommendationInLanguage,
};
