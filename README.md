# Volunteer Management Platform 
 
Starter setup for a Volunteer Management Platform using Spring Cloud microservices and PostgreSQL. The frontend is optional and can be added later. 
 
## Prerequisites
- JDK 21 
- Maven 3.9+ (or use included Maven wrapper)
- Docker Desktop 
- Node.js 20+ (only if you add a frontend) 
 
## Quick Start (Local)

1. Start your local Postgres instances
2. Navigate to backend directory:
   ```bash
   cd backend
   ```
3. Run services in order:
   ```bash
   # Config Server (wait ~10s)
   ./mvnw -pl config-server spring-boot:run
   
   # Discovery Server (wait ~10s)
   ./mvnw -pl discovery-server spring-boot:run
   
   # User Service (wait ~10s)
   ./mvnw -pl user-service spring-boot:run
   
   # API Gateway
   ./mvnw -pl api-gateway spring-boot:run
   ```

Or use the automated startup script from root:
```bash
start.bat  # Windows
```

## Service URLs
- Config Server: http://localhost:8888
- Discovery Server: http://localhost:8761
- User Service: http://localhost:8081
- API Gateway: http://localhost:8080

## Project Structure
```
├── backend/               # Spring Cloud microservices (parent POM)
│   ├── pom.xml           # Parent POM with Spring Boot/Cloud BOMs
│   ├── mvnw, mvnw.cmd    # Maven wrapper
│   ├── .mvn/             # Maven wrapper config
│   ├── config-server/    # Central configuration server
│   ├── config-repo/      # Native config repository
│   ├── discovery-server/ # Eureka service discovery
│   ├── user-service/     # User management + JWT auth
│   └── api-gateway/      # API gateway
├── infra/                # Docker Compose services
├── frontend/             # Optional frontend placeholder
├── docs/                 # Architecture notes
└── start.bat             # Automated startup script
```

## Building
```bash
cd backend
./mvnw clean install
```

## API Documentation
Once services are running, access Swagger UI at:
- User Service: http://localhost:8081/swagger-ui.html
