# Testing Guide

## Testing Workflow

This guide provides step-by-step instructions to test all features of the Volunteer Management Platform.

## Prerequisites

- All services running (use `start.bat`)
- Postman or curl installed
- PostgreSQL running with all databases created

## Test Scenarios

### 1. User Registration and Authentication

#### 1.1 Register as Volunteer
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "volunteer1",
    "email": "volunteer1@example.com",
    "password": "Volunteer123!",
    "phoneNumber": "+1234567890"
  }'
```

**Expected**: User created with role VOLUNTEER

#### 1.2 Register as Organizer
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "organizer1",
    "email": "organizer1@example.com",
    "password": "Organizer123!",
    "phoneNumber": "+1234567891"
  }'
```

Then update role to ORGANIZER via database or admin endpoint.

#### 1.3 Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer1@example.com",
    "password": "Organizer123!"
  }'
```

**Save the accessToken for subsequent requests**

#### 1.4 Get Profile
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <organizer-token>"
```

### 2. Event Management (Organizer)

#### 2.1 Create Event
```bash
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <organizer-token>" \
  -d '{
    "title": "Community Cleanup Drive",
    "description": "Join us to clean up Central Park and make our community beautiful!",
    "location": "Central Park, 123 Main Street",
    "eventDate": "2024-12-25T10:00:00",
    "requiredVolunteers": 20
  }'
```

**Save the event ID from response**

#### 2.2 List All Events
```bash
curl -X GET http://localhost:8080/api/events \
  -H "Authorization: Bearer <organizer-token>"
```

#### 2.3 List Upcoming Events
```bash
curl -X GET "http://localhost:8080/api/events?upcoming=true" \
  -H "Authorization: Bearer <organizer-token>"
```

#### 2.4 Get Event Details
```bash
curl -X GET http://localhost:8080/api/events/<event-id> \
  -H "Authorization: Bearer <organizer-token>"
```

#### 2.5 Update Event
```bash
curl -X PUT http://localhost:8080/api/events/<event-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <organizer-token>" \
  -d '{
    "title": "Community Cleanup Drive - Updated",
    "requiredVolunteers": 25
  }'
```

#### 2.6 Get My Organized Events
```bash
curl -X GET http://localhost:8080/api/events/organizer/my-events \
  -H "Authorization: Bearer <organizer-token>"
```

### 3. Volunteer Participation

#### 3.1 Register for Event (as Volunteer)
```bash
curl -X POST http://localhost:8080/api/participations/events/<event-id>/register \
  -H "Authorization: Bearer <volunteer-token>"
```

**Expected**: Participation created, event registered_volunteers incremented

#### 3.2 Get My Participations
```bash
curl -X GET http://localhost:8080/api/participations/my-participations \
  -H "Authorization: Bearer <volunteer-token>"
```

#### 3.3 Get Event Participants (as Organizer)
```bash
curl -X GET http://localhost:8080/api/participations/events/<event-id> \
  -H "Authorization: Bearer <organizer-token>"
```

#### 3.4 Cancel Participation
```bash
curl -X POST http://localhost:8080/api/participations/events/<event-id>/cancel \
  -H "Authorization: Bearer <volunteer-token>"
```

**Expected**: Status changed to CANCELLED, event counter decremented

#### 3.5 Mark Attendance (as Organizer)
```bash
curl -X PUT "http://localhost:8080/api/participations/events/<event-id>/volunteers/<volunteer-id>/attendance?attended=true" \
  -H "Authorization: Bearer <organizer-token>"
```

#### 3.6 Update Volunteer Role (as Organizer)
```bash
curl -X PUT "http://localhost:8080/api/participations/events/<event-id>/volunteers/<volunteer-id>/role?role=Team Leader" \
  -H "Authorization: Bearer <organizer-token>"
```

### 4. Event Feedback

#### 4.1 Submit Feedback (after attending)
```bash
curl -X POST http://localhost:8080/api/feedbacks/events/<event-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <volunteer-token>" \
  -d '{
    "rating": 5,
    "comment": "Excellent event! Very well organized and impactful."
  }'
```

**Note**: Volunteer must have ATTENDED status to submit feedback

#### 4.2 Get Event Feedbacks
```bash
curl -X GET http://localhost:8080/api/feedbacks/events/<event-id> \
  -H "Authorization: Bearer <organizer-token>"
```

#### 4.3 Get Average Rating
```bash
curl -X GET http://localhost:8080/api/feedbacks/events/<event-id>/average-rating \
  -H "Authorization: Bearer <organizer-token>"
```

### 5. Notifications

#### 5.1 Get My Notifications
```bash
curl -X GET http://localhost:8080/api/notifications/my-notifications \
  -H "Authorization: Bearer <volunteer-token>"
```

#### 5.2 Get Unread Notifications
```bash
curl -X GET http://localhost:8080/api/notifications/unread \
  -H "Authorization: Bearer <volunteer-token>"
```

#### 5.3 Get Unread Count
```bash
curl -X GET http://localhost:8080/api/notifications/unread-count \
  -H "Authorization: Bearer <volunteer-token>"
```

