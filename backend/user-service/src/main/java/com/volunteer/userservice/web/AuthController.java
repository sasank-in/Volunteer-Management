package com.volunteer.userservice.web;

import com.volunteer.userservice.domain.UserAccount;
import com.volunteer.userservice.service.JwtTokenService;
import com.volunteer.userservice.service.UserAccountService;
import com.volunteer.userservice.web.dto.AuthResponse;
import com.volunteer.userservice.web.dto.ChangePasswordRequest;
import com.volunteer.userservice.web.dto.LoginRequest;
import com.volunteer.userservice.web.dto.RefreshRequest;
import com.volunteer.userservice.web.dto.RegisterRequest;
import com.volunteer.userservice.web.dto.UserResponse;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserAccountService userAccountService;
  private final AuthenticationManager authenticationManager;
  private final JwtTokenService jwtTokenService;
  private final JwtDecoder jwtDecoder;

  public AuthController(
      UserAccountService userAccountService,
      AuthenticationManager authenticationManager,
      JwtTokenService jwtTokenService,
      JwtDecoder jwtDecoder) {
    this.userAccountService = userAccountService;
    this.authenticationManager = authenticationManager;
    this.jwtTokenService = jwtTokenService;
    this.jwtDecoder = jwtDecoder;
  }

  @PostMapping("/register")
  public UserResponse register(@Valid @RequestBody RegisterRequest request) {
    UserAccount account = userAccountService.register(request);
    return new UserResponse(
        account.getId(),
        account.getUsername(),
        account.getEmail(),
        account.getRole(),
        account.getPhoneNumber(),
        account.getCreatedAt()
      );
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            request.getEmail(),
            request.getPassword()));

    String principal = authentication.getName();
    UserAccount account = userAccountService.findByEmail(principal)
        .orElseThrow(() -> new IllegalArgumentException("User not found."));

    String accessToken = jwtTokenService.generateAccessToken(account);
    String refreshToken = jwtTokenService.generateRefreshToken(account);
    String role = account.getRole() == null ? "VOLUNTEER" : account.getRole().name();
    AuthResponse.Tokens tokens = new AuthResponse.Tokens(accessToken, refreshToken);
    AuthResponse.User user = new AuthResponse.User(
        account.getUsername(),
        account.getEmail(),
        role,
        account.getId().toString());
    return new AuthResponse(tokens, user);
  }

  @PostMapping("/refresh")
  public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
    Jwt jwt = jwtDecoder.decode(request.getRefreshToken());
    String type = jwt.getClaimAsString("type");
    if (type == null || !"refresh".equals(type)) {
      throw new IllegalArgumentException("Invalid refresh token.");
    }
    String subject = jwt.getSubject();
    if (subject == null || subject.isBlank()) {
      throw new IllegalArgumentException("Invalid refresh token.");
    }

    UserAccount account = userAccountService.findByUsernameOrEmail(subject)
        .orElseThrow(() -> new IllegalArgumentException("User not found."));

    String accessToken = jwtTokenService.generateAccessToken(account);
    String refreshToken = jwtTokenService.generateRefreshToken(account);
    String role = account.getRole() == null ? "VOLUNTEER" : account.getRole().name();
    AuthResponse.Tokens tokens = new AuthResponse.Tokens(accessToken, refreshToken);
    AuthResponse.User user = new AuthResponse.User(
        account.getUsername(),
        account.getEmail(),
        role,
        account.getId().toString());
    return new AuthResponse(tokens, user);
  }

  @PostMapping("/change-password")
  public Map<String, String> changePassword(@Valid @RequestBody ChangePasswordRequest request,
      Authentication authentication) {
    userAccountService.changePassword(
        authentication.getName(),
        request.getCurrentPassword(),
        request.getNewPassword());
    return Map.of("message", "Password updated.");
  }
}
