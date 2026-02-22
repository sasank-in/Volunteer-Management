# Future Backend Development

This document lists backend APIs and development items that are not yet implemented but are expected based on the project documentation.

**User And Access Management**
- `POST /api/auth/logout-all` revoke all refresh tokens for the current user.
- `PUT /api/users/{id}/role` assign or change a user's role (admin only).
- `PATCH /api/users/{id}/status` set account status to `ACTIVE` or `DISABLED`.
- `GET /api/users/{id}/events` participation history for a volunteer.
- `GET /api/organizers/{id}/events` events created by an organizer.
- `GET /api/volunteers/{id}/profile` volunteer profile details.
- `GET /api/organizers/{id}/profile` organizer profile details.

**Event Management**
- `POST /api/events` create a new event (organizer).
- `PUT /api/events/{id}` update event details (organizer).
- `GET /api/events` list events (filter by date, location, status).
- `GET /api/events/{id}` fetch event details.
- `POST /api/events/{id}/close` close registration.
- `POST /api/events/{id}/complete` mark event as completed.

**Volunteer Participation**
- `POST /api/events/{id}/join` sign up for an event.
- `POST /api/events/{id}/withdraw` cancel participation.
- `GET /api/events/{id}/participants` list participants (organizer).

**Notifications**
- `GET /api/notifications` list notifications.
- `PATCH /api/notifications/{id}/read` mark a notification as read.
- Background jobs for reminders and sign-up alerts (email or in-app).

**Feedback And Ratings**
- `POST /api/events/{id}/feedback` submit feedback or rating.
- `GET /api/events/{id}/feedback` list feedback for organizers.

**Reporting**
- `GET /api/reports/events/{id}` participation summary for an event.
- `GET /api/reports/organizers/{id}` organizer dashboard metrics.

**Infrastructure And Security**
- Rate limiting for auth and public endpoints.
- Audit logging for role changes and auth events.
- Refresh token rotation and reuse detection.
- Email delivery integration for password reset.
