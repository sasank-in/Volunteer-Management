package com.volunteer.userservice.web.dto;

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

  public static class Tokens {
    private String access;
    private String refresh;

    public Tokens(String access, String refresh) {
      this.access = access;
      this.refresh = refresh;
    }

    public String getAccess() {
      return access;
    }

    public String getRefresh() {
      return refresh;
    }
  }

  public static class User {
    private String username;
    private String email;
    private String role;
    private String id;

    public User(String username, String email, String role, String id) {
      this.username = username;
      this.email = email;
      this.role = role;
      this.id = id;
    }

    public String getUsername() {
      return username;
    }

    public String getEmail() {
      return email;
    }

    public String getRole() {
      return role;
    }

    public String getId() {
      return id;
    }
  }
}
