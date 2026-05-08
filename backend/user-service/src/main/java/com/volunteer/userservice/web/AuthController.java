package com.volunteer.userservice.web;

import com.volunteer.userservice.domain.UserAccount;
import com.volunteer.userservice.service.JwtTokenService;
import com.volunteer.userservice.service.LoginAttemptService;
import com.volunteer.userservice.service.PasswordResetMailer;
import com.volunteer.userservice.service.UserAccountService;
import com.volunteer.userservice.service.AuthTokenService;
import com.volunteer.userservice.web.dto.AuthResponse;
import com.volunteer.userservice.web.dto.ChangePasswordRequest;
import com.volunteer.userservice.web.dto.LoginRequest;
import com.volunteer.userservice.web.dto.ForgotPasswordRequest;
import com.volunteer.userservice.web.dto.RegisterRequest;
import com.volunteer.userservice.web.dto.ResetPasswordRequest;
import com.volunteer.userservice.web.dto.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import com.volunteer.userservice.domain.Role;
import java.util.Map;
import java.time.Instant;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.GetMapping;
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
  private final AuthTokenService authTokenService;
  private final JwtDecoder jwtDecoder;
  private final AuthCookies authCookies;
  private final PasswordResetMailer passwordResetMailer;
  private final LoginAttemptService loginAttemptService;

  public AuthController(
      UserAccountService userAccountService,
      AuthenticationManager authenticationManager,
      JwtTokenService jwtTokenService,
      AuthTokenService authTokenService,
      JwtDecoder jwtDecoder,
      AuthCookies authCookies,
      PasswordResetMailer passwordResetMailer,
      LoginAttemptService loginAttemptService) {
    this.userAccountService = userAccountService;
    this.authenticationManager = authenticationManager;
    this.jwtTokenService = jwtTokenService;
    this.authTokenService = authTokenService;
    this.jwtDecoder = jwtDecoder;
    this.authCookies = authCookies;
    this.passwordResetMailer = passwordResetMailer;
    this.loginAttemptService = loginAttemptService;
  }

  /**
   * Lightweight endpoint whose only purpose is to prime the XSRF-TOKEN cookie
   * before the SPA calls a CSRF-protected endpoint like /auth/refresh.
   */
  @GetMapping("/csrf")
  public Map<String, String> csrf() {
    return Map.of("status", "ok");
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
        account.getCreatedAt(),
        account.getUpdatedAt()
      );
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
    UserAccount preAuth = userAccountService.findByEmail(request.getEmail()).orElse(null);
    if (preAuth != null && loginAttemptService.isLocked(preAuth)) {
      throw new IllegalArgumentException(
          "Account temporarily locked due to repeated failed logins. Try again later.");
    }
    if (preAuth != null
        && preAuth.getStatus() == com.volunteer.userservice.domain.UserStatus.INACTIVE) {
      // Same generic message as bad credentials so we don't leak account state.
      throw new IllegalArgumentException("Invalid credentials.");
    }

    Authentication authentication;
    try {
      authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(
              request.getEmail(),
              request.getPassword()));
    } catch (org.springframework.security.core.AuthenticationException ex) {
      if (preAuth != null) {
        loginAttemptService.recordFailure(preAuth);
      }
      throw new IllegalArgumentException("Invalid credentials.");
    }

    String principal = authentication.getName();
    UserAccount account = userAccountService.findByEmail(principal)
        .orElseThrow(() -> new IllegalArgumentException("User not found."));
    loginAttemptService.recordSuccess(account);

    Role safeRole = account.getRole() != null ? account.getRole() : Role.VOLUNTEER;

    String accessToken = jwtTokenService.generateAccessToken(account);
    String refreshToken = jwtTokenService.generateRefreshToken(account);
    Jwt refreshJwt = jwtDecoder.decode(refreshToken);
    Instant refreshExpiresAt = refreshJwt.getExpiresAt();
    if (refreshExpiresAt == null) {
      throw new IllegalArgumentException("Refresh token missing expiry.");
    }
    authTokenService.storeRefreshToken(account, refreshToken, refreshExpiresAt);
    authCookies.writeRefreshCookie(response, refreshToken, jwtTokenService.getRefreshExpiresIn());

    AuthResponse.Tokens tokens = new AuthResponse.Tokens(accessToken);
    AuthResponse.User user = new AuthResponse.User(
        account.getUsername(),
        account.getEmail(),
        safeRole,
        account.getId().toString(),
        account.getPhoneNumber(),
        account.getCreatedAt(),
        account.getUpdatedAt());
    return new AuthResponse(tokens, user);
  }

  @PostMapping("/refresh")
  public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
    String currentRefresh = authCookies.readRefreshCookie(request);
    if (currentRefresh == null || currentRefresh.isBlank()) {
      throw new IllegalArgumentException("Missing refresh token.");
    }

    Jwt jwt = jwtDecoder.decode(currentRefresh);
    String type = jwt.getClaimAsString("type");
    if (!"refresh".equals(type)) {
      throw new IllegalArgumentException("Invalid refresh token.");
    }
    String subject = jwt.getSubject();
    if (subject == null || subject.isBlank()) {
      throw new IllegalArgumentException("Invalid refresh token.");
    }

    authTokenService.getValidRefreshToken(currentRefresh);

    UserAccount account = userAccountService.findByUsernameOrEmail(subject)
        .orElseThrow(() -> new IllegalArgumentException("User not found."));

    Role safeRole = account.getRole() != null ? account.getRole() : Role.VOLUNTEER;

    String accessToken = jwtTokenService.generateAccessToken(account);
    String newRefresh = jwtTokenService.generateRefreshToken(account);
    authTokenService.revokeRefreshToken(currentRefresh);
    Jwt refreshJwt = jwtDecoder.decode(newRefresh);
    Instant refreshExpiresAt = refreshJwt.getExpiresAt();
    if (refreshExpiresAt == null) {
      throw new IllegalArgumentException("Refresh token missing expiry.");
    }
    authTokenService.storeRefreshToken(account, newRefresh, refreshExpiresAt);
    authCookies.writeRefreshCookie(response, newRefresh, jwtTokenService.getRefreshExpiresIn());

    AuthResponse.Tokens tokens = new AuthResponse.Tokens(accessToken);
    AuthResponse.User user = new AuthResponse.User(
        account.getUsername(),
        account.getEmail(),
        safeRole,
        account.getId().toString(),
        account.getPhoneNumber(),
        account.getCreatedAt(),
        account.getUpdatedAt());
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

  @PostMapping("/logout")
  public Map<String, String> logout(HttpServletRequest request, HttpServletResponse response) {
    String currentRefresh = authCookies.readRefreshCookie(request);
    if (currentRefresh != null && !currentRefresh.isBlank()) {
      authTokenService.revokeRefreshToken(currentRefresh);
    }
    authCookies.clearRefreshCookie(response);
    return Map.of("message", "Logged out.");
  }

  @PostMapping("/forgot-password")
  public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    // Always return the same response whether the email exists or not, so an
    // attacker can't enumerate accounts. The reset token is delivered out of
    // band via email and never returned in the response body.
    userAccountService.findByEmail(request.getEmail()).ifPresent(account -> {
      String resetToken = authTokenService.createPasswordResetToken(account);
      passwordResetMailer.sendResetLink(account, resetToken);
    });
    return Map.of("message",
        "If an account exists for that email, a reset link has been sent.");
  }

  @PostMapping("/reset-password")
  public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    UserAccount account = authTokenService.getAccountForResetToken(userAccountService,
        request.getResetToken());
    userAccountService.setPassword(account.getId(), request.getNewPassword());
    authTokenService.usePasswordResetToken(request.getResetToken());
    return Map.of("message", "Password reset successful.");
  }
}
