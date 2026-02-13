# Volunteer Management Platform 
 
Starter setup for a Volunteer Management Platform using Spring Cloud microservices and PostgreSQL. The frontend is optional and can be added later. 
 
Prerequisites: 
- JDK 21 
- Maven 3.9+ 
- Docker Desktop 
- Node.js 20+ (only if you add a frontend) 
 
Quick Start (Local): 
1. Start your local Postgres instances.
2. Run config server:
   `./mvnw -pl backend/config-server spring-boot:run`
3. Run discovery server:
   `./mvnw -pl backend/discovery-server spring-boot:run`
4. Run user service:
   `./mvnw -pl backend/user-service spring-boot:run`
5. Run API gateway:
   `./mvnw -pl backend/api-gateway spring-boot:run`
 
Project Structure: 
- pom.xml: Root aggregator + Maven Wrapper 
- backend: Spring Cloud microservices (multi-module) 
- backend/discovery-server: Eureka service discovery 
- backend/config-server: Central config (required) 
- backend/config-repo: Native config repository (local) 
- backend/user-service: User management + JWT auth 
- backend/api-gateway: API gateway 
- infra: Docker Compose services 
- frontend: Optional frontend placeholder 
- docs: Architecture notes
