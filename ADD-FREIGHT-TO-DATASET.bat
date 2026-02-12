@echo off
echo ========================================
echo   Add Freight Trains to Dataset
echo ========================================
echo.
echo This will:
echo   1. Generate 60 freight trains
echo   2. Distribute them across 24 hours
echo   3. Add them to Train_details.csv
echo   4. Backup original file
echo.
echo ========================================
echo.

cd python-ai
python generate_freight_dataset.py

echo.
echo ========================================
echo   Done!
echo ========================================
echo.
echo Now restart your backend and frontend:
echo   Terminal 1: cd backend ^&^& npm start
echo   Terminal 2: cd frontend ^&^& npm start
echo.
pause
