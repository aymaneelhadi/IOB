@echo off
title A&A - Interactive Launcher
color 0A

echo ===================================================
echo   Starting A&A App (Debug Mode)
echo ===================================================
echo.

:: 1. Check Node.js
echo [1/4] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js is NOT found in your PATH!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b
) else (
    echo [OK] Node.js found.
)

:: 2. Build Contract
echo.
echo [2/4] Building Smart Contract...
cd commercial_devis
if exist "src/main.leo" (
    call leo build
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Leo build failed. Skipping... (Is Leo installed?)
    ) else (
        echo [OK] Contract built.
    )
) else (
    echo [WARNING] Contract folder not found.
)
cd ..

:: 3. Install Client Deps
echo.
echo [3/4] Installing Frontend Dependencies...
cd client
if not exist "node_modules" (
    echo Installing npm packages (this may take a minute)...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        color 0C
        echo [ERROR] npm install failed!
        pause
        exit /b
    )
) else (
    echo [OK] dependencies already installed.
)

:: 4. Start Server
echo.
echo [4/4] Starting Development Server...
echo.
echo IMPORTANT: Keep this window OPEN.
echo If the browser fails to load, Check this window for errors.
echo.

:: Wait 3 seconds to let user read
timeout /t 3 >nul

:: Launch browser in parallel
start "" "http://localhost:5173"

:: Verify 'vite' command access via npm
call npm run dev

echo.
echo [STOPPED] Server has stopped.
pause
