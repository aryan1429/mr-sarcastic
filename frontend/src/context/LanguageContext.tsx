import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Supported languages configuration (mirrors backend config).
 */
export const SUPPORTED_LANGUAGES = {
  auto: {
    code: 'auto',
    name: 'Auto-Detect',
    nativeName: 'Auto',
    flag: '🌐',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  tl: {
    code: 'tl',
    name: 'Tagalog',
    nativeName: 'Tagalog',
    flag: '🇵🇭',
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
  },
};

/**
 * UI strings for each language (used client-side).
 */
const UI_STRINGS = {
  en: {
    welcome: "Hey there! I'm Mr Sarcastic, your friendly neighborhood AI with a sense of humor and a love for good music. What's on your mind today?",
    thinking: "Mr. Sarcastic is thinking of something witty...",
    error: "Oops! Something went wrong with my sarcasm circuits. Try again!",
    typeMessage: "Type your message here...",
    changeLanguage: "Change Language",
    changeMood: "Change Mood",
    currentMood: "Current Mood",
    clearChat: "Clear Chat History",
    browseSongs: "Browse Songs",
    chatTitle: "Chat with Mr Sarcastic",
    quickPlay: "Quick Play by Mood",
    quickActions: "Quick Actions",
    moodChanged: "Mood Changed!",
    chatCleared: "Chat Cleared",
    playNow: "Play Now",
    songsPage: "Songs Page",
    recommendedSong: "Recommended Song",
    loading: "Loading...",
    preparing: "Preparing your experience",
  },
  tl: {
    welcome: "Uy, kumusta! Ako si Mr. Sarcastic, ang AI mong kaibigan na may sariling utak at pagmamahal sa magandang musika. Anong nasa isip mo ngayon? 😏",
    thinking: "Nag-iisip si Mr. Sarcastic ng nakakatawang sagot...",
    error: "Ay! May nasira sa sarcasm circuits ko. Subukan mo ulit!",
    typeMessage: "I-type ang iyong mensahe dito...",
    changeLanguage: "Palitan ang Wika",
    changeMood: "Palitan ang Mood",
    currentMood: "Kasalukuyang Mood",
    clearChat: "I-clear ang Chat History",
    browseSongs: "Mag-browse ng mga Kanta",
    chatTitle: "Chat kasama si Mr Sarcastic",
    quickPlay: "Quick Play ayon sa Mood",
    quickActions: "Quick Actions",
    moodChanged: "Binago ang Mood!",
    chatCleared: "Na-clear ang Chat",
    playNow: "I-play Ngayon",
    songsPage: "Pahina ng mga Kanta",
    recommendedSong: "Inirerekomendang Kanta",
    loading: "Naglo-load...",
    preparing: "Ihinahanda ang iyong experience",
  },
  te: {
    welcome: "హాయ్! నేను Mr. Sarcastic ని, మీ ఫ్రెండ్లీ AI బడ్డీ. హాస్యం మరియు మంచి సంగీతం అంటే నాకు చాలా ఇష్టం. ఈ రోజు ఏమి చెప్పాలనుకుంటున్నారు? 😏",
    thinking: "Mr. Sarcastic ఏదో తమాషా ఆలోచిస్తున్నాడు...",
    error: "అయ్యో! నా sarcasm circuits లో ఏదో తేడా వచ్చింది. మళ్ళీ ప్రయత్నించండి!",
    typeMessage: "మీ సందేశాన్ని ఇక్కడ టైప్ చేయండి...",
    changeLanguage: "భాష మార్చండి",
    changeMood: "మూడ్ మార్చండి",
    currentMood: "ప్రస్తుత మూడ్",
    clearChat: "చాట్ హిస్టరీ క్లియర్ చేయండి",
    browseSongs: "పాటలు బ్రౌజ్ చేయండి",
    chatTitle: "Mr Sarcastic తో చాట్",
    quickPlay: "మూడ్ ప్రకారం Quick Play",
    quickActions: "Quick Actions",
    moodChanged: "మూడ్ మార్చబడింది!",
    chatCleared: "చాట్ క్లియర్ చేయబడింది",
    playNow: "ఇప్పుడు ప్లే చేయండి",
    songsPage: "పాటల పేజీ",
    recommendedSong: "సిఫార్సు చేసిన పాట",
    loading: "లోడ్ అవుతోంది...",
    preparing: "మీ experience తయారు చేస్తున్నాం",
  },
  hi: {
    welcome: "अरे, नमस्ते! मैं Mr. Sarcastic हूँ, तुम्हारा दोस्त AI जिसे हास्य और अच्छे संगीत से प्यार है। आज क्या चल रहा है? 😏",
    thinking: "Mr. Sarcastic कुछ मज़ेदार सोच रहा है...",
    error: "अरे! मेरे sarcasm circuits में कुछ गड़बड़ हो गई। फिर से कोशिश करो!",
    typeMessage: "अपना संदेश यहाँ टाइप करो...",
    changeLanguage: "भाषा बदलो",
    changeMood: "मूड बदलो",
    currentMood: "अभी का मूड",
    clearChat: "चैट हिस्ट्री साफ़ करो",
    browseSongs: "गाने ब्राउज़ करो",
    chatTitle: "Mr Sarcastic से चैट",
    quickPlay: "मूड के अनुसार Quick Play",
    quickActions: "Quick Actions",
    moodChanged: "मूड बदल गया!",
    chatCleared: "चैट साफ़ हो गई",
    playNow: "अभी चलाओ",
    songsPage: "गानों का पेज",
    recommendedSong: "सुझाया गया गाना",
    loading: "लोड हो रहा है...",
    preparing: "तुम्हारा experience तैयार कर रहे हैं",
  },
};

const LANGUAGE_STORAGE_KEY = 'mr-sarcastic-language';

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'auto';
    } catch {
      return 'auto';
    }
  });

  // Persist language selection
  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }, [language]);

  const setLanguage = useCallback((langCode) => {
    if (langCode in SUPPORTED_LANGUAGES) {
      setLanguageState(langCode);
    }
  }, []);

  /**
   * Get a UI string in the current language.
   * For 'auto' mode, falls back to English for UI elements.
   */
  const t = useCallback((key) => {
    const effectiveLang = language === 'auto' ? 'en' : language;
    const strings = UI_STRINGS[effectiveLang] || UI_STRINGS['en'];
    return strings[key] || UI_STRINGS['en'][key] || key;
  }, [language]);

  /**
   * Get the current language config object.
   */
  const currentLanguage = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES['auto'];

  /**
   * Get all supported languages as an array.
   */
  const languageOptions = Object.values(SUPPORTED_LANGUAGES);

  const value = {
    language,
    setLanguage,
    currentLanguage,
    languageOptions,
    t,
    isAutoDetect: language === 'auto',
    SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
