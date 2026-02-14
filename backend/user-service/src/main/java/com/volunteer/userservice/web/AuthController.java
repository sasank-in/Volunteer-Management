package com.volunteer.userservice.web;

import com.volunteer.userservice.domain.UserAccount;
import com.volunteer.userservice.service.JwtTokenService;
import com.volunteer.userservice.service.UserAccountService;
import com.volunteer.userservice.web.dto.AuthResponse;
import com.volunteer.userservice.web.dto.LoginRequest;
import com.volunteer.userservice.web.dto.RegisterRequest;
import com.volunteer.userservice.web.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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

  public AuthController(
      UserAccountService userAccountService,
      AuthenticationManager authenticationManager,
      JwtTokenService jwtTokenService) {
    this.userAccountService = userAccountService;
    this.authenticationManager = authenticationManager;
    this.jwtTokenService = jwtTokenService;
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
}
