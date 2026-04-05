
cd backend

echo starting...

start "Config Server" cmd /k ".\mvnw.cmd -pl config-server spring-boot:run"
timeout /t 17 /nobreak >nul

start "Discovery Server" cmd /k ".\mvnw.cmd -pl discovery-server spring-boot:run"
timeout /t 5 /nobreak >nul

start "User Service" cmd /k ".\mvnw.cmd -pl user-service spring-boot:run"
timeout /t 5 /nobreak >nul

start "Event Service" cmd /k ".\mvnw.cmd -pl event-service spring-boot:run"
timeout /t 5 /nobreak >nul

start "Notification Service" cmd /k ".\mvnw.cmd -pl notification-service spring-boot:run"
timeout /t 5 /nobreak >nul

start "API Gateway" cmd /k ".\mvnw.cmd -pl api-gateway spring-boot:run"
