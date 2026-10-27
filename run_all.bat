@echo off
echo ========================================================
echo Launching Discord Text Web Analysis (Full-Stack System)
echo 1. Backend:  http://127.0.0.1:8000 (Docs: /docs)
echo 2. Frontend: http://localhost:5173
echo ========================================================
start "Discord Analytics Backend (FastAPI)" cmd /c "%~dp0run_backend.bat"
timeout /t 3 /nobreak >nul
start "Discord Analytics Frontend (Vite)" cmd /c "%~dp0run_frontend.bat"
echo Both servers launched in background windows.
pause
