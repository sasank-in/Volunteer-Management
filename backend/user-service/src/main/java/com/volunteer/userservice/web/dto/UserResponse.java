package com.volunteer.userservice.web.dto;

import com.volunteer.userservice.domain.Role;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public class UserResponse {
  private UUID id;
  private String username;
  private String email;
  private Set<Role> roles;
  private Instant createdAt;

  public UserResponse(UUID id, String username, String email, Set<Role> roles, Instant createdAt) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.roles = roles;
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

  public Set<Role> getRoles() {
    return roles;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
