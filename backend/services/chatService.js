import axios from 'axios';
import youtubeSarcasticService from './youtubeSarcasticService.js';

class ChatService {
    constructor() {
        this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001';
        this.isMLServiceAvailable = false;
        this.checkMLService();
    }

    async checkMLService() {
        try {
            const response = await axios.get(`${this.mlServiceUrl}/health`);
            this.isMLServiceAvailable = response.status === 200;
            console.log('ML Service status:', response.data);
        } catch (error) {
            this.isMLServiceAvailable = false;
            console.log('ML Service not available, using YouTube-trained responses');
        }
    }

    async generateResponse(message, userId = null, conversationHistory = []) {
        try {
            if (this.isMLServiceAvailable) {
                // Use ML service for response generation
                const response = await axios.post(`${this.mlServiceUrl}/chat`, {
                    message,
                    user_id: userId,
                    conversation_history: conversationHistory
                });

                return {
                    text: response.data.response,
                    mood: response.data.mood_detected,
                    confidence: response.data.confidence,
                    source: 'ml'
                };
            } else {
                // Use YouTube-trained sarcastic service
                return await youtubeSarcasticService.generateResponse(message, userId, conversationHistory);
            }
        } catch (error) {
            console.error('Error generating ML response:', error);
            // Fallback to YouTube-trained responses on error
            return await youtubeSarcasticService.generateResponse(message, userId, conversationHistory);
        }
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
                // Return YouTube model status
                return youtubeSarcasticService.getModelStatus();
            }
        } catch (error) {
            console.error('Error getting training status:', error);
            // Fallback to YouTube model status
            return youtubeSarcasticService.getModelStatus();
        }
    }
}

export default new ChatService();
