package com.volunteer.userservice.service;

import com.volunteer.userservice.domain.UserAccount;
import com.volunteer.userservice.repository.UserAccountRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Tracks failed login attempts and enforces a temporary lockout after a
 * configurable threshold to slow credential-stuffing.
 */
@Service
public class LoginAttemptService {

  private final UserAccountRepository repository;
  private final int maxAttempts;
  private final long lockoutMinutes;

  public LoginAttemptService(
      UserAccountRepository repository,
      @Value("${app.login.max-attempts:5}") int maxAttempts,
      @Value("${app.login.lockout-minutes:15}") long lockoutMinutes) {
    this.repository = repository;
    this.maxAttempts = maxAttempts;
    this.lockoutMinutes = lockoutMinutes;
  }

  public boolean isLocked(UserAccount account) {
    Instant until = account.getLockedUntil();
    return until != null && until.isAfter(Instant.now());
  }

  @Transactional
  public void recordFailure(UserAccount account) {
    int next = account.getFailedLoginAttempts() + 1;
    account.setFailedLoginAttempts(next);
    if (next >= maxAttempts) {
      account.setLockedUntil(Instant.now().plus(lockoutMinutes, ChronoUnit.MINUTES));
    }
    repository.save(account);
  }

  @Transactional
  public void recordSuccess(UserAccount account) {
    if (account.getFailedLoginAttempts() == 0 && account.getLockedUntil() == null) {
      return;
    }
    account.setFailedLoginAttempts(0);
    account.setLockedUntil(null);
    repository.save(account);
  }
}
