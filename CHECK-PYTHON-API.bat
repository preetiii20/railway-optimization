@echo off
echo ========================================
echo   Checking Python AI API Status
echo ========================================
echo.

echo Testing connection to http://localhost:5001...
echo.

curl -s http://localhost:5001/api/freight/gaps > nul 2>&1

if %errorlevel% == 0 (
    echo ✅ Python AI API is RUNNING on port 5001
    echo.
    echo You can proceed with starting backend and frontend.
) else (
    echo ❌ Python AI API is NOT running on port 5001
    echo.
    echo To start it manually:
    echo   cd python-ai
    echo   python api/freight_api.py
    echo.
    echo Or use START-ALL.bat to start everything automatically.
)

echo.
echo ========================================
pause
