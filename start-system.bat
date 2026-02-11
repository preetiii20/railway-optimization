@echo off
echo ========================================
echo Railway Optimization System Startup
echo ========================================
echo.

REM Kill any existing Node processes
echo Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd backend && node server.js"

timeout /t 3 /nobreak >nul

echo Starting Frontend (Port 3000)...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo System Started!
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
