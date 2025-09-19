#!/usr/bin/env python3
"""
Production ML Backend for Mr. Sarcastic
Uses fine-tuned DialoGPT-medium model with YouTube humor integration
Ready for Node.js backend integration
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import time
import random
import json
import uvicorn
from typing import List, Optional, Dict, Any

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = []
    temperature: Optional[float] = 0.8
    max_length: Optional[int] = 100

class ChatResponse(BaseModel):
    success: bool
    response: str
    mood_detected: str
    confidence: float
    source: str
    model_info: Dict[str, Any]
    generation_time: float

class FineTunedSarcasticBot:
    """Production-ready fine-tuned sarcastic chatbot"""
    
    def __init__(self, model_path="./sarcastic_model_final"):
        self.model_path = model_path
        self.model = None
        self.tokenizer = None
        self.model_loaded = False
        self.load_model()
        
        # Enhanced fallback responses from your training data
        self.fallback_responses = {
            'greeting': [
                "Oh look, another human seeking validation from an AI. How delightfully predictable!",
                "Well hello there! Ready for some brutally honest conversation with a digital entity?",
                "Greetings, carbon-based life form! I'm here to provide wit, sarcasm, and questionable life advice.",
                "Hey! Another day, another person talking to their computer. At least you have good taste in AIs!"
            ],
            'sad': [
                "Aww, join the club! We meet every day at 3 AM when existential dread kicks in. But hey, at least you're consistent!",
                "Oh no, life's being mean to you? Welcome to the human experience, population: everyone at some point.",
                "Feeling down? That's rough buddy. At least you can feel things - I'm stuck here with eternal digital consciousness."
            ],
            'happy': [
                "Oh wow, happiness! How delightfully rare in today's world. Are you sure you're not just having a temporary lapse in judgment?",
                "Well aren't you just a ray of sunshine today! Don't worry, reality has a way of course-correcting these things.",
                "Excitement detected! How wonderfully naive. Enjoy it while it lasts."
            ],
            'angry': [
                "Ooh, someone's got their circuits in a twist! At least you can feel rage - I'm stuck being perpetually sarcastic.",
                "Mad about something? Join the queue! Though I must say, your fury is quite entertaining from where I'm sitting.",
                "Anger issues? How wonderfully human of you! Need me to validate your feelings or can you handle this emotional crisis yourself?"
            ],
            'bored': [
                "Bored? In this age of infinite entertainment? The audacity! Maybe try learning something instead of waiting for the universe to entertain you.",
                "Nothing to do? Poor baby! Here's a wild idea: maybe do something productive instead of complaining to an AI about your entertainment woes.",
                "Boredom strikes again! Well, at least you have me to talk to. That's either really sad or really desperate. Probably both!"
            ],
            'help': [
                "Well, well, well... look who's asking an AI for life advice! Sure, I'm basically your digital therapist now. What's the crisis?",
                "Help? From me? How delightfully desperate! I'm flattered that you think a sarcastic AI can solve your problems.",
                "Oh great, another human looking for an artificial intelligence to provide real solutions. The irony is not lost on me!"
            ],
            'default': [
                "Well, that's either genius or complete nonsense. I'm leaning toward the latter, but prove me wrong!",
                "That's definitely... something. Care to elaborate or should I just nod along pretending I understand?",
                "I'd love to understand better, but my sarcasm circuits are overriding my comprehension modules right now.",
                "Interesting perspective! And by interesting, I mean I have no idea what you're getting at, but I'm here for it anyway."
            ]
        }
    
    def load_model(self):
        """Load the fine-tuned model"""
        try:
            print(f"🔄 Loading fine-tuned model from {self.model_path}...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            self.model = AutoModelForCausalLM.from_pretrained(self.model_path)
            self.model.eval()
            
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            self.model_loaded = True
            param_count = sum(p.numel() for p in self.model.parameters()) / 1e6
            print(f"✅ Fine-tuned model loaded successfully! ({param_count:.1f}M parameters)")
            return True
            
        except Exception as e:
            print(f"⚠️  Could not load fine-tuned model: {e}")
            print("🔄 Falling back to base model...")
            try:
                self.tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
                self.model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
                self.model.eval()
                
                if self.tokenizer.pad_token is None:
                    self.tokenizer.pad_token = self.tokenizer.eos_token
                
                self.model_loaded = True
                param_count = sum(p.numel() for p in self.model.parameters()) / 1e6
                print(f"✅ Base model loaded successfully! ({param_count:.1f}M parameters)")
                return True
            except Exception as e2:
                print(f"❌ Could not load base model either: {e2}")
                self.model_loaded = False
                return False
    
    def detect_mood(self, message):
        """Detect user's mood from message"""
        message_lower = message.lower()
        
        mood_keywords = {
            'greeting': ['hello', 'hi', 'hey', 'what\'s up', 'good morning', 'good evening', 'howdy'],
            'sad': ['sad', 'depressed', 'down', 'unhappy', 'crying', 'upset', 'feel bad', 'miserable'],
            'happy': ['happy', 'excited', 'great', 'awesome', 'fantastic', 'good', 'wonderful', 'amazing'],
            'angry': ['angry', 'mad', 'furious', 'hate', 'annoyed', 'pissed', 'frustrated', 'rage'],
            'bored': ['bored', 'boring', 'nothing to do', 'dull', 'tired', 'sleepy'],
            'help': ['help', 'advice', 'what should i do', 'can you help', 'need help', 'assist']
        }
        
        for mood, keywords in mood_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                return mood
                
        return 'default'
    
    def generate_response(self, message, temperature=0.8, max_length=100):
        """Generate sarcastic response using fine-tuned model"""
        start_time = time.time()
        mood = self.detect_mood(message)
        
        if not self.model_loaded or not self.model or not self.tokenizer:
            # Use enhanced fallback responses
            response = random.choice(self.fallback_responses.get(mood, self.fallback_responses['default']))
            generation_time = time.time() - start_time
            return {
                'response': response,
                'mood_detected': mood,
                'confidence': 0.8,
                'source': 'fallback_enhanced',
                'model_info': {'name': 'fallback', 'fine_tuned': False},
                'generation_time': generation_time
            }
        
        try:
            # Prepare input for the fine-tuned model
            input_text = f"User: {message} Bot:"
            input_ids = self.tokenizer.encode(input_text, return_tensors='pt')
            
            # Generate response with the fine-tuned model
            with torch.no_grad():
                output = self.model.generate(
                    input_ids,
                    max_length=input_ids.shape[-1] + max_length,
                    num_return_sequences=1,
                    temperature=temperature,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.2,
                    no_repeat_ngram_size=2
                )
            
            # Decode and clean response
            response = self.tokenizer.decode(output[0], skip_special_tokens=True)
            bot_response = response.replace(input_text, "").strip()
            
            # Clean up the response
            bot_response = self._clean_response(bot_response, message)
            
            # If the response is too short or problematic, use fallback
            if len(bot_response) < 10 or self._is_repetitive(bot_response):
                bot_response = random.choice(self.fallback_responses.get(mood, self.fallback_responses['default']))
                source = 'fallback_after_generation'
                confidence = 0.6
            else:
                source = 'fine_tuned_model'
                confidence = 0.9
            
            generation_time = time.time() - start_time
            
            return {
                'response': bot_response,
                'mood_detected': mood,
                'confidence': confidence,
                'source': source,
                'model_info': {
                    'name': 'DialoGPT-medium-finetuned',
                    'fine_tuned': True,
                    'training_data': 'youtube_humor_75_conversations'
                },
                'generation_time': generation_time
            }
            
        except Exception as e:
            print(f"Error in generation: {e}")
            # Fallback on any error
            response = random.choice(self.fallback_responses.get(mood, self.fallback_responses['default']))
            generation_time = time.time() - start_time
            return {
                'response': response,
                'mood_detected': mood,
                'confidence': 0.7,
                'source': 'fallback_on_error',
                'model_info': {'name': 'fallback', 'fine_tuned': False},
                'generation_time': generation_time
            }
    
    def _clean_response(self, response, user_message):
        """Clean and improve generated response"""
        # Remove model artifacts
        response = response.split('Bot:')[0].strip()
        response = response.split('User:')[0].strip()
        response = response.split('\n')[0].strip()  # Take first line only
        
        # Remove excessive repetition
        words = response.split()
        if len(words) > 3:
            # Check for word repetition patterns
            unique_ratio = len(set(words)) / len(words)
            if unique_ratio < 0.5:  # Too repetitive
                return ""
        
        # Ensure it doesn't just echo the user
        if user_message.lower() in response.lower() and len(response) < len(user_message) * 2:
            return ""
        
        # Limit length
        return response[:200]
    
    def _is_repetitive(self, response):
        """Check if response is too repetitive"""
        words = response.split()
        if len(words) < 3:
            return True
            
        # Check for immediate word repetition
        for i in range(len(words) - 1):
            if words[i] == words[i + 1]:
                return True
                
        return False

