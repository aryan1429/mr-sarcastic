from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import json
import os
import uvicorn
from fine_tune_falcon import FalconFineTuner
from youtube_extractor import YouTubeTranscriptExtractor

app = FastAPI(title="Mr. Sarcastic ML Service", version="1.0.0")

# Global variables
fine_tuner = None
model_loaded = False

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    conversation_history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    response: str
    mood_detected: str
    confidence: float

class TrainingRequest(BaseModel):
    dataset_path: Optional[str] = None
    youtube_urls: Optional[List[str]] = []
    custom_data: Optional[List[dict]] = []
    max_steps: Optional[int] = 500

class TrainingResponse(BaseModel):
    status: str
    message: str
    model_path: Optional[str] = None

@app.on_event("startup")
async def startup_event():
    """Initialize the ML service"""
    global fine_tuner, model_loaded
    try:
        fine_tuner = FalconFineTuner()
        print("ML Service initialized successfully")
    except Exception as e:
        print(f"Error initializing ML service: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model_loaded}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Generate a sarcastic response to user input"""
    global fine_tuner, model_loaded
    
    try:
        if not fine_tuner:
            raise HTTPException(status_code=500, detail="ML service not initialized")
        
        # Check if we have a fine-tuned model
        model_path = "./falcon-humor-chatbot" if os.path.exists("./falcon-humor-chatbot") else None
        
        # Generate response
        response = fine_tuner.generate_response(
            request.message, 
            max_length=100, 
            model_path=model_path
        )
        
        # Simple mood detection based on keywords (can be enhanced)
        mood = detect_mood(request.message)
        
        return ChatResponse(
            response=response,
            mood_detected=mood,
            confidence=0.8  # Placeholder confidence score
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@app.post("/train", response_model=TrainingResponse)
async def train_model(request: TrainingRequest):
    """Train the model with custom data"""
    global fine_tuner
    
    try:
        if not fine_tuner:
            raise HTTPException(status_code=500, detail="ML service not initialized")
        
        dataset_path = request.dataset_path or "custom_training_data.jsonl"
        
        # If custom data is provided, create a dataset file
        if request.custom_data:
            with open(dataset_path, 'w', encoding='utf-8') as f:
                for item in request.custom_data:
                    f.write(json.dumps(item) + '\n')
        
        # Process YouTube URLs if provided (placeholder for now)
        if request.youtube_urls:
            youtube_data = process_youtube_urls(request.youtube_urls)
            # Append to dataset
            with open(dataset_path, 'a', encoding='utf-8') as f:
                for item in youtube_data:
                    f.write(json.dumps(item) + '\n')
        
        # Start training
        output_dir = "./falcon-humor-chatbot"
        fine_tuner.train(
            dataset_path=dataset_path,
            output_dir=output_dir,
            max_steps=request.max_steps or 500
        )
        
        global model_loaded
        model_loaded = True
        
        return TrainingResponse(
            status="success",
            message="Model training completed successfully",
            model_path=output_dir
        )
        
    except Exception as e:
        return TrainingResponse(
            status="error",
            message=f"Training failed: {str(e)}"
        )

@app.get("/training-status")
async def get_training_status():
    """Get the current training status"""
    model_exists = os.path.exists("./falcon-humor-chatbot")
    return {
        "model_trained": model_exists,
        "model_loaded": model_loaded,
        "model_path": "./falcon-humor-chatbot" if model_exists else None
    }

def detect_mood(message: str) -> str:
    """Simple mood detection based on keywords"""
    message_lower = message.lower()
    
    sad_keywords = ['sad', 'depressed', 'down', 'unhappy', 'crying', 'upset']
    happy_keywords = ['happy', 'excited', 'joy', 'great', 'awesome', 'fantastic']
    angry_keywords = ['angry', 'mad', 'furious', 'hate', 'annoyed', 'pissed']
    bored_keywords = ['bored', 'boring', 'dull', 'nothing to do', 'tired']
    
    if any(word in message_lower for word in sad_keywords):
        return "sad"
    elif any(word in message_lower for word in happy_keywords):
        return "happy"
    elif any(word in message_lower for word in angry_keywords):
        return "angry"
    elif any(word in message_lower for word in bored_keywords):
        return "bored"
    else:
        return "neutral"

def process_youtube_urls(urls: List[str]) -> List[dict]:
    """Process YouTube URLs and extract transcript data"""
    if not urls:
        return []
    
    print(f"🎬 Processing {len(urls)} YouTube videos...")
    
    try:
        extractor = YouTubeTranscriptExtractor()
        processed_data = []
        
        for url in urls:
            print(f"📥 Processing: {url}")
            try:
                training_pairs = extractor.process_video(url)
                # Convert to standard format
                for pair in training_pairs:
                    processed_data.append({
                        "prompt": pair["prompt"],
                        "completion": pair["completion"]
                    })
            except Exception as e:
                print(f"❌ Error processing {url}: {str(e)}")
                continue
                
        print(f"✅ Successfully processed {len(processed_data)} training pairs from YouTube")
        return processed_data
        
    except Exception as e:
        print(f"❌ YouTube processing failed: {str(e)}")
        return []

if __name__ == "__main__":
    uvicorn.run(
        "ml_service:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )
