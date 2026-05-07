package com.volunteer.eventservice.web;

import com.volunteer.eventservice.domain.Event;
import com.volunteer.eventservice.service.EventService;
import com.volunteer.eventservice.service.storage.FileStorage;
import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/events/{id}/cover")
public class EventCoverUploadController {

  private static final long MAX_BYTES = 5L * 1024 * 1024;
  private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
  private static final Map<String, String> EXTENSION_FOR_TYPE = Map.of(
      "image/jpeg", "jpg",
      "image/png", "png",
      "image/webp", "webp");

  private final EventService eventService;
  private final FileStorage fileStorage;

  public EventCoverUploadController(EventService eventService, FileStorage fileStorage) {
    this.eventService = eventService;
    this.fileStorage = fileStorage;
  }

  @PostMapping
  public Map<String, String> upload(@PathVariable("id") UUID eventId,
      @RequestParam("file") MultipartFile file,
      Authentication authentication) {

    if (file == null || file.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
    }
    if (file.getSize() > MAX_BYTES) {
      throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
          "Cover image must be 5MB or smaller");
    }
    String contentType = file.getContentType() == null
        ? ""
        : file.getContentType().toLowerCase(Locale.ROOT);
    if (!ALLOWED_TYPES.contains(contentType)) {
      throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
          "Cover image must be JPEG, PNG, or WebP");
    }

    Jwt jwt = (Jwt) authentication.getPrincipal();
    String role = jwt.getClaimAsString("role");
    boolean isAdmin = "ADMIN".equals(role);
    if (!isAdmin && !"ORGANIZER".equals(role)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "Only organizers or admins can upload cover images");
    }
    UUID requesterId = UUID.fromString(jwt.getClaimAsString("userId"));

    String filename = UUID.randomUUID() + "." + EXTENSION_FOR_TYPE.get(contentType);

    String publicPath;
    try {
      publicPath = fileStorage.store(file.getInputStream(), filename, contentType);
    } catch (IOException ex) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to read uploaded file");
    }

    Event existing = eventService.getEventById(eventId);
    String previous = existing.getCoverImageUrl();

    Event updated = eventService.setCoverImageUrl(eventId, requesterId, isAdmin, publicPath);

    // Best-effort delete of the previous file once the new one is committed.
    if (previous != null && !previous.equals(publicPath)) {
      fileStorage.delete(previous);
    }

    return Map.of("coverImageUrl", updated.getCoverImageUrl());
  }
}
