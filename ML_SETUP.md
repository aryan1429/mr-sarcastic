# Mr. Sarcastic ML Setup Instructions

## Prerequisites
1. Python 3.8+ with venv
2. Node.js 16+ with npm
3. At least 8GB RAM (16GB recommended for training)
4. GPU with CUDA support (optional but recommended for training)

## Quick Start

### 1. Start Backend Server
```bash
cd backend
npm install
npm start
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Start ML Service (Optional - for custom training)
```bash
cd ml
# Activate virtual environment
venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate   # macOS/Linux

# Start ML service
python ml_service.py
```

## Features Available Now

### ✅ Ready to Use:
- **Sarcastic Chat**: Uses fallback rule-based responses with sarcastic personality
- **Mood Detection**: Detects user mood (sad, happy, angry, bored, neutral)
- **Music Recommendations**: Suggests songs based on detected mood
- **Training Interface**: UI ready for custom model training
- **User Authentication**: Google OAuth integration

### 🔄 Advanced Features (Requires ML Service):
- **Custom Model Training**: Train Falcon 7B with your own data
- **YouTube Training**: Extract transcripts for personality training
- **Advanced NLP**: Fine-tuned responses with improved sarcasm

## Training Your Model

1. **Access Training Page**: Navigate to `/training` in the app
2. **Add Training Data**: 
   - Custom prompt-response pairs
   - YouTube video URLs for transcript extraction
3. **Configure Training**: Set max steps (500-5000)
4. **Start Training**: Click "Start Training" (requires ML service)

## Current System Architecture

```
Frontend (React/Vite) ←→ Backend (Node.js/Express) ←→ ML Service (FastAPI/Python)
                     ↓
               MongoDB/MockDB
```

## API Endpoints

### Chat API (`/api/chat/`)
- `POST /send` - Send message, get AI response
- `POST /train` - Start model training
- `GET /training-status` - Check training progress
- `GET /health` - Service health check

## Fallback Mode

The system works perfectly without the ML service by using:
- Rule-based sarcastic responses
- Keyword-based mood detection
- Predefined personality responses

## Next Steps for Full ML Integration

1. **Install ML Dependencies**: Ensure all Python packages are installed
2. **Configure GPU** (Optional): Set up CUDA for faster training
3. **Create Training Data**: Add your sarcastic examples
4. **Start ML Service**: Run the FastAPI service
5. **Train Model**: Use the training interface to customize personality

The chatbot is fully functional now with great sarcastic personality - the ML training is an enhancement for customization!
