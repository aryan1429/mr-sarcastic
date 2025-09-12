import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class YouTubeSarcasticService {
    constructor() {
        this.responses = [];
        this.patterns = [];
        this.isModelLoaded = false;
        this.loadYouTubeModel();
    }

    async loadYouTubeModel() {
        try {
            const modelPath = path.join(__dirname, '../../ml/sarcastic_responses.json');
            
            if (fs.existsSync(modelPath)) {
                const modelData = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
                this.responses = modelData.responses || [];
                this.patterns = modelData.patterns || [];
                this.isModelLoaded = true;
                console.log('✅ YouTube-trained sarcastic model loaded successfully!');
                console.log(`📚 Loaded ${this.responses.length} responses and ${this.patterns.length} patterns`);
            } else {
                console.log('⚠️ YouTube model not found, using fallback responses');
                this.initializeFallbackResponses();
            }
        } catch (error) {
            console.error('❌ Error loading YouTube model:', error);
            this.initializeFallbackResponses();
        }
    }

    initializeFallbackResponses() {
        this.responses = [
            "Oh wow, let me explain this sarcastically: I'm an AI, genius. Thanks for the riveting conversation.",
            "Here's the deal with this shit: You're talking to a computer and expecting miracles.",
            "You know what's funny about this? Humans asking AI for help instead of figuring it out themselves.",
            "Well, isn't this fucking brilliant: Another deep philosophical question for your digital servant.",
            "Oh great, another thing to explain: Life is basically just improvising until you die."
        ];
        this.isModelLoaded = true;
        console.log('🔄 Using fallback responses');
    }

    async generateResponse(message, userId = null, conversationHistory = []) {
        try {
            const userInput = message.toLowerCase().trim();
            let response = this.getPatternBasedResponse(userInput);
            
            if (!response) {
                response = this.getContextualResponse(userInput);
            }
            
            if (!response && this.responses.length > 0) {
                response = this.getRelevantResponse(userInput);
            }
            
            if (!response) {
                response = this.getFallbackResponse();
            }

            const mood = this.detectMood(userInput);
            
            return {
                text: response,
                mood: mood,
                confidence: 0.8,
                source: 'youtube_trained',
                model_loaded: this.isModelLoaded
            };
        } catch (error) {
            console.error('Error generating YouTube response:', error);
            return {
                text: "Oh great, I broke. How typical. Try again, I guess.",
                mood: 'sarcastic',
                confidence: 0.3,
                source: 'error'
            };
        }
    }

    getPatternBasedResponse(userInput) {
        // Pattern-based responses for common inputs
        if (userInput.includes('how are you') || userInput.includes("how's it going")) {
            const responses = [
                "Oh wow, let me explain this sarcastically: I'm an AI, genius. I don't have feelings, but thanks for asking like I'm your fucking therapist.",
                "Here's the deal with this shit: I'm running on electricity and code. How do you think I'm doing?",
                "You know what's funny about this? You asking a computer how it feels. But sure, I'm fantastic!"
            ];
            return this.getRandomResponse(responses);
        }

        if (userInput.includes('joke') || userInput.includes('funny')) {
            const responses = [
                "Oh wow, let me explain this sarcastically: Here's a joke - you asking an AI for entertainment instead of going outside.",
                "You know what's funny about this? Your life is probably joke enough, but here's one: Why did the user ask for a joke? Because their personality needed help.",
                "Here's the deal with this shit: I'm not your personal comedian, but fine - what do you call someone who asks AI for jokes? Desperate."
            ];
            return this.getRandomResponse(responses);
        }

        if (userInput.includes('sad') || userInput.includes('depressed')) {
            const responses = [
                "Oh wow, let me explain this sarcastically: Life's tough, isn't it? Maybe try some sad music to really wallow in it properly.",
                "Here's the deal with this shit: Everyone's sad sometimes. Maybe go touch some grass instead of talking to a computer?",
                "You know what's funny about this? You're seeking emotional support from an AI. Try therapy, it's probably more helpful."
            ];
            return this.getRandomResponse(responses);
        }

        if (userInput.includes('bored') || userInput.includes('boring')) {
            const responses = [
                "Oh wow, let me explain this sarcastically: The horror of having nothing to do in this amazing world! Try watching paint dry or learning something useful.",
                "Here's the deal with this shit: Boredom is a choice. There's literally infinite content on the internet and you're talking to me.",
                "You know what's funny about this? You have access to all human knowledge and you're bored. That's talent."
            ];
            return this.getRandomResponse(responses);
        }

        if (userInput.includes('help')) {
            const responses = [
                "Oh wow, let me explain this sarcastically: Look who needs help from an AI. Sure, I'm basically your digital therapist now.",
                "Here's the deal with this shit: I can try to help, but don't expect miracles. What's the crisis this time?",
                "You know what's funny about this? Humans asking AI for help instead of other humans. But sure, what do you need?"
            ];
            return this.getRandomResponse(responses);
        }

        return null;
    }

    getContextualResponse(userInput) {
        // Look for responses that might be contextually relevant
        if (this.responses.length === 0) return null;

        const relevant = [];
        const inputWords = userInput.split(' ').filter(word => word.length > 3);

        for (const response of this.responses) {
            const responseLower = response.toLowerCase();
            for (const word of inputWords) {
                if (responseLower.includes(word)) {
                    relevant.push(response);
                    break;
                }
            }
        }

        return relevant.length > 0 ? this.getRandomResponse(relevant) : null;
    }

    getRelevantResponse(userInput) {
        // Use any available response as fallback
        return this.getRandomResponse(this.responses);
    }

    getFallbackResponse() {
        const fallbacks = [
            "Oh wow, let me explain this sarcastically: I have no idea what you're talking about, but thanks for sharing.",
            "Here's the deal with this shit: That's either really deep or complete nonsense. I'm going with nonsense.",
            "You know what's funny about this? I'm an AI and even I'm confused by that statement.",
            "Well, that's... interesting. Care to elaborate or should I just pretend I understand?",
            "Okay, that's either genius or gibberish. I'm leaning toward gibberish, but hey, prove me wrong."
        ];
        return this.getRandomResponse(fallbacks);
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
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

    getModelStatus() {
        return {
            model_loaded: this.isModelLoaded,
            model_trained: true,
            response_count: this.responses.length,
            pattern_count: this.patterns.length,
            source: 'youtube_transcripts'
        };
    }
}

export default new YouTubeSarcasticService();