package com.volunteer.eventservice.service;

import com.volunteer.eventservice.domain.Event;
import com.volunteer.eventservice.domain.EventStatus;
import com.volunteer.eventservice.domain.Participation;
import com.volunteer.eventservice.domain.ParticipationStatus;
import com.volunteer.eventservice.repository.EventRepository;
import com.volunteer.eventservice.repository.ParticipationRepository;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventReminderService {
  private static final Logger logger = LoggerFactory.getLogger(EventReminderService.class);
  private final EventRepository eventRepository;
  private final ParticipationRepository participationRepository;
  private final NotificationDispatchService notificationDispatchService;

  @Value("${notification.reminder.hours-before:24}")
  private int reminderHoursBefore;

  public EventReminderService(
      EventRepository eventRepository,
      ParticipationRepository participationRepository,
      NotificationDispatchService notificationDispatchService) {
    this.eventRepository = eventRepository;
    this.participationRepository = participationRepository;
    this.notificationDispatchService = notificationDispatchService;
  }

  @Scheduled(fixedDelayString = "${notification.reminder.check-interval-ms:900000}")
  @Transactional
  public void sendUpcomingEventReminders() {
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime reminderWindowEnd = now.plusHours(reminderHoursBefore);

    List<Event> upcoming = eventRepository.findByStatusAndEventDateBetween(
        EventStatus.OPEN,
        now,
        reminderWindowEnd);

    for (Event event : upcoming) {
      if (event.getReminderSentAt() != null) {
        continue;
      }
      List<Participation> participants = participationRepository.findByEventId(event.getId());
      boolean sentAny = false;
      notificationDispatchService.sendOrganizerEventReminder(event, null);
      if (event.getOrganizerEmail() != null && !event.getOrganizerEmail().isBlank()) {
        sentAny = true;
      }
      for (Participation participant : participants) {
        if (participant.getStatus() == ParticipationStatus.REGISTERED) {
          notificationDispatchService.sendEventReminderNotification(event, participant, null);
          sentAny = true;
        }
      }
      if (sentAny) {
        event.setReminderSentAt(Instant.now());
        eventRepository.save(event);
      }
    }
    logger.info("Event reminder check complete. Window end: {}", reminderWindowEnd);
  }
}
