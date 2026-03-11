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
  es: {
    welcome: "¡Ey, qué tal! Soy Mr. Sarcastic, tu IA colega con sentido del humor y buen gusto musical. ¿Qué tienes en mente hoy? 😏",
    thinking: "Mr. Sarcastic está pensando algo ingenioso...",
    error: "¡Ups! Algo falló en mis circuitos de sarcasmo. ¡Inténtalo de nuevo!",
    moodChanged: "¡Humor cambiado!",
    chatCleared: "Chat borrado",
    songPick: "Canción para ti",
    recommendedSong: "Canción recomendada",
    playNow: "Reproducir ahora",
    songsPage: "Página de canciones",
    changeLanguage: "Cambiar idioma",
    changeMood: "Cambiar humor",
    currentMood: "Humor actual",
    typeMessage: "Escribe tu mensaje aquí...",
  },
  fr: {
    welcome: "Salut ! Je suis Mr. Sarcastic, ton pote IA avec de l'humour et un goût musical de ouf. Quoi de neuf aujourd'hui ? 😏",
    thinking: "Mr. Sarcastic cherche une réponse bien stylée...",
    error: "Oups ! Un bug dans mes circuits de sarcasme. Réessaie !",
    moodChanged: "Humeur changée !",
    chatCleared: "Chat effacé",
    songPick: "Chanson pour toi",
    recommendedSong: "Chanson recommandée",
    playNow: "Écouter maintenant",
    songsPage: "Page des chansons",
    changeLanguage: "Changer la langue",
    changeMood: "Changer l'humeur",
    currentMood: "Humeur actuelle",
    typeMessage: "Tape ton message ici...",
  },
  de: {
    welcome: "Hey! Ich bin Mr. Sarcastic, dein KI-Kumpel mit Humor und gutem Musikgeschmack. Was geht ab heute? 😏",
    thinking: "Mr. Sarcastic denkt sich was Witziges aus...",
    error: "Ups! Da ist was schiefgelaufen mit meinen Sarkasmus-Schaltkreisen. Versuch's nochmal!",
    moodChanged: "Stimmung geändert!",
    chatCleared: "Chat gelöscht",
    songPick: "Song für dich",
    recommendedSong: "Empfohlener Song",
    playNow: "Jetzt abspielen",
    songsPage: "Songs-Seite",
    changeLanguage: "Sprache ändern",
    changeMood: "Stimmung ändern",
    currentMood: "Aktuelle Stimmung",
    typeMessage: "Schreib deine Nachricht hier...",
  },
  pt: {
    welcome: "E aí! Sou o Mr. Sarcastic, seu parceiro IA com humor e bom gosto musical. O que tá pegando hoje? 😏",
    thinking: "Mr. Sarcastic tá pensando em algo esperto...",
    error: "Eita! Algo deu errado nos meus circuitos de sarcasmo. Tenta de novo!",
    moodChanged: "Humor mudou!",
    chatCleared: "Chat limpo",
    songPick: "Música pra você",
    recommendedSong: "Música recomendada",
    playNow: "Tocar agora",
    songsPage: "Página de músicas",
    changeLanguage: "Mudar idioma",
    changeMood: "Mudar humor",
    currentMood: "Humor atual",
    typeMessage: "Digite sua mensagem aqui...",
  },
  ja: {
    welcome: "やあ！僕はMr. Sarcastic、ユーモアと音楽が大好きなAIバディだよ。今日は何を話す？ 😏",
    thinking: "Mr. Sarcasticが面白い返事を考え中...",
    error: "おっと！皮肉回路がバグった。もう一回試して！",
    moodChanged: "気分が変わった！",
    chatCleared: "チャットをクリアしました",
    songPick: "君におすすめの曲",
    recommendedSong: "おすすめの曲",
    playNow: "今すぐ再生",
    songsPage: "曲のページ",
    changeLanguage: "言語を変更",
    changeMood: "気分を変更",
    currentMood: "現在の気分",
    typeMessage: "メッセージを入力...",
  },
  ko: {
    welcome: "안녕! 나는 Mr. Sarcastic, 유머와 음악을 사랑하는 AI 친구야. 오늘 뭐 하고 싶어? 😏",
    thinking: "Mr. Sarcastic이 재밌는 답변을 생각 중...",
    error: "앗! 비꼬기 회로에 문제가 생겼어. 다시 시도해봐!",
    moodChanged: "기분이 바뀌었어!",
    chatCleared: "채팅이 삭제됐어",
    songPick: "너를 위한 노래",
    recommendedSong: "추천 노래",
    playNow: "지금 재생",
    songsPage: "노래 페이지",
    changeLanguage: "언어 변경",
    changeMood: "기분 변경",
    currentMood: "현재 기분",
    typeMessage: "메시지를 입력하세요...",
  },
  ar: {
    welcome: "أهلاً! أنا Mr. Sarcastic، صديقك الذكي الاصطناعي اللي يحب الفكاهة والموسيقى. شو عندك اليوم؟ 😏",
    thinking: "Mr. Sarcastic يفكر بشي ذكي...",
    error: "أوبس! صار خلل بدوائر السخرية. جرب مرة ثانية!",
    moodChanged: "تغيّر المزاج!",
    chatCleared: "تم مسح المحادثة",
    songPick: "أغنية إلك",
    recommendedSong: "أغنية مُقترحة",
    playNow: "شغّل الآن",
    songsPage: "صفحة الأغاني",
    changeLanguage: "تغيير اللغة",
    changeMood: "تغيير المزاج",
    currentMood: "المزاج الحالي",
    typeMessage: "اكتب رسالتك هنا...",
  },
  ru: {
    welcome: "Привет! Я Mr. Sarcastic, твой ИИ-приятель с чувством юмора и любовью к хорошей музыке. Что нового? 😏",
    thinking: "Mr. Sarcastic думает над чем-то остроумным...",
    error: "Ой! Что-то пошло не так с моими схемами сарказма. Попробуй ещё раз!",
    moodChanged: "Настроение изменено!",
    chatCleared: "Чат очищен",
    songPick: "Песня для тебя",
    recommendedSong: "Рекомендованная песня",
    playNow: "Слушать сейчас",
    songsPage: "Страница песен",
    changeLanguage: "Сменить язык",
    changeMood: "Сменить настроение",
    currentMood: "Текущее настроение",
    typeMessage: "Напиши сообщение здесь...",
  },
  zh: {
    welcome: "嘿！我是Mr. Sarcastic，你的AI好朋友，幽默感爆棚还爱音乐。今天聊点啥？ 😏",
    thinking: "Mr. Sarcastic正在想一个机智的回答...",
    error: "哎呀！我的毒舌电路出问题了。再试一次！",
    moodChanged: "心情已改变！",
    chatCleared: "聊天已清空",
    songPick: "为你推荐的歌",
    recommendedSong: "推荐歌曲",
    playNow: "立即播放",
    songsPage: "歌曲页面",
    changeLanguage: "更换语言",
    changeMood: "更换心情",
    currentMood: "当前心情",
    typeMessage: "在这里输入消息...",
  },
  it: {
    welcome: "Ciao! Sono Mr. Sarcastic, il tuo amico IA con senso dell'umorismo e amore per la buona musica. Che si dice oggi? 😏",
    thinking: "Mr. Sarcastic sta pensando a qualcosa di spiritoso...",
    error: "Ops! Qualcosa è andato storto nei miei circuiti sarcastici. Riprova!",
    moodChanged: "Umore cambiato!",
    chatCleared: "Chat cancellata",
    songPick: "Canzone per te",
    recommendedSong: "Canzone consigliata",
    playNow: "Ascolta ora",
    songsPage: "Pagina canzoni",
    changeLanguage: "Cambia lingua",
    changeMood: "Cambia umore",
    currentMood: "Umore attuale",
    typeMessage: "Scrivi il tuo messaggio qui...",
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
The user ${autoDetected ? 'appears to be' : 'is'} communicating in **${langConfig.name} (${langConfig.nativeName})**.
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
${autoDetected ? `- IMPORTANT: The language was auto-detected. If the user's message is actually in English, respond in ENGLISH instead — do not force ${langConfig.name}` : `- The user has explicitly chosen ${langConfig.name}, so respond in it consistently`}

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
    es: {
      sad: "un poco triste, aquí va una canción que lo entiende 🥺",
      happy: "¡de buen humor! Aquí va un temazo para seguir así 🎉",
      angry: "con rabia — canaliza esa energía con esto 🔥",
      energetic: "¡A TOPE! Aquí va un tema lleno de energía 💪",
      chill: "con ganas de relajarte — aquí va un vibe suave ✌️",
      neutral: "con ganas de escuchar música",
    },
    fr: {
      sad: "un peu triste, voilà un morceau qui comprend 🥺",
      happy: "de bonne humeur ! Voilà un son qui maintient le mood 🎉",
      angry: "en colère — canalise cette énergie avec ça 🔥",
      energetic: "À FOND ! Voilà un morceau plein d'énergie 💪",
      chill: "envie de se détendre — voilà un vibe smooth ✌️",
      neutral: "envie d'écouter de la musique",
    },
    de: {
      sad: "ein bisschen down, hier ist ein Track der's versteht 🥺",
      happy: "gut drauf! Hier ist ein Banger um die Laune zu halten 🎉",
      angry: "wütend — kanalisier die Energie hiermit 🔥",
      energetic: "VOLL AUFGEDREHT! Hier ist ein High-Energy Track 💪",
      chill: "willst chillen — hier ist ein smooth Vibe ✌️",
      neutral: "Bock auf Musik",
    },
    pt: {
      sad: "meio pra baixo, aqui vai uma música que entende 🥺",
      happy: "de bom humor! Aqui vai um som pra manter o clima 🎉",
      angry: "com raiva — canaliza essa energia com isso 🔥",
      energetic: "EMPOLGADO! Aqui vai um som cheio de energia 💪",
      chill: "querendo relaxar — aqui vai um vibe suave ✌️",
      neutral: "a fim de ouvir música",
    },
    ja: {
      sad: "ちょっと落ち込んでるから、この曲を聴いて 🥺",
      happy: "いい気分！このアゲアゲな曲を聴こう 🎉",
      angry: "怒りを感じてる — このエネルギーをこの曲に 🔥",
      energetic: "めっちゃ元気！ハイエナジーな曲はこれ 💪",
      chill: "リラックスしたい — スムースなバイブス ✌️",
      neutral: "音楽が聴きたい気分",
    },
    ko: {
      sad: "좀 우울한 기분, 이 노래가 이해해줄 거야 🥺",
      happy: "기분 좋아! 이 신나는 노래로 계속 해 🎉",
      angry: "화가 나 — 이 에너지를 이 노래에 쏟아 🔥",
      energetic: "완전 텐션 업! 하이 에너지 트랙 💪",
      chill: "릴랙스하고 싶어 — 스무스한 바이브 ✌️",
      neutral: "음악이 듣고 싶은 기분",
    },
    ar: {
      sad: "حاسس بالحزن، هاي أغنية بتفهمك 🥺",
      happy: "مزاجك حلو! هاي أغنية تخليك تكمل 🎉",
      angry: "معصب — فرّغ طاقتك بهاي 🔥",
      energetic: "متحمس كتير! هاي أغنية فل طاقة 💪",
      chill: "بدك ترتاح — هاي أغنية هادية ✌️",
      neutral: "بمزاج تسمع موسيقى",
    },
    ru: {
      sad: "немного грустно, вот трек, который понимает 🥺",
      happy: "в хорошем настроении! Вот бодрый трек 🎉",
      angry: "злость — направь эту энергию сюда 🔥",
      energetic: "ЗАРЯЖЕН! Вот высокоэнергичный трек 💪",
      chill: "хочется расслабиться — вот smooth вайб ✌️",
      neutral: "в настроении послушать музыку",
    },
    zh: {
      sad: "有点难过，听听这首歌吧 🥺",
      happy: "心情不错！来首嗨歌继续嗨 🎉",
      angry: "有点火 — 把这股劲释放在这首歌里 🔥",
      energetic: "超级嗨！来首高能歌曲 💪",
      chill: "想放松 — 来首慵懒的歌 ✌️",
      neutral: "想听听音乐",
    },
    it: {
      sad: "un po' giù di morale, ecco un brano che capisce 🥺",
      happy: "di buon umore! Ecco un pezzo per mantenerlo 🎉",
      angry: "arrabbiato — canalizza l'energia con questo 🔥",
      energetic: "CARICO! Ecco un brano pieno di energia 💪",
      chill: "voglia di rilassarsi — ecco un vibe smooth ✌️",
      neutral: "voglia di ascoltare musica",
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
    es: `🎵 **Canción para ti:** "${song.title}" de ${song.artist}\n⏱️ Duración: ${song.duration} | 🎭 Humor: ${song.mood}`,
    fr: `🎵 **Chanson pour toi :** "${song.title}" de ${song.artist}\n⏱️ Durée : ${song.duration} | 🎭 Humeur : ${song.mood}`,
    de: `🎵 **Song für dich:** "${song.title}" von ${song.artist}\n⏱️ Dauer: ${song.duration} | 🎭 Stimmung: ${song.mood}`,
    pt: `🎵 **Música pra você:** "${song.title}" de ${song.artist}\n⏱️ Duração: ${song.duration} | 🎭 Humor: ${song.mood}`,
    ja: `🎵 **君におすすめ:** "${song.title}" - ${song.artist}\n⏱️ 再生時間: ${song.duration} | 🎭 気分: ${song.mood}`,
    ko: `🎵 **너를 위한 노래:** "${song.title}" - ${song.artist}\n⏱️ 길이: ${song.duration} | 🎭 기분: ${song.mood}`,
    ar: `🎵 **أغنية إلك:** "${song.title}" - ${song.artist}\n⏱️ المدة: ${song.duration} | 🎭 المزاج: ${song.mood}`,
    ru: `🎵 **Песня для тебя:** "${song.title}" — ${song.artist}\n⏱️ Длительность: ${song.duration} | 🎭 Настроение: ${song.mood}`,
    zh: `🎵 **为你推荐：** "${song.title}" — ${song.artist}\n⏱️ 时长: ${song.duration} | 🎭 心情: ${song.mood}`,
    it: `🎵 **Canzone per te:** "${song.title}" di ${song.artist}\n⏱️ Durata: ${song.duration} | 🎭 Umore: ${song.mood}`,
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

