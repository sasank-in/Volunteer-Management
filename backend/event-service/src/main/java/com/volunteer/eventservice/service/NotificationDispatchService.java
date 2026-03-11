package com.volunteer.eventservice.service;

import com.volunteer.eventservice.domain.Event;
import com.volunteer.eventservice.domain.NotificationType;
import com.volunteer.eventservice.domain.Participation;
import com.volunteer.eventservice.integration.notification.NotificationRequest;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NotificationDispatchService {
  private static final Logger logger = LoggerFactory.getLogger(NotificationDispatchService.class);
  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

  private final RestTemplate restTemplate;
  private final NotificationOutboxService outboxService;

  @Value("${notification.service.url:http://notification-service}")
  private String notificationServiceUrl;
  @Value("${notification.internal.token:dev-notify-token}")
  private String internalToken;

  public NotificationDispatchService(RestTemplate restTemplate, NotificationOutboxService outboxService) {
    this.restTemplate = restTemplate;
    this.outboxService = outboxService;
  }

  public void sendRegistrationNotification(Event event, UUID volunteerId, String volunteerEmail,
      String volunteerName, String authToken) {
    String subject = "Registration confirmed: " + event.getTitle();
    String message = String.format(
        "Hi %s, you are registered for %s on %s at %s.",
        volunteerName,
        event.getTitle(),
        event.getEventDate().format(DATE_FORMAT),
        event.getLocation());
    NotificationRequest request = new NotificationRequest(
        volunteerId,
        volunteerEmail,
        NotificationType.VOLUNTEER_REGISTERED,
        subject,
        message,
        event.getId());
    sendNotification(request, authToken);
  }

  public void sendOrganizerRegistrationNotification(Event event, Participation participation, String authToken) {
    if (event.getOrganizerEmail() == null || event.getOrganizerEmail().isBlank()) {
      return;
    }
    String subject = "Volunteer registered: " + event.getTitle();
    String message = String.format(
        "%s (%s) just registered for %s.",
        participation.getVolunteerName(),
        participation.getVolunteerEmail(),
        event.getTitle());
    NotificationRequest request = new NotificationRequest(
        event.getOrganizerId(),
        event.getOrganizerEmail(),
        NotificationType.VOLUNTEER_REGISTERED,
        subject,
        message,
        event.getId());
    sendNotification(request, authToken);
  }

  public void sendCancellationNotification(Event event, UUID volunteerId, String volunteerEmail,
      String volunteerName, String authToken) {
    String subject = "Registration cancelled: " + event.getTitle();
    String message = String.format(
        "Hi %s, your registration for %s on %s at %s has been cancelled.",
        volunteerName,
        event.getTitle(),
        event.getEventDate().format(DATE_FORMAT),
        event.getLocation());
    NotificationRequest request = new NotificationRequest(
        volunteerId,
        volunteerEmail,
        NotificationType.VOLUNTEER_CANCELLED,
        subject,
        message,
        event.getId());
    sendNotification(request, authToken);
  }

  public void sendOrganizerCancellationNotification(Event event, Participation participation, String authToken) {
    if (event.getOrganizerEmail() == null || event.getOrganizerEmail().isBlank()) {
      return;
    }
    String subject = "Volunteer cancelled: " + event.getTitle();
    String message = String.format(
        "%s (%s) cancelled their registration for %s.",
        participation.getVolunteerName(),
        participation.getVolunteerEmail(),
        event.getTitle());
    NotificationRequest request = new NotificationRequest(
        event.getOrganizerId(),
        event.getOrganizerEmail(),
        NotificationType.VOLUNTEER_CANCELLED,
        subject,
        message,
        event.getId());
    sendNotification(request, authToken);
  }

  public void sendEventUpdatedNotification(Event event, Participation participation, String authToken) {
    String subject = "Event updated: " + event.getTitle();
    String message = String.format(
        "Hi %s, the event %s has been updated. It is scheduled for %s at %s.",
        participation.getVolunteerName(),
        event.getTitle(),
        event.getEventDate().format(DATE_FORMAT),
        event.getLocation());
    NotificationRequest request = new NotificationRequest(
        participation.getVolunteerId(),
        participation.getVolunteerEmail(),
        NotificationType.EVENT_UPDATED,
        subject,
        message,
        event.getId());
    sendNotification(request, authToken);
  }

  public void sendEventCancelledNotification(Event event, Participation participation, String authToken) {
    String subject = "Event cancelled: " + event.getTitle();
    String message = String.format(
        "Hi %s, the event %s scheduled on %s has been cancelled.",
        participation.getVolunteerName(),
        event.getTitle(),
        event.getEventDate().format(DATE_FORMAT));
    NotificationRequest request = new NotificationRequest(
        participation.getVolunteerId(),
        participation.getVolunteerEmail(),
        NotificationType.EVENT_CANCELLED,
        subject,
        message,
        event.getId());
    sendNotification(request, authToken);
  }

  public void sendEventCompletedNotification(Event event, Participation participation, String authToken) {
    String subject = "Event completed: " + event.getTitle();
    String message = String.format(
        "Hi %s, thanks for participating in %s. We appreciate your support!",
        participation.getVolunteerName(),
        event.getTitle());
    NotificationRequest request = new NotificationRequest(
        participation.getVolunteerId(),
        participation.getVolunteerEmail(),
        NotificationType.EVENT_COMPLETED,
        subject,
        message,
        event.getId());
    sendNotification(request, authToken);
  }

  public void sendEventReminderNotification(Event event, Participation participation, String authToken) {
    String subject = "Reminder: " + event.getTitle();
    String message = String.format(
        "Hi %s, reminder that %s starts on %s at %s.",
        participation.getVolunteerName(),
        event.getTitle(),
        event.getEventDate().format(DATE_FORMAT),
        event.getLocation());
    NotificationRequest request = new NotificationRequest(
        participation.getVolunteerId(),
        participation.getVolunteerEmail(),
        NotificationType.EVENT_REMINDER,
        subject,
        message,
        event.getId());
    sendNotification(request, authToken);
  }

  public void sendOrganizerEventReminder(Event event, String authToken) {
    if (event.getOrganizerEmail() == null || event.getOrganizerEmail().isBlank()) {
      return;
    }
    String subject = "Reminder: " + event.getTitle();
    String message = String.format(
        "Reminder that %s starts on %s at %s.",
        event.getTitle(),
        event.getEventDate().format(DATE_FORMAT),
        event.getLocation());
    NotificationRequest request = new NotificationRequest(
        event.getOrganizerId(),
        event.getOrganizerEmail(),
        NotificationType.EVENT_REMINDER,
        subject,
        message,
        event.getId());
    sendNotification(request, authToken);
  }

  @CircuitBreaker(name = "notification-service", fallbackMethod = "queueNotificationFallbackWithToken")
  public void sendNotification(NotificationRequest request, String authToken) {
    if (!isValid(request)) {
      logger.warn("Skipping notification with missing fields. recipientId={}, recipientEmail={}, type={}",
          request.getRecipientId(), request.getRecipientEmail(), request.getType());
      return;
    }
    sendDirect(request, authToken);
  }

  public void sendDirect(NotificationRequest request, String authToken) {
    String url = notificationServiceUrl + "/api/notifications";
    org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
    if (authToken != null && !authToken.isBlank()) {
      headers.setBearerAuth(authToken);
    } else {
      headers.set("X-Internal-Token", internalToken);
    }
    org.springframework.http.HttpEntity<NotificationRequest> entity =
        new org.springframework.http.HttpEntity<>(request, headers);
    restTemplate.postForObject(url, entity, Void.class);
    logger.info("Notification dispatched to {}", request.getRecipientEmail());
  }

  @SuppressWarnings("unused")
  private void queueNotificationFallbackWithToken(NotificationRequest request, String authToken, Exception ex) {
    if (!isValid(request)) {
      logger.warn("Skipping outbox enqueue for invalid notification request: {}", ex.getMessage());
      return;
    }
    outboxService.enqueue(request, ex.getMessage());
  }

  private boolean isValid(NotificationRequest request) {
    if (request == null) {
      return false;
    }
    if (request.getRecipientId() == null) {
      return false;
    }
    if (request.getRecipientEmail() == null || request.getRecipientEmail().isBlank()) {
      return false;
    }
    if (request.getType() == null) {
      return false;
    }
    if (request.getSubject() == null || request.getSubject().isBlank()) {
      return false;
    }
    if (request.getMessage() == null || request.getMessage().isBlank()) {
      return false;
    }
    return true;
  }

  public void sendRegistrationNotification(Event event, UUID volunteerId, String volunteerEmail,
      String volunteerName) {
    sendRegistrationNotification(event, volunteerId, volunteerEmail, volunteerName, null);
  }

  public void sendOrganizerRegistrationNotification(Event event, Participation participation) {
    sendOrganizerRegistrationNotification(event, participation, null);
  }

  public void sendCancellationNotification(Event event, UUID volunteerId, String volunteerEmail,
      String volunteerName) {
    sendCancellationNotification(event, volunteerId, volunteerEmail, volunteerName, null);
  }

  public void sendOrganizerCancellationNotification(Event event, Participation participation) {
    sendOrganizerCancellationNotification(event, participation, null);
  }

  public void sendEventUpdatedNotification(Event event, Participation participation) {
    sendEventUpdatedNotification(event, participation, null);
  }

  public void sendEventCancelledNotification(Event event, Participation participation) {
    sendEventCancelledNotification(event, participation, null);
  }

  public void sendEventCompletedNotification(Event event, Participation participation) {
    sendEventCompletedNotification(event, participation, null);
  }

  public void sendEventReminderNotification(Event event, Participation participation) {
    sendEventReminderNotification(event, participation, null);
  }

  public void sendOrganizerEventReminder(Event event) {
    sendOrganizerEventReminder(event, null);
  }
}
