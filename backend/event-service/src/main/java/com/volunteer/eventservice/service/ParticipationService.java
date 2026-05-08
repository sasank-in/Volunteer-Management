package com.volunteer.eventservice.service;

import com.volunteer.eventservice.domain.Event;
import com.volunteer.eventservice.domain.EventStatus;
import com.volunteer.eventservice.domain.Participation;
import com.volunteer.eventservice.domain.ParticipationStatus;
import com.volunteer.eventservice.repository.EventRepository;
import com.volunteer.eventservice.repository.ParticipationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ParticipationService {
  private final ParticipationRepository participationRepository;
  private final EventRepository eventRepository;
  private final EventService eventService;
  private final NotificationDispatchService notificationDispatchService;
  private final EventLiveBroadcaster liveBroadcaster;

  public ParticipationService(
      ParticipationRepository participationRepository,
      EventRepository eventRepository,
      EventService eventService,
      NotificationDispatchService notificationDispatchService,
      EventLiveBroadcaster liveBroadcaster) {
    this.participationRepository = participationRepository;
    this.eventRepository = eventRepository;
    this.eventService = eventService;
    this.notificationDispatchService = notificationDispatchService;
    this.liveBroadcaster = liveBroadcaster;
  }

  @Transactional
  public Participation registerForEvent(UUID eventId, UUID volunteerId, String volunteerName,
      String volunteerEmail, String authToken) {
    if (participationRepository.findByEventIdAndVolunteerId(eventId, volunteerId).isPresent()) {
      throw new IllegalArgumentException("Already registered for this event");
    }

    // Atomic capacity reservation. Returns 0 if the event is full, completed,
    // cancelled, or doesn't exist — covering the previous race window.
    int reserved = eventRepository.reserveSlot(eventId);
    if (reserved == 0) {
      Event existing = eventService.getEventById(eventId);
      if (existing.getStatus() == EventStatus.FULL) {
        throw new IllegalArgumentException("Event is full");
      }
      throw new IllegalArgumentException("Cannot register for this event");
    }

    Event event = eventService.getEventById(eventId);

    Participation participation = new Participation();
    participation.setEventId(eventId);
    participation.setVolunteerId(volunteerId);
    participation.setVolunteerName(volunteerName);
    participation.setVolunteerEmail(volunteerEmail);
    participation.setStatus(ParticipationStatus.REGISTERED);

    Participation saved = participationRepository.save(participation);

    // Re-read post-reserveSlot so the broadcast carries up-to-date counts/status.
    Event fresh = eventService.getEventById(eventId);
    liveBroadcaster.broadcast(fresh, EventLiveBroadcaster.Kind.REGISTERED);

    notificationDispatchService.sendRegistrationNotification(
        event,
        volunteerId,
        volunteerEmail,
        volunteerName,
        authToken);
    notificationDispatchService.sendOrganizerRegistrationNotification(event, saved, authToken);

    return saved;
  }

  @Transactional
  public void cancelParticipation(UUID eventId, UUID volunteerId, String authToken) {
    Participation participation = participationRepository.findByEventIdAndVolunteerId(eventId, volunteerId)
        .orElseThrow(() -> new IllegalArgumentException("Participation not found"));

    if (participation.getStatus() == ParticipationStatus.CANCELLED) {
      throw new IllegalArgumentException("Participation already cancelled");
    }

    participation.setStatus(ParticipationStatus.CANCELLED);
    participation.setCancelledAt(Instant.now());
    participationRepository.save(participation);
    eventRepository.releaseSlot(eventId);

    Event event = eventService.getEventById(eventId);
    liveBroadcaster.broadcast(event, EventLiveBroadcaster.Kind.CANCELLED);

    notificationDispatchService.sendCancellationNotification(
        event,
        volunteerId,
        participation.getVolunteerEmail(),
        participation.getVolunteerName(),
        authToken);
    notificationDispatchService.sendOrganizerCancellationNotification(event, participation, authToken);
  }

  public List<Participation> getEventParticipations(UUID eventId) {
    return participationRepository.findByEventId(eventId);
  }

  public List<Participation> getVolunteerParticipations(UUID volunteerId) {
    return participationRepository.findByVolunteerId(volunteerId);
  }

  public Participation getParticipationById(UUID participationId) {
    return participationRepository.findById(participationId)
        .orElseThrow(() -> new IllegalArgumentException("Participation not found"));
  }

  @Transactional
  public Participation markAttended(UUID participationId) {
    Participation participation = participationRepository.findById(participationId)
        .orElseThrow(() -> new IllegalArgumentException("Participation not found"));
    participation.setStatus(ParticipationStatus.ATTENDED);
    return participationRepository.save(participation);
  }
}
