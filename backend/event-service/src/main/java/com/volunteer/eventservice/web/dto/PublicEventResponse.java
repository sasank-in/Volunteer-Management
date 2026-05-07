package com.volunteer.eventservice.web.dto;

import com.volunteer.eventservice.domain.Event;
import com.volunteer.eventservice.domain.EventStatus;
import java.time.LocalDateTime;

/**
 * Public-facing projection of an event. Excludes anything sensitive
 * (organizer email, internal UUIDs, participant lists).
 */
public record PublicEventResponse(
    String slug,
    String title,
    String description,
    String location,
    LocalDateTime eventDate,
    int requiredVolunteers,
    int registeredVolunteers,
    EventStatus status,
    String organizerName,
    String coverImageUrl) {

  public static PublicEventResponse from(Event event) {
    return new PublicEventResponse(
        event.getSlug(),
        event.getTitle(),
        event.getDescription(),
        event.getLocation(),
        event.getEventDate(),
        event.getRequiredVolunteers(),
        event.getRegisteredVolunteers(),
        event.getStatus(),
        event.getOrganizerName(),
        event.getCoverImageUrl());
  }
}
