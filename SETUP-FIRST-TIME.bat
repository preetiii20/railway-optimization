@echo off
echo ========================================
echo   IRIS Railway Management System
echo   First Time Setup
echo ========================================
echo.
echo This will install all dependencies.
echo This only needs to be run ONCE.
echo.
pause

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Installing Backend Dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
cd ..
echo Backend dependencies installed successfully!
echo.

echo [2/3] Installing Frontend Dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
cd ..
echo Frontend dependencies installed successfully!
echo.

echo [3/3] Setup Complete!
echo ========================================
echo   All dependencies installed!
echo   You can now run START-PROJECT.bat
echo ========================================
echo.
pause
