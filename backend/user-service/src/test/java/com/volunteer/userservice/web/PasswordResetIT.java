package com.volunteer.userservice.web;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.volunteer.userservice.IntegrationTestBase;
import com.volunteer.userservice.domain.PasswordResetToken;
import com.volunteer.userservice.repository.PasswordResetTokenRepository;
import com.volunteer.userservice.service.AuthTokenService;
import com.volunteer.userservice.service.UserAccountService;
import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

class PasswordResetIT extends IntegrationTestBase {

  @Autowired
  private TestRestTemplate rest;
  @Autowired
  private ObjectMapper mapper;
  @Autowired
  private PasswordResetTokenRepository resetTokenRepo;
  @Autowired
  private AuthTokenService authTokenService;
  @Autowired
  private UserAccountService userAccountService;

  private String registerAndGetEmail(String tag) {
    String email = tag + System.nanoTime() + "@example.com";
    rest.postForEntity("/api/auth/register", Map.of(
        "username", tag + System.nanoTime(),
        "email", email,
        "password", "old-password-99",
        "phoneNumber", "5550001111"), String.class);
    return email;
  }

  /** Directly mints a reset token via the service, mirroring what the mailer would receive. */
  private String mintResetTokenDirectly(String email) {
    return authTokenService.createPasswordResetToken(
        userAccountService.findByEmail(email).orElseThrow());
  }

  @Test
  void forgotPasswordEndpointDoesNotLeakTokenOrEnumerate() throws Exception {
    String email = registerAndGetEmail("alice");

    ResponseEntity<String> exists = rest.postForEntity(
        "/api/auth/forgot-password", Map.of("email", email), String.class);
    ResponseEntity<String> nonExisting = rest.postForEntity(
        "/api/auth/forgot-password",
        Map.of("email", "nobody-" + System.nanoTime() + "@example.com"),
        String.class);

    assertThat(exists.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(nonExisting.getStatusCode()).isEqualTo(HttpStatus.OK);

    JsonNode existsBody = mapper.readTree(exists.getBody());
    JsonNode missBody = mapper.readTree(nonExisting.getBody());

    // Body must not contain the raw token.
    assertThat(existsBody.has("resetToken")).isFalse();
    assertThat(missBody.has("resetToken")).isFalse();

    // Both responses identical so an attacker can't enumerate.
    assertThat(existsBody.path("message").asText())
        .isEqualTo(missBody.path("message").asText());
  }

  @Test
  void resetTokenAllowsPasswordChangeAndCannotBeReused() {
    String email = registerAndGetEmail("carol");
    String token = mintResetTokenDirectly(email);
    assertThat(token).isNotBlank();

    Map<String, String> body = Map.of("resetToken", token, "newPassword", "fresh-password-77");
    ResponseEntity<String> first = rest.postForEntity("/api/auth/reset-password", body, String.class);
    assertThat(first.getStatusCode()).isEqualTo(HttpStatus.OK);

    ResponseEntity<String> login = rest.postForEntity("/api/auth/login",
        Map.of("email", email, "password", "fresh-password-77"), String.class);
    assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);

    ResponseEntity<String> second = rest.postForEntity("/api/auth/reset-password", body, String.class);
    assertThat(second.getStatusCode().is4xxClientError()).isTrue();
  }

  @Test
  @Transactional
  void expiredResetTokenIsRejected() {
    String email = registerAndGetEmail("dave");
    String rawToken = mintResetTokenDirectly(email);

    PasswordResetToken row = resetTokenRepo.findByTokenHash(sha256Base64(rawToken)).orElseThrow();
    row.setExpiresAt(Instant.now().minusSeconds(60));
    resetTokenRepo.save(row);

    ResponseEntity<String> resp = rest.postForEntity(
        "/api/auth/reset-password",
        Map.of("resetToken", rawToken, "newPassword", "another-password-88"),
        String.class);
    assertThat(resp.getStatusCode().is4xxClientError()).isTrue();
  }

  private static String sha256Base64(String value) {
    try {
      java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
      byte[] hash = md.digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
      return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }
}
