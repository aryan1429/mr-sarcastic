@echo off
echo.
echo ========================================
echo  Starting Enhanced Mr. Sarcastic ML Backend
echo ========================================
echo.

cd /d "%~dp0"

REM Check if we're in the ml directory, if not, navigate there
if not exist "enhanced_sarcastic_backend.py" (
    if exist "ml\enhanced_sarcastic_backend.py" (
        cd ml
        echo Navigating to ml directory...
    ) else (
        echo Error: Cannot find enhanced_sarcastic_backend.py
        echo Please run this script from the project root directory
        pause
        exit /b 1
    )
)

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Error: Failed to create virtual environment
        echo Please make sure Python 3.8+ is installed
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Error: Failed to activate virtual environment
    pause
    exit /b 1
)

REM Install/upgrade requirements
echo Installing/upgrading dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo Warning: Some dependencies might not have installed correctly
    echo Continuing anyway...
)

echo.
echo ========================================
echo  Starting Enhanced ML Backend Server
echo ========================================
echo.
echo The server will start on: http://localhost:8001
echo.
echo Features:
echo - GPT-2 XL for intelligent responses
echo - Context-aware conversation memory
echo - Advanced sarcastic personality
echo - No manual response coding needed
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the enhanced ML backend
python enhanced_sarcastic_backend.py

REM If we reach here, the server stopped
echo.
echo ML Backend server stopped.
pause