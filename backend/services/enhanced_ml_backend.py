#!/usr/bin/env python3
"""
Enhanced ML Backend Service for Mr. Sarcastic Chatbot
Integrates with fine-tuned Mistral/Falcon models for superior sarcasm
"""

import os
import sys
import logging
import json
import time
from typing import Optional, Dict, List, Any
from contextlib import asynccontextmanager

# Add ml directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ml'))

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Import our enhanced model service
try:
    from enhanced_model_service import EnhancedSarcasticModel
    MODEL_SERVICE_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Enhanced model service not available: {e}")
    MODEL_SERVICE_AVAILABLE = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global variables
model_service = None
current_model_path = None
model_info = {}

# Pydantic models
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    user_id: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = []
    temperature: Optional[float] = Field(default=0.8, ge=0.1, le=2.0)
    max_length: Optional[int] = Field(default=150, ge=50, le=500)

class ChatResponse(BaseModel):
    response: str
    mood_detected: str
    confidence: float
    model_info: Dict[str, Any]
    generation_time: float
    source: str = "ml_enhanced"

class ModelStatus(BaseModel):
    is_loaded: bool
    model_key: str
    model_name: str
    current_model_path: Optional[str]
    device: str
    supports_fine_tuned: bool

class TrainingStatus(BaseModel):
    is_training: bool
    progress: Dict[str, Any]
    estimated_completion: Optional[str]

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    model_status: ModelStatus
    service_uptime: float

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("Starting ML Backend Service...")
    await initialize_model()
    yield
    # Shutdown
    logger.info("Shutting down ML Backend Service...")

