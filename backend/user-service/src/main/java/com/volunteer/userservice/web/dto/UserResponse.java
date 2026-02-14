package com.volunteer.userservice.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.volunteer.userservice.domain.Role;
import java.time.Instant;
import java.util.UUID;

public class UserResponse {
  private UUID id;
  private String username;
  private String email;
  private Role role;
  @JsonProperty("phone_number")
  private String phoneNumber;
  private Instant createdAt;

  public UserResponse(UUID id, String username, String email, Role role, String phoneNumber,
      Instant createdAt) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
    this.phoneNumber = phoneNumber;
    this.createdAt = createdAt;
  }

  public UUID getId() {
    return id;
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

  public String getPhoneNumber() {
    return phoneNumber;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
