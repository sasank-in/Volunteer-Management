package com.volunteer.userservice.service;

import com.volunteer.userservice.domain.UserAccount;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Notifies downstream services that a user's denormalized fields (email,
 * username) have changed. Best-effort: failures are logged but do not roll
 * back the local user update.
 *
 * Production upgrade path: replace the synchronous POST with an outbox table
 * + scheduled flusher, so a downstream outage cannot drop sync events.
 */
@Component
public class UserSyncPublisher {

  private static final Logger logger = LoggerFactory.getLogger(UserSyncPublisher.class);

  private final RestTemplate restTemplate;
  private final String eventServiceUrl;
  private final String internalToken;
  private final boolean enabled;

  public UserSyncPublisher(
      RestTemplate restTemplate,
      @Value("${app.sync.event-service-url:}") String eventServiceUrl,
      @Value("${app.sync.internal-token:}") String internalToken,
      @Value("${app.sync.enabled:true}") boolean enabled) {
    this.restTemplate = restTemplate;
    this.eventServiceUrl = eventServiceUrl;
    this.internalToken = internalToken;
    this.enabled = enabled;
  }

  public void publishUserUpdated(UserAccount account) {
    if (!enabled || eventServiceUrl == null || eventServiceUrl.isBlank()) {
      return;
    }
    Map<String, Object> payload = Map.of(
        "userId", account.getId().toString(),
        "username", account.getUsername(),
        "email", account.getEmail(),
        "role", account.getRole() != null ? account.getRole().name() : "VOLUNTEER",
        "updatedAt", account.getUpdatedAt() != null ? account.getUpdatedAt().toString() : "");

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    if (internalToken != null && !internalToken.isBlank()) {
      headers.set("X-Internal-Token", internalToken);
    }

    try {
      restTemplate.postForObject(
          eventServiceUrl + "/api/internal/users/sync",
          new HttpEntity<>(payload, headers),
          Void.class);
    } catch (Exception ex) {
      logger.warn("User sync to event-service failed for userId={}: {}", account.getId(), ex.getMessage());
    }
  }
}
