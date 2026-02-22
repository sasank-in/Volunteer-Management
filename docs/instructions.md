# Instructions

## Prerequisites
- JDK 21
- Maven
- PostgreSQL 16+

## Services and Ports
- Config Server: `http://localhost:8888`
- Discovery Server (Eureka): `http://localhost:8761`
- User Service: `http://localhost:8081`
- API Gateway: `http://localhost:8080`

## Maven Structure
- Backend services inherit from the shared parent `backend/pom.xml` (Spring Cloud BOM).
- Root `pom.xml` aggregates `backend` for convenience.

## Start Order (Required)
All services pull config from Config Server and register with Eureka.
Start in order:

1. Config Server
```
.\mvnw.cmd -f backend/config-server/pom.xml spring-boot:run
```

2. Discovery Server
```
.\mvnw.cmd -f backend/discovery-server/pom.xml spring-boot:run
```

3. User Service
```
.\mvnw.cmd -f backend/user-service/pom.xml spring-boot:run
```

4. API Gateway
```
.\mvnw.cmd -f backend/api-gateway/pom.xml spring-boot:run
```

Or start everything in separate windows:
```
.\start.bat
```

## Configuration and .env
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
JWT_SECRET=replace_with_32_plus_char_secret
```

Optional values:
```
JWT_ISSUER=volunteer-user-service
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800
EUREKA_URL=http://localhost:8761/eureka
```

Notes:
- Do not set `SERVER_PORT` in the root `.env`, or all services will try to use the same port.
- Config Server is required for service startup (fail-fast enabled).
- `JWT_SECRET` is mandatory; startup fails if missing or too short.

## Database Migrations
Flyway runs automatically on User Service startup.
- `V3__case_insensitive_unique.sql` enforces case-insensitive uniqueness for `email` and `username`.
  If duplicates exist only by case, the migration fails with a clear error.

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

Me (alias for profile):
```
curl -X GET http://localhost:8080/api/users/me ^
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Get All Users:
```
curl -X GET http://localhost:8080/api/users ^
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Get Users by Role:
```
curl -X GET "http://localhost:8080/api/users?role=VOLUNTEER" ^
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Get User by ID:
```
curl -X GET http://localhost:8080/api/users/<USER_ID> ^
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Update User:
```
curl -X PUT http://localhost:8080/api/users/<USER_ID> ^
  -H "Authorization: Bearer <ACCESS_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"newname\",\"email\":\"new@example.com\",\"phone_number\":\"+15551230000\",\"role\":\"ADMIN\"}"
```

Delete User:
```
curl -X DELETE http://localhost:8080/api/users/<USER_ID> ^
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Refresh Token:
```
curl -X POST http://localhost:8080/api/auth/refresh ^
  -H "Content-Type: application/json" ^
  -d "{\"refresh_token\":\"<REFRESH_TOKEN>\"}"
```

Change Password:
```
curl -X POST http://localhost:8080/api/auth/change-password ^
  -H "Authorization: Bearer <ACCESS_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"current_password\":\"OldPass@123\",\"new_password\":\"NewPass@123\"}"
```

Logout (invalidate refresh token):
```
curl -X POST http://localhost:8080/api/auth/logout ^
  -H "Content-Type: application/json" ^
  -d "{\"refresh_token\":\"<REFRESH_TOKEN>\"}"
```

Forgot Password:
```
curl -X POST http://localhost:8080/api/auth/forgot-password ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"demo@example.com\"}"
```

Reset Password:
```
curl -X POST http://localhost:8080/api/auth/reset-password ^
  -H "Content-Type: application/json" ^
  -d "{\"reset_token\":\"<RESET_TOKEN>\",\"new_password\":\"NewPass@123\"}"
```

## Health Checks
```
http://localhost:8888/actuator/health
http://localhost:8761/actuator/health
http://localhost:8081/actuator/health
http://localhost:8080/actuator/health
```

## Config Server Checks
Config is available when you see non-empty `propertySources`.

User Service config:
```
curl http://localhost:8888/user-service/default
```

API Gateway config:
```
curl http://localhost:8888/api-gateway/default
```

Discovery Server config:
```
curl http://localhost:8888/discovery-server/default
```

## Available APIs (Gateway)
These are the only functional APIs currently implemented in this repo.

Auth:
- POST `/api/auth/register` creates a user account
- POST `/api/auth/login` returns access and refresh tokens (email-based login only)
- POST `/api/auth/refresh` issues new tokens using a refresh token
- POST `/api/auth/change-password` updates the current user's password
- POST `/api/auth/logout` invalidates a refresh token
- POST `/api/auth/forgot-password` creates a password reset token
- POST `/api/auth/reset-password` resets password using a reset token

User:
- GET `/api/users/profile` returns the current user profile, requires `Authorization: Bearer <ACCESS_TOKEN>`
- GET `/api/users/me` alias for current user profile
- GET `/api/users` returns all users, requires `Authorization: Bearer <ACCESS_TOKEN>`
- GET `/api/users?role=ROLE` filters users by role
- GET `/api/users/{id}` returns a user by id
- PUT `/api/users/{id}` updates a user, requires `Authorization: Bearer <ACCESS_TOKEN>`
- DELETE `/api/users/{id}` deletes a user, requires `Authorization: Bearer <ACCESS_TOKEN>`

System:
- GET `/actuator/health` is available on each service port (see Health Checks above)

## Not Implemented Yet (Won't Appear in Swagger)
- Password reset email delivery (currently returns the token in response for dev)

## Default Service Endpoints (Non-Gateway)
Config Server:
- GET `http://localhost:8888/{app}/{profile}` returns resolved config (example: `http://localhost:8888/user-service/default`)

Discovery Server:
- Eureka UI: `http://localhost:8761`

User Service (direct):
- POST `http://localhost:8081/api/auth/register`
- POST `http://localhost:8081/api/auth/login`
- POST `http://localhost:8081/api/auth/refresh`
- POST `http://localhost:8081/api/auth/change-password`
- POST `http://localhost:8081/api/auth/logout`
- POST `http://localhost:8081/api/auth/forgot-password`
- POST `http://localhost:8081/api/auth/reset-password`
- GET `http://localhost:8081/api/users/profile`
- GET `http://localhost:8081/api/users/me`
- GET `http://localhost:8081/api/users`
- GET `http://localhost:8081/api/users/{id}`
- PUT `http://localhost:8081/api/users/{id}`
- DELETE `http://localhost:8081/api/users/{id}`
