package com.volunteer.userservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
public class AuditLogEntry {

  @Id
  @Column(nullable = false)
  private UUID id;

  @Column(name = "occurred_at", nullable = false)
  private Instant occurredAt;

  @Column(name = "actor_id", nullable = false)
  private UUID actorId;

  @Column(name = "actor_username", nullable = false, length = 50)
  private String actorUsername;

  @Column(nullable = false, length = 60)
  private String action;

  @Column(name = "target_type", length = 40)
  private String targetType;

  @Column(name = "target_id")
  private UUID targetId;

  @Column(columnDefinition = "TEXT")
  private String details;

  public UUID getId() { return id; }
  public void setId(UUID id) { this.id = id; }

  public Instant getOccurredAt() { return occurredAt; }
  public void setOccurredAt(Instant occurredAt) { this.occurredAt = occurredAt; }

  public UUID getActorId() { return actorId; }
  public void setActorId(UUID actorId) { this.actorId = actorId; }

  public String getActorUsername() { return actorUsername; }
  public void setActorUsername(String actorUsername) { this.actorUsername = actorUsername; }

  public String getAction() { return action; }
  public void setAction(String action) { this.action = action; }

  public String getTargetType() { return targetType; }
  public void setTargetType(String targetType) { this.targetType = targetType; }

  public UUID getTargetId() { return targetId; }
  public void setTargetId(UUID targetId) { this.targetId = targetId; }

  public String getDetails() { return details; }
  public void setDetails(String details) { this.details = details; }
}
