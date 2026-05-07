package com.volunteer.userservice.web.dto;

import com.volunteer.userservice.domain.AuditLogEntry;
import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
    UUID id,
    Instant occurredAt,
    UUID actorId,
    String actorUsername,
    String action,
    String targetType,
    UUID targetId,
    String details) {

  public static AuditLogResponse from(AuditLogEntry e) {
    return new AuditLogResponse(
        e.getId(),
        e.getOccurredAt(),
        e.getActorId(),
        e.getActorUsername(),
        e.getAction(),
        e.getTargetType(),
        e.getTargetId(),
        e.getDetails());
  }
}
