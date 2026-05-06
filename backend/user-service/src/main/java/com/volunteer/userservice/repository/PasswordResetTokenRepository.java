package com.volunteer.userservice.repository;

import com.volunteer.userservice.domain.PasswordResetToken;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
  Optional<PasswordResetToken> findByTokenHash(String tokenHash);

  @Modifying
  @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now " +
      "OR (t.usedAt IS NOT NULL AND t.usedAt < :usedCutoff)")
  int deleteExpiredOrStaleUsed(@Param("now") Instant now,
      @Param("usedCutoff") Instant usedCutoff);
}
