# Working Instructions

## Prerequisites
- JDK 21
- PostgreSQL 16+

## Services and Ports
- Config Server: `http://localhost:8888`
- Discovery Server (Eureka): `http://localhost:8761`
- User Service: `http://localhost:8081`
- API Gateway: `http://localhost:8080`

## Start Order (Required)
Run each command in a separate terminal from the repo root:

1. Config Server
```
.\mvnw.cmd -pl backend/config-server spring-boot:run
```

2. Discovery Server
```
.\mvnw.cmd -pl backend/discovery-server spring-boot:run
```

3. User Service
```
.\mvnw.cmd -pl backend/user-service spring-boot:run
```

4. API Gateway
```
.\mvnw.cmd -pl backend/api-gateway spring-boot:run
```

## Database Configuration
User Service reads config from Config Server (native repo):
`backend/config-repo/user-service.yml`

Database credentials are loaded from `.env` at the repo root.
Services also look for a fallback `../../.env` so you can start from module folders.
Create/update this file:
`.env`

Required values:
```
DB_URL=jdbc:postgresql://localhost:5432/volunteer_user_db
DB_USER=user_service
DB_PASSWORD=StrongPass@123
```

Note: `backend/.env` is kept in sync, but the repo-root `.env` is the one read when starting services from the repo root.

Note: If Config Server is not reachable, services fall back to their local `application.yml` settings.
Local fallbacks keep ports unique (8080/8081/8761/8888).
Gateway also includes a local fallback route for user-service, so `/api/auth/**` and `/api/users/**` still work even if Config Server is down.

JWT secret:
- If `JWT_SECRET` is not set, the service generates a temporary secret on startup.
- Tokens will become invalid after restart.
- For production, always set a stable 32+ character secret.

## Swagger UI
Direct User Service:
```
http://localhost:8081/swagger-ui.html
```

Via Gateway:
```
http://localhost:8080/swagger-ui.html
```

## API Smoke Tests (cURL)

Register:
```
curl -X POST http://localhost:8080/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"demo\",\"email\":\"demo@example.com\",\"password\":\"StrongPass@123\",\"phone_number\":\"+15551234567\"}"
```

Register Request Structure:
```
{
  "username": "demo",
  "email": "demo@example.com",
  "password": "StrongPass@123",
  "phone_number": "+15551234567"
}
```

Login:
```
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"demo@example.com\",\"password\":\"StrongPass@123\"}"
```

Login Response Shape:
```
{
  "tokens": {
    "access": "<ACCESS_TOKEN>",
    "refresh": "<REFRESH_TOKEN>"
  },
  "user": {
    "username": "demo",
    "email": "demo@example.com",
    "role": "VOLUNTEER",
    "id": "uuid"
  }
}
```

Profile:
```
curl -X GET http://localhost:8080/api/users/profile ^
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## Health Checks
```
http://localhost:8888/actuator/health
http://localhost:8761/actuator/health
http://localhost:8081/actuator/health
http://localhost:8080/actuator/health
```

## Available APIs (Gateway)
These are the only functional APIs currently implemented in this repo.

Auth:
- POST `/api/auth/register` creates a user account
- POST `/api/auth/login` returns access and refresh tokens (email-based login only)

User:
- GET `/api/users/profile` returns the current user profile, requires `Authorization: Bearer <ACCESS_TOKEN>`

System:
- GET `/actuator/health` is available on each service port (see Health Checks above)

## Default Service Endpoints (Non-Gateway)
Config Server:
- GET `http://localhost:8888/{app}/{profile}` returns resolved config (example: `http://localhost:8888/user-service/default`)

Discovery Server:
- Eureka UI: `http://localhost:8761`

User Service (direct):
- POST `http://localhost:8081/api/auth/register`
- POST `http://localhost:8081/api/auth/login`
- GET `http://localhost:8081/api/users/profile`