#### 5.4 Mark as Read
```bash
curl -X PUT http://localhost:8080/api/notifications/<notification-id>/read \
  -H "Authorization: Bearer <volunteer-token>"
```

#### 5.5 Create Notification (System/Admin)
```bash
curl -X POST http://localhost:8080/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "recipientId": "<volunteer-id>",
    "recipientEmail": "volunteer1@example.com",
    "type": "EVENT_REMINDER",
    "subject": "Event Reminder: Community Cleanup Tomorrow",
    "message": "Don'\''t forget! The Community Cleanup event starts tomorrow at 10 AM.",
    "eventId": "<event-id>"
  }'
```

#### 5.6 Send Notification
```bash
curl -X POST http://localhost:8080/api/notifications/<notification-id>/send \
  -H "Authorization: Bearer <admin-token>"
```

### 6. User Management

#### 6.1 List All Users
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer <token>"
```

#### 6.2 Filter Users by Role
```bash
curl -X GET "http://localhost:8080/api/users?role=ORGANIZER" \
  -H "Authorization: Bearer <token>"
```

#### 6.3 Get User by ID
```bash
curl -X GET http://localhost:8080/api/users/<user-id> \
  -H "Authorization: Bearer <token>"
```

#### 6.4 Update User
```bash
curl -X PUT http://localhost:8080/api/users/<user-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "phoneNumber": "+9876543210",
    "role": "ORGANIZER"
  }'
```

#### 6.5 Change Password
```bash
curl -X POST http://localhost:8080/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass123!"
  }'
```

#### 6.6 Forgot Password
```bash
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "volunteer1@example.com"
  }'
```

**Save the reset_token from response**

#### 6.7 Reset Password
```bash
curl -X POST http://localhost:8080/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "<reset-token>",
    "newPassword": "ResetPass123!"
  }'
```

### 7. Token Management

#### 7.1 Refresh Token
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh-token>"
  }'
```

#### 7.2 Logout
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "refreshToken": "<refresh-token>"
  }'
```

## Complete Test Flow

### Scenario: Organize and Participate in an Event

1. **Register Organizer**
   - Create organizer account
   - Login and get token
   - Update role to ORGANIZER (via database)

2. **Create Event**
   - Organizer creates cleanup event
   - Set date, location, required volunteers

3. **Register Volunteers**
   - Create 3 volunteer accounts
   - Each volunteer logs in
   - Each registers for the event

4. **Event Management**
   - Organizer views participants
   - Organizer updates event details
   - Organizer assigns roles to volunteers

5. **Event Day**
   - Organizer marks attendance
   - 2 volunteers attended, 1 no-show

6. **Post-Event**
   - Attended volunteers submit feedback
   - Organizer views feedback and ratings
   - Organizer marks event as COMPLETED

7. **Notifications**
   - Volunteers receive event reminders
   - Organizer receives registration notifications
   - All check and read notifications

## Postman Collection

Import this collection for easier testing:

```json
{
  "info": {
    "name": "Volunteer Management Platform",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"email\": \"test@example.com\",\n  \"password\": \"Test123!\",\n  \"phoneNumber\": \"+1234567890\"\n}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Test123!\"\n}"
            }
          }
        }
      ]
    }
  ]
}
```

## Validation Checklist

- [ ] User registration works
- [ ] Login returns valid JWT tokens
- [ ] Token refresh works
- [ ] Password reset flow works
- [ ] Event creation works
- [ ] Event listing and filtering works
- [ ] Volunteer registration works
- [ ] Participation cancellation works
- [ ] Attendance marking works
- [ ] Feedback submission works
- [ ] Average rating calculation works
- [ ] Notifications are created
- [ ] Email sending works (if configured)
- [ ] Notification read status updates
- [ ] All services registered in Eureka
- [ ] API Gateway routing works
- [ ] Database migrations applied
- [ ] Swagger UI accessible

## Common Issues

### 401 Unauthorized
- Token expired (refresh it)
- Token not included in header
- Invalid token format

### 400 Bad Request
- Validation error (check request body)
- Missing required fields
- Invalid data format

### 403 Forbidden
- Insufficient permissions
- Wrong user role for operation

### 404 Not Found
- Invalid ID
- Resource doesn't exist
- Wrong endpoint URL

## Performance Testing

Use Apache JMeter or similar tools:

1. **Load Test**: 100 concurrent users
2. **Stress Test**: Gradually increase load
3. **Endurance Test**: Sustained load for 1 hour
4. **Spike Test**: Sudden traffic increase

## Security Testing

1. **SQL Injection**: Try malicious SQL in inputs
2. **XSS**: Try script injection
3. **JWT Tampering**: Modify token and test
4. **Brute Force**: Multiple failed login attempts
5. **Authorization**: Access resources without permission

## Automated Testing

Run unit and integration tests:

```bash
cd backend
./mvnw test
```

## Monitoring During Tests

Watch logs in real-time:
```bash
tail -f backend/user-service/logs/application.log
tail -f backend/event-service/logs/application.log
tail -f backend/notification-service/logs/application.log
```

Check Eureka dashboard:
http://localhost:8761

Monitor database connections:
```sql
SELECT * FROM pg_stat_activity;
```
