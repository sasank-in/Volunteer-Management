package com.volunteer.userservice.web.dto;

import com.volunteer.userservice.domain.Role;
import java.time.Instant;

public class AuthResponse {
  private Tokens tokens;
  private User user;

  public AuthResponse(Tokens tokens, User user) {
    this.tokens = tokens;
    this.user = user;
  }

  public Tokens getTokens() {
    return tokens;
  }

  public User getUser() {
    return user;
  }

  /**
   * Only the short-lived access token is returned in the body. The refresh
   * token lives in an HttpOnly cookie and is never readable by JS.
   */
  public static class Tokens {
    private String accessToken;

    public Tokens(String accessToken) {
      this.accessToken = accessToken;
    }

    public String getAccessToken() {
      return accessToken;
    }
  }

  public static class User {
    private String username;
    private String email;
    private Role role;
    private String id;
    private String phoneNumber;
    private Instant createdAt;
    private Instant updatedAt;

    public User(String username, String email, Role role, String id, String phoneNumber, Instant createdAt,
        Instant updatedAt) {
      this.username = username;
      this.email = email;
      this.role = role;
      this.id = id;
      this.phoneNumber = phoneNumber;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }

    public String getUsername() {
      return username;
    }

    public String getEmail() {
      return email;
    }

    public Role getRole() {
      return role;
    }

    public String getId() {
      return id;
    }

    public String getPhoneNumber() {
      return phoneNumber;
    }

    public Instant getCreatedAt() {
      return createdAt;
    }

    public Instant getUpdatedAt() {
      return updatedAt;
    }
  }
}
