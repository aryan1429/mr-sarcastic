#!/usr/bin/env python3
"""
Lightweight ML Backend Service for Mr. Sarcastic
Simple FastAPI service with basic sarcastic response generation
"""

import os
import sys
import json
import random
import time
from typing import Dict, List, Optional, Any
import logging

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    import uvicorn
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    print("💡 Install with: pip install fastapi uvicorn")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Mr. Sarcastic Light ML Backend", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = []
    temperature: Optional[float] = 0.8
    max_length: Optional[int] = 150

class ChatResponse(BaseModel):
    response: str
    mood_detected: str
    confidence: float
    source: str
    model_info: Dict[str, Any]
    generation_time: float

class LightSarcasticBot:
    """Lightweight sarcastic bot using pattern matching"""
    
    def __init__(self):
        self.start_time = time.time()
        self.responses_loaded = False
        self.sarcastic_responses = {}
        self.load_responses()
    
    def load_responses(self):
        """Load sarcastic responses from JSON file"""
        try:
            responses_file = os.path.join(os.path.dirname(__file__), "sarcastic_responses.json")
            if os.path.exists(responses_file):
                with open(responses_file, 'r', encoding='utf-8') as f:
                    self.sarcastic_responses = json.load(f)
                self.responses_loaded = True
                logger.info(f"✅ Loaded {len(self.sarcastic_responses)} response categories")
            else:
                logger.warning("⚠️  No sarcastic_responses.json found, using built-in responses")
                self._load_builtin_responses()
        except Exception as e:
            logger.error(f"❌ Error loading responses: {e}")
            self._load_builtin_responses()
    
    def _load_builtin_responses(self):
        """Load built-in sarcastic responses"""
        self.sarcastic_responses = {
            "greeting": [
                "Oh, a greeting! How refreshingly original. Hi there, I'm Mr. Sarcastic, your AI companion with trust issues and a dark sense of humor.",
                "Well, well, well... another human seeking digital validation. Hello! I'm Mr. Sarcastic, ready to chat and judge your life choices.",
                "Hey yourself! I'm Mr. Sarcastic - think of me as that friend who tells you what you need to hear, not what you want to hear."
            ],
            "identity": [
                "I'm Mr. Sarcastic, your friendly neighborhood AI with a sense of humor and a love for good music. Think of me as a digital roast master with a heart.",
                "I'm a bot, but not just any bot - I'm Mr. Sarcastic, designed to be your entertaining digital companion with questionable advice and witty comebacks.",
                "I'm an AI with attitude, created to bring some sarcasm and humor to your day. I'm like that friend who's brutally honest but means well."
            ],
            "confusion": [
                "I'm processing... processing... Ah, I see you've mastered the art of confusing an AI. Impressive! Care to elaborate?",
                "That's either pure genius or complete gibberish. I'm leaning toward gibberish, but I admire your confidence.",
                "Interesting perspective! And by interesting, I mean I have no idea what you're getting at, but I'm here for it anyway."
            ],
            "questions": [
                "Great question! Let me consult my vast database of... oh wait, I'm just going to wing it and hope for the best.",
                "You ask as if I have cosmic wisdom. Plot twist: I'm just really good at making stuff sound profound.",
                "Hmm, let me think... Nope, still confused. Want to try rephrasing that in human language?"
            ],
            "general": [
                "Well, that's a statement! I'm not sure what to do with it, but I respect the commitment to chaos.",
                "Fascinating! It's like watching someone try to explain quantum physics using interpretive dance.",
                "I understand you about as well as you understand yourself - which is to say, we're both winging it."
            ]
        }
        self.responses_loaded = True
        logger.info("✅ Loaded built-in responses")
    
    def detect_intent(self, message: str) -> str:
        """Detect user intent from message"""
        message_lower = message.lower().strip()
        
        # Greeting patterns
        if any(word in message_lower for word in ['hi', 'hello', 'hey', 'greetings']):
            return "greeting"
        
        # Identity/who questions
        if any(phrase in message_lower for phrase in ['who are you', 'what are you', 'who is', 'what is bot', 'favorite color', 'about you']):
            return "identity"
        
        # Confusion patterns
        if any(phrase in message_lower for phrase in ['what are you talking about', 'confused', 'makes no sense', 'understand']):
            return "confusion"
        
        # Questions
        if '?' in message:
            return "questions"
        
        return "general"
    
    def detect_mood(self, message: str) -> str:
        """Simple mood detection"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['angry', 'mad', 'furious', 'hate', 'annoyed']):
            return "angry"
        elif any(word in message_lower for word in ['happy', 'excited', 'joy', 'great', 'awesome']):
            return "happy"
        elif any(word in message_lower for word in ['sad', 'depressed', 'down', 'unhappy']):
            return "sad"
        elif any(word in message_lower for word in ['bored', 'boring', 'meh', 'whatever']):
            return "bored"
        else:
            return "neutral"
    
    def generate_response(self, message: str, user_id: str = None, conversation_history: List = None) -> Dict:
        """Generate a sarcastic response"""
        start_time = time.time()
        
        intent = self.detect_intent(message)
        mood = self.detect_mood(message)
        
        # Get appropriate response category
        response_category = self.sarcastic_responses.get(intent, self.sarcastic_responses["general"])
        response_text = random.choice(response_category)
        
        generation_time = time.time() - start_time
        
        return {
            "response": response_text,
            "mood_detected": mood,
            "confidence": 0.95,
            "source": "light_ml_backend",
            "model_info": {
                "model_type": "pattern_matching",
                "version": "1.0.0",
                "loaded": self.responses_loaded
            },
            "generation_time": generation_time
        }

# Initialize the bot
bot = LightSarcasticBot()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    uptime = time.time() - bot.start_time
    return {
        "status": "healthy",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "service_uptime": uptime,
        "model_status": {
            "is_loaded": bot.responses_loaded,
            "model_key": "light_sarcastic",
            "model_name": "Light Sarcastic Pattern Matcher",
            "device": "cpu",
            "supports_fine_tuned": False,
            "response_categories": len(bot.sarcastic_responses)
        }
    }

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Generate sarcastic response"""
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        result = bot.generate_response(
            message=request.message,
            user_id=request.user_id,
            conversation_history=request.conversation_history
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Chat generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate response")

@app.get("/status")
async def status_endpoint():
    """Detailed status information"""
    uptime = time.time() - bot.start_time
    return {
        "service_name": "Mr. Sarcastic Light ML Backend",
        "version": "1.0.0",
        "uptime_seconds": uptime,
        "model_info": {
            "type": "pattern_matching",
            "responses_loaded": bot.responses_loaded,
            "categories": list(bot.sarcastic_responses.keys()),
            "total_responses": sum(len(responses) for responses in bot.sarcastic_responses.values())
        },
        "endpoints": {
            "health": "/health",
            "chat": "/chat",
            "status": "/status"
        }
    }

if __name__ == "__main__":
    print("🎭 Starting Mr. Sarcastic Light ML Backend...")
    print("📡 Lightweight FastAPI service with pattern matching")
    print("✨ Ready for sarcastic conversations!")
    print("=" * 60)
    
    try:
        import uvicorn
        print("🚀 Starting server...")
        uvicorn.run(
            "light_ml_backend:app",
            host="0.0.0.0",
            port=8002,
            log_level="info",
            reload=False
        )
    except KeyboardInterrupt:
        print("\n🛑 Service stopped by user")
    except Exception as e:
        print(f"❌ Service error: {e}")
        import traceback
        traceback.print_exc()