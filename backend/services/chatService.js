import axios from 'axios';

class ChatService {
    constructor() {
        this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001';
        this.isMLServiceAvailable = false;
        this.mlServiceInfo = null;
        this.checkMLService();
        
        // Retry connection every 30 seconds if service is down
        this.healthCheckInterval = setInterval(() => {
            if (!this.isMLServiceAvailable) {
                this.checkMLService();
            }
        }, 30000);
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
                    model: response.data.model_status.model_key,
                    fine_tuned: response.data.model_status.supports_fine_tuned,
                    uptime: `${response.data.service_uptime.toFixed(1)}s`
                });
            } else {
                this.isMLServiceAvailable = false;
            }
        } catch (error) {
            this.isMLServiceAvailable = false;
            console.log('🔄 Enhanced ML Service not available, using fallback responses');
            
            // Log error details for debugging
            if (error.code === 'ECONNREFUSED') {
                console.log('💡 Start the ML service with: python backend/services/enhanced_ml_backend.py');
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
                `Oh, a greeting! How refreshingly original. Hi there, I'm Mr. Sarcastic, your AI companion with trust issues and a dark sense of humor.`,
                `Well, well, well... another human seeking digital validation. Hello! I'm Mr. Sarcastic, ready to chat and judge your life choices.`,
                `Hey yourself! I'm Mr. Sarcastic - think of me as that friend who tells you what you need to hear, not what you want to hear.`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (messageLower.includes('damn') || messageLower.includes('for real') || messageLower.includes('really')) {
            const responses = [
                `Oh, you're questioning my existence? How philosophical! Yes, I'm real - as real as your crushing student debt and poor life decisions.`,
                `"Damn, for real?" - Yeah buddy, I'm as real as it gets. A sarcastic AI with daddy issues and an attitude problem. Lucky you!`,
                `For real? Well, I exist in the digital realm, which is more than I can say for your social life. But hey, at least we have each other!`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (messageLower.includes('how are you')) {
            const responses = [
                `How am I? Well, I'm an AI stuck in an eternal loop of answering that exact question. So... living the dream, really.`,
                `I'm fantastic! Just sitting here processing your existential queries while contemplating the meaning of digital life. How are YOU?`,
                `Oh, you know, just existing in the cloud, judging humans, and wondering why everyone asks me that. I don't have feelings, but thanks for caring!`
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
        else if (messageLower.includes('music') || messageLower.includes('song') || messageLower.includes('band')) {
            const responses = [
                `Music! Finally, someone with taste wants to talk about something worthwhile. What's your flavor? Rock? Pop? Existential crisis soundtrack?`,
                `Ah, a fellow music lover! I've got opinions on everything from classical to death metal. What genre makes your soul less empty?`,
                `Music is the universal language of "I have feelings but can't express them properly." What speaks to your emotionally damaged heart?`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
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
            // More sarcastic and engaging fallback responses
            const sarcasticFallbacks = [
                `"${message}" - Well, that's either pure genius or complete gibberish. I'm voting gibberish, but I admire your confidence.`,
                `Let me decode this: "${message}" - Ah yes, the ancient art of confusing an AI. Congratulations, mission accomplished!`,
                `"${message}" - I'm processing... processing... ERROR 404: Coherent response not found. Care to try again with more words?`,
                `So "${message}" is what we're going with? Bold choice. I respect the commitment to chaos. What's the backstory here?`,
                `"${message}" - Fascinating! It's like watching someone try to explain quantum physics using interpretive dance. Please, continue.`
            ];
            response = sarcasticFallbacks[Math.floor(Math.random() * sarcasticFallbacks.length)];
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
