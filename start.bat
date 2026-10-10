@echo off
echo ==============================================
echo       EduManage v1.0 - Local Launch Script
echo ==============================================
echo.

echo Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Starting EduManage Backend and Frontend...
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:5173
echo.

start "EduManage Backend (API)" cmd /k "cd server && npm.cmd start"
timeout /t 3 >nul
start "EduManage Frontend (PWA)" cmd /k "cd client && npm.cmd run dev"

echo.
echo ==============================================
echo EduManage is starting!
echo Once loaded, open your browser at:
echo http://localhost:5173
echo ==============================================
pause
