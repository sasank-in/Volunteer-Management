package com.volunteer.userservice.service;

import com.volunteer.userservice.repository.PasswordResetTokenRepository;
import com.volunteer.userservice.repository.RefreshTokenRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Periodically prunes expired and stale revoked/used token rows so the
 * tables don't grow unbounded.
 */
@Component
public class TokenCleanupJob {

  private static final Logger logger = LoggerFactory.getLogger(TokenCleanupJob.class);

  private final RefreshTokenRepository refreshTokens;
  private final PasswordResetTokenRepository resetTokens;

  public TokenCleanupJob(RefreshTokenRepository refreshTokens,
      PasswordResetTokenRepository resetTokens) {
    this.refreshTokens = refreshTokens;
    this.resetTokens = resetTokens;
  }

  /** Runs hourly on the top of the hour. */
  @Scheduled(cron = "0 0 * * * *")
  @Transactional
  public void prune() {
    Instant now = Instant.now();
    Instant revokedCutoff = now.minus(7, ChronoUnit.DAYS);
    Instant usedCutoff = now.minus(7, ChronoUnit.DAYS);

    int refreshDeleted = refreshTokens.deleteExpiredOrStaleRevoked(now, revokedCutoff);
    int resetDeleted = resetTokens.deleteExpiredOrStaleUsed(now, usedCutoff);

    if (refreshDeleted > 0 || resetDeleted > 0) {
      logger.info("Token cleanup pruned refresh={}, reset={}", refreshDeleted, resetDeleted);
    }
  }
}
