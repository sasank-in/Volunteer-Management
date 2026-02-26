# Volunteer Management Platform

A microservices-based platform for managing volunteer events, participation tracking, and notifications. Built with Spring Cloud, PostgreSQL, and JWT authentication.

## Architecture

### Microservices
- **Config Server** (8888): Centralized configuration management
- **Discovery Server** (8761): Eureka service registry
- **API Gateway** (8080): Single entry point for all services
- **User Service** (8081): Authentication and user management
- **Event Service** (8082): Event and participation management
- **Notification Service** (8083): Email and in-app notifications

### Technology Stack
- Java 21
- Spring Boot 3.4.2
- Spring Cloud 2024.0.1
- Spring Security with JWT
- PostgreSQL with Flyway migrations
- Maven

## Prerequisites

- JDK 21
- PostgreSQL 14+
- Maven 3.9+ (or use included wrapper)

## Setup

### 1. Database Setup

Create three PostgreSQL databases:
```sql
CREATE DATABASE volunteer_user_db;
CREATE DATABASE volunteer_event_db;
CREATE DATABASE volunteer_notification_db;
```

Grant permissions to your database user and update credentials in `.env` file.

### 2. Configure Environment

Update `.env` file with your database credentials:
```
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

### 3. Start Services

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
cd backend

# Start services in order
./mvnw -pl config-server spring-boot:run &
sleep 15
./mvnw -pl discovery-server spring-boot:run &
sleep 15
./mvnw -pl user-service spring-boot:run &
./mvnw -pl event-service spring-boot:run &
./mvnw -pl notification-service spring-boot:run &
./mvnw -pl api-gateway spring-boot:run &
```

### 4. Verify

- Discovery Server: http://localhost:8761
- API Gateway: http://localhost:8080
- Swagger UI: http://localhost:8081/swagger-ui.html

## API Documentation

All APIs are accessible through the API Gateway at `http://localhost:8080`

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login and get JWT token
POST /api/auth/refresh - Refresh access token
```

### User Management
```
GET /api/users/me - Get current user profile
GET /api/users - List all users
PUT /api/users/{id} - Update user
```

### Event Management
```
POST /api/events - Create event
GET /api/events - List all events
GET /api/events/{id} - Get event details
PUT /api/events/{id} - Update event
DELETE /api/events/{id} - Delete event
```

### Participation
```
POST /api/participations/events/{eventId}/register - Register for event
POST /api/participations/events/{eventId}/cancel - Cancel participation
GET /api/participations/my-participations - Get participation history
```

### Notifications
```
GET /api/notifications/my-notifications - Get notifications
GET /api/notifications/unread-count - Get unread count
PUT /api/notifications/{id}/read - Mark as read
```

For complete API documentation, visit Swagger UI at http://localhost:8081/swagger-ui.html

## Project Structure

```
├── backend/
│   ├── config-server/            # Configuration server
│   ├── config-repo/              # Configuration files
│   ├── discovery-server/         # Eureka service registry
│   ├── api-gateway/              # API Gateway
│   ├── user-service/             # User management & auth
│   ├── event-service/            # Event & participation
│   └── notification-service/     # Notifications
├── docs/                         # Additional documentation
├── .env                          # Environment configuration
├── start.bat                     # Service startup script
└── README.md                     # This file
```

## Development

### Build
```bash
cd backend
./mvnw clean install
```

### Run Tests
```bash
./mvnw test
```

## Security

- JWT-based authentication
- BCrypt password hashing
- Role-based access control (VOLUNTEER, ORGANIZER, ADMIN)
- Stateless session management

## License

Educational purposes.
