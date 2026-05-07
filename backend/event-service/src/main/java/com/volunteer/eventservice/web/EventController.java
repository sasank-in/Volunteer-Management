package com.volunteer.eventservice.web;

import com.volunteer.eventservice.domain.Event;
import com.volunteer.eventservice.service.EventService;
import com.volunteer.eventservice.web.dto.CreateEventRequest;
import com.volunteer.eventservice.web.dto.EventResponse;
import com.volunteer.eventservice.web.dto.UpdateEventRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
public class EventController {
  private final EventService eventService;

  public EventController(EventService eventService) {
    this.eventService = eventService;
  }

  @PostMapping
  public EventResponse createEvent(@Valid @RequestBody CreateEventRequest request, Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    requireOrganizerOrAdmin(jwt);
    UUID organizerId = UUID.fromString(jwt.getClaimAsString("userId"));
    String organizerName = jwt.getClaimAsString("username");
    String organizerEmail = jwt.getClaimAsString("email");
    if (organizerEmail == null || organizerEmail.isBlank()) {
      organizerEmail = jwt.getSubject();
    }

    Event event = eventService.createEvent(request, organizerId, organizerName, organizerEmail);
    return toResponse(event);
  }

  @GetMapping
  public List<EventResponse> getAllEvents(@RequestParam(name = "upcoming", required = false) Boolean upcoming) {
    List<Event> events = upcoming != null && upcoming
        ? eventService.getUpcomingEvents()
        : eventService.getAllEvents();
    return events.stream().map(this::toResponse).collect(Collectors.toList());
  }

  @GetMapping("/{id}")
  public EventResponse getEvent(@PathVariable("id") UUID id) {
    Event event = eventService.getEventById(id);
    return toResponse(event);
  }

  @GetMapping("/organizer/my-events")
  public List<EventResponse> getMyEvents(Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    requireOrganizerOrAdmin(jwt);
    UUID organizerId = UUID.fromString(jwt.getClaimAsString("userId"));
    List<Event> events = eventService.getEventsByOrganizer(organizerId);
    return events.stream().map(this::toResponse).collect(Collectors.toList());
  }

  @PutMapping("/{id}")
  public EventResponse updateEvent(@PathVariable("id") UUID id, @Valid @RequestBody UpdateEventRequest request,
      Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID organizerId = resolveOrganizerIdForUpdate(jwt, id);
    Event event = eventService.updateEvent(id, request, organizerId, jwt.getTokenValue());
    return toResponse(event);
  }

  @DeleteMapping("/{id}")
  public void deleteEvent(@PathVariable("id") UUID id, Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID organizerId = resolveOrganizerIdForUpdate(jwt, id);
    eventService.deleteEvent(id, organizerId, jwt.getTokenValue());
  }

  private EventResponse toResponse(Event event) {
    EventResponse response = new EventResponse(
        event.getId(),
        event.getTitle(),
        event.getDescription(),
        event.getLocation(),
        event.getEventDate(),
        event.getRequiredVolunteers(),
        event.getRegisteredVolunteers(),
        event.getOrganizerId(),
        event.getOrganizerName(),
        event.getStatus(),
        event.getCreatedAt(),
        event.getUpdatedAt()
    );
    response.setSlug(event.getSlug());
    response.setCoverImageUrl(event.getCoverImageUrl());
    Double avgRating = eventService.getAverageRating(event.getId());
    response.setAverageRating(avgRating);
    return response;
  }

  private void requireOrganizerOrAdmin(Jwt jwt) {
    String role = jwt.getClaimAsString("role");
    if (!"ORGANIZER".equals(role) && !"ADMIN".equals(role)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only organizers or admins can perform this action");
    }
  }

  private UUID resolveOrganizerIdForUpdate(Jwt jwt, UUID eventId) {
    String role = jwt.getClaimAsString("role");
    if ("ADMIN".equals(role)) {
      return eventService.getEventById(eventId).getOrganizerId();
    }
    if (!"ORGANIZER".equals(role)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only organizers or admins can perform this action");
    }
    return UUID.fromString(jwt.getClaimAsString("userId"));
  }
}
