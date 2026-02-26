# Deployment Guide

## Prerequisites

### Required Software
- **JDK 21**: Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)
- **PostgreSQL 14+**: Download from [PostgreSQL.org](https://www.postgresql.org/download/)
- **Maven 3.9+**: Included via Maven Wrapper (mvnw)
- **Git**: For version control

### Optional Software
- **Docker Desktop**: For containerized PostgreSQL
- **Postman**: For API testing
- **pgAdmin**: PostgreSQL GUI client

## Step-by-Step Deployment

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Volunteer-Management
```

### Step 2: Setup PostgreSQL

#### Option A: Local PostgreSQL Installation

1. Install PostgreSQL and start the service

2. Run the database setup script:
```bash
psql -U postgres -f setup-databases.sql
```

This creates:
- `volunteer_user_db` with user `user_service`
- `volunteer_event_db` with user `event_service`
- `volunteer_notification_db` with user `notification_service`

#### Option B: Docker PostgreSQL

```bash
docker run --name volunteer-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:14

# Wait for PostgreSQL to start
sleep 5

# Create databases
docker exec -i volunteer-postgres psql -U postgres < setup-databases.sql
```

### Step 3: Configure Environment Variables

The `.env` file contains all configuration. Review and update if needed:

```env
# User Service Database
DB_URL=jdbc:postgresql://localhost:5432/volunteer_user_db
DB_USER=user_service
DB_PASSWORD=StrongPass@123

# Event Service Database
EVENT_DB_URL=jdbc:postgresql://localhost:5432/volunteer_event_db
EVENT_DB_USER=event_service
EVENT_DB_PASSWORD=StrongPass@123

# Notification Service Database
NOTIFICATION_DB_URL=jdbc:postgresql://localhost:5432/volunteer_notification_db
NOTIFICATION_DB_USER=notification_service
NOTIFICATION_DB_PASSWORD=StrongPass@123

# JWT Configuration
JWT_SECRET=6QcvRfByzKetvja6OSBcr/N/lQ1hhskz2Yu0AKOa1Tw=
JWT_ISSUER=volunteer-user-service
JWT_EXPIRES_IN=3600
EUREKA_URL=http://localhost:8761/eureka

# Email Configuration (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

**Important**: Generate a new JWT secret for production:
```bash
openssl rand -base64 32
```

### Step 4: Build the Project

```bash
cd backend
./mvnw clean install
```

This will:
- Download all dependencies
- Compile all services
- Run tests
- Package JAR files

### Step 5: Start Services

#### Option A: Automated Startup (Windows)

From the root directory:
```bash
start.bat
```

#### Option B: Manual Startup

Start services in order, waiting ~10 seconds between each:

```bash
cd backend

# 1. Config Server
./mvnw -pl config-server spring-boot:run

# 2. Discovery Server (new terminal)
./mvnw -pl discovery-server spring-boot:run

# 3. User Service (new terminal)
./mvnw -pl user-service spring-boot:run

# 4. Event Service (new terminal)
./mvnw -pl event-service spring-boot:run

# 5. Notification Service (new terminal)
./mvnw -pl notification-service spring-boot:run

# 6. API Gateway (new terminal)
./mvnw -pl api-gateway spring-boot:run
```

#### Option C: Production JAR Execution

```bash
cd backend

# Build JARs
./mvnw clean package -DskipTests

# Run services
java -jar config-server/target/config-server-0.1.0-SNAPSHOT.jar &
sleep 10
java -jar discovery-server/target/discovery-server-0.1.0-SNAPSHOT.jar &
sleep 10
java -jar user-service/target/user-service-0.1.0-SNAPSHOT.jar &
java -jar event-service/target/event-service-0.1.0-SNAPSHOT.jar &
java -jar notification-service/target/notification-service-0.1.0-SNAPSHOT.jar &
java -jar api-gateway/target/api-gateway-0.1.0-SNAPSHOT.jar &
```

### Step 6: Verify Deployment

Check that all services are running:

1. **Config Server**: http://localhost:8888/actuator/health
2. **Discovery Server**: http://localhost:8761
3. **User Service**: http://localhost:8081/actuator/health
4. **Event Service**: http://localhost:8082/actuator/health
5. **Notification Service**: http://localhost:8083/actuator/health
6. **API Gateway**: http://localhost:8080/actuator/health

All should return `{"status":"UP"}`

### Step 7: Test the API

#### Register a User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "phoneNumber": "+1234567890"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

Save the `accessToken` from the response.

#### Create an Event
```bash
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{
    "title": "Community Cleanup",
    "description": "Help clean our neighborhood",
    "location": "Central Park",
    "eventDate": "2024-12-25T10:00:00",
    "requiredVolunteers": 20
  }'
```

## Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication in your Google Account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated password

3. Update `.env`:
```env
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
```

### Other SMTP Providers

Update these values in `.env`:
```env
MAIL_HOST=smtp.your-provider.com
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
```

## Production Deployment

### Environment-Specific Configuration

Create environment-specific config files in `backend/config-repo/`:

**application-prod.yml**:
```yaml
spring:
  datasource:
    url: ${DB_URL}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5

logging:
  level:
    root: INFO
    com.volunteer: INFO
```

Run with profile:
```bash
java -jar -Dspring.profiles.active=prod user-service.jar
```

### Docker Deployment

Create `Dockerfile` for each service:

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:
```bash
docker build -t user-service:latest ./user-service
docker run -p 8081:8081 --env-file .env user-service:latest
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./setup-databases.sql:/docker-entrypoint-initdb.d/setup.sql

  config-server:
    build: ./backend/config-server
    ports:
      - "8888:8888"
    environment:
      - SPRING_PROFILES_ACTIVE=docker

  discovery-server:
    build: ./backend/discovery-server
    ports:
      - "8761:8761"
    depends_on:
      - config-server

  user-service:
    build: ./backend/user-service
    ports:
      - "8081:8081"
    env_file:
      - .env
    depends_on:
      - postgres
      - config-server
      - discovery-server

  event-service:
    build: ./backend/event-service
    ports:
      - "8082:8082"
    env_file:
      - .env
    depends_on:
      - postgres
      - config-server
      - discovery-server

  notification-service:
    build: ./backend/notification-service
    ports:
      - "8083:8083"
    env_file:
      - .env
    depends_on:
      - postgres
      - config-server
      - discovery-server

  api-gateway:
    build: ./backend/api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - config-server
      - discovery-server
      - user-service
      - event-service
      - notification-service

volumes:
  postgres-data:
```

Start all services:
```bash
docker-compose up -d
```

### Kubernetes Deployment

Create Kubernetes manifests in `k8s/` directory:

**postgres-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:14
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

Deploy:
```bash
kubectl apply -f k8s/
```

## Monitoring and Maintenance

### Health Checks

Monitor service health:
```bash
# Check all services
curl http://localhost:8888/actuator/health
curl http://localhost:8761/actuator/health
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
curl http://localhost:8083/actuator/health
curl http://localhost:8080/actuator/health
```

### Logs

View logs:
```bash
# Spring Boot logs
tail -f backend/user-service/logs/application.log

# Docker logs
docker logs -f user-service

# Kubernetes logs
kubectl logs -f deployment/user-service
```

### Database Backups

```bash
# Backup all databases
pg_dump -U postgres volunteer_user_db > user_db_backup.sql
pg_dump -U postgres volunteer_event_db > event_db_backup.sql
pg_dump -U postgres volunteer_notification_db > notification_db_backup.sql

# Restore
psql -U postgres volunteer_user_db < user_db_backup.sql
```

### Database Migrations

Flyway automatically runs migrations on startup. To manually check:

```bash
# Check migration status
./mvnw -pl user-service flyway:info

# Validate migrations
./mvnw -pl user-service flyway:validate
```

## Troubleshooting

### Service Won't Start

1. Check if port is already in use:
```bash
netstat -ano | findstr :8081
```

2. Check logs for errors
3. Verify database connection
4. Ensure Config Server is running first

### Database Connection Issues

1. Verify PostgreSQL is running:
```bash
psql -U postgres -c "SELECT version();"
```

2. Check database exists:
```bash
psql -U postgres -l
```

3. Test connection:
```bash
psql -U user_service -d volunteer_user_db -h localhost
```

### JWT Token Issues

1. Verify JWT secret is set in `.env`
2. Check token expiration
3. Ensure all services use the same secret

### Email Not Sending

1. Verify SMTP credentials
2. Check firewall/antivirus blocking port 587
3. Enable "Less secure app access" (Gmail)
4. Use App Password instead of account password

### Service Discovery Issues

1. Check Eureka dashboard: http://localhost:8761
2. Verify services are registered
3. Check network connectivity
4. Restart Discovery Server

## Performance Tuning

### JVM Options

```bash
java -Xms512m -Xmx1024m \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -jar user-service.jar
```

### Database Connection Pool

Update `application.yml`:
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

### API Gateway Timeout

```yaml
spring:
  cloud:
    gateway:
      httpclient:
        connect-timeout: 5000
        response-timeout: 30s
```

## Security Hardening

1. **Change Default Passwords**: Update all database passwords
2. **Use HTTPS**: Configure SSL certificates
3. **Enable CORS**: Configure allowed origins
4. **Rate Limiting**: Implement API rate limiting
5. **Firewall Rules**: Restrict database access
6. **Regular Updates**: Keep dependencies updated

## Backup and Recovery

### Automated Backups

Create a backup script:

```bash
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

pg_dump -U postgres volunteer_user_db > $BACKUP_DIR/user_db.sql
pg_dump -U postgres volunteer_event_db > $BACKUP_DIR/event_db.sql
pg_dump -U postgres volunteer_notification_db > $BACKUP_DIR/notification_db.sql

# Compress
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR
```

Schedule with cron:
```bash
0 2 * * * /path/to/backup-script.sh
```

## Scaling

### Horizontal Scaling

Run multiple instances:
```bash
# Instance 1
SERVER_PORT=8081 java -jar user-service.jar

# Instance 2
SERVER_PORT=8091 java -jar user-service.jar
```

Eureka will automatically load balance.

### Database Scaling

1. **Read Replicas**: Configure read-only replicas
2. **Connection Pooling**: Increase pool size
3. **Caching**: Implement Redis caching

## Support

For issues or questions:
1. Check logs first
2. Review documentation
3. Search existing issues
4. Create new issue with details
