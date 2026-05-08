package com.volunteer.userservice.web;

import com.volunteer.userservice.domain.Role;
import com.volunteer.userservice.domain.UserAccount;
import com.volunteer.userservice.service.AuditLogService;
import com.volunteer.userservice.service.UserAccountService;
import com.volunteer.userservice.web.dto.UpdateUserRequest;
import com.volunteer.userservice.web.dto.UserResponse;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserAccountService userAccountService;
  private final AuditLogService auditLog;

  public UserController(UserAccountService userAccountService, AuditLogService auditLog) {
    this.userAccountService = userAccountService;
    this.auditLog = auditLog;
  }

  /** Pulls (actorId, actorUsername) from the JWT principal. */
  private static UUID actorId(Authentication auth) {
    Jwt jwt = (Jwt) auth.getPrincipal();
    return UUID.fromString(jwt.getClaimAsString("userId"));
  }

  private static String actorUsername(Authentication auth) {
    Jwt jwt = (Jwt) auth.getPrincipal();
    String username = jwt.getClaimAsString("username");
    return username != null ? username : auth.getName();
  }

  @GetMapping("/profile")
  public UserResponse profile(Principal principal) {
    UserAccount account = userAccountService.findByUsernameOrEmail(principal.getName())
        .orElseThrow(() -> new IllegalArgumentException("User not found."));
    return toResponse(account);
  }

  @GetMapping("/me")
  public UserResponse me(Principal principal) {
    return profile(principal);
  }

  @PutMapping("/me")
  public UserResponse updateMe(Principal principal, @Valid @RequestBody UpdateUserRequest request) {
    UserAccount current = userAccountService.findByUsernameOrEmail(principal.getName())
        .orElseThrow(() -> new IllegalArgumentException("User not found."));
    // Prevent self-service privilege escalation / self-deactivation.
    request.setRole(null);
    request.setStatus(null);
    return toResponse(userAccountService.updateUser(current.getId(), request));
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public List<UserResponse> getAll(@RequestParam(name = "role", required = false) Role role) {
    List<UserAccount> accounts = role == null
        ? userAccountService.findAll()
        : userAccountService.findAllByRole(role);
    return accounts.stream().map(this::toResponse).collect(Collectors.toList());
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public UserResponse getById(@PathVariable("id") UUID id) {
    UserAccount account = userAccountService.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("User not found."));
    return toResponse(account);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public UserResponse update(@PathVariable("id") UUID id,
      @Valid @RequestBody UpdateUserRequest request,
      Authentication authentication) {
    UserAccount before = userAccountService.findById(id).orElse(null);
    Role previousRole = before != null ? before.getRole() : null;

    UserAccount account = userAccountService.updateUser(id, request);

    // Distinguish role changes from regular profile edits — they're investigated differently.
    boolean roleChanged = request.getRole() != null && request.getRole() != previousRole;
    if (roleChanged) {
      auditLog.record(
          actorId(authentication),
          actorUsername(authentication),
          AuditLogService.USER_ROLE_CHANGED,
          "USER", id,
          String.format("%s -> %s", previousRole, request.getRole()));
    } else {
      auditLog.record(
          actorId(authentication),
          actorUsername(authentication),
          AuditLogService.USER_UPDATED,
          "USER", id,
          null);
    }

    return toResponse(account);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public void delete(@PathVariable("id") UUID id, Authentication authentication) {
    UserAccount before = userAccountService.findById(id).orElse(null);
    String details = before != null
        ? String.format("Deleted %s (%s)", before.getUsername(), before.getEmail())
        : null;
    userAccountService.deleteUser(id);
    auditLog.record(
        actorId(authentication),
        actorUsername(authentication),
        AuditLogService.USER_DELETED,
        "USER", id,
        details);
  }

  private UserResponse toResponse(UserAccount account) {
    UserResponse response = new UserResponse(
        account.getId(),
        account.getUsername(),
        account.getEmail(),
        account.getRole(),
        account.getPhoneNumber(),
        account.getCreatedAt(),
        account.getUpdatedAt());
    response.setStatus(account.getStatus());
    return response;
  }
}
