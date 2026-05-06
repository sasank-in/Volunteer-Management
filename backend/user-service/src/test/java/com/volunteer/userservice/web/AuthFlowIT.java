package com.volunteer.userservice.web;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.volunteer.userservice.IntegrationTestBase;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

/**
 * End-to-end auth flow against a real Postgres via Testcontainers:
 * register → login → refresh (cookie-only) → logout → revoked refresh fails.
 */
class AuthFlowIT extends IntegrationTestBase {

  @Autowired
  private TestRestTemplate rest;

  @Autowired
  private ObjectMapper mapper;

  private static String unique(String tag) {
    return tag + System.nanoTime();
  }

  @Test
  void fullAuthLifecycle() throws Exception {
    String username = unique("alice");
    String email = username + "@example.com";

    // 1) Register
    Map<String, String> register = Map.of(
        "username", username,
        "email", email,
        "password", "correct-horse-staple-9",
        "phoneNumber", "5551234567");
    ResponseEntity<String> regResp = rest.postForEntity("/api/auth/register", register, String.class);
    assertThat(regResp.getStatusCode()).isEqualTo(HttpStatus.OK);

    // 2) Login — body returns access token, response sets HttpOnly refresh cookie
    Map<String, String> login = Map.of("email", email, "password", "correct-horse-staple-9");
    ResponseEntity<String> loginResp = rest.postForEntity("/api/auth/login", login, String.class);
    assertThat(loginResp.getStatusCode()).isEqualTo(HttpStatus.OK);

    JsonNode loginBody = mapper.readTree(loginResp.getBody());
    String accessToken = loginBody.path("tokens").path("accessToken").asText();
    assertThat(accessToken).isNotBlank();
    // Refresh token must NOT be in body
    assertThat(loginBody.path("tokens").has("refreshToken")).isFalse();

    String refreshCookie = extractCookie(loginResp, "refresh_token");
    assertThat(refreshCookie).as("refresh_token cookie set on login").isNotBlank();
    assertThat(loginResp.getHeaders().getFirst("Set-Cookie")).contains("HttpOnly");

    // 3) /api/users/me with the access token works
    HttpHeaders bearer = new HttpHeaders();
    bearer.setBearerAuth(accessToken);
    ResponseEntity<String> me = rest.exchange(
        "/api/users/me", HttpMethod.GET, new HttpEntity<>(bearer), String.class);
    assertThat(me.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(mapper.readTree(me.getBody()).path("email").asText()).isEqualTo(email);

    // 4) Prime CSRF, then refresh. New cookie must be issued, old one revoked.
    String csrfToken = primeCsrf();
    HttpHeaders refreshHeaders = new HttpHeaders();
    refreshHeaders.add("Cookie", "refresh_token=" + refreshCookie + "; XSRF-TOKEN=" + csrfToken);
    refreshHeaders.add("X-XSRF-TOKEN", csrfToken);
    refreshHeaders.setContentType(MediaType.APPLICATION_JSON);
    ResponseEntity<String> refresh = rest.exchange(
        "/api/auth/refresh", HttpMethod.POST, new HttpEntity<>("{}", refreshHeaders), String.class);
    assertThat(refresh.getStatusCode()).isEqualTo(HttpStatus.OK);

    String rotatedCookie = extractCookie(refresh, "refresh_token");
    assertThat(rotatedCookie).isNotBlank().isNotEqualTo(refreshCookie);

    // 5) Old refresh token must now be invalid
    HttpHeaders oldHeaders = new HttpHeaders();
    String csrf2 = primeCsrf();
    oldHeaders.add("Cookie", "refresh_token=" + refreshCookie + "; XSRF-TOKEN=" + csrf2);
    oldHeaders.add("X-XSRF-TOKEN", csrf2);
    oldHeaders.setContentType(MediaType.APPLICATION_JSON);
    ResponseEntity<String> rotatedOld = rest.exchange(
        "/api/auth/refresh", HttpMethod.POST, new HttpEntity<>("{}", oldHeaders), String.class);
    assertThat(rotatedOld.getStatusCode().is4xxClientError()).isTrue();

    // 6) Logout with the rotated cookie clears it
    HttpHeaders logoutHeaders = new HttpHeaders();
    String csrf3 = primeCsrf();
    logoutHeaders.add("Cookie", "refresh_token=" + rotatedCookie + "; XSRF-TOKEN=" + csrf3);
    logoutHeaders.add("X-XSRF-TOKEN", csrf3);
    logoutHeaders.setContentType(MediaType.APPLICATION_JSON);
    ResponseEntity<String> logout = rest.exchange(
        "/api/auth/logout", HttpMethod.POST, new HttpEntity<>("{}", logoutHeaders), String.class);
    assertThat(logout.getStatusCode()).isEqualTo(HttpStatus.OK);

    String cleared = logout.getHeaders().getFirst("Set-Cookie");
    assertThat(cleared).contains("refresh_token=").contains("Max-Age=0");

    // 7) After logout, the rotated cookie is revoked too
    HttpHeaders postLogoutHeaders = new HttpHeaders();
    String csrf4 = primeCsrf();
    postLogoutHeaders.add("Cookie", "refresh_token=" + rotatedCookie + "; XSRF-TOKEN=" + csrf4);
    postLogoutHeaders.add("X-XSRF-TOKEN", csrf4);
    postLogoutHeaders.setContentType(MediaType.APPLICATION_JSON);
    ResponseEntity<String> afterLogout = rest.exchange(
        "/api/auth/refresh", HttpMethod.POST, new HttpEntity<>("{}", postLogoutHeaders), String.class);
    assertThat(afterLogout.getStatusCode().is4xxClientError()).isTrue();
  }

  @Test
  void refreshWithoutCsrfTokenIs403() {
    // Use a freshly-logged-in cookie so token validity is not the failure cause.
    String email = unique("bob") + "@example.com";
    rest.postForEntity("/api/auth/register", Map.of(
        "username", email.split("@")[0],
        "email", email,
        "password", "correct-horse-staple-9",
        "phoneNumber", "5559876543"), String.class);
    ResponseEntity<String> login = rest.postForEntity("/api/auth/login",
        Map.of("email", email, "password", "correct-horse-staple-9"), String.class);
    String cookie = extractCookie(login, "refresh_token");

    HttpHeaders headers = new HttpHeaders();
    headers.add("Cookie", "refresh_token=" + cookie);
    headers.setContentType(MediaType.APPLICATION_JSON);

    ResponseEntity<String> refresh = rest.exchange(
        "/api/auth/refresh", HttpMethod.POST, new HttpEntity<>("{}", headers), String.class);
    assertThat(refresh.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
  }

  @Test
  void refreshWithoutCookieFails() {
    String csrf = primeCsrf();
    HttpHeaders headers = new HttpHeaders();
    headers.add("Cookie", "XSRF-TOKEN=" + csrf);
    headers.add("X-XSRF-TOKEN", csrf);
    headers.setContentType(MediaType.APPLICATION_JSON);

    ResponseEntity<String> refresh = rest.exchange(
        "/api/auth/refresh", HttpMethod.POST, new HttpEntity<>("{}", headers), String.class);
    assertThat(refresh.getStatusCode().is4xxClientError()).isTrue();
  }

  private String primeCsrf() {
    ResponseEntity<String> resp = rest.getForEntity("/api/auth/csrf", String.class);
    return extractCookie(resp, "XSRF-TOKEN");
  }

  private String extractCookie(ResponseEntity<?> response, String name) {
    java.util.List<String> setCookies = response.getHeaders().get("Set-Cookie");
    if (setCookies == null) return null;
    for (String header : setCookies) {
      if (header.startsWith(name + "=")) {
        String pair = header.split(";", 2)[0];
        return pair.substring(name.length() + 1);
      }
    }
    return null;
  }

  // Suppress unused-warning for MultiValueMap import (keep available for future param tests)
  @SuppressWarnings("unused")
  private static MultiValueMap<String, String> formBody() {
    return new LinkedMultiValueMap<>();
  }
}
