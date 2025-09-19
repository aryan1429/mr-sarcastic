@echo off
echo 🎭 Starting Mr. Sarcastic - Enhanced Chatbot System
echo =====================================================
echo.

REM Change to ML directory
cd /d "a:\mr-sarcastic\ml"

echo 🔧 Starting ML Backend with Fine-tuned Model...
echo Model: DialoGPT-medium fine-tuned with YouTube humor data
echo Training Data: 75 conversations from 345 YouTube humor entries
echo.

REM Start the Python ML backend
python production_ml_backend.py

pause