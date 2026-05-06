package com.volunteer.eventservice.service;

import com.volunteer.eventservice.repository.EventRepository;
import com.volunteer.eventservice.repository.ParticipationRepository;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Applies a user-update event from user-service to all denormalized columns
 * across event-service tables. Idempotent: re-applying the same payload is a
 * no-op once data is already in sync.
 */
@Service
public class UserSyncService {

  private static final Logger logger = LoggerFactory.getLogger(UserSyncService.class);

  private final EventRepository eventRepository;
  private final ParticipationRepository participationRepository;

  public UserSyncService(EventRepository eventRepository, ParticipationRepository participationRepository) {
    this.eventRepository = eventRepository;
    this.participationRepository = participationRepository;
  }

  @Transactional
  public void syncUser(UUID userId, String username, String email) {
    int eventsUpdated = eventRepository.updateOrganizerDenormalizedFields(userId, email, username);
    int participationsUpdated = participationRepository.updateVolunteerDenormalizedFields(userId, email, username);
    logger.info("User sync userId={} touched events={} participations={}",
        userId, eventsUpdated, participationsUpdated);
  }
}
