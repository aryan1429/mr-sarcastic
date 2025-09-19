@echo off
echo Starting Mr. Sarcastic Application...

REM Start backend server
start "Backend Server" cmd /k "cd backend && npm start"

REM Wait a bit for backend to start
timeout /t 3

REM Start frontend
start "Frontend Dev Server" cmd /k "cd frontend && npm run dev"

REM Optional: Start ML service
echo.
echo To enable custom training, run:
echo cd ml
echo .\venv\Scripts\Activate.ps1
echo python ml_service.py
echo.

pause
