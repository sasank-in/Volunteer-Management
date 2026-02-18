# Volunteer-Management Backend Instructions

This repository contains a Spring Cloud microservices backend with a Config Server, Discovery Server (Eureka), API Gateway, and User Service.

## Prerequisites
- Java 21
- Maven
- PostgreSQL

## Required Environment Variables
Set these in `.env` at the repo root (loaded by services).
- `DB_URL` (e.g., `jdbc:postgresql://localhost:5432/volunteer`)
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET` (32+ characters, required)
- `JWT_ISSUER` (optional, default: `volunteer-user-service`)
- `JWT_EXPIRES_IN` (optional, seconds, default: `3600`)
- `JWT_REFRESH_EXPIRES_IN` (optional, seconds, default: `604800`)
- `EUREKA_URL` (optional, default: `http://localhost:8761/eureka`)

## Startup Order
1. Config Server (`backend/config-server`)
2. Discovery Server (`backend/discovery-server`)
3. API Gateway (`backend/api-gateway`)
4. User Service (`backend/user-service`)

Each service reads config from `backend/config-repo` via the Config Server.

## Database Migrations
Flyway runs automatically on User Service startup.
- `V3__case_insensitive_unique.sql` adds case-insensitive uniqueness for `email` and `username`.
  If duplicates exist only by case, the migration will fail with a clear error.

## API Notes
- Auth endpoints: `/api/auth/register`, `/api/auth/login`
- User profile: `/api/users/profile`
- Actuator health: `/actuator/health` (service-level)
- Swagger UI is exposed through the API Gateway at `/swagger-ui.html`

## APIs Available vs. Not Available
- Available (implemented and should appear in Swagger):
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/users/profile`
- Not available (will not appear in Swagger until implemented):
  - Refresh token endpoint (e.g., `POST /api/auth/refresh`)
  - Logout/invalidate token endpoint
  - Password reset / change password endpoints

Swagger only lists endpoints that are implemented in controllers. If you expect an API to show up but it does not, it likely is not implemented yet or is excluded from component scanning.

## Security Notes
- JWTs are signed with `JWT_SECRET`. The service will fail fast if missing.
