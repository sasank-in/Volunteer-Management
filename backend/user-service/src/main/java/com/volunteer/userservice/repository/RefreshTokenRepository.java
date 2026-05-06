package com.volunteer.userservice.repository;

import com.volunteer.userservice.domain.RefreshToken;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
  Optional<RefreshToken> findByTokenHash(String tokenHash);

  /** Deletes refresh tokens that are expired or revoked before the cutoff. */
  @Modifying
  @Query("DELETE FROM RefreshToken t WHERE t.expiresAt < :now " +
      "OR (t.revokedAt IS NOT NULL AND t.revokedAt < :revokedCutoff)")
  int deleteExpiredOrStaleRevoked(@Param("now") Instant now,
      @Param("revokedCutoff") Instant revokedCutoff);
}
