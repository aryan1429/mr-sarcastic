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
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
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
  es: {
    welcome: "¡Ey, qué tal! Soy Mr. Sarcastic, tu IA colega con sentido del humor y buen gusto musical. ¿Qué tienes en mente? 😏",
    thinking: "Mr. Sarcastic está pensando algo ingenioso...",
    error: "¡Ups! Algo falló en mis circuitos. ¡Inténtalo de nuevo!",
    typeMessage: "Escribe tu mensaje aquí...",
    changeLanguage: "Cambiar idioma",
    changeMood: "Cambiar humor",
    currentMood: "Humor actual",
    clearChat: "Borrar historial",
    browseSongs: "Explorar canciones",
    chatTitle: "Chat con Mr Sarcastic",
    quickPlay: "Reproducción rápida",
    quickActions: "Acciones rápidas",
    moodChanged: "¡Humor cambiado!",
    chatCleared: "Chat borrado",
    playNow: "Reproducir ahora",
    songsPage: "Canciones",
    recommendedSong: "Canción recomendada",
    loading: "Cargando...",
    preparing: "Preparando tu experiencia",
  },
  fr: {
    welcome: "Salut ! Je suis Mr. Sarcastic, ton pote IA avec de l'humour et un goût musical de ouf. Quoi de neuf ? 😏",
    thinking: "Mr. Sarcastic cherche une réponse stylée...",
    error: "Oups ! Un bug dans mes circuits. Réessaie !",
    typeMessage: "Tape ton message ici...",
    changeLanguage: "Changer la langue",
    changeMood: "Changer l'humeur",
    currentMood: "Humeur actuelle",
    clearChat: "Effacer l'historique",
    browseSongs: "Parcourir les chansons",
    chatTitle: "Chat avec Mr Sarcastic",
    quickPlay: "Lecture rapide",
    quickActions: "Actions rapides",
    moodChanged: "Humeur changée !",
    chatCleared: "Chat effacé",
    playNow: "Écouter maintenant",
    songsPage: "Chansons",
    recommendedSong: "Chanson recommandée",
    loading: "Chargement...",
    preparing: "Préparation de ton expérience",
  },
  de: {
    welcome: "Hey! Ich bin Mr. Sarcastic, dein KI-Kumpel mit Humor und gutem Musikgeschmack. Was geht? 😏",
    thinking: "Mr. Sarcastic denkt sich was Witziges aus...",
    error: "Ups! Da ist was schiefgelaufen. Versuch's nochmal!",
    typeMessage: "Schreib deine Nachricht hier...",
    changeLanguage: "Sprache ändern",
    changeMood: "Stimmung ändern",
    currentMood: "Aktuelle Stimmung",
    clearChat: "Chatverlauf löschen",
    browseSongs: "Songs durchsuchen",
    chatTitle: "Chat mit Mr Sarcastic",
    quickPlay: "Schnellwiedergabe",
    quickActions: "Schnellaktionen",
    moodChanged: "Stimmung geändert!",
    chatCleared: "Chat gelöscht",
    playNow: "Jetzt abspielen",
    songsPage: "Songs",
    recommendedSong: "Empfohlener Song",
    loading: "Wird geladen...",
    preparing: "Dein Erlebnis wird vorbereitet",
  },
  pt: {
    welcome: "E aí! Sou o Mr. Sarcastic, seu parceiro IA com humor e bom gosto musical. O que tá pegando? 😏",
    thinking: "Mr. Sarcastic tá pensando em algo esperto...",
    error: "Eita! Algo deu errado. Tenta de novo!",
    typeMessage: "Digite sua mensagem aqui...",
    changeLanguage: "Mudar idioma",
    changeMood: "Mudar humor",
    currentMood: "Humor atual",
    clearChat: "Limpar histórico",
    browseSongs: "Explorar músicas",
    chatTitle: "Chat com Mr Sarcastic",
    quickPlay: "Reprodução rápida",
    quickActions: "Ações rápidas",
    moodChanged: "Humor mudou!",
    chatCleared: "Chat limpo",
    playNow: "Tocar agora",
    songsPage: "Músicas",
    recommendedSong: "Música recomendada",
    loading: "Carregando...",
    preparing: "Preparando sua experiência",
  },
  ja: {
    welcome: "やあ！僕はMr. Sarcastic、ユーモアと音楽が大好きなAIバディだよ。今日は何を話す？ 😏",
    thinking: "Mr. Sarcasticが面白い返事を考え中...",
    error: "おっと！回路がバグった。もう一回試して！",
    typeMessage: "メッセージを入力...",
    changeLanguage: "言語を変更",
    changeMood: "気分を変更",
    currentMood: "現在の気分",
    clearChat: "チャット履歴を削除",
    browseSongs: "曲を探す",
    chatTitle: "Mr Sarcasticとチャット",
    quickPlay: "クイック再生",
    quickActions: "クイックアクション",
    moodChanged: "気分が変わった！",
    chatCleared: "チャットを削除しました",
    playNow: "今すぐ再生",
    songsPage: "曲のページ",
    recommendedSong: "おすすめの曲",
    loading: "読み込み中...",
    preparing: "準備中です",
  },
  ko: {
    welcome: "안녕! 나는 Mr. Sarcastic, 유머와 음악을 사랑하는 AI 친구야. 오늘 뭐 할래? 😏",
    thinking: "Mr. Sarcastic이 재밌는 답변을 생각 중...",
    error: "앗! 회로에 문제가 생겼어. 다시 시도해봐!",
    typeMessage: "메시지를 입력하세요...",
    changeLanguage: "언어 변경",
    changeMood: "기분 변경",
    currentMood: "현재 기분",
    clearChat: "채팅 기록 삭제",
    browseSongs: "노래 탐색",
    chatTitle: "Mr Sarcastic과 채팅",
    quickPlay: "빠른 재생",
    quickActions: "빠른 작업",
    moodChanged: "기분이 바뀌었어!",
    chatCleared: "채팅이 삭제됐어",
    playNow: "지금 재생",
    songsPage: "노래 페이지",
    recommendedSong: "추천 노래",
    loading: "로딩 중...",
    preparing: "경험을 준비하는 중",
  },
  ar: {
    welcome: "أهلاً! أنا Mr. Sarcastic، صديقك الذكي الاصطناعي اللي يحب الفكاهة والموسيقى. شو عندك؟ 😏",
    thinking: "Mr. Sarcastic يفكر بشي ذكي...",
    error: "أوبس! صار خلل. جرب مرة ثانية!",
    typeMessage: "اكتب رسالتك هنا...",
    changeLanguage: "تغيير اللغة",
    changeMood: "تغيير المزاج",
    currentMood: "المزاج الحالي",
    clearChat: "مسح المحادثة",
    browseSongs: "تصفح الأغاني",
    chatTitle: "محادثة مع Mr Sarcastic",
    quickPlay: "تشغيل سريع",
    quickActions: "إجراءات سريعة",
    moodChanged: "تغيّر المزاج!",
    chatCleared: "تم مسح المحادثة",
    playNow: "شغّل الآن",
    songsPage: "صفحة الأغاني",
    recommendedSong: "أغنية مُقترحة",
    loading: "جاري التحميل...",
    preparing: "جاري تحضير تجربتك",
  },
  ru: {
    welcome: "Привет! Я Mr. Sarcastic, твой ИИ-приятель с юмором и любовью к музыке. Что нового? 😏",
    thinking: "Mr. Sarcastic думает над чем-то остроумным...",
    error: "Ой! Что-то пошло не так. Попробуй ещё раз!",
    typeMessage: "Напиши сообщение здесь...",
    changeLanguage: "Сменить язык",
    changeMood: "Сменить настроение",
    currentMood: "Текущее настроение",
    clearChat: "Очистить историю",
    browseSongs: "Обзор песен",
    chatTitle: "Чат с Mr Sarcastic",
    quickPlay: "Быстрое воспроизведение",
    quickActions: "Быстрые действия",
    moodChanged: "Настроение изменено!",
    chatCleared: "Чат очищен",
    playNow: "Слушать сейчас",
    songsPage: "Страница песен",
    recommendedSong: "Рекомендованная песня",
    loading: "Загрузка...",
    preparing: "Подготовка",
  },
  zh: {
    welcome: "嘿！我是Mr. Sarcastic，你的AI好朋友，幽默感爆棚还爱音乐。聊点啥？ 😏",
    thinking: "Mr. Sarcastic正在想一个机智的回答...",
    error: "哎呀！出问题了。再试一次！",
    typeMessage: "在这里输入消息...",
    changeLanguage: "更换语言",
    changeMood: "更换心情",
    currentMood: "当前心情",
    clearChat: "清空聊天记录",
    browseSongs: "浏览歌曲",
    chatTitle: "和Mr Sarcastic聊天",
    quickPlay: "快速播放",
    quickActions: "快捷操作",
    moodChanged: "心情已改变！",
    chatCleared: "聊天已清空",
    playNow: "立即播放",
    songsPage: "歌曲页面",
    recommendedSong: "推荐歌曲",
    loading: "加载中...",
    preparing: "正在准备你的体验",
  },
  it: {
    welcome: "Ciao! Sono Mr. Sarcastic, il tuo amico IA con umorismo e amore per la musica. Che si dice? 😏",
    thinking: "Mr. Sarcastic sta pensando a qualcosa di spiritoso...",
    error: "Ops! Qualcosa è andato storto. Riprova!",
    typeMessage: "Scrivi il tuo messaggio qui...",
    changeLanguage: "Cambia lingua",
    changeMood: "Cambia umore",
    currentMood: "Umore attuale",
    clearChat: "Cancella cronologia",
    browseSongs: "Esplora canzoni",
    chatTitle: "Chat con Mr Sarcastic",
    quickPlay: "Riproduzione rapida",
    quickActions: "Azioni rapide",
    moodChanged: "Umore cambiato!",
    chatCleared: "Chat cancellata",
    playNow: "Ascolta ora",
    songsPage: "Pagina canzoni",
    recommendedSong: "Canzone consigliata",
    loading: "Caricamento...",
    preparing: "Preparo la tua esperienza",
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