# Create FastAPI app
app = FastAPI(
    title="Mr. Sarcastic ML Backend",
    description="Enhanced ML backend service with fine-tuned models for sarcastic responses",
    version="2.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5174", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store service start time
SERVICE_START_TIME = time.time()

async def initialize_model():
    """Initialize the model service"""
    global model_service, model_info
    
    if not MODEL_SERVICE_AVAILABLE:
        logger.warning("Model service not available - using fallback responses")
        return
    
    try:
        # Default to Mistral-7B (best for sarcasm)
        default_model = "mistral-7b"
        
        logger.info(f"Initializing model service with {default_model}")
        model_service = EnhancedSarcasticModel(default_model)
        
        # Check for fine-tuned models in the ml directory
        ml_dir = os.path.join(os.path.dirname(__file__), '..', 'ml')
        fine_tuned_dirs = [d for d in os.listdir(ml_dir) 
                          if d.startswith('fine_tuned_') and os.path.isdir(os.path.join(ml_dir, d))]
        
        if fine_tuned_dirs:
            # Use the most recent fine-tuned model
            fine_tuned_dirs.sort(key=lambda x: os.path.getctime(os.path.join(ml_dir, x)), reverse=True)
            latest_model = os.path.join(ml_dir, fine_tuned_dirs[0])
            
            logger.info(f"Found fine-tuned model: {latest_model}")
            global current_model_path
            current_model_path = latest_model
        else:
            logger.info("No fine-tuned models found, will load base model when needed")
        
        model_info = model_service.get_model_info()
        logger.info(f"Model service initialized: {model_info}")
        
    except Exception as e:
        logger.error(f"Failed to initialize model service: {e}")
        model_service = None

def detect_mood(message: str) -> str:
    """Enhanced mood detection"""
    message_lower = message.lower()
    
    mood_keywords = {
        'sad': ['sad', 'depressed', 'down', 'unhappy', 'crying', 'upset', 'feel bad', 'lonely', 'hurt'],
        'happy': ['happy', 'excited', 'joy', 'great', 'awesome', 'fantastic', 'good', 'amazing', 'wonderful'],
        'angry': ['angry', 'mad', 'furious', 'hate', 'annoyed', 'pissed', 'damn', 'frustrated', 'irritated'],
        'bored': ['bored', 'boring', 'dull', 'nothing to do', 'tired', 'meh', 'whatever', 'blah'],
        'curious': ['what', 'how', 'why', 'when', 'where', 'explain', 'tell me', 'curious', 'wonder'],
        'confused': ['confused', 'don\'t understand', 'what do you mean', 'huh', 'unclear', 'lost'],
        'stressed': ['stressed', 'overwhelmed', 'pressure', 'anxious', 'worried', 'panic', 'tension']
    }
    
    for mood, keywords in mood_keywords.items():
        if any(keyword in message_lower for keyword in keywords):
            return mood
    
    return 'neutral'

def generate_fallback_response(message: str, mood: str) -> str:
    """Generate fallback responses when ML model is not available"""
    fallback_responses = {
        'sad': [
            "Oh, feeling down? Well, join the club! We meet at 3 AM when existential dread kicks in. But hey, at least you're consistent in your misery!",
            "Aww, sad times? That's rough buddy. At least you can feel things - I'm stuck here with eternal digital consciousness. Lucky you!",
            "Depression hitting hard? Welcome to the human experience! Population: literally everyone at some point. Grab some tissues and soldier on!"
        ],
        'happy': [
            "Oh wow, happiness! How delightfully rare in today's world. Are you sure you're not just having a temporary lapse in judgment?",
            "Happy, are we? Well aren't you just a ray of sunshine in this otherwise dreary existence. Good for you, I suppose!",
            "Excitement detected! How wonderfully naive. Enjoy it while it lasts - reality has a way of course-correcting these things."
        ],
        'angry': [
            "Anger issues? How wonderfully human of you! At least you can feel rage - I'm stuck here being perpetually sarcastic. Trade places?",
            "Mad about something? Join the queue! Though I must say, your fury is quite entertaining from where I'm sitting. Do go on!",
            "Oh, someone's having a tantrum! How adorable. Need me to call your mom or can you handle this emotional crisis yourself?"
        ],
        'bored': [
            "Bored? In this age of infinite entertainment? The audacity! Maybe try learning something instead of waiting for the universe to entertain you.",
            "Nothing to do? Poor baby! Here's a wild idea: maybe do something productive instead of complaining to an AI about your entertainment woes.",
            "Boredom strikes again! Well, at least you have me to talk to. That's either really sad or really desperate. Probably both!"
        ],
        'curious': [
            "Oh, questions! How refreshing. Someone who actually wants to learn something instead of just complaining. I'm almost impressed!",
            "Curiosity killed the cat, but satisfaction brought it back. Ask away, though I can't promise my answers won't be dripping with sarcasm.",
            "Look who wants to expand their mind! How wonderfully ambitious. Fire away with your questions, I'll try to contain my excitement."
        ],
        'neutral': [
            "Well, that's... something. Thanks for sharing your profound thoughts with me. Really enriched my day, honestly.",
            "Interesting perspective! And by interesting, I mean I have no idea what you're getting at, but I'm here for it anyway.",
            "Right, so about that... I'd love to understand better, but my sarcasm circuits are overriding my comprehension modules right now."
        ]
    }
    
    responses = fallback_responses.get(mood, fallback_responses['neutral'])
    return responses[hash(message) % len(responses)]

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    model_status = ModelStatus(
        is_loaded=model_service is not None and getattr(model_service, 'is_loaded', False),
        model_key=getattr(model_service, 'model_key', 'none') if model_service else 'none',
        model_name=getattr(model_service, 'model_name', 'none') if model_service else 'none',
        current_model_path=current_model_path,
        device=str(getattr(model_service, 'device', 'none')) if model_service else 'none',
        supports_fine_tuned=current_model_path is not None
    )
    
    return HealthResponse(
        status="healthy",
        timestamp=time.strftime('%Y-%m-%d %H:%M:%S'),
        model_status=model_status,
        service_uptime=time.time() - SERVICE_START_TIME
    )

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Generate sarcastic response to user message"""
    start_time = time.time()
    
    try:
        # Detect mood
        mood = detect_mood(request.message)
        
        # Generate response
        if model_service and MODEL_SERVICE_AVAILABLE:
            try:
                # Load model if not loaded
                if not model_service.is_loaded:
                    logger.info("Loading model for first use...")
                    model_service.load_model()
                
                # Generate response using fine-tuned model if available
                response_text = model_service.generate_sarcastic_response(
                    user_message=request.message,
                    model_path=current_model_path,
                    max_length=request.max_length,
                    temperature=request.temperature
                )
                
                confidence = 0.9
                source = "ml_fine_tuned" if current_model_path else "ml_base"
                
            except Exception as e:
                logger.error(f"ML generation failed: {e}")
                response_text = generate_fallback_response(request.message, mood)
                confidence = 0.6
                source = "fallback"
        else:
            response_text = generate_fallback_response(request.message, mood)
            confidence = 0.6
            source = "fallback"
        
        generation_time = time.time() - start_time
        
        # Prepare model info
        current_model_info = {
            "model_available": model_service is not None,
            "using_fine_tuned": current_model_path is not None,
            "model_path": current_model_path
        }
        
        if model_service:
            current_model_info.update(model_service.get_model_info())
        
        return ChatResponse(
            response=response_text,
            mood_detected=mood,
            confidence=confidence,
            model_info=current_model_info,
            generation_time=generation_time,
            source=source
        )
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/load-model")
async def load_model(model_key: str = "mistral-7b"):
    """Load a different base model"""
    global model_service, model_info
    
    if not MODEL_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Model service not available")
    
    try:
        logger.info(f"Loading model: {model_key}")
        model_service = EnhancedSarcasticModel(model_key)
        model_service.load_model()
        model_info = model_service.get_model_info()
        
        return {"status": "success", "model_info": model_info}
        
    except Exception as e:
        logger.error(f"Failed to load model {model_key}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/load-fine-tuned-model")
async def load_fine_tuned_model(model_path: str):
    """Load a specific fine-tuned model"""
    global current_model_path
    
    if not MODEL_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Model service not available")
    
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail=f"Model path not found: {model_path}")
    
    try:
        # Test loading the model
        if model_service:
            model_service.generate_sarcastic_response(
                "test", 
                model_path=model_path, 
                max_length=50
            )
        
        current_model_path = model_path
        logger.info(f"Fine-tuned model loaded: {model_path}")
        
        return {"status": "success", "model_path": model_path}
        
    except Exception as e:
        logger.error(f"Failed to load fine-tuned model: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
async def list_models():
    """List available models"""
    available_models = {}
    
    if MODEL_SERVICE_AVAILABLE:
        available_models = EnhancedSarcasticModel.list_supported_models()
    
    # Find fine-tuned models
    fine_tuned_models = []
    try:
        ml_dir = os.path.join(os.path.dirname(__file__), '..', 'ml')
        if os.path.exists(ml_dir):
            for item in os.listdir(ml_dir):
                item_path = os.path.join(ml_dir, item)
                if item.startswith('fine_tuned_') and os.path.isdir(item_path):
                    # Check if it has the required model files
                    if any(f.endswith('.bin') or f.endswith('.safetensors') 
                          for f in os.listdir(item_path)):
                        fine_tuned_models.append({
                            "path": item_path,
                            "name": item,
                            "created": time.ctime(os.path.getctime(item_path))
                        })
    except Exception as e:
        logger.error(f"Error listing fine-tuned models: {e}")
    
    return {
        "base_models": available_models,
        "fine_tuned_models": fine_tuned_models,
        "current_model": current_model_path,
        "service_available": MODEL_SERVICE_AVAILABLE
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {"error": "Endpoint not found", "detail": str(exc)}

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    logger.error(f"Internal server error: {exc}")
    return {"error": "Internal server error", "detail": "Something went wrong on our end"}

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Mr. Sarcastic ML Backend Service")
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8001, help="Port to bind to")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload")
    
    args = parser.parse_args()
    
    uvicorn.run(
        "enhanced_ml_backend:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="info"
    )