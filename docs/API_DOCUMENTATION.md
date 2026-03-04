# API Documentation

## Base URL
All requests go through the API Gateway: `http://localhost:8080`

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All responses follow this structure:
- Success: Returns the requested data or confirmation message
- Error: Returns `{"error": "Error message"}`

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "VOLUNTEER",
  "phoneNumber": "+1234567890",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "VOLUNTEER",
    "phoneNumber": "+1234567890",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

### Logout
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

---

## Event Endpoints

### Create Event (Organizer)
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Community Cleanup Drive",
  "description": "Join us for a neighborhood cleanup",
  "location": "Central Park, Main Street",
  "eventDate": "2024-12-25T10:00:00",
  "requiredVolunteers": 20
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Community Cleanup Drive",
  "description": "Join us for a neighborhood cleanup",
  "location": "Central Park, Main Street",
  "eventDate": "2024-12-25T10:00:00",
  "requiredVolunteers": 20,
  "registeredVolunteers": 0,
  "organizerId": "uuid",
  "organizerName": "john_doe",
  "status": "OPEN",
  "averageRating": null,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### List Events
```http
GET /api/events
GET /api/events?upcoming=true
Authorization: Bearer <token>
```

### Get Event Details
```http
GET /api/events/{eventId}
Authorization: Bearer <token>
```

### Update Event (Organizer Only)
```http
PUT /api/events/{eventId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "requiredVolunteers": 25,
  "status": "FULL"
}
```

### Delete Event (Organizer Only)
```http
DELETE /api/events/{eventId}
Authorization: Bearer <token>
```

### Get My Organized Events
```http
GET /api/events/organizer/my-events
Authorization: Bearer <token>
```

---

## Participation Endpoints

### Register for Event
```http
POST /api/participations/events/{eventId}/register
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "eventId": "uuid",
  "volunteerId": "uuid",
  "volunteerName": "john_doe",
  "volunteerEmail": "john@example.com",
  "status": "REGISTERED",
  "rolePlayed": null,
  "registeredAt": "2024-01-01T00:00:00Z"
}
```

### Cancel Participation
```http
POST /api/participations/events/{eventId}/cancel
Authorization: Bearer <token>
```

### Get My Participation History
```http
GET /api/participations/my-participations
Authorization: Bearer <token>
```

### Get Event Participants
```http
GET /api/participations/events/{eventId}
Authorization: Bearer <token>
```

### Mark Attendance (Organizer)
```http
PUT /api/participations/events/{eventId}/volunteers/{volunteerId}/attendance?attended=true
Authorization: Bearer <token>
```

### Update Volunteer Role (Organizer)
```http
PUT /api/participations/events/{eventId}/volunteers/{volunteerId}/role?role=Team Leader
Authorization: Bearer <token>
```

---

## Feedback Endpoints

### Submit Feedback
```http
POST /api/feedbacks/events/{eventId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great event! Well organized."
}
```

**Response:**
```json
{
  "id": "uuid",
  "eventId": "uuid",
  "volunteerId": "uuid",
  "volunteerName": "john_doe",
  "rating": 5,
  "comment": "Great event! Well organized.",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Get Event Feedbacks
```http
GET /api/feedbacks/events/{eventId}
Authorization: Bearer <token>
```

### Get Average Rating
```http
GET /api/feedbacks/events/{eventId}/average-rating
Authorization: Bearer <token>
```

**Response:**
```json
4.5
```

---

## Notification Endpoints

### Get My Notifications
```http
GET /api/notifications/my-notifications
Authorization: Bearer <token>
```

### Get Unread Notifications
```http
GET /api/notifications/unread
Authorization: Bearer <token>
```

### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "unreadCount": 5
}
```

### Mark Notification as Read
```http
PUT /api/notifications/{notificationId}/read
Authorization: Bearer <token>
```

### Create Notification (System/Admin)
```http
POST /api/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "uuid",
  "recipientEmail": "john@example.com",
  "type": "EVENT_REMINDER",
  "subject": "Event Reminder",
  "message": "Your event starts tomorrow!",
  "eventId": "uuid"
}
```

---

## User Management Endpoints

### Get My Profile
```http
GET /api/users/me
Authorization: Bearer <token>
```

### List All Users
```http
GET /api/users
GET /api/users?role=ORGANIZER
Authorization: Bearer <token>
```

### Get User by ID
```http
GET /api/users/{userId}
Authorization: Bearer <token>
```

### Update User
```http
PUT /api/users/{userId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "new_username",
  "email": "newemail@example.com",
  "phoneNumber": "+9876543210",
  "role": "ORGANIZER"
}
```

### Delete User
```http
DELETE /api/users/{userId}
Authorization: Bearer <token>
```

### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

## Common Error Responses

### Validation Error
```json
{
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

### Authentication Error
```json
{
  "error": "Invalid credentials"
}
```

### Authorization Error
```json
{
  "error": "Only the organizer can update this event"
}
```

## Notification Types

- `EVENT_CREATED`: New event created
- `EVENT_UPDATED`: Event details updated
- `EVENT_CANCELLED`: Event cancelled
- `VOLUNTEER_REGISTERED`: Volunteer registered for event
- `VOLUNTEER_CANCELLED`: Volunteer cancelled participation
- `EVENT_REMINDER`: Reminder before event
- `EVENT_COMPLETED`: Event marked as completed

## Event Status

- `OPEN`: Accepting registrations
- `FULL`: Maximum volunteers reached
- `COMPLETED`: Event finished
- `CANCELLED`: Event cancelled

## Participation Status

- `REGISTERED`: Volunteer registered
- `ATTENDED`: Volunteer attended
- `CANCELLED`: Registration cancelled
- `NO_SHOW`: Registered but didn't attend

## User Roles

- `VOLUNTEER`: Regular volunteer user
- `ORGANIZER`: Can create and manage events
- `ADMIN`: Full system access
