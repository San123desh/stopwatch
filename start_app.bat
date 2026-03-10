@echo off
echo Starting Stopwatch App using Docker...
docker compose -f deploy/docker-compose.yml up -d --build

echo Waiting for services to start...
timeout /t 10

echo Opening Frontend...
start http://localhost:8000

echo Backend API is running at http://localhost:8000
echo Done!
pause
