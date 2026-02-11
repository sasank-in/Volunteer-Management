# Architecture Notes

## Domain Draft
- Volunteer
- Organizer
- Event
- Participation
- Notification
- Feedback

## Suggested Services
- `user-service` for volunteers and organizers
- `event-service` for event creation and schedules
- `notification-service` for email and in-app alerts

## Data Sketch
- `volunteers` and `organizers` tables
- `events` with status and capacity
- `participations` linking volunteers to events