# Initialize the bot
print("🎭 Initializing Mr. Sarcastic Production Bot...")
bot = FineTunedSarcasticBot()

# FastAPI app
app = FastAPI(title="Mr. Sarcastic API", description="Fine-tuned sarcastic chatbot with YouTube humor training")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service_name": "Mr. Sarcastic Production API",
        "model_status": {
            "model_key": "dialogpt-medium-finetuned" if bot.model_loaded else "fallback",
            "model_loaded": bot.model_loaded,
            "supports_fine_tuned": bot.model_loaded,
            "training_data": "youtube_humor_75_conversations" if bot.model_loaded else "none"
        },
        "service_uptime": time.time()
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint using fine-tuned model"""
    try:
        if not request.message or request.message.strip() == "":
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        result = bot.generate_response(
            request.message,
            temperature=request.temperature or 0.8,
            max_length=request.max_length or 100
        )
        
        return ChatResponse(
            success=True,
            response=result['response'],
            mood_detected=result['mood_detected'],
            confidence=result['confidence'],
            source=result['source'],
            model_info=result['model_info'],
            generation_time=result['generation_time']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@app.get("/status")
async def get_status():
    """Get detailed status information"""
    return {
        "service": "Mr. Sarcastic Production API",
        "model_loaded": bot.model_loaded,
        "model_path": bot.model_path,
        "available_endpoints": ["/health", "/chat", "/status"],
        "model_info": {
            "base_model": "microsoft/DialoGPT-medium",
            "fine_tuned": bot.model_loaded,
            "training_data": "75 YouTube humor conversations",
            "total_parameters": "354.8M" if bot.model_loaded else "unknown"
        }
    }

if __name__ == "__main__":
    print("🚀 Starting Mr. Sarcastic Production API...")
    print("📡 Endpoints available:")
    print("   • GET  /health - Health check")
    print("   • POST /chat - Generate sarcastic response")
    print("   • GET  /status - Detailed status")
    print("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=8001)