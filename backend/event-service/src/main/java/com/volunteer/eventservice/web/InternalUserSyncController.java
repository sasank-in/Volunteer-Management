package com.volunteer.eventservice.web;

import com.volunteer.eventservice.service.UserSyncService;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/users")
public class InternalUserSyncController {

  private final UserSyncService userSyncService;
  private final String expectedToken;

  public InternalUserSyncController(
      UserSyncService userSyncService,
      @Value("${app.sync.internal-token:}") String expectedToken) {
    this.userSyncService = userSyncService;
    this.expectedToken = expectedToken;
  }

  @PostMapping("/sync")
  public ResponseEntity<Map<String, String>> sync(
      @RequestHeader(value = "X-Internal-Token", required = false) String token,
      @RequestBody UserSyncRequest body) {
    if (expectedToken == null || expectedToken.isBlank() || !expectedToken.equals(token)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "invalid token"));
    }
    userSyncService.syncUser(UUID.fromString(body.userId()), body.username(), body.email());
    return ResponseEntity.ok(Map.of("status", "ok"));
  }

  public record UserSyncRequest(
      @NotBlank String userId,
      @NotBlank String username,
      @NotBlank String email,
      String role,
      String updatedAt) {}
}
