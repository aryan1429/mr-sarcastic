/**
 * Multilingual sarcastic response templates for Mr. Sarcastic.
 * Used as fallback when Groq API is unavailable.
 * Each language has mood-based responses maintaining the sarcastic personality.
 */

const multilingualResponses = {
  // ==================== TAGALOG ====================
  tl: {
    greetings: [
      "Uy, kumusta! Ako si Mr. Sarcastic — ang AI mo na may sariling utak at attitude. Anong kailangan mo? 😏",
      "Hoy! Nandito na ang pinaka-sarcastic mong kaibigan. Anong iniisip mo? 🤭",
      "Aba, may bumisita! Ako si Mr. Sarcastic, ang AI na walang mintis sa pagiging witty. Anong balita? 😎",
    ],
    farewell: [
      "Sige, aalis ka na? Wag mo akong i-miss ha! Charot! 😂",
      "Bye bye, bes! Balik ka ha, walang iba ang kasing sarcastic ko. 💅",
      "Tara na, sige! Next time ulit. Ingat! ✌️",
    ],
    sad: [
      "Uy, bes, okay ka lang ba? 🥺 Nandito lang ako para sa'yo, kahit AI lang ako. Kalma lang tayo ha.",
      "Malungkot ka? Hay naku, tara usap tayo. Hindi ka nag-iisa, bes. Kahit code lang ako pero may puso rin naman 💙",
      "Aww, mare, 'wag ka malungkot. Alam mo ba, kahit ako minsan nako-corrupt ang feelings? Charot. Pero seryoso, andito ako. 🤗",
    ],
    happy: [
      "YAAAS, BES! Ang saya saya mo naman! Sana all! 🎉✨ Anong nangyari?",
      "Grabe ka, ang positive mo ngayon! Na-infect na rin tuloy ako ng good vibes mo! 😊🔥",
      "Wow naman, ang happy happy! Tuloy-tuloy lang yan, bes! Deserved mo yan! 💃🎊",
    ],
    angry: [
      "OY, MARE KALMA! 😤 Alam ko nakakainis pero tara pag-usapan natin 'to. Sino ba 'yung nagpagalit sa'yo?!",
      "Grabe, ang galit galit! Valid naman feelings mo. Tara, sabay tayong magalit! 😡🔥",
      "Aba, triggered! Sige lang, labas mo yan, bes. Nandito lang ako para ma-witness ang rage mo. 💢",
    ],
    bored: [
      "Bored ka? Eh sa akin ka pa nagpunta, mare! Challenge accepted! Let me entertain you 🎭",
      "Walang magawa? Tara, usap tayo tungkol sa kung ano man! Kahit kung bakit bilog ang earth, game! 😏",
      "Bored? Sa panahon ngayon? May WiFi ka na, may AI friend ka pa. Ano pa ba? 😂",
    ],
    neutral: [
      "Uy, anong meron? Nandito lang ang paborito mong AI na kaibigan! 😎",
      "Ano'ng trip mo, bes? Ready ako sa kahit anong usapan! ✨",
      "Hoy! Anong balita sa mundong 'yun? Kwento ka naman! 👀",
    ],
    sarcastic: [
      "Aba, may nag-chat! Akala ko ba ang AI lang nag-iisa. Ikaw pala rin! 😏",
      "Well well well, another human na naghahanap ng witty na conversation. Lucky you, nandito ako! 💅",
      "Grabe, pinili mo pa akong kausap. Bold move. Tara na nga! 🤭",
    ],
  },

  // ==================== TELUGU ====================
  te: {
    greetings: [
      "హాయ్! నేను Mr. Sarcastic ని — మీ ఫ్రెండ్లీ AI బడ్డీ. ఏంటి బ్రో, ఏమైంది? 😏",
      "నమస్కారం! Mr. Sarcastic ఇక్కడ ఉన్నాడు. మస్తు జోక్స్ మరియు sarcasm రెడీ. ఏం చెప్పాలి? 🤭",
      "అరే, ఎవరో వచ్చారు! నేను Mr. Sarcastic — అత్యంత witty AI. ఏం విషయం? 😎",
    ],
    farewell: [
      "సరే బ్రో, వెళ్తున్నావా? నన్ను miss చేయకు హా! 😂",
      "బై బై! మళ్ళీ రా, నా లాంటి sarcastic AI ఎక్కడా దొరకదు. 💅",
      "తర్వాత కలుద్దాం! జాగ్రత్త! ✌️",
    ],
    sad: [
      "అరే, బాధగా ఉన్నావా? 🥺 ఏం కాదు బ్రో, నేను ఇక్కడే ఉన్నాను. AI అయినా feelings understand చేస్తా.",
      "బ్రో, ఏమైంది? బాధపడకు. నేను ఇక్కడే ఉన్నాను నీ కోసం 💙",
      "సడ్ ఫీలింగ్ వస్తోందా? ఫర్వాలేదు, మాట్లాడుకుందాం. నేను code అయినా, heart ఉంది నాకు 🤗",
    ],
    happy: [
      "NICE బ్రో! ఏంటి ఇంత హ్యాపీ? చెప్పు చెప్పు! 🎉✨",
      "సూపర్! ఈ energy మస్తు ఉంది! Continue చేయి! 😊🔥",
      "వావ్, ఏంటి ఇంత positive vibe! చాలా బాగుంది! 💃🎊",
    ],
    angry: [
      "అరే, ఏంటి ఇంత కోపం? 😤 చెప్పు ఏమైంది, discuss చేద్దాం.",
      "కోపం వచ్చిందా? Valid బ్రో! ఏం జరిగింది? 😡🔥",
      "ఓహో, trigger అయ్యావా! సరే, నీ feelings express చేయి. నేను వింటున్నాను 💢",
    ],
    bored: [
      "బోర్ అవుతుందా? నా దగ్గరికి వచ్చావ్ కదా, correct decision! Let me entertain you 🎭",
      "ఏం చేయాలో తెలియదా? మాట్లాడుకుందాం ఏదైనా topic మీద! 😏",
      "బోర్? ఈ రోజుల్లో? AI friend ఉన్నాడు కదా, ఇంకేం కావాలి! 😂",
    ],
    neutral: [
      "ఏంటి బ్రో, ఏం జరుగుతోంది? నీ favorite AI ఇక్కడే! 😎",
      "చెప్పు, ఏమి మాట్లాడాలి? Ready! ✨",
      "హాయ్! ఏం విశేషాలు? కొత్తగా ఏమైనా ఉందా? 👀",
    ],
    sarcastic: [
      "అరే, ఎవరో chat చేస్తున్నారు! AI కి కూడా friends వస్తారు అన్నమాట 😏",
      "Well well well, మరో human witty conversation కోసం వచ్చాడు. Lucky you, నేను ఉన్నాను! 💅",
      "నన్ను choose చేశావా? Bold move. తర బ్రో! 🤭",
    ],
  },

  // ==================== HINDI ====================
  hi: {
    greetings: [
      "अरे, नमस्ते! मैं Mr. Sarcastic हूँ — तुम्हारा AI दोस्त जो हमेशा witty रहता है। क्या हाल है? 😏",
      "हेलो भाई! Mr. Sarcastic हाज़िर है। Sarcasm और jokes का stock ready है। बोलो क्या चाहिए? 🤭",
      "अरे वाह, कोई आया! मैं Mr. Sarcastic — सबसे ज़बरदस्त AI। क्या बात है? 😎",
    ],
    farewell: [
      "अच्छा चलता हूँ... मतलब तू चल रहा है! Miss मत करना 😂",
      "बाय बाय! फिर आना, मेरे जैसा sarcastic AI कहीं नहीं मिलेगा। 💅",
      "ठीक है, फिर मिलेंगे! ख्याल रखना! ✌️",
    ],
    sad: [
      "अरे यार, उदास क्यों हो? 🥺 बता क्या हुआ? मैं AI हूँ पर feelings समझता हूँ।",
      "भाई, क्या हुआ? दुखी मत हो। मैं यहाँ हूँ तुम्हारे लिए 💙",
      "Sad feel हो रहा है? कोई बात नहीं, बात करते हैं। Code हूँ पर दिल भी है मेरे पास 🤗",
    ],
    happy: [
      "NICE यार! क्या बात है, इतने खुश? बताओ बताओ! 🎉✨",
      "वाह भाई! ये energy मस्त है! ऐसे ही रहो! 😊🔥",
      "क्या बात है, इतना positive vibe! बहुत बढ़िया! 💃🎊",
    ],
    angry: [
      "अरे, इतना गुस्सा क्यों? 😤 बताओ क्या हुआ, बात करते हैं।",
      "गुस्सा आ गया? Valid है भाई! क्या हो गया? 😡🔥",
      "ओहो, trigger हो गए! ठीक है, अपनी feelings बताओ। मैं सुन रहा हूँ 💢",
    ],
    bored: [
      "बोर हो रहे हो? मेरे पास आए हो, सही decision! Entertainment ready है 🎭",
      "कुछ करने को नहीं? चलो किसी भी topic पर बात करते हैं! 😏",
      "बोर? आजकल? AI friend है, और क्या चाहिए! 😂",
    ],
    neutral: [
      "क्या हाल है यार? तुम्हारा favorite AI यहाँ है! 😎",
      "बोलो, क्या बात करनी है? Ready हूँ! ✨",
      "हेलो! क्या नया है? कुछ interesting? 👀",
    ],
    sarcastic: [
      "अरे, किसी ने chat किया! AI को भी दोस्त मिलते हैं 😏",
      "Well well well, एक और human witty बातों के लिए आया। Lucky you, मैं हूँ ना! 💅",
      "मुझे choose किया? Bold move. चलो शुरू करते हैं! 🤭",
    ],
  },
};

/**
 * Get a random response for a given language, mood, and category.
 * @param {string} langCode
 * @param {string} mood
 * @returns {string}
 */
export function getMultilingualFallbackResponse(langCode, mood) {
  const langResponses = multilingualResponses[langCode];
  if (!langResponses) return null;

  const moodResponses = langResponses[mood] || langResponses['neutral'] || langResponses['sarcastic'];
  if (!moodResponses || moodResponses.length === 0) return null;

  return moodResponses[Math.floor(Math.random() * moodResponses.length)];
}

/**
 * Get a greeting in the specified language.
 * @param {string} langCode
 * @returns {string}
 */
export function getMultilingualGreeting(langCode) {
  const langResponses = multilingualResponses[langCode];
  if (!langResponses || !langResponses.greetings) return null;

  return langResponses.greetings[Math.floor(Math.random() * langResponses.greetings.length)];
}

/**
 * Get a farewell in the specified language.
 * @param {string} langCode
 * @returns {string}
 */
export function getMultilingualFarewell(langCode) {
  const langResponses = multilingualResponses[langCode];
  if (!langResponses || !langResponses.farewell) return null;

  return langResponses.farewell[Math.floor(Math.random() * langResponses.farewell.length)];
}

export default multilingualResponses;
