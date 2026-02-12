@echo off
echo ========================================
echo   IRIS Railway System - Complete Startup
echo ========================================
echo.
echo This will start ALL services in the correct order:
echo 1. Python AI API (port 5001)
echo 2. Backend Server (port 5000) 
echo 3. Frontend (port 3000)
echo.
echo ========================================
echo.

echo Step 1: Starting Python AI API...
echo.
cd python-ai
start "Python AI API" cmd /k "python api/freight_api.py"
echo Waiting for Python AI to initialize (15 seconds)...
timeout /t 15 /nobreak > nul

echo.
echo Step 2: Starting Backend Server...
echo.
cd ..\backend
start "Backend Server" cmd /k "npm start"
echo Waiting for Backend to initialize (10 seconds)...
timeout /t 10 /nobreak > nul

echo.
echo Step 3: Starting Frontend...
echo.
cd ..\frontend
start "Frontend" cmd /k "npm start"

echo.
echo ========================================
echo   All Services Starting!
echo ========================================
echo.
echo Python AI API: http://localhost:5001
echo Backend Server: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Wait 30 seconds for everything to be ready...
echo Then open: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
