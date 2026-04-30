@echo off
title SBC AI Image Generator
color 0D
echo.
echo  ================================================
echo    SBC by Shwetaa - AI Image Generator Service
echo  ================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed!
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

:: Check if token is set
if "%HUGGINGFACE_TOKEN%"=="" (
    echo [WARNING] HUGGINGFACE_TOKEN is not set!
    echo.
    echo To get your FREE token:
    echo   1. Go to: https://huggingface.co/settings/tokens
    echo   2. Create account or sign in
    echo   3. Create new token with "Read" permissions
    echo   4. Run this command:
    echo.
    echo      set HUGGINGFACE_TOKEN=hf_your_token_here
    echo.
    echo The service will start but image generation requires a token.
    echo.
    echo Press any key to continue anyway...
    pause >nul
)

echo [INFO] Installing dependencies...
pip install fastapi uvicorn python-multipart aiofiles requests -q

echo.
echo [INFO] Starting AI service on http://localhost:8000
echo [INFO] Press Ctrl+C to stop
echo.

:: Start the server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
