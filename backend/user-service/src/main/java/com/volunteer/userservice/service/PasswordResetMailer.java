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
 * Emails the password-reset link to the user via notification-service.
 * Production rule: the reset token must NEVER be returned in an API response;
 * it must reach the user only through their registered email channel.
 */
@Component
public class PasswordResetMailer {

  private static final Logger logger = LoggerFactory.getLogger(PasswordResetMailer.class);

  private final RestTemplate restTemplate;
  private final String notificationUrl;
  private final String internalToken;
  private final String resetUrlBase;
  private final boolean enabled;

  public PasswordResetMailer(
      RestTemplate restTemplate,
      @Value("${app.notification.service-url:http://localhost:8083}") String notificationUrl,
      @Value("${app.notification.internal-token:dev-notify-token}") String internalToken,
      @Value("${app.password-reset.url-base:http://localhost:5173/reset-password}") String resetUrlBase,
      @Value("${app.password-reset.email-enabled:true}") boolean enabled) {
    this.restTemplate = restTemplate;
    this.notificationUrl = notificationUrl;
    this.internalToken = internalToken;
    this.resetUrlBase = resetUrlBase;
    this.enabled = enabled;
  }

  public void sendResetLink(UserAccount account, String rawToken) {
    String link = resetUrlBase + "?token=" + rawToken;

    if (!enabled) {
      logger.info("[password-reset] (notification disabled) link for {}: {}", account.getEmail(), link);
      return;
    }

    Map<String, Object> payload = Map.of(
        "recipientId", account.getId().toString(),
        "recipientEmail", account.getEmail(),
        "type", "PASSWORD_RESET",
        "subject", "Reset your Volunteer Platform password",
        "message", String.format(
            "Hi %s,%n%nWe received a request to reset your password. " +
            "Click the link below within 30 minutes to set a new password:%n%n%s%n%n" +
            "If you did not request this, ignore this email.%n",
            account.getUsername(), link));

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    if (internalToken != null && !internalToken.isBlank()) {
      headers.set("X-Internal-Token", internalToken);
    }

    try {
      restTemplate.postForObject(
          notificationUrl + "/api/notifications",
          new HttpEntity<>(payload, headers),
          Void.class);
    } catch (Exception ex) {
      // Never reveal email-send failure to the caller. Log and let the user
      // re-request later.
      logger.warn("password-reset email dispatch failed for userId={}: {}",
          account.getId(), ex.getMessage());
    }
  }
}
