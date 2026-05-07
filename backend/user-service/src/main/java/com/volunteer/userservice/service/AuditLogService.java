package com.volunteer.userservice.service;

import com.volunteer.userservice.domain.AuditLogEntry;
import com.volunteer.userservice.repository.AuditLogRepository;
import java.time.Instant;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Centralised admin-action recorder. Callers pass actor + action + target;
 * everything else is filled in here.
 *
 * Writes use {@code REQUIRES_NEW} so an audit failure can never roll back the
 * underlying admin operation, and a rolled-back admin operation still leaves
 * a trail (intentional — incidents need that record).
 */
@Service
public class AuditLogService {

  /** Stable action constants used across the app — keep this list short and meaningful. */
  public static final String USER_ROLE_CHANGED = "USER_ROLE_CHANGED";
  public static final String USER_DELETED = "USER_DELETED";
  public static final String USER_UPDATED = "USER_UPDATED";

  private static final Logger logger = LoggerFactory.getLogger(AuditLogService.class);

  private final AuditLogRepository repository;

  public AuditLogService(AuditLogRepository repository) {
    this.repository = repository;
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void record(UUID actorId, String actorUsername, String action,
      String targetType, UUID targetId, String details) {
    try {
      AuditLogEntry entry = new AuditLogEntry();
      entry.setId(UUID.randomUUID());
      entry.setOccurredAt(Instant.now());
      entry.setActorId(actorId);
      entry.setActorUsername(actorUsername);
      entry.setAction(action);
      entry.setTargetType(targetType);
      entry.setTargetId(targetId);
      entry.setDetails(details);
      repository.save(entry);
    } catch (Exception ex) {
      // Never let an audit-write failure bubble up and break the admin action.
      logger.error("Failed to write audit log entry action={} target={}/{}",
          action, targetType, targetId, ex);
    }
  }
}
