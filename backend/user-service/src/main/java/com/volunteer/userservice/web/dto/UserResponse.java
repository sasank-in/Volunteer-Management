package com.volunteer.userservice.web.dto;

import com.volunteer.userservice.domain.Role;
import com.volunteer.userservice.domain.UserStatus;
import java.time.Instant;
import java.util.UUID;

public class UserResponse {
  private UUID id;
  private String username;
  private String email;
  private Role role;
  private UserStatus status;
  private String phoneNumber;
  private Instant createdAt;
  private Instant updatedAt;

  public UserResponse(UUID id, String username, String email, Role role, String phoneNumber,
      Instant createdAt, Instant updatedAt) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
    this.phoneNumber = phoneNumber;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
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

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public UserStatus getStatus() {
    return status;
  }

  public void setStatus(UserStatus status) {
    this.status = status;
  }
}
