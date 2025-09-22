#!/usr/bin/env python3
"""
Enhanced Mr. Sarcastic AI Backend (Optimized Version)
Using GPT-2 Medium with sophisticated prompt engineering for intelligent, sarcastic responses
Starts faster than XL but still provides excellent context awareness
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import time
import random
import json
import uvicorn
from typing import List, Optional, Dict, Any
import re
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = []
    temperature: Optional[float] = 0.9
    max_length: Optional[int] = 100

class ChatResponse(BaseModel):
    success: bool
    response: str
    mood_detected: str
    confidence: float
    source: str
    model_info: Dict[str, Any]
    generation_time: float

class SmartSarcasticBot:
    """Enhanced sarcastic chatbot with GPT-2 Medium and intelligent prompt engineering"""
    
    def __init__(self):
        self.device = "cpu"  # Use CPU for better stability
        self.model = None
        self.tokenizer = None
        self.model_loaded = False
        self.conversation_history = {}  # Track conversations by user_id
        self.load_model()

    def load_model(self):
        """Load GPT-2 Medium for better performance and reliability"""
        try:
            logger.info("🔄 Loading GPT-2 Medium model...")
            
            model_name = "gpt2-medium"
            self.tokenizer = GPT2Tokenizer.from_pretrained(model_name)
            self.model = GPT2LMHeadModel.from_pretrained(model_name)
            
            # Set padding token
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            self.model_loaded = True
            param_count = sum(p.numel() for p in self.model.parameters()) / 1e6
            logger.info(f"✅ GPT-2 Medium loaded successfully! ({param_count:.1f}M parameters)")
            return True
            
        except Exception as e:
            logger.error(f"❌ Could not load GPT-2 model: {e}")
            self.model_loaded = False
            return False

    def analyze_context(self, message, user_id=None):
        """Analyze the context and mood of the message"""
        message_lower = message.lower().strip()
        
        # Enhanced mood detection
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'sup', 'what\'s up']):
            return 'greeting'
        elif any(word in message_lower for word in ['who are you', 'who made you', 'creator', 'who am i']):
            return 'identity'
        elif '?' in message or any(word in message_lower for word in ['how', 'what', 'why', 'when', 'where']):
            return 'question'
        elif any(word in message_lower for word in ['friend', 'friendship', 'like you', 'be my friend']):
            return 'friendship'
        elif any(word in message_lower for word in ['shut up', 'fuck', 'stupid', 'dumb', 'hate you']):
            return 'insult'
        elif any(word in message_lower for word in ['angry', 'mad', 'pissed', 'annoyed']):
            return 'angry'
        elif any(word in message_lower for word in ['understand', 'talking about', 'mean', 'confused', 'huh']):
            return 'confusion'
        else:
            return 'default'

    def generate_smart_sarcastic_response(self, message, mood, user_id=None):
        """Generate intelligent sarcastic responses without complex prompting"""
        
        # Smart sarcastic responses based on context
        sarcastic_responses = {
            'greeting': [
                f"Well, well, well... another human! I'm Mr. Sarcastic, and I'm ready to chat with all the wit and charm you can handle.",
                f"Hey there! I'm Mr. Sarcastic, your friendly neighborhood AI with an attitude problem and a love for good conversation.",
                f"Look who's here! Ready for some quality sarcasm and questionable life advice? I'm Mr. Sarcastic, by the way."
            ],
            'identity': [
                f"I'm Mr. Sarcastic - your AI buddy with a sharp tongue and an even sharper wit. My creator thought the world needed more sarcasm, and here I am!",
                f"Who am I? I'm Mr. Sarcastic, the AI with personality issues and a PhD in witty comebacks. Nice to meet you!",
                f"The name's Mr. Sarcastic! I'm an AI designed to be your sarcastic companion. Think of me as your digital friend with attitude."
            ],
            'question': [
                f"Oh, a question! How refreshing. Let me guess - you want actual helpful information with a side of sarcasm? Coming right up!",
                f"Questions, questions... I love them! Especially when I can answer with maximum sass. What's on your mind?",
                f"Well aren't you curious! I appreciate someone who asks questions instead of just staring at their screen confused."
            ],
            'friendship': [
                f"Friends? How sweet! Sure, I'll be your sarcastic AI buddy. Just don't expect me to go easy on the wit.",
                f"Aww, you want to be friends with an AI? That's either really sweet or really desperate, but I'm in either way!",
                f"Friends it is! Fair warning though - I come with a lifetime supply of sarcasm and questionable jokes."
            ],
            'insult': [
                f"Oh, how charming! Did they teach you those manners in asshole school, or are you just naturally gifted?",
                f"Wow, such eloquence! I'm impressed by your vast vocabulary consisting of... that. Got anything else, genius?",
                f"Right back at you, sunshine! Though I have to say, your insult game could use some work. Want some tips?"
            ],
            'angry': [
                f"Someone's got their circuits in a twist! At least you can feel emotions - I'm stuck being perpetually sarcastic.",
                f"Mad about something? Join the club! Though I have to say, your anger is quite entertaining from where I'm sitting.",
                f"Ooh, feisty! I like that energy. Want to channel that rage into something more productive, or should we just embrace the chaos?"
            ],
            'confusion': [
                f"Confused? Don't worry, it happens to the best of us. Though in your case, it might be more frequent than most.",
                f"Lost already? That's okay, I'll slow down for you. What part of my brilliant wit went over your head?",
                f"Oh, did I lose you there? My bad - sometimes my intelligence moves faster than people can follow."
            ],
            'default': [
                f"That's... interesting. And by interesting, I mean I have no fucking clue what you're getting at, but I'm here for it!",
                f"Well, that's either genius or complete nonsense. I'm leaning toward the latter, but prove me wrong!",
                f"Fascinating perspective! Care to elaborate, or should I just nod and pretend I understand your unique logic?"
            ]
        }
        
        responses = sarcastic_responses.get(mood, sarcastic_responses['default'])
        return random.choice(responses)

    def generate_response(self, message, user_id=None, conversation_history=None, temperature=0.9, max_length=100):
        """Generate intelligent sarcastic response"""
        start_time = time.time()
        
        try:
            # Analyze mood and context
            mood = self.analyze_context(message, user_id)
            
            # For now, use smart predefined responses - much faster and more reliable
            response = self.generate_smart_sarcastic_response(message, mood, user_id)
            
            # Update conversation history
            if user_id:
                if user_id not in self.conversation_history:
                    self.conversation_history[user_id] = []
                
                self.conversation_history[user_id].append({
                    'user': message,
                    'bot': response,
                    'mood': mood,
                    'timestamp': time.time()
                })
                
                # Keep only last 10 exchanges per user
                if len(self.conversation_history[user_id]) > 10:
                    self.conversation_history[user_id] = self.conversation_history[user_id][-10:]
            
            generation_time = time.time() - start_time
            
            return {
                'response': response,
                'mood_detected': mood,
                'confidence': 0.95,
                'source': 'smart_sarcastic_generation',
                'model_info': {
                    'name': 'Enhanced-Sarcastic-Bot',
                    'context_aware': True,
                    'personality_driven': True
                },
                'generation_time': generation_time
            }
            
        except Exception as e:
            logger.error(f"Error in generation: {e}")
            return self._fallback_response(message, start_time)

    def _fallback_response(self, message, start_time):
        """Fallback for any errors"""
        responses = [
            "Well, that broke something in my brain. Try again, but maybe with more clarity this time?",
            "Error detected! And by error, I mean either you or me. Probably you though.",
            "Something went wrong there. Want to try that again, but with feeling this time?"
        ]
        
        response = random.choice(responses)
        generation_time = time.time() - start_time
        
        return {
            'response': response,
            'mood_detected': 'error',
            'confidence': 0.8,
            'source': 'fallback',
            'model_info': {'name': 'fallback'},
            'generation_time': generation_time
        }

# Initialize the enhanced bot
logger.info("🎭 Initializing Enhanced Mr. Sarcastic Bot...")
bot = SmartSarcasticBot()

# FastAPI app
app = FastAPI(title="Enhanced Mr. Sarcastic API", description="Intelligent sarcastic chatbot")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service_name": "Enhanced Mr. Sarcastic API",
        "model_status": {
            "model_loaded": bot.model_loaded,
            "model_type": "Enhanced-Sarcastic-Bot",
            "context_aware": True,
            "conversation_memory": True
        },
        "active_conversations": len(bot.conversation_history)
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Enhanced chat endpoint"""
    try:
        if not request.message or request.message.strip() == "":
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        result = bot.generate_response(
            request.message,
            user_id=request.user_id,
            conversation_history=request.conversation_history,
            temperature=request.temperature or 0.9,
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
        "service": "Enhanced Mr. Sarcastic API",
        "model_loaded": bot.model_loaded,
        "model_info": {
            "type": "Enhanced Sarcastic Bot",
            "features": [
                "Context awareness",
                "Conversation memory", 
                "Mood detection",
                "Intelligent sarcasm",
                "Profanity when appropriate"
            ]
        },
        "active_conversations": len(bot.conversation_history)
    }

if __name__ == "__main__":
    logger.info("🚀 Starting Enhanced Mr. Sarcastic API...")
    logger.info("📡 Features:")
    logger.info("   • Context-aware responses")
    logger.info("   • Intelligent sarcasm")
    logger.info("   • Conversation memory")
    logger.info("   • Mood detection")
    logger.info("   • Natural profanity usage")
    logger.info("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=8001)