@echo off
echo ========================================
echo IRIS Railway System - Quick Setup
echo ========================================
echo.

echo Step 1: Processing train data from CSV...
cd python-ai
python phase1_data_prep.py
if %errorlevel% neq 0 (
    echo ERROR: Failed to process data. Make sure Python is installed.
    pause
    exit /b 1
)
cd ..
echo ✅ Data processed successfully!
echo.

echo Step 2: Installing backend dependencies...
cd backend
if not exist node_modules (
    npm install
)
echo ✅ Backend dependencies installed!
echo.

echo Step 3: Installing frontend dependencies...
cd ../frontend
if not exist node_modules (
    npm install
)
echo ✅ Frontend dependencies installed!
echo.

echo ========================================
echo Setup Complete! Now starting servers...
echo ========================================
echo.
echo Opening 2 new windows:
echo   1. Backend Server (port 5000)
echo   2. Frontend App (port 3000)
echo.

cd ../backend
start "IRIS Backend" cmd /k "node server.js"

timeout /t 3 /nobreak > nul

cd ../frontend
start "IRIS Frontend" cmd /k "npm start"

echo.
echo ✅ Servers starting...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul
