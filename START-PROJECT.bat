@echo off
echo ========================================
echo   IRIS Railway Management System
echo   Starting Backend and Frontend
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Checking Node.js installation...
node --version
echo.

REM Start Backend
echo [2/4] Starting Backend Server...
start "IRIS Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
echo Backend started on http://localhost:5000
echo.

REM Start Frontend
echo [3/4] Starting Frontend...
start "IRIS Frontend" cmd /k "cd frontend && npm start"
timeout /t 3 /nobreak >nul
echo Frontend will open on http://localhost:3000
echo.

echo [4/4] System Ready!
echo ========================================
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to close this window...
echo (Backend and Frontend will keep running)
pause >nul
