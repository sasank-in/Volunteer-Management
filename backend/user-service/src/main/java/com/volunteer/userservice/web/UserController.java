package com.volunteer.userservice.web;

import com.volunteer.userservice.domain.UserAccount;
import com.volunteer.userservice.service.UserAccountService;
import com.volunteer.userservice.web.dto.UserResponse;
import java.security.Principal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserAccountService userAccountService;

  public UserController(UserAccountService userAccountService) {
    this.userAccountService = userAccountService;
  }

  @GetMapping("/profile")
  public UserResponse profile(Principal principal) {
    UserAccount account = userAccountService.findByUsernameOrEmail(principal.getName())
        .orElseThrow(() -> new IllegalArgumentException("User not found."));
    return new UserResponse(
        account.getId(),
        account.getUsername(),
        account.getEmail(),
        account.getRole(),
        account.getPhoneNumber(),
        account.getCreatedAt());
  }
}
