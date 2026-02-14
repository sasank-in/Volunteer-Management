package com.volunteer.userservice.service;

import com.volunteer.userservice.domain.Role;
import com.volunteer.userservice.domain.UserAccount;
import com.volunteer.userservice.repository.UserAccountRepository;
import com.volunteer.userservice.web.dto.RegisterRequest;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserAccountService {
  private final UserAccountRepository repository;
  private final PasswordEncoder passwordEncoder;

  public UserAccountService(UserAccountRepository repository, PasswordEncoder passwordEncoder) {
    this.repository = repository;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional
  public UserAccount register(RegisterRequest request) {
    if (repository.existsByUsernameIgnoreCase(request.getUsername())) {
      throw new IllegalArgumentException("Username already in use.");
    }
    if (repository.existsByEmailIgnoreCase(request.getEmail())) {
      throw new IllegalArgumentException("Email already in use.");
    }

    UserAccount account = new UserAccount();
    account.setUsername(request.getUsername().trim());
    account.setEmail(request.getEmail().trim().toLowerCase());
    account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    account.setRole(Role.VOLUNTEER);
    account.setPhoneNumber(request.getPhoneNumber().trim());

    return repository.save(account);
  }

  public Optional<UserAccount> findByUsernameOrEmail(String value) {
    return repository.findByUsernameIgnoreCase(value)
        .or(() -> repository.findByEmailIgnoreCase(value));
  }

  public Optional<UserAccount> findByEmail(String email) {
    return repository.findByEmailIgnoreCase(email);
  }
}
