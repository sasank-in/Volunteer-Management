@echo off
echo ==========================================
echo Volunteer Management Platform
echo Starting Microservices...
echo ==========================================
echo.

cd backend

echo [1/6] Config Server (Port 8888)...
start "Config Server" cmd /k ".\mvnw.cmd -pl config-server spring-boot:run"
timeout /t 10 /nobreak >nul

echo [2/6] Discovery Server (Port 8761)...
start "Discovery Server" cmd /k ".\mvnw.cmd -pl discovery-server spring-boot:run"
timeout /t 10 /nobreak >nul

echo [3/6] User Service (Port 8081)...
start "User Service" cmd /k ".\mvnw.cmd -pl user-service spring-boot:run"
timeout /t 5 /nobreak >nul

echo [4/6] Event Service (Port 8082)...
start "Event Service" cmd /k ".\mvnw.cmd -pl event-service spring-boot:run"
timeout /t 5 /nobreak >nul

echo [5/6] Notification Service (Port 8083)...
start "Notification Service" cmd /k ".\mvnw.cmd -pl notification-service spring-boot:run"
timeout /t 5 /nobreak >nul

echo [6/6] API Gateway (Port 8080)...
start "API Gateway" cmd /k ".\mvnw.cmd -pl api-gateway spring-boot:run"

cd ..
echo.
echo ==========================================
echo Services Starting...
echo ==========================================
echo Config Server:        http://localhost:8888
echo Discovery Server:     http://localhost:8761
echo User Service:         http://localhost:8081
echo Event Service:        http://localhost:8082
echo Notification Service: http://localhost:8083
echo API Gateway:          http://localhost:8080
echo ==========================================
echo.
echo Wait 30-60 seconds for all services to start
echo Check Discovery Server for registered services
echo.
pause
