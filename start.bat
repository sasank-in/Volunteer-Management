@echo off
start "config-server" cmd /k ".\\mvnw.cmd -pl backend/config-server spring-boot:run"
timeout /t 8 /nobreak >nul
start "discovery-server" cmd /k ".\\mvnw.cmd -pl backend/discovery-server spring-boot:run"
timeout /t 8 /nobreak >nul
start "user-service" cmd /k ".\\mvnw.cmd -pl backend/user-service spring-boot:run"
timeout /t 8 /nobreak >nul
start "api-gateway" cmd /k ".\\mvnw.cmd -pl backend/api-gateway spring-boot:run"
