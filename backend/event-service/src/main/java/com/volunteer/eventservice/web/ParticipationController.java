package com.volunteer.eventservice.web;

import com.volunteer.eventservice.domain.Participation;
import com.volunteer.eventservice.service.ParticipationService;
import com.volunteer.eventservice.service.EventService;
import org.springframework.http.HttpStatus;
import com.volunteer.eventservice.web.dto.ParticipationResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/participations")
public class ParticipationController {
  private final ParticipationService participationService;
  private final EventService eventService;

  public ParticipationController(ParticipationService participationService, EventService eventService) {
    this.participationService = participationService;
    this.eventService = eventService;
  }

  @PostMapping("/events/{eventId}/register")
  public ParticipationResponse registerForEvent(@PathVariable("eventId") UUID eventId, Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    requireVolunteer(jwt);
    UUID volunteerId = UUID.fromString(jwt.getClaimAsString("userId"));
    String volunteerName = jwt.getClaimAsString("username");
    String volunteerEmail = jwt.getClaimAsString("email");
    if (volunteerEmail == null || volunteerEmail.isBlank()) {
      volunteerEmail = jwt.getSubject();
    }

    Participation participation = participationService.registerForEvent(
        eventId,
        volunteerId,
        volunteerName,
        volunteerEmail,
        jwt.getTokenValue());
    return toResponse(participation);
  }

  @PostMapping("/events/{eventId}/cancel")
  public Map<String, String> cancelParticipation(@PathVariable("eventId") UUID eventId, Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    requireVolunteer(jwt);
    UUID volunteerId = UUID.fromString(jwt.getClaimAsString("userId"));
    participationService.cancelParticipation(eventId, volunteerId, jwt.getTokenValue());
    return Map.of("message", "Participation cancelled successfully");
  }

  @GetMapping("/events/{eventId}")
  public List<ParticipationResponse> getEventParticipations(@PathVariable("eventId") UUID eventId,
      Authentication authentication) {
    return getAuthorizedEventParticipations(eventId, authentication).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @GetMapping("/my-participations")
  public List<ParticipationResponse> getMyParticipations(Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID volunteerId = UUID.fromString(jwt.getClaimAsString("userId"));
    return participationService.getVolunteerParticipations(volunteerId).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @GetMapping("/me")
  public List<ParticipationResponse> getMeParticipations(Authentication authentication) {
    return getMyParticipations(authentication);
  }

  @GetMapping("/events/{eventId}/participants")
  public List<ParticipationResponse> getEventParticipants(@PathVariable("eventId") UUID eventId,
      Authentication authentication) {
    return getEventParticipations(eventId, authentication);
  }

  @PutMapping("/{participationId}/mark-attended")
  public ParticipationResponse markAttended(@PathVariable("participationId") UUID participationId,
      Authentication authentication) {
    Participation participation = participationService.getParticipationById(participationId);
    requireOrganizerOrAdminForEvent(participation.getEventId(), authentication);
    Participation updated = participationService.markAttended(participationId);
    return toResponse(updated);
  }

  private ParticipationResponse toResponse(Participation p) {
    return new ParticipationResponse(
        p.getId(),
        p.getEventId(),
        p.getVolunteerId(),
        p.getVolunteerName(),
        p.getVolunteerEmail(),
        p.getStatus(),
        p.getRolePlayed(),
        p.getRegisteredAt()
    );
  }

  private List<Participation> getAuthorizedEventParticipations(UUID eventId, Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    String role = jwt.getClaimAsString("role");
    if ("ADMIN".equals(role)) {
      return participationService.getEventParticipations(eventId);
    }

    if (!"ORGANIZER".equals(role)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to view participants");
    }

    UUID requesterId = UUID.fromString(jwt.getClaimAsString("userId"));
    UUID organizerId = eventService.getEventById(eventId).getOrganizerId();
    if (!requesterId.equals(organizerId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to view participants");
    }

    return participationService.getEventParticipations(eventId);
  }

  private void requireOrganizerOrAdminForEvent(UUID eventId, Authentication authentication) {
    getAuthorizedEventParticipations(eventId, authentication);
  }

  private void requireVolunteer(Jwt jwt) {
    String role = jwt.getClaimAsString("role");
    if (!"VOLUNTEER".equals(role)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only volunteers can perform this action");
    }
  }
}
