@echo off
REM Interview-IA - Quick Start Script
REM Runs the application in development mode
echo.
echo ========================================
echo    Interview-IA - AI Coding Assistant
echo ========================================
echo.
echo [*] Like this project? Buy me a coffee!
echo [*] https://buymeacoffee.com/maikonrenner
echo.
echo ========================================
echo.
REM Check if node_modules exists
if not exist "node_modules\" (
    echo [!] Dependencies not installed
    echo [*] Running npm install...
    echo.
    call npm install
    echo.
)
echo [*] Starting Interview-IA...
echo [*] Vite dev server will start on http://localhost:3000
echo [*] Electron window will open automatically
echo.
echo [i] Press Ctrl+C to stop
echo.
REM Start the application
call npm run dev
pause