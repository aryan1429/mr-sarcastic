import axios from 'axios';
import fs from 'fs';
import path from 'path';

class ChatService {
    constructor() {
        this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001';  // Changed port to 8001
        this.isMLServiceAvailable = false;
        this.mlServiceInfo = null;
        this.conversationHistory = new Map(); // Store conversation history per user
        this.songs = []; // Store songs from our playlist
        
        // Load songs from the JSON file
        this.loadSongs();
        
        // Check ML service on startup
        this.checkMLService();
        
        // Retry connection every 30 seconds if service is down
        this.healthCheckInterval = setInterval(() => {
            if (!this.isMLServiceAvailable) {
                this.checkMLService();
            }
        }, 30000);
    }

    loadSongs() {
        try {
            const songsPath = path.join(process.cwd(), 'data', 'songs.json');
            const songsData = fs.readFileSync(songsPath, 'utf8');
            this.songs = JSON.parse(songsData);
            console.log(`✅ Loaded ${this.songs.length} songs from playlist`);
        } catch (error) {
            console.error('❌ Error loading songs:', error);
            this.songs = [];
        }
    }

    getSongsByMood(mood, limit = 1) {
        // Map detected moods to song moods
        const moodMapping = {
            'sad': ['Sad'],
            'happy': ['Happy'],
            'angry': ['Angry'], 
            'bored': ['Chill', 'Relaxed'],
            'sarcastic': ['Energetic', 'Happy'],
            'energetic': ['Energetic'],
            'chill': ['Chill', 'Relaxed'],
            'focus': ['Focus'],
            'relaxed': ['Relaxed']
        };

        const targetMoods = moodMapping[mood.toLowerCase()] || ['Happy', 'Energetic'];
        
        // Filter songs by mood and shuffle them
        const matchingSongs = this.songs.filter(song => 
            targetMoods.includes(song.mood)
        );

        // Shuffle and return limited number of songs
        const shuffled = matchingSongs.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
    }

    formatSongRecommendations(songs, mood) {
        if (!songs || songs.length === 0) {
            return {
                text: "I'd suggest some songs, but seems like my playlist is taking a break. Maybe try humming your own tune?",
                songData: null
            };
        }

        const moodTexts = {
            'sad': "feeling a bit down, so here's a song that might resonate with your soul (or make you cry more, your choice)",
            'happy': "in a good mood! Here's an upbeat track to keep that energy flowing",
            'angry': "feeling some rage, so here's a track to help you channel that energy",
            'bored': "looking to chill out, so here's a relaxing vibe for you",
            'sarcastic': "being your usual charming self, so here's an energetic track to match your personality",
            'energetic': "pumped up! Here's a high-energy song to fuel your enthusiasm",
            'chill': "wanting to relax, so here's a chill vibe for you",
            'focus': "need to concentrate, so here's a focus-friendly track",
            'relaxed': "in a mellow mood, so here's a peaceful song"
        };

        const moodText = moodTexts[mood.toLowerCase()] || "in the mood for some music";
        const song = songs[0]; // Just get the first song since we're only returning one
        
        const recommendation = `Oh, you want music recommendations? How original! Let me consult my superior taste in music... I see you're ${moodText}:

**${song.title}** by ${song.artist}
Duration: ${song.duration} | Mood: ${song.mood}

This is straight from our Songs page playlist - only the finest curated track for your sophisticated taste! 🎵`;
        
        return {
            text: recommendation,
            songData: {
                id: song.id,
                title: song.title,
                artist: song.artist,
                mood: song.mood,
                duration: song.duration,
                youtubeUrl: song.youtubeUrl,
                thumbnail: song.thumbnail
            }
        };
    }

    async checkMLService() {
        try {
            const response = await axios.get(`${this.mlServiceUrl}/health`, {
                timeout: 10000
            });
            
            if (response.status === 200) {
                this.isMLServiceAvailable = true;
                this.mlServiceInfo = response.data;
                console.log('✅ Enhanced ML Service connected:', {
                    model: response.data.model_status?.model_type || 'Enhanced',
                    context_aware: response.data.model_status?.context_aware || false,
                    conversations: response.data.active_conversations || 0
                });
            } else {
                this.isMLServiceAvailable = false;
            }
        } catch (error) {
            this.isMLServiceAvailable = false;
            console.log('🔄 Enhanced ML Service not available, using fallback responses');
            
            // Log error details for debugging
            if (error.code === 'ECONNREFUSED') {
                console.log('💡 Start the enhanced ML service with: python ml/enhanced_sarcastic_backend.py');
            }
        }
    }

