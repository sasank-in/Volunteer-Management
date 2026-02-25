@echo off
echo Starting Volunteer Management Platform Services...
echo.

cd backend

echo [1/4] Starting Config Server...
start "config-server" cmd /k "mvnw.cmd -pl config-server spring-boot:run"
timeout /t 10 /nobreak >nul

echo [2/4] Starting Discovery Server...
start "discovery-server" cmd /k "mvnw.cmd -pl discovery-server spring-boot:run"
timeout /t 10 /nobreak >nul

echo [3/4] Starting User Service...
start "user-service" cmd /k "mvnw.cmd -pl user-service spring-boot:run"
timeout /t 10 /nobreak >nul

echo [4/4] Starting API Gateway...
start "api-gateway" cmd /k "mvnw.cmd -pl api-gateway spring-boot:run"

cd ..
echo.
echo All services started successfully!
echo Config Server: http://localhost:8888
echo Discovery Server: http://localhost:8761
echo User Service: http://localhost:8081
echo API Gateway: http://localhost:8080
echo.
