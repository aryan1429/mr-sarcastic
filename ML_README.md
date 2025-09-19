# Mr. Sarcastic - ML Setup Guide

## 🎯 Overview
This guide helps you set up the Machine Learning components for your sarcastic chatbot using Falcon 7B fine-tuning.

## ✅ Current Status
- ✅ **Backend**: Running on http://localhost:8001
- ✅ **Frontend**: Running on http://localhost:5173
- ✅ **ML Environment**: All packages installed and working
- ✅ **Pylance Errors**: Fixed with proper VS Code configuration

## 🚀 Quick Start

### 1. Test ML Environment
```bash
cd ml
.\venv\Scripts\Activate.ps1
python test_environment.py
```

### 2. Train the Model (Optional)
```bash
cd ml
.\venv\Scripts\Activate.ps1
python train_model.py
```

### 3. Start ML Service (Optional)
```bash
cd ml
.\venv\Scripts\Activate.ps1
python ml_service.py
```

## 📁 Project Structure
```
mr-sarcastic/
├── ml/                          # Machine Learning components
│   ├── venv/                    # Python virtual environment
│   ├── fine_tune_falcon.py      # Main fine-tuning script
│   ├── ml_service.py           # FastAPI service for ML
│   ├── train_model.py          # Simple training script
│   ├── test_environment.py     # Environment test script
│   ├── requirements.txt        # Python dependencies
│   └── humor_dataset.jsonl     # Training data (auto-generated)
├── backend/                     # Node.js backend
├── frontend/                    # React frontend
└── .vscode/                     # VS Code configuration
```

## 🔧 Troubleshooting Pylance Errors

### Problem: "Import could not be resolved"
**Solution**: The Python virtual environment isn't selected in VS Code.

### Steps to Fix:
1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Select Interpreter**: Type "Python: Select Interpreter"
3. **Choose**: `./ml/venv/Scripts/python.exe`
4. **Restart VS Code** (if needed)

### Alternative Fix:
The `.vscode/settings.json` is already configured with:
```json
{
  "python.defaultInterpreterPath": "./ml/venv/Scripts/python.exe",
  "python.analysis.extraPaths": ["./ml/venv/Lib/site-packages"]
}
```

## 🎯 Training Your Model

### Option 1: Quick Training (Recommended)
```bash
cd ml
.\venv\Scripts\Activate.ps1
python train_model.py
```

### Option 2: Custom Training
1. Edit `humor_dataset.jsonl` with your own sarcastic examples
2. Run: `python fine_tune_falcon.py`

### Option 3: Advanced Training
- Modify parameters in `fine_tune_falcon.py`
- Add more training data
- Adjust hyperparameters

## 🌐 API Endpoints

### Chat API (Backend)
- `POST /api/chat/send` - Send message, get AI response
- `POST /api/chat/train` - Start model training
- `GET /api/chat/training-status` - Check training progress

### ML Service (Optional)
- `POST /chat` - Direct ML chat endpoint
- `POST /train` - Direct ML training endpoint
- `GET /health` - ML service health check

## 💡 Tips

### Memory Requirements
- **Minimum**: 8GB RAM
- **Recommended**: 16GB+ RAM for training
- **GPU**: NVIDIA GPU with 8GB+ VRAM (optional but faster)

### Training Time
- **CPU**: 30-60 minutes for 100 steps
- **GPU**: 5-10 minutes for 100 steps

### Dataset Format
```json
{"prompt": "User: Hello\nChatbot:", "completion": " Oh great, another human bothering me."}
```

## 🔄 Fallback Mode

Your chatbot works perfectly without ML training:
- ✅ Sarcastic responses
- ✅ Mood detection
- ✅ Music recommendations
- ✅ Full conversation flow

The ML components are enhancements for customization!

## 🎉 Next Steps

1. **Test the Chat**: Visit http://localhost:5173 and chat with Mr. Sarcastic
2. **Optional Training**: Run `python train_model.py` for custom personality
3. **Customize**: Add your own sarcastic examples to the dataset
4. **Deploy**: Your chatbot is production-ready!

## 📞 Support

If you encounter issues:
1. Run `python test_environment.py` to verify setup
2. Check VS Code Python interpreter selection
3. Ensure virtual environment is activated
4. Restart VS Code if Pylance errors persist

**Your sarcastic chatbot is ready to roast some users! 🔥**
