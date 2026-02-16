@echo off
start "config-server" cmd /k ".\\mvnw.cmd -f backend/config-server/pom.xml spring-boot:run"
start "discovery-server" cmd /k ".\\mvnw.cmd -f backend/discovery-server/pom.xml spring-boot:run"
start "user-service" cmd /k ".\\mvnw.cmd -f backend/user-service/pom.xml spring-boot:run"
start "api-gateway" cmd /k ".\\mvnw.cmd -f backend/api-gateway/pom.xml spring-boot:run"
