# Notification E2E Test Guide (Frontend POV)

Use this checklist to verify notification behavior end-to-end from the frontend.

**Prerequisites**
- `config-server`, `discovery-server`, `api-gateway`, `user-service`, `event-service`, `notification-service` running.
- DB migrations applied for `event-service` and `notification-service`.
- Valid SMTP credentials in `.env` for `notification-service`.

**Assumptions**
- You have at least one organizer user and one volunteer user.
- You can create events as an organizer.

**Test 1: Volunteer Registration Notification (Volunteer + Organizer)**
1. Log in as **Organizer**.
2. Create an event with a future date.
3. Log out.
4. Log in as **Volunteer**.
5. Open Events and register for the event.

Expected:
- Volunteer receives a notification: `VOLUNTEER_REGISTERED` with subject "Registration confirmed: {Event Title}".
- Organizer receives a notification: `VOLUNTEER_REGISTERED` with subject "Volunteer registered: {Event Title}".
- Both appear in Notifications UI and in unread count.

**Test 2: Volunteer Cancellation Notification (Volunteer + Organizer)**
1. As **Volunteer**, cancel registration for the event.

Expected:
- Volunteer receives a notification: `VOLUNTEER_CANCELLED` with subject "Registration cancelled: {Event Title}".
- Organizer receives a notification: `VOLUNTEER_CANCELLED` with subject "Volunteer cancelled: {Event Title}".

**Test 3: Event Update Notification (Participants)**
1. Log in as **Organizer**.
2. Update event title, date, or location.

Expected:
- All registered participants receive `EVENT_UPDATED` notification.
- Notifications show updated schedule in the message.

**Test 4: Event Cancellation Notification (Participants)**
1. As **Organizer**, set event status to `CANCELLED` or delete the event.

Expected:
- All registered participants receive `EVENT_CANCELLED` notification.

**Test 5: Event Completed Notification (Participants)**
1. As **Organizer**, set event status to `COMPLETED`.

Expected:
- All participants receive `EVENT_COMPLETED` notification.

**Test 6: Event Reminder Notification (Volunteer + Organizer)**
1. Ensure event date is within the reminder window (default 24 hours).
2. Wait for scheduled reminder job or temporarily set:
   - `NOTIFICATION_REMINDER_HOURS_BEFORE=48`
   - `NOTIFICATION_REMINDER_CHECK_INTERVAL_MS=60000`
3. Restart `event-service`.

Expected:
- Volunteers with `REGISTERED` status receive `EVENT_REMINDER`.
- Organizer receives `EVENT_REMINDER`.
- Each event gets reminders only once (uses `reminder_sent_at`).

**Test 7: Notification Center (Unread Count)**
1. With any user, open the notification bell in the AppBar.
2. Click an unread notification.
3. Click "Mark all as read".

Expected:
- Unread count decreases immediately.
- Clicked notification is marked read and navigates to the event if `eventId` exists.

**Test 8: Notifications Page**
1. Navigate to Notifications page.
2. Use filter for Unread vs All.
3. Mark one notification read.

Expected:
- Items update without refresh.
- Unread badge count updates.

**Troubleshooting Checklist**
- If no notifications appear:
  - Check `/api/notifications/unread` and `/api/notifications` response in Network tab.
  - Verify notification-service is reachable via API Gateway.
- If email not sent:
  - Check notification-service logs for mail errors.
  - Verify `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_HOST`, `MAIL_PORT`.
  - Ensure app password is valid and not blocked by Gmail.
- If reminders never trigger:
  - Confirm event date is within reminder window.
  - Confirm `event-service` has scheduling enabled.
  - Check DB column `events.reminder_sent_at`.
