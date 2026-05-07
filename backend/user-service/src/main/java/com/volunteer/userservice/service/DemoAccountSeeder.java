package com.volunteer.userservice.service;

import com.volunteer.userservice.domain.Role;
import com.volunteer.userservice.domain.UserAccount;
import com.volunteer.userservice.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates a small set of demo accounts so the LoginPage demo-cred buttons
 * actually work after a fresh deploy. Idempotent — re-running on an existing
 * database is a no-op.
 *
 * Disable in production by setting {@code app.demo.seed-enabled=false}.
 */
@Component
public class DemoAccountSeeder {

  private static final Logger logger = LoggerFactory.getLogger(DemoAccountSeeder.class);

  private static final DemoAccount[] DEMO_ACCOUNTS = {
      new DemoAccount("volunteer", "volunteer@example.com", "Demo-Volunteer-1", "5550100001", Role.VOLUNTEER),
      new DemoAccount("organizer", "organizer@example.com", "Demo-Organizer-1", "5550100002", Role.ORGANIZER),
      new DemoAccount("admin", "admin@example.com", "Demo-Admin-1", "5550100003", Role.ADMIN),
  };

  private final UserAccountRepository repository;
  private final PasswordEncoder passwordEncoder;
  private final boolean enabled;

  public DemoAccountSeeder(
      UserAccountRepository repository,
      PasswordEncoder passwordEncoder,
      @Value("${app.demo.seed-enabled:true}") boolean enabled) {
    this.repository = repository;
    this.passwordEncoder = passwordEncoder;
    this.enabled = enabled;
  }

  @EventListener(ApplicationReadyEvent.class)
  @Transactional
  public void seed() {
    if (!enabled) {
      return;
    }
    int created = 0;
    for (DemoAccount demo : DEMO_ACCOUNTS) {
      if (repository.existsByEmailIgnoreCase(demo.email)) {
        continue;
      }
      UserAccount account = new UserAccount();
      account.setUsername(demo.username);
      account.setEmail(demo.email);
      account.setPasswordHash(passwordEncoder.encode(demo.password));
      account.setRole(demo.role);
      account.setPhoneNumber(demo.phoneNumber);
      repository.save(account);
      created++;
    }
    if (created > 0) {
      logger.info("Demo account seeder created {} account(s).", created);
    }
  }

  private record DemoAccount(String username, String email, String password,
      String phoneNumber, Role role) {}
}
