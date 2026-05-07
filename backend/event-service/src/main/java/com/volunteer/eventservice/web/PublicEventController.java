package com.volunteer.eventservice.web;

import com.volunteer.eventservice.service.EventService;
import com.volunteer.eventservice.web.dto.PublicEventResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Unauthenticated read-only access to events by slug. Powers shareable
 * /e/{slug} pages outside the auth wall — recruitment-friendly.
 */
@RestController
@RequestMapping("/api/public")
public class PublicEventController {

  private final EventService eventService;

  public PublicEventController(EventService eventService) {
    this.eventService = eventService;
  }

  @GetMapping("/events/{slug}")
  public PublicEventResponse getBySlug(@PathVariable("slug") String slug) {
    return PublicEventResponse.from(eventService.getEventBySlug(slug));
  }
}
