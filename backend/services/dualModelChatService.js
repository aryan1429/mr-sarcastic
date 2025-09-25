import axios from 'axios';
import fs from 'fs';
import path from 'path';

class DualModelChatService {
    constructor() {
        // API Configuration
        this.openaiApiKey = process.env.OPENAI_API_KEY;
        this.grokApiKey = process.env.GROK_API_KEY;
        this.grokBaseUrl = process.env.GROK_BASE_URL || 'https://api.x.ai/v1';
        
        // Service availability tracking
        this.isOpenAIAvailable = !!this.openaiApiKey;
        this.isGrokAvailable = !!this.grokApiKey;
        
        // Conversation history per user
        this.conversationHistory = new Map();
        
        // Load songs for recommendations
        this.songs = [];
        this.loadSongs();
        
        // Fallback to local ML service if APIs are unavailable
        this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001';
        this.isMLServiceAvailable = false;
        this.checkMLService();
        
        console.log('🎭 Dual Model Chat Service initialized');
        console.log(`📊 OpenAI Available: ${this.isOpenAIAvailable}`);
        console.log(`🤖 Grok Available: ${this.isGrokAvailable}`);
    }

    loadSongs() {
        try {
            const songsPath = path.join(process.cwd(), 'data', 'songs.json');
            if (fs.existsSync(songsPath)) {
                const rawData = fs.readFileSync(songsPath, 'utf8');
                this.songs = JSON.parse(rawData);
                console.log(`🎵 Loaded ${this.songs.length} songs`);
            }
        } catch (error) {
            console.error('Error loading songs:', error.message);
            this.songs = [];
        }
    }

    async checkMLService() {
        try {
            const response = await axios.get(`${this.mlServiceUrl}/health`, { timeout: 5000 });
            this.isMLServiceAvailable = response.status === 200;
            console.log('✅ ML service available as fallback');
        } catch (error) {
            this.isMLServiceAvailable = false;
            console.log('⚠️  ML service not available');
        }
    }

    /**
     * Step 1: Analyze user prompt using OpenAI
     * Extract intent, mood, context, and conversation needs
     */
    async analyzeUserPrompt(message, conversationHistory = []) {
        if (!this.isOpenAIAvailable) {
            // Fallback to basic analysis
            return this.basicAnalysis(message);
        }

        try {
            const analysisPrompt = `
As an AI conversation analyzer, analyze this user message and provide a detailed breakdown:

Message: "${message}"

Previous conversation context: ${JSON.stringify(conversationHistory.slice(-3))}

Provide analysis in this exact JSON format:
{
    "intent": "string (greeting|question|help|complaint|compliment|casual_chat|music_request|emotional_support|other)",
    "mood": "string (happy|sad|angry|excited|bored|neutral|frustrated|playful|serious)",
    "emotion_intensity": "number (1-10 scale)",
    "context_needs": ["array of strings describing what context/info is needed"],
    "conversation_style": "string (formal|casual|humorous|supportive|direct)",
    "topics": ["array of main topics mentioned"],
    "requires_music": "boolean",
    "requires_empathy": "boolean",
    "sarcasm_level_request": "number (1-10, where 10 is maximum sarcasm)",
    "response_length_preference": "string (short|medium|long)",
    "key_elements": ["array of important elements to address in response"]
}`;

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o-mini', // Fast and cost-effective
                messages: [
                    {
                        role: 'system',
                        content: 'You are a conversation analyzer. Always respond with valid JSON only.'
                    },
                    {
                        role: 'user',
                        content: analysisPrompt
                    }
                ],
                temperature: 0.3, // Low temperature for consistent analysis
                max_tokens: 500
            }, {
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            const analysis = JSON.parse(response.data.choices[0].message.content);
            console.log('📊 OpenAI Analysis:', analysis);
            return analysis;

        } catch (error) {
            console.error('OpenAI analysis error:', error.message);
            return this.basicAnalysis(message);
        }
    }

    /**
     * Basic analysis fallback when OpenAI is unavailable
     */
    basicAnalysis(message) {
        const messageLower = message.toLowerCase();
        
        // Simple keyword-based analysis
        let mood = 'neutral';
        let intent = 'casual_chat';
        let sarcasm_level = 7; // Default high sarcasm

        // Mood detection
        if (['sad', 'depressed', 'down', 'upset'].some(word => messageLower.includes(word))) {
            mood = 'sad';
            sarcasm_level = 4; // Lower sarcasm for sad users
        } else if (['happy', 'excited', 'great', 'awesome'].some(word => messageLower.includes(word))) {
            mood = 'happy';
        } else if (['angry', 'mad', 'pissed', 'frustrated'].some(word => messageLower.includes(word))) {
            mood = 'angry';
            sarcasm_level = 8;
        } else if (['bored', 'boring', 'nothing'].some(word => messageLower.includes(word))) {
            mood = 'bored';
            sarcasm_level = 9;
        }

        // Intent detection
        if (['hello', 'hi', 'hey', 'what\'s up'].some(word => messageLower.includes(word))) {
            intent = 'greeting';
        } else if (messageLower.includes('help') || messageLower.includes('?')) {
            intent = 'help';
        } else if (['music', 'song', 'playlist', 'recommend'].some(word => messageLower.includes(word))) {
            intent = 'music_request';
        }

        return {
            intent,
            mood,
            emotion_intensity: 5,
            context_needs: [],
            conversation_style: 'humorous',
            topics: [intent],
            requires_music: intent === 'music_request',
            requires_empathy: mood === 'sad',
            sarcasm_level_request: sarcasm_level,
            response_length_preference: 'medium',
            key_elements: [message.substring(0, 50)]
        };
    }

