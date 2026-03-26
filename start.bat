@echo off
echo =======================================================
echo          PORTIVA LOCAL SERVER MULTI-LAUNCHER
echo =======================================================
echo.
echo Please ensure you have the following running natively:
echo 1. PostgreSQL (Port 5432) with a database named 'portiva' and password 'postgres'
echo 2. Redis (Port 6379)
echo 3. Ollama running with qwen2.5:1.5b model downloaded
echo.
echo Starting Backend (Spring Boot)...
start "Portiva Backend" cmd /k "cd backend && title Backend Server && mvn spring-boot:run"

echo Starting AI Engine (FastAPI)...
start "Portiva AI Engine" cmd /k "cd ai-engine && title AI Engine Server && call venv_win\Scripts\activate.bat && uvicorn src.api.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend (Vite)...
start "Portiva Frontend" cmd /k "cd frontend && title Frontend Server && npm run dev"

echo.
echo All services are launching in separate windows!
echo Make sure PostgreSQL and Redis are running before the Backend finishes starting.
echo.
echo Frontend will be at: http://localhost:5173
echo Backend API at: http://localhost:5000
echo AI Engine API at: http://localhost:8000
echo.
pause
