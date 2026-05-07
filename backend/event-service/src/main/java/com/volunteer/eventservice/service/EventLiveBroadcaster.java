package com.volunteer.eventservice.service;

import com.volunteer.eventservice.domain.Event;
import com.volunteer.eventservice.domain.EventStatus;
import java.time.Instant;
import java.util.UUID;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Pushes event-state changes (registrations, cancellations, edits) to all
 * clients subscribed to {@code /topic/events/{eventId}}.
 */
@Component
public class EventLiveBroadcaster {

  public enum Kind {
    REGISTERED,
    CANCELLED,
    UPDATED,
    DELETED,
  }

  public record EventLiveUpdate(
      UUID eventId,
      int registeredVolunteers,
      int requiredVolunteers,
      EventStatus status,
      Kind kind,
      Instant at) {}

  private final SimpMessagingTemplate template;

  public EventLiveBroadcaster(SimpMessagingTemplate template) {
    this.template = template;
  }

  public void broadcast(Event event, Kind kind) {
    EventLiveUpdate payload = new EventLiveUpdate(
        event.getId(),
        event.getRegisteredVolunteers(),
        event.getRequiredVolunteers(),
        event.getStatus(),
        kind,
        Instant.now());
    template.convertAndSend("/topic/events/" + event.getId(), payload);
  }
}