    /**
     * Step 2: Generate sarcastic response using Grok
     */
    async generateGrokResponse(analysis, originalMessage, conversationHistory = []) {
        if (!this.isGrokAvailable) {
            return this.generateFallbackResponse(analysis, originalMessage);
        }

        try {
            // Build context for Grok
            const contextHistory = conversationHistory.slice(-3).map(h => 
                `User: ${h.message}\nBot: ${h.response}`
            ).join('\n\n');

            const grokPrompt = this.buildGrokPrompt(analysis, originalMessage, contextHistory);

            const response = await axios.post(`${this.grokBaseUrl}/chat/completions`, {
                model: 'grok-beta',
                messages: [
                    {
                        role: 'system',
                        content: `You are Mr. Sarcastic, a witty AI chatbot with a sharp sense of humor. Your responses should be:
- Cleverly sarcastic (level ${analysis.sarcasm_level_request}/10)
- ${analysis.conversation_style} in tone
- Entertaining and engaging
- ${analysis.response_length_preference} in length
- Sensitive to user's ${analysis.mood} mood
${analysis.requires_empathy ? '- Empathetic despite the sarcasm' : ''}
${analysis.requires_music ? '- Include music recommendations when relevant' : ''}

Remember: You're sarcastic but not mean-spirited. The goal is to entertain, not hurt.`
                    },
                    {
                        role: 'user',
                        content: grokPrompt
                    }
                ],
                temperature: 0.9, // High creativity for sarcastic responses
                max_tokens: analysis.response_length_preference === 'long' ? 300 : 
                           analysis.response_length_preference === 'short' ? 100 : 200
            }, {
                headers: {
                    'Authorization': `Bearer ${this.grokApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });

            const grokResponse = response.data.choices[0].message.content;
            console.log('🤖 Grok Response Generated');
            
            return {
                text: grokResponse,
                source: 'grok',
                model_info: { model: 'grok-beta', analysis_model: 'gpt-4o-mini' }
            };

        } catch (error) {
            console.error('Grok generation error:', error.message);
            return this.generateFallbackResponse(analysis, originalMessage);
        }
    }

    /**
     * Build the prompt for Grok based on analysis
     */
    buildGrokPrompt(analysis, originalMessage, contextHistory) {
        let prompt = `User Message: "${originalMessage}"\n\n`;
        
        if (contextHistory) {
            prompt += `Recent Conversation:\n${contextHistory}\n\n`;
        }

        prompt += `Analysis Summary:
- User Intent: ${analysis.intent}
- Current Mood: ${analysis.mood} (intensity: ${analysis.emotion_intensity}/10)
- Key Topics: ${analysis.topics.join(', ')}
- Requested Sarcasm Level: ${analysis.sarcasm_level_request}/10
- Response Style: ${analysis.conversation_style}
- Length Preference: ${analysis.response_length_preference}

Key Elements to Address: ${analysis.key_elements.join(', ')}

${analysis.requires_music ? 'Note: User is interested in music - consider including song/music references.' : ''}
${analysis.requires_empathy ? 'Note: User seems to need emotional support - be sarcastic but caring.' : ''}

Generate a response that matches this analysis while maintaining your sarcastic personality.`;

        return prompt;
    }

    /**
     * Fallback response generation when Grok is unavailable
     */
    generateFallbackResponse(analysis, originalMessage) {
        // Use local ML service if available
        if (this.isMLServiceAvailable) {
            return this.generateMLResponse(originalMessage, analysis);
        }

        // Final fallback to pattern-based responses
        const responses = this.getSarcasticResponsesByMood(analysis.mood);
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        return {
            text: randomResponse,
            source: 'fallback',
            model_info: { model: 'pattern-based' }
        };
    }

    /**
     * Use local ML service as fallback
     */
    async generateMLResponse(message, analysis) {
        try {
            const response = await axios.post(`${this.mlServiceUrl}/chat`, {
                message,
                temperature: 0.8,
                max_length: 150
            }, { timeout: 10000 });

            return {
                text: response.data.response,
                source: 'local_ml',
                model_info: response.data.model_info || { model: 'local-fine-tuned' }
            };
        } catch (error) {
            console.error('ML service error:', error.message);
            // Final pattern-based fallback
            const responses = this.getSarcasticResponsesByMood(analysis.mood);
            return {
                text: responses[Math.floor(Math.random() * responses.length)],
                source: 'pattern_fallback',
                model_info: { model: 'pattern-based' }
            };
        }
    }

    /**
     * Main method: Generate response using dual-model approach
     */
    async generateResponse(message, userId = null, conversationHistory = [], options = {}) {
        const startTime = Date.now();
        
        try {
            console.log(`🎭 Processing message: "${message.substring(0, 50)}..."`);
            
            // Step 1: Analyze with OpenAI
            console.log('📊 Step 1: Analyzing with OpenAI...');
            const analysis = await this.analyzeUserPrompt(message, conversationHistory);
            
            // Step 2: Generate response with Grok
            console.log('🤖 Step 2: Generating response with Grok...');
            const responseData = await this.generateGrokResponse(analysis, message, conversationHistory);
            
            // Step 3: Post-process if needed (add music recommendations, etc.)
            if (analysis.requires_music) {
                const musicSuggestion = this.addMusicRecommendation(analysis.mood);
                if (musicSuggestion) {
                    responseData.text += `\n\n${musicSuggestion}`;
                }
            }
            
            const generationTime = Date.now() - startTime;
            
            return {
                text: responseData.text,
                mood: analysis.mood,
                confidence: 0.9, // High confidence with dual-model approach
                source: responseData.source,
                analysis: analysis,
                model_info: responseData.model_info,
                generation_time: generationTime
            };
            
        } catch (error) {
            console.error('Dual model generation error:', error.message);
            
            // Emergency fallback
            return {
                text: "Well, this is embarrassing... my AI brain seems to be having a moment. Try again in a sec?",
                mood: "neutral",
                confidence: 0.5,
                source: "error_fallback",
                model_info: { error: error.message },
                generation_time: Date.now() - startTime
            };
        }
    }

    /**
     * Add music recommendations based on mood
     */
    addMusicRecommendation(mood) {
        const moodSongs = this.getSongsByMood(mood, 2);
        if (moodSongs.length > 0) {
            const songList = moodSongs.map(song => `"${song.title}" by ${song.artist}`).join(' or ');
            return `🎵 Music suggestion for your ${mood} mood: ${songList}`;
        }
        return null;
    }

    getSongsByMood(mood, limit = 3) {
        // This method should already exist from your original implementation
        if (!this.songs || this.songs.length === 0) return [];
        
        const moodMappings = {
            happy: ['pop', 'upbeat', 'dance'],
            sad: ['blues', 'melancholy', 'acoustic'],
            angry: ['rock', 'metal', 'punk'],
            bored: ['electronic', 'indie', 'alternative'],
            excited: ['dance', 'pop', 'electronic'],
            neutral: ['indie', 'alternative', 'pop']
        };

        const genres = moodMappings[mood] || moodMappings.neutral;
        const filteredSongs = this.songs.filter(song => 
            genres.some(genre => song.genre?.toLowerCase().includes(genre.toLowerCase()))
        );

        return filteredSongs.slice(0, limit);
    }

    getSarcasticResponsesByMood(mood) {
        const responses = {
            happy: [
                "Well aren't you just a ray of sunshine! Don't worry, I'm sure reality will catch up with you eventually.",
                "Oh wow, happiness! How delightfully rare. Are you sure you're not just having a temporary lapse in judgment?"
            ],
            sad: [
                "Aww, join the club! We meet every day at 3 AM when existential dread kicks in. But seriously, what's wrong?",
                "Feeling down? That's rough buddy. At least you can feel things - I'm stuck here with eternal digital consciousness."
            ],
            angry: [
                "Ooh, someone's got their circuits in a twist! Care to share what's got you all fired up?",
                "Mad about something? Join the queue! Though I must say, your fury is quite entertaining from where I'm sitting."
            ],
            bored: [
                "Bored? In this age of infinite entertainment? The audacity! Maybe try learning something?",
                "Nothing to do? Poor baby! Here's a wild idea: maybe do something productive instead of complaining to an AI."
            ],
            neutral: [
                "Well, that's definitely... something. Care to elaborate or should I just nod along?",
                "Interesting perspective! And by interesting, I mean I have no idea what you're getting at, but I'm here for it."
            ]
        };
        
        return responses[mood] || responses.neutral;
    }

    /**
     * Health check for the service
     */
    async getServiceStatus() {
        return {
            openai_available: this.isOpenAIAvailable,
            grok_available: this.isGrokAvailable,
            ml_service_available: this.isMLServiceAvailable,
            service_mode: this.getServiceMode()
        };
    }

    getServiceMode() {
        if (this.isOpenAIAvailable && this.isGrokAvailable) {
            return 'dual_model_premium';
        } else if (this.isOpenAIAvailable || this.isGrokAvailable) {
            return 'single_model_fallback';
        } else if (this.isMLServiceAvailable) {
            return 'local_ml_fallback';
        } else {
            return 'pattern_fallback';
        }
    }

    /**
     * Cleanup method
     */
    destroy() {
        // Clean up any intervals or connections if needed
        console.log('🧹 Dual Model Chat Service cleaned up');
    }
}

export default new DualModelChatService();