@echo off
echo ========================================
echo   IRIS Railway System - Quick Start
echo ========================================
echo.
echo Starting Backend (with Python AI)...
echo.

cd backend
start cmd /k "npm start"

timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend...
echo.

cd ..\frontend
start cmd /k "npm start"

echo.
echo ========================================
echo   System Starting!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo Python AI: http://localhost:5001 (auto-started)
echo.
echo Press any key to exit this window...
pause > nul
