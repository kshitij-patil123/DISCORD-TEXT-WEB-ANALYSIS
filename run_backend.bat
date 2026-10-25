@echo off
echo ========================================================
echo Starting Discord Text Web Analysis - FastAPI Backend
echo Port: 8000 | URL: http://127.0.0.1:8000
echo API Docs: http://127.0.0.1:8000/docs
echo ========================================================
cd /d "%~dp0backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
