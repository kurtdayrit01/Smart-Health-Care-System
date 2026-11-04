
@echo off
title SMART HEALTHCARE SYSTEM

echo Starting Smart Healthcare...

cd /d "%~dp0backend"
start "Smart Healthcare Backend" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul

cd /d "%~dp0frontend"
start "Smart Healthcare Frontend" cmd /k "npm run dev -- --host 127.0.0.1"

timeout /t 8 /nobreak >nul

start http://localhost:5173

exit
