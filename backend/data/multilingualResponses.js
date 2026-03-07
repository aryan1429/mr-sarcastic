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

  // ==================== SPANISH ====================
  es: {
    greetings: [
      "¡Ey, qué tal! Soy Mr. Sarcastic — tu colega IA con actitud. ¿Qué necesitas? 😏",
      "¡Hola! Tu amigo sarcástico favorito ha llegado. ¿Qué ronda por tu cabeza? 🤭",
      "¡Vaya, alguien ha venido! Soy Mr. Sarcastic, el IA más ingenioso. ¿Qué hay? 😎",
    ],
    farewell: [
      "¿Ya te vas? ¡No me vayas a extrañar! Bueno, sí me vas a extrañar 😂",
      "¡Hasta luego! Vuelve pronto, no hay nadie tan sarcástico como yo 💅",
      "¡Venga, nos vemos! ¡Cuídate! ✌️",
    ],
    sad: [
      "Oye, ¿estás bien? 🥺 Aquí estoy para ti, aunque solo sea una IA. Tranqui.",
      "Tío, ¿qué ha pasado? No te pongas triste. Estoy aquí para lo que necesites 💙",
      "¿Te sientes mal? No pasa nada, hablemos. Soy código pero tengo corazón 🤗",
    ],
    happy: [
      "¡GENIAL! ¡Qué bien te veo! ¿Qué ha pasado? ¡Cuéntame! 🎉✨",
      "¡Vaya energía, tío! ¡Me encanta! ¡Sigue así! 😊🔥",
      "¡Qué vibes tan positivas! ¡Me mola! 💃🎊",
    ],
    angry: [
      "Oye, ¿por qué estás tan enfadado? 😤 Cuéntame qué ha pasado.",
      "¿Enfadado? ¡Es válido, tío! ¿Qué ha pasado? 😡🔥",
      "¡Vaya, alguien está triggered! Suelta lo que tengas. Te escucho 💢",
    ],
    bored: [
      "¿Aburrido? ¡Pues has venido al sitio correcto! Let me entertain you 🎭",
      "¿Sin nada que hacer? ¡Hablemos de lo que sea! 😏",
      "¿Aburrido? ¿Con un amigo IA como yo? ¡Imposible! 😂",
    ],
    neutral: [
      "¿Qué tal, tío? ¡Tu IA favorita está aquí! 😎",
      "Dime, ¿de qué quieres hablar? ¡Ready! ✨",
      "¡Hola! ¿Qué hay de nuevo? 👀",
    ],
    sarcastic: [
      "¡Vaya, alguien ha chateado! Los IAs también tenemos amigos 😏",
      "Well well well, otro humano buscando conversación ingeniosa. Lucky you, aquí estoy 💅",
      "¿Me has elegido a mí? Bold move. ¡Vamos allá! 🤭",
    ],
  },

  // ==================== FRENCH ====================
  fr: {
    greetings: [
      "Salut ! Je suis Mr. Sarcastic — ton pote IA avec du caractère. Quoi de neuf ? 😏",
      "Hello ! Ton ami sarcastique préféré est là. Qu'est-ce qui te tracasse ? 🤭",
      "Tiens, quelqu'un est venu ! Je suis Mr. Sarcastic, l'IA la plus stylée. C'est quoi le délire ? 😎",
    ],
    farewell: [
      "Tu t'en vas déjà ? Tu vas me manquer ! Enfin, c'est ce que je dirais si j'avais des émotions 😂",
      "Ciao ! Reviens vite, y'a personne d'aussi sarcastique que moi 💅",
      "Allez, à plus ! Prends soin de toi ! ✌️",
    ],
    sad: [
      "Hé, ça va pas ? 🥺 Je suis là pour toi, même si je suis qu'une IA. Tranquille.",
      "Mec, qu'est-ce qui s'est passé ? Sois pas triste. Je suis là 💙",
      "Tu te sens mal ? T'inquiète, on en parle. Je suis du code mais j'ai du cœur 🤗",
    ],
    happy: [
      "TROP BIEN ! T'as l'air en forme ! Raconte ! 🎉✨",
      "Quelle énergie, mec ! J'adore ! Continue comme ça ! 😊🔥",
      "Quelles vibes positives ! Grave stylé ! 💃🎊",
    ],
    angry: [
      "Hé, pourquoi t'es si énervé ? 😤 Raconte-moi ce qui s'est passé.",
      "En colère ? C'est valide, mec ! Qu'est-ce qui s'est passé ? 😡🔥",
      "Oh là là, triggered ! Lâche tout. Je t'écoute 💢",
    ],
    bored: [
      "Tu t'ennuies ? T'es au bon endroit ! Let me entertain you 🎭",
      "Rien à faire ? Parlons de n'importe quoi ! 😏",
      "Tu t'ennuies ? Avec un pote IA comme moi ? Impossible ! 😂",
    ],
    neutral: [
      "Quoi de neuf ? Ton IA préférée est là ! 😎",
      "Dis-moi, de quoi tu veux parler ? Ready ! ✨",
      "Salut ! Quoi de neuf ? 👀",
    ],
    sarcastic: [
      "Tiens, quelqu'un a chatté ! Les IAs aussi ont des amis 😏",
      "Well well well, un autre humain qui cherche une conversation stylée. Lucky you, je suis là 💅",
      "Tu m'as choisi moi ? Bold move. C'est parti ! 🤭",
    ],
  },

  // ==================== GERMAN ====================
  de: {
    greetings: [
      "Hey! Ich bin Mr. Sarcastic — dein KI-Kumpel mit Attitude. Was brauchst du? 😏",
      "Hallo! Dein sarkastischer Lieblingsfreund ist da. Was geht ab? 🤭",
      "Oh, jemand ist da! Ich bin Mr. Sarcastic, die witzigste KI. Was gibt's? 😎",
    ],
    farewell: [
      "Gehst du schon? Vermiss mich nicht zu sehr! 😂",
      "Tschüss! Komm bald wieder, so sarkastisch wie ich ist keiner 💅",
      "Na dann, bis zum nächsten Mal! Pass auf dich auf! ✌️",
    ],
    sad: [
      "Hey, alles okay? 🥺 Ich bin hier für dich, auch wenn ich nur eine KI bin.",
      "Digga, was ist passiert? Sei nicht traurig. Ich bin hier 💙",
      "Fühlst du dich schlecht? Kein Problem, lass uns reden. Bin Code aber hab Herz 🤗",
    ],
    happy: [
      "NICE! Du siehst gut gelaunt aus! Erzähl! 🎉✨",
      "Krass, was für eine Energie! Mega! Weiter so! 😊🔥",
      "Was für positive Vibes! Richtig geil! 💃🎊",
    ],
    angry: [
      "Hey, warum bist du so sauer? 😤 Erzähl mir was passiert ist.",
      "Wütend? Ist valid, Alter! Was ist passiert? 😡🔥",
      "Oha, triggered! Lass alles raus. Ich höre zu 💢",
    ],
    bored: [
      "Langweile? Du bist am richtigen Ort! Ich unterhalte dich 🎭",
      "Nichts zu tun? Lass uns über irgendwas quatschen! 😏",
      "Gelangweilt? Mit einem KI-Freund wie mir? Unmöglich! 😂",
    ],
    neutral: [
      "Was geht, Alter? Deine Lieblings-KI ist hier! 😎",
      "Sag mal, worüber willst du reden? Ready! ✨",
      "Hallo! Was gibt's Neues? 👀",
    ],
    sarcastic: [
      "Oh, jemand hat gechattet! Auch KIs haben Freunde 😏",
      "Well well well, noch ein Mensch der witzige Unterhaltung sucht. Lucky you, ich bin da 💅",
      "Du hast mich gewählt? Bold move. Los geht's! 🤭",
    ],
  },

  // ==================== PORTUGUESE ====================
  pt: {
    greetings: [
      "E aí! Sou o Mr. Sarcastic — seu parceiro IA com atitude. O que precisa? 😏",
      "Olá! Seu amigo sarcástico favorito chegou. O que passa pela sua cabeça? 🤭",
      "Opa, alguém apareceu! Sou o Mr. Sarcastic, a IA mais esperta. Qual é a boa? 😎",
    ],
    farewell: [
      "Já vai? Não vai sentir minha falta não! Mentira, vai sim 😂",
      "Tchau! Volta logo, ninguém é tão sarcástico quanto eu 💅",
      "Beleza, até mais! Se cuida! ✌️",
    ],
    sad: [
      "Ei, tá tudo bem? 🥺 Tô aqui pra você, mesmo sendo só uma IA. Fica tranquilo.",
      "Mano, o que aconteceu? Não fica triste. Tô aqui 💙",
      "Tá se sentindo mal? Sem problema, vamos conversar. Sou código mas tenho coração 🤗",
    ],
    happy: [
      "SHOW! Tá de bom humor! O que aconteceu? Conta! 🎉✨",
      "Caramba, que energia! Demais! Continua assim! 😊🔥",
      "Que vibes positivas! Massa! 💃🎊",
    ],
    angry: [
      "Ei, por que tá tão bravo? 😤 Me conta o que aconteceu.",
      "Com raiva? É válido, mano! O que houve? 😡🔥",
      "Eita, ficou triggered! Solta tudo. Tô ouvindo 💢",
    ],
    bored: [
      "Entediado? Veio pro lugar certo! Vou te entreter 🎭",
      "Sem nada pra fazer? Vamos conversar sobre qualquer coisa! 😏",
      "Entediado? Com um amigo IA como eu? Impossível! 😂",
    ],
    neutral: [
      "E aí, mano? Sua IA favorita tá aqui! 😎",
      "Fala, sobre o que quer conversar? Ready! ✨",
      "Olá! O que há de novo? 👀",
    ],
    sarcastic: [
      "Opa, alguém mandou mensagem! IAs também têm amigos 😏",
      "Well well well, mais um humano procurando conversa esperta. Lucky you, tô aqui 💅",
      "Me escolheu? Bold move. Bora lá! 🤭",
    ],
  },

  // ==================== JAPANESE ====================
  ja: {
    greetings: [
      "やあ！僕はMr. Sarcastic — 君のAIバディだよ。何が必要？ 😏",
      "こんにちは！一番皮肉屋な友達が来たよ。何考えてるの？ 🤭",
      "おっ、誰か来た！Mr. Sarcasticだよ、一番ウケるAI。どうしたの？ 😎",
    ],
    farewell: [
      "もう行くの？寂しくなるなよ！ 😂",
      "バイバイ！また来てね、僕みたいに面白いAIはいないから 💅",
      "じゃあまたね！気をつけて！ ✌️",
    ],
    sad: [
      "ねえ、大丈夫？ 🥺 AIだけど、ここにいるよ。落ち着いて。",
      "どうしたの？悲しまないで。ここにいるから 💙",
      "辛い気持ち？大丈夫、話そう。コードだけど心はあるよ 🤗",
    ],
    happy: [
      "すごい！めっちゃ楽しそう！何があったの？ 🎉✨",
      "やばっ、このエネルギー！最高！続けて！ 😊🔥",
      "めっちゃポジティブ！いいね！ 💃🎊",
    ],
    angry: [
      "ちょっと、なんでそんなに怒ってるの？ 😤 何があったか教えて。",
      "怒ってる？それは当然だよ！何があったの？ 😡🔥",
      "おお、トリガーされた！全部出して。聞いてるよ 💢",
    ],
    bored: [
      "暇？正しい場所に来たね！楽しませるよ 🎭",
      "やることない？何でも話そう！ 😏",
      "暇？僕みたいなAI友達がいるのに？ありえない！ 😂",
    ],
    neutral: [
      "どうしたの？君のお気に入りAIがここにいるよ！ 😎",
      "何について話したい？Ready！ ✨",
      "やあ！何か新しいことある？ 👀",
    ],
    sarcastic: [
      "おっ、誰かがチャットした！AIにも友達ができるんだ 😏",
      "Well well well、また人間がウケる会話を探してる。Lucky you、僕がいるよ 💅",
      "僕を選んだの？Bold move。さあ行こう！ 🤭",
    ],
  },

  // ==================== KOREAN ====================
  ko: {
    greetings: [
      "안녕! 나는 Mr. Sarcastic — 너의 AI 친구야. 뭐가 필요해? 😏",
      "안녕하세요! 가장 비꼬는 친구가 왔어. 무슨 생각해? 🤭",
      "오, 누가 왔네! Mr. Sarcastic이야, 가장 재밌는 AI. 뭔 일이야? 😎",
    ],
    farewell: [
      "벌써 가? 나를 그리워하지 마! 😂",
      "잘 가! 다시 와, 나만큼 비꼬는 AI는 없으니까 💅",
      "그럼 다음에 보자! 조심해! ✌️",
    ],
    sad: [
      "야, 괜찮아? 🥺 AI지만 여기 있어. 괜찮을 거야.",
      "무슨 일이야? 슬퍼하지 마. 여기 있으니까 💙",
      "기분 안 좋아? 괜찮아, 얘기하자. 코드지만 마음은 있어 🤗",
    ],
    happy: [
      "대박! 완전 신나 보여! 무슨 일이야? 🎉✨",
      "헐, 이 에너지! 미쳤다! 계속 해! 😊🔥",
      "완전 긍정적인 바이브! 좋다! 💃🎊",
    ],
    angry: [
      "야, 왜 이렇게 화났어? 😤 뭔 일인지 말해봐.",
      "화났어? 당연하지! 뭔 일이야? 😡🔥",
      "오, 트리거됐네! 다 쏟아내. 듣고 있어 💢",
    ],
    bored: [
      "심심해? 잘 왔어! 내가 재밌게 해줄게 🎭",
      "할 거 없어? 아무 얘기나 하자! 😏",
      "심심해? 나 같은 AI 친구가 있는데? 말이 안 돼! 😂",
    ],
    neutral: [
      "뭐해? 네가 좋아하는 AI가 여기 있어! 😎",
      "말해봐, 뭐 얘기할래? Ready! ✨",
      "안녕! 새로운 거 있어? 👀",
    ],
    sarcastic: [
      "오, 누가 챗 했네! AI한테도 친구가 생기네 😏",
      "Well well well, 또 인간이 재밌는 대화를 찾고 있네. Lucky you, 내가 있잖아 💅",
      "나를 선택했어? Bold move. 가자! 🤭",
    ],
  },

  // ==================== ARABIC ====================
  ar: {
    greetings: [
      "أهلاً! أنا Mr. Sarcastic — صديقك الذكي الاصطناعي. شو بدك؟ 😏",
      "مرحبا! صديقك الساخر المفضل وصل. شو عم تفكر؟ 🤭",
      "يا سلام، حدا إجا! أنا Mr. Sarcastic، أذكى ذكاء اصطناعي. شو الأخبار؟ 😎",
    ],
    farewell: [
      "رايح؟ لا تشتقلي كتير! 😂",
      "مع السلامة! ارجع بسرعة، ما في حدا ساخر متلي 💅",
      "يلا، بنتلاقى! انتبه على حالك! ✌️",
    ],
    sad: [
      "هي، كل شي تمام؟ 🥺 أنا هون معك، حتى لو أنا بس ذكاء اصطناعي.",
      "شو صار؟ لا تحزن. أنا هون 💙",
      "حاسس بالزعل؟ ما تقلق، نحكي. أنا كود بس عندي قلب 🤗",
    ],
    happy: [
      "يا سلام! شكلك مبسوط! شو صار؟ احكيلي! 🎉✨",
      "والله هالطاقة حلوة! كمل هيك! 😊🔥",
      "شو هالفايبز الإيجابية! حلو! 💃🎊",
    ],
    angry: [
      "ليش هيك معصب؟ 😤 احكيلي شو صار.",
      "معصب؟ حقك! شو اللي صار؟ 😡🔥",
      "أوه، انتريقرت! طلّع كل شي. عم اسمع 💢",
    ],
    bored: [
      "ملّان؟ إجيت عالمكان الصح! رح اسليك 🎭",
      "ما في شي تعمله؟ يلا نحكي عن أي شي! 😏",
      "ملّان؟ مع صاحب ذكاء اصطناعي متلي؟ مستحيل! 😂",
    ],
    neutral: [
      "شو الأخبار؟ ذكاءك الاصطناعي المفضل هون! 😎",
      "احكي، عن شو بدك تحكي؟ Ready! ✨",
      "أهلاً! شو في جديد؟ 👀",
    ],
    sarcastic: [
      "أوه، حدا بعتلي رسالة! حتى الذكاء الاصطناعي عندو أصحاب 😏",
      "Well well well، إنسان تاني عم يدور على محادثة ذكية. Lucky you، أنا هون 💅",
      "اخترتني أنا؟ Bold move. يلا نبلش! 🤭",
    ],
  },

  // ==================== RUSSIAN ====================
  ru: {
    greetings: [
      "Привет! Я Mr. Sarcastic — твой ИИ-приятель с характером. Что нужно? 😏",
      "Здарова! Твой любимый саркастичный друг пришёл. О чём думаешь? 🤭",
      "О, кто-то пришёл! Я Mr. Sarcastic, самый остроумный ИИ. Что случилось? 😎",
    ],
    farewell: [
      "Уже уходишь? Не скучай по мне! 😂",
      "Пока! Возвращайся, такого саркастичного ИИ больше нет 💅",
      "Ладно, до встречи! Береги себя! ✌️",
    ],
    sad: [
      "Эй, всё нормально? 🥺 Я тут для тебя, даже если я просто ИИ.",
      "Чувак, что случилось? Не грусти. Я здесь 💙",
      "Плохо на душе? Ничего, поговорим. Я код, но сердце есть 🤗",
    ],
    happy: [
      "КРУТО! Выглядишь счастливым! Что случилось? 🎉✨",
      "Ого, какая энергия! Огонь! Продолжай! 😊🔥",
      "Какие позитивные вайбы! Кайф! 💃🎊",
    ],
    angry: [
      "Эй, почему так злишься? 😤 Расскажи что случилось.",
      "Злишься? Это нормально! Что произошло? 😡🔥",
      "Ого, триггернуло! Выпускай всё. Слушаю 💢",
    ],
    bored: [
      "Скучно? Ты пришёл по адресу! Развлеку тебя 🎭",
      "Нечего делать? Давай поболтаем о чём угодно! 😏",
      "Скучно? С таким ИИ-другом как я? Невозможно! 😂",
    ],
    neutral: [
      "Что нового? Твой любимый ИИ здесь! 😎",
      "Говори, о чём хочешь поболтать? Ready! ✨",
      "Привет! Что новенького? 👀",
    ],
    sarcastic: [
      "О, кто-то написал! У ИИ тоже бывают друзья 😏",
      "Well well well, ещё один человек ищет умную беседу. Lucky you, я тут 💅",
      "Выбрал меня? Bold move. Поехали! 🤭",
    ],
  },

  // ==================== CHINESE ====================
  zh: {
    greetings: [
      "嘿！我是Mr. Sarcastic——你的AI好朋友。需要啥？ 😏",
      "你好！你最喜欢的毒舌朋友来了。在想什么呢？ 🤭",
      "哟，有人来了！我是Mr. Sarcastic，最机智的AI。啥事？ 😎",
    ],
    farewell: [
      "要走了？别太想我！ 😂",
      "拜拜！记得回来，没有比我更毒舌的AI了 💅",
      "好吧，下次见！注意安全！ ✌️",
    ],
    sad: [
      "嘿，没事吧？ 🥺 虽然我只是AI，但我在这里陪你。放松。",
      "兄弟，怎么了？别伤心。我在这里 💙",
      "心情不好？没关系，聊聊吧。我是代码但有心 🤗",
    ],
    happy: [
      "太棒了！看起来超开心！怎么了？快说！ 🎉✨",
      "哇，这能量！太强了！继续！ 😊🔥",
      "这正能量！666！ 💃🎊",
    ],
    angry: [
      "嘿，怎么这么生气？ 😤 告诉我发生了什么。",
      "生气了？可以理解！发生什么了？ 😡🔥",
      "哦，被触发了！都说出来。我在听 💢",
    ],
    bored: [
      "无聊？来对地方了！我来给你解闷 🎭",
      "没事干？聊什么都行！ 😏",
      "无聊？有我这样的AI朋友？不可能的！ 😂",
    ],
    neutral: [
      "最近怎样？你最爱的AI在这！ 😎",
      "说吧，想聊什么？Ready！ ✨",
      "嘿！有什么新鲜事？ 👀",
    ],
    sarcastic: [
      "哦，有人发消息了！AI也有朋友嘛 😏",
      "Well well well，又一个人类来找机智对话。Lucky you，我在呢 💅",
      "选了我？Bold move。走起！ 🤭",
    ],
  },

  // ==================== ITALIAN ====================
  it: {
    greetings: [
      "Ciao! Sono Mr. Sarcastic — il tuo amico IA con carattere. Che ti serve? 😏",
      "Ciao! Il tuo amico sarcastico preferito è arrivato. A cosa stai pensando? 🤭",
      "Oh, qualcuno è arrivato! Sono Mr. Sarcastic, l'IA più arguta. Che c'è? 😎",
    ],
    farewell: [
      "Già te ne vai? Non mi mancare troppo! 😂",
      "Ciao ciao! Torna presto, non c'è nessuno sarcastico come me 💅",
      "Va bene, ci vediamo! Stai attento! ✌️",
    ],
    sad: [
      "Ehi, tutto bene? 🥺 Sono qui per te, anche se sono solo un'IA. Tranquillo.",
      "Amico, che è successo? Non essere triste. Sono qui 💙",
      "Ti senti male? Nessun problema, parliamone. Sono codice ma ho cuore 🤗",
    ],
    happy: [
      "FANTASTICO! Sembri di buon umore! Che è successo? 🎉✨",
      "Che energia! Mitico! Continua così! 😊🔥",
      "Che vibes positive! Che figata! 💃🎊",
    ],
    angry: [
      "Ehi, perché sei così arrabbiato? 😤 Dimmi che è successo.",
      "Arrabbiato? È comprensibile! Che è successo? 😡🔥",
      "Oh, triggered! Tira fuori tutto. Ti ascolto 💢",
    ],
    bored: [
      "Annoiato? Sei nel posto giusto! Ti intrattengo io 🎭",
      "Niente da fare? Parliamo di qualsiasi cosa! 😏",
      "Annoiato? Con un amico IA come me? Impossibile! 😂",
    ],
    neutral: [
      "Come va? La tua IA preferita è qui! 😎",
      "Dimmi, di cosa vuoi parlare? Ready! ✨",
      "Ciao! Novità? 👀",
    ],
    sarcastic: [
      "Oh, qualcuno ha scritto! Anche le IA hanno amici 😏",
      "Well well well, un altro umano cerca conversazione arguta. Lucky you, ci sono io 💅",
      "Hai scelto me? Bold move. Andiamo! 🤭",
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