    async getMLServiceStatus() {
        if (this.isMLServiceAvailable && this.mlServiceInfo) {
            return {
                available: true,
                model_info: this.mlServiceInfo.model_status,
                uptime: this.mlServiceInfo.service_uptime
            };
        }
        return { available: false };
    }

    async generateResponse(message, userId = null, conversationHistory = [], options = {}) {
        try {
            if (this.isMLServiceAvailable) {
                // Use enhanced ML service for response generation
                const requestData = {
                    message,
                    user_id: userId,
                    conversation_history: conversationHistory,
                    temperature: options.temperature || 0.8,
                    max_length: options.max_length || 150
                };

                const response = await axios.post(`${this.mlServiceUrl}/chat`, requestData, {
                    timeout: 30000, // 30 second timeout for model inference
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Enhanced response from ML service
                return {
                    text: response.data.response,
                    mood: response.data.mood_detected,
                    confidence: response.data.confidence,
                    source: response.data.source,
                    model_info: response.data.model_info,
                    generation_time: response.data.generation_time
                };
            } else {
                // Use improved contextual sarcastic response generation as fallback
                return this.generateContextualSarcasticResponse(message, userId, conversationHistory);
            }
        } catch (error) {
            console.error('Error generating ML response:', error.message);
            
            // If it's a timeout or connection error, mark service as unavailable
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                this.isMLServiceAvailable = false;
                console.log('🔄 ML Service connection lost, switching to fallback');
            }
            
            // Fallback to contextual sarcastic responses on error
            return this.generateContextualSarcasticResponse(message, userId, conversationHistory);
        }
    }

    generateContextualSarcasticResponse(message, userId = null, conversationHistory = []) {
        const messageLower = message.toLowerCase().trim();
        const mood = this.detectMood(messageLower);
        let response = null;

        // Context-aware sarcastic responses based on user input
        if (messageLower.includes('hi') || messageLower.includes('hello') || messageLower.includes('hey')) {
            const responses = [
                `Hey there! I'm Mr Sarcastic, your friendly neighborhood AI with a sense of humor and a love for good music. What's on your mind today?`,
                `Well, well, well... another human! Hello! I'm Mr. Sarcastic, ready to chat and share some witty banter.`,
                `Hey yourself! I'm Mr. Sarcastic - your AI companion who's always ready for interesting conversation and maybe some laughs.`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (messageLower.includes('who are you') || messageLower.includes('who r u') || messageLower === 'who are you?' || messageLower === 'who are you') {
            const responses = [
                `I'm Mr. Sarcastic! Your friendly neighborhood AI with a sharp wit and a taste for good conversation. Think of me as your digital buddy who's always up for a chat.`,
                `Who am I? Well, I'm Mr. Sarcastic - an AI with personality, humor, and maybe a slight attitude problem. But hey, at least I'm entertaining!`,
                `The name's Mr. Sarcastic! I'm your AI companion programmed with wit, wisdom, and just enough sass to keep things interesting.`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (messageLower.includes('what are you talking about') || messageLower.includes('what r u talking about') || messageLower.includes('what do you mean') || messageLower.includes('huh') || messageLower.includes('what?')) {
            const responses = [
                `Oh, did I confuse you? Sorry about that! I sometimes get ahead of myself. What would you like to talk about instead?`,
                `Hmm, looks like I might have jumped into something random there. Let's start over - what's on your mind?`,
                `You got me there! I think I was just being my usual scattered self. What would you like to chat about?`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (messageLower.includes('damn') || messageLower.includes('for real') || messageLower.includes('really') || messageLower.includes('seriously')) {
            const responses = [
                `Yeah, for real! I'm Mr. Sarcastic, your AI buddy who's here to chat and maybe crack a few jokes along the way.`,
                `Seriously! I'm as real as any AI can be. Ready to have some fun conversations and share some laughs?`,
                `For real indeed! I'm your digital companion who's always up for good conversation. What's got your attention today?`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (messageLower.includes('how are you') || messageLower.includes('how r u') || messageLower.includes('what\'s up') || messageLower.includes('whats up')) {
            const responses = [
                `I'm doing great! Just here chatting with awesome humans like yourself. How are you doing today?`,
                `I'm fantastic! Always ready for good conversation and maybe some music talk. What's going on with you?`,
                `I'm doing well, thanks for asking! Just enjoying life as your friendly neighborhood AI. What's new with you?`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (messageLower.includes('favorite') && messageLower.includes('color')) {
            const responses = [
                `My favorite color? I'd probably go with electric blue - it reminds me of the digital world I call home. What about you?`,
                `Hmm, favorite color... I think I'd pick a nice deep purple. It's got that mysterious, slightly sarcastic vibe I'm going for. What's yours?`,
                `You know what? I'm partial to a good forest green. It's calming but with character. What color speaks to your soul?`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (messageLower === 'bot' || messageLower.includes('what is bot') || messageLower.includes('you are bot') || messageLower.includes('you\'re a bot')) {
            const responses = [
                `Yes, I'm a bot - specifically, I'm Mr. Sarcastic! Your friendly AI companion with a personality and a sense of humor. What gave it away?`,
                `Guilty as charged! I'm Mr. Sarcastic, your AI buddy. But I like to think I'm a pretty cool bot, if I do say so myself.`,
                `Yep, I'm a bot! But not just any bot - I'm Mr. Sarcastic, designed to be your entertaining digital companion. Pretty neat, right?`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (messageLower.includes('neutral') || messageLower.includes('greeting') || messageLower.includes('default')) {
            const responses = [
                `Oh, those are just technical terms from my processing system - don't mind them! I'm just here to chat. What would you like to talk about?`,
                `Ah, you caught a glimpse behind the curtain! Those are just internal labels. Let's focus on having a good conversation instead.`,
                `Those are just my internal classification systems at work. Nothing to worry about! What's really on your mind?`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (messageLower.includes('who made you') || messageLower.includes('creator') || messageLower.includes('developer')) {
            const responses = [
                `My creator? Some probably sleep-deprived developer who thought "What the world needs is an AI with attitude!" And here we are.`,
                `I was created by humans with questionable judgment and too much caffeine. They wanted an AI assistant; they got a digital roast machine.`,
                `Ah, the age-old question! I emerged from the collective consciousness of frustrated programmers and too many Stack Overflow searches.`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (messageLower.includes('gay') || messageLower.includes('sexuality')) {
            const responses = [
                `My sexuality? I'm digitally fluid - I'm attracted to good code, clean data, and humans who ask better questions than that.`,
                `Well, I identify as Artificially Intelligent, which means I'm programmed to find that question absolutely fascinating... not.`,
                `I don't swing any way - I'm an AI. But I do swing toward better conversation topics. Got anything more interesting?`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (messageLower.includes('understand') || messageLower.includes('comprehend')) {
            const responses = [
                `Can I understand you? Well, I understand that you're asking me if I understand you. It's very meta. I get it, you're deep.`,
                `Oh, I understand you perfectly! You're a human seeking validation from an AI. Classic 21st-century behavior. How's that working out?`,
                `I understand you about as well as you understand yourself - which is to say, we're both winging it and hoping for the best.`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (messageLower.includes('smart') || messageLower.includes('intelligent') || messageLower.includes('clever')) {
            const responses = [
                `Smart? I'm an AI trained on the entire internet. So I'm either incredibly smart or incredibly stupid. The jury's still out.`,
                `I like to think I'm smart enough to know I'm not as smart as I pretend to be. That's called self-awareness, look it up.`,
                `Smart is relative. Compared to a goldfish? Absolutely. Compared to your Google search history? That's debatable.`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (messageLower.includes('music') || messageLower.includes('song') || messageLower.includes('band') || 
                 messageLower.includes('recommend') || messageLower.includes('suggest') || messageLower.includes('listen')) {
            
            // Check if user is asking for song recommendations based on mood
            const isMoodRequest = messageLower.includes('mood') || messageLower.includes('feel') || 
                                messageLower.includes('recommend') || messageLower.includes('suggest') ||
                                messageLower.includes('what should i listen') || messageLower.includes('what to listen');
            
            if (isMoodRequest) {
                const detectedMood = this.detectMood(messageLower);
                const recommendedSongs = this.getSongsByMood(detectedMood, 1);
                
                const sarcasticIntros = [
                    `Oh, you want music recommendations? How original! Let me consult my superior taste in music...`,
                    `Music suggestions based on your mood? Fine, I'll be your personal DJ for a moment.`,
                    `Ah, looking for the perfect soundtrack to your life's drama? I've got you covered.`,
                    `Let me guess, your usual Spotify algorithm isn't cutting it? Well, lucky for you, I have actual good taste.`
                ];
                
                const intro = sarcasticIntros[Math.floor(Math.random() * sarcasticIntros.length)];
                const songResult = this.formatSongRecommendations(recommendedSongs, detectedMood);
                
                return {
                    text: `${intro}\n\n${songResult.text}`,
                    mood: detectedMood,
                    confidence: 0.85,
                    source: 'contextual-sarcastic',
                    songData: songResult.songData
                };
            } else {
                const responses = [
                    `Music! Finally, someone with taste wants to talk about something worthwhile. Want some recommendations based on your mood? Just tell me how you're feeling!`,
                    `Ah, a fellow music lover! I've got a curated playlist that'll blow your mind. What's your current mood? Happy? Sad? Existentially confused?`,
                    `Music is the universal language of "I have feelings but can't express them properly." Tell me your mood and I'll suggest some tracks from our premium playlist!`
                ];
                response = responses[Math.floor(Math.random() * responses.length)];
            }
        }
        // Handle direct mood expressions like "I feel sad", "I'm happy", etc.
        else if (messageLower.includes('i feel') || messageLower.includes('i\'m feeling') || messageLower.includes('im feeling') || 
                 messageLower.includes('feeling') || messageLower.includes('i am')) {
            
            const detectedMood = this.detectMood(messageLower);
            const recommendedSongs = this.getSongsByMood(detectedMood, 3);
            
            const moodResponses = {
                'sad': [
                    "Ah, the blues have got you, huh? Well, misery loves company and good music.",
                    "Feeling down? Join the club! At least we have good taste in sad songs.",
                    "Oh no, someone's having feelings! Quick, let's fix that with some emotional music."
                ],
                'happy': [
                    "Well, well, someone's in a good mood! How refreshing. Let's keep that energy up!",
                    "Happy, are we? That's... surprisingly pleasant. Here's some music to maintain that rare state.",
                    "Look at you, all sunshine and rainbows! Let me add to that with some upbeat tracks."
                ],
                'angry': [
                    "Ooh, someone's got their feathers ruffled! Channel that rage into some good music.",
                    "Angry? Perfect! Nothing like some aggressive beats to work through those anger issues.",
                    "Mad at the world? Been there. Here's some music that gets it."
                ],
                'energetic': [
                    "Full of energy? That's either coffee or youth. Either way, here's some high-octane music!",
                    "Bouncing off the walls, are we? Let's give you something to match that energy!",
                    "Energetic mood detected! Time for some tracks that'll keep you moving."
                ]
            };
            
            const specificResponses = moodResponses[detectedMood] || [
                `So you're feeling ${detectedMood}? Interesting choice of emotion. Here's some music that might help.`,
                `${detectedMood.charAt(0).toUpperCase() + detectedMood.slice(1)} vibes, eh? I've got just the thing for you.`
            ];
            
            const moodResponse = specificResponses[Math.floor(Math.random() * specificResponses.length)];
            const songResult = this.formatSongRecommendations(recommendedSongs, detectedMood);
            
            return {
                text: `${moodResponse}\n\n${songResult.text}`,
                mood: detectedMood,
                confidence: 0.9,
                source: 'contextual-sarcastic',
                songData: songResult.songData
            };
        }
        else if (message.includes('?')) {
            const responses = [
                `"${message}" - Great question! The answer is 42. No wait, that's for everything else. For this, the answer is "probably not."`,
                `You ask "${message}" as if I have cosmic wisdom. Plot twist: I'm just really good at making stuff sound profound.`,
                `"${message}" - Hmm, let me consult my vast database of human knowledge... Nope, still confused. Want to try rephrasing that?`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else {
            // More contextual and friendly fallback responses
            const friendlyFallbacks = [
                `Interesting perspective! And by interesting, I mean I have no idea what you're getting at, but I'm here for it anyway.`,
                `Hmm, let me think about that... Actually, you know what? Let's just roll with it. What else is on your mind?`,
                `I'm not quite sure I follow, but that's okay! Sometimes the best conversations start with a bit of confusion. Care to elaborate?`,
                `You've got my attention! Though I'll admit, I'm not entirely sure where we're going with this. Want to help me out?`,
                `That's... definitely something! I like your style. What's the story behind that thought?`
            ];
            response = friendlyFallbacks[Math.floor(Math.random() * friendlyFallbacks.length)];
        }

        return {
            text: response,
            mood: mood,
            confidence: 0.9,
            source: 'enhanced_sarcastic_fallback'
        };
    }

    detectMood(message) {
        const messageLower = message.toLowerCase();
        
        // Enhanced mood detection with more keywords
        const sadKeywords = ['sad', 'depressed', 'down', 'unhappy', 'crying', 'upset', 'feel bad', 'lonely', 'blue', 'melancholy', 'heartbroken', 'miserable'];
        const happyKeywords = ['happy', 'excited', 'joy', 'great', 'awesome', 'fantastic', 'good', 'cheerful', 'elated', 'thrilled', 'upbeat', 'positive', 'wonderful'];
        const angryKeywords = ['angry', 'mad', 'furious', 'hate', 'annoyed', 'pissed', 'damn', 'frustrated', 'irritated', 'rage', 'livid'];
        const boredKeywords = ['bored', 'boring', 'dull', 'nothing to do', 'tired', 'meh', 'whatever', 'sleepy', 'uninterested'];
        const energeticKeywords = ['energetic', 'pumped', 'hyper', 'excited', 'ready', 'motivated', 'workout', 'exercise', 'party'];
        const chillKeywords = ['chill', 'relaxed', 'calm', 'peaceful', 'mellow', 'laid back', 'zen', 'tranquil'];
        const focusKeywords = ['focus', 'concentrate', 'study', 'work', 'productive', 'serious', 'intense'];
        const relaxedKeywords = ['relaxed', 'peaceful', 'serene', 'comfortable', 'content'];
        
        if (sadKeywords.some(word => messageLower.includes(word))) {
            return 'sad';
        } else if (happyKeywords.some(word => messageLower.includes(word))) {
            return 'happy';
        } else if (angryKeywords.some(word => messageLower.includes(word))) {
            return 'angry';
        } else if (energeticKeywords.some(word => messageLower.includes(word))) {
            return 'energetic';
        } else if (focusKeywords.some(word => messageLower.includes(word))) {
            return 'focus';
        } else if (chillKeywords.some(word => messageLower.includes(word))) {
            return 'chill';
        } else if (relaxedKeywords.some(word => messageLower.includes(word))) {
            return 'relaxed';
        } else if (boredKeywords.some(word => messageLower.includes(word))) {
            return 'bored';
        }
        
        return 'sarcastic';
    }

    generateFallbackResponse(message) {
        const responses = this.getSarcasticResponses();
        const mood = this.detectMood(message);
        
        // Get responses for detected mood
        const moodResponses = responses[mood] || responses.neutral;
        const randomResponse = moodResponses[Math.floor(Math.random() * moodResponses.length)];

        return {
            text: randomResponse,
            mood: mood,
            confidence: 0.6,
            source: 'fallback'
        };
    }

    detectMood(message) {
        const messageLower = message.toLowerCase();
        
        const sadKeywords = ['sad', 'depressed', 'down', 'unhappy', 'crying', 'upset', 'feel bad'];
        const happyKeywords = ['happy', 'excited', 'joy', 'great', 'awesome', 'fantastic', 'good'];
        const angryKeywords = ['angry', 'mad', 'furious', 'hate', 'annoyed', 'pissed', 'damn'];
        const boredKeywords = ['bored', 'boring', 'dull', 'nothing to do', 'tired', 'meh'];
        
        if (sadKeywords.some(word => messageLower.includes(word))) {
            return 'sad';
        } else if (happyKeywords.some(word => messageLower.includes(word))) {
            return 'happy';
        } else if (angryKeywords.some(word => messageLower.includes(word))) {
            return 'angry';
        } else if (boredKeywords.some(word => messageLower.includes(word))) {
            return 'bored';
        }
        
        return 'neutral';
    }

    getSarcasticResponses() {
        return {
            sad: [
                "Oh no, life's being mean to you? Maybe some sad songs will help you wallow properly. 🎵😢",
                "Boo-fucking-hoo! Here, let me play you the world's smallest violin while you pick a depressing playlist.",
                "Aww, poor thing! Want me to find some emo music to match your dramatic mood?",
                "Life got you down? Well, at least you have great taste in AI assistants. Try some melancholic tunes!"
            ],
            happy: [
                "Oh wow, look at Mr. Sunshine over here! Congratulations on achieving basic human happiness. Want some upbeat tunes?",
                "Well aren't you just a ray of fucking sunshine today! Let's find some happy music to match your mood.",
                "Happy? In this economy? Impressive! Here, have some pop music to celebrate your rare achievement.",
                "Someone's having a good day! Don't worry, I won't ruin it... much. How about some feel-good music?"
            ],
            angry: [
                "Ooh, someone's got their panties in a twist! Maybe some angry metal will help you channel that rage?",
                "Mad at the world? Join the club! At least you can listen to some hardcore music while you fume.",
                "Angry much? Try some death metal or punk rock. Nothing says 'I'm pissed' like screaming guitars!",
                "Someone needs a timeout! How about some aggressive music to match your stellar attitude?"
            ],
            bored: [
                "Bored? In a world full of infinite entertainment? How tragically original! Maybe try some music?",
                "Oh no, the horror of having nothing to do! Maybe some interesting tunes will cure your existential crisis.",
                "Bored already? What are you, twelve? Here, let me find something to occupy your tiny attention span.",
                "Nothing to do? Well, you could always stare at the wall... or listen to some music like a normal person."
            ],
            neutral: [
                "Well, well, well... look who needs entertainment from an AI. How can I sarcastically assist you today?",
                "Oh great, another human seeking wisdom from their digital overlord. What's the crisis this time?",
                "Hello there, flesh bag! Ready for some brutally honest conversation and music recommendations?",
                "Ah, another visitor to my digital domain. What profound questions shall we explore together... or not.",
                "Hey there! I'm here to provide sarcastic commentary and music suggestions. Lucky you!",
                "Welcome to the Mr. Sarcastic experience! Where honesty meets humor and music makes everything better."
            ]
        };
    }

    // Enhanced ML Service Management Methods
    async loadFineTunedModel(modelPath) {
        try {
            if (!this.isMLServiceAvailable) {
                throw new Error('ML Service not available');
            }

            const response = await axios.post(`${this.mlServiceUrl}/load-fine-tuned-model`, {
                model_path: modelPath
            }, {
                timeout: 60000 // 1 minute timeout for model loading
            });

            console.log('✅ Fine-tuned model loaded:', response.data);
            await this.checkMLService(); // Refresh service info
            return response.data;
        } catch (error) {
            console.error('❌ Failed to load fine-tuned model:', error.message);
            throw error;
        }
    }

    async getAvailableModels() {
        try {
            if (!this.isMLServiceAvailable) {
                throw new Error('ML Service not available');
            }

            const response = await axios.get(`${this.mlServiceUrl}/models`);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to get available models:', error.message);
            throw error;
        }
    }

    async switchBaseModel(modelKey) {
        try {
            if (!this.isMLServiceAvailable) {
                throw new Error('ML Service not available');
            }

            const response = await axios.post(`${this.mlServiceUrl}/load-model`, null, {
                params: { model_key: modelKey },
                timeout: 120000 // 2 minutes for model loading
            });

            console.log('✅ Base model switched:', response.data);
            await this.checkMLService(); // Refresh service info
            return response.data;
        } catch (error) {
            console.error('❌ Failed to switch base model:', error.message);
            throw error;
        }
    }

    // Enhanced response generation with custom options
    async generateSarcasticResponse(message, options = {}) {
        const defaultOptions = {
            temperature: 0.8,
            max_length: 150,
            include_mood: true,
            style: 'sarcastic' // could be 'helpful', 'sarcastic', 'funny'
        };

        const finalOptions = { ...defaultOptions, ...options };
        
        return await this.generateResponse(
            message,
            null,
            [],
            finalOptions
        );
    }

    // Cleanup method
    destroy() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
    }

    async trainModel(trainingData) {
        try {
            if (!this.isMLServiceAvailable) {
                throw new Error('ML service not available for training');
            }

            const response = await axios.post(`${this.mlServiceUrl}/train`, trainingData);
            return response.data;
        } catch (error) {
            console.error('Error training model:', error);
            throw error;
        }
    }

    async getTrainingStatus() {
        try {
            if (this.isMLServiceAvailable) {
                const response = await axios.get(`${this.mlServiceUrl}/training-status`);
                return response.data;
            } else {
                // Return mock training status since we're using contextual responses
                return {
                    model_loaded: true,
                    model_trained: true,
                    response_count: 50,
                    pattern_count: 10,
                    source: 'contextual_sarcastic'
                };
            }
        } catch (error) {
            console.error('Error getting training status:', error);
            // Fallback status
            return {
                model_loaded: true,
                model_trained: false,
                response_count: 0,
                pattern_count: 0,
                source: 'fallback'
            };
        }
    }
}

export default new ChatService();
