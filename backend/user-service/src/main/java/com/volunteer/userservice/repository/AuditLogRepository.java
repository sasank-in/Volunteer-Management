package com.volunteer.userservice.repository;

import com.volunteer.userservice.domain.AuditLogEntry;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLogEntry, UUID> {

  /** All entries, newest first. Paged so the admin UI never pulls thousands. */
  @Query("SELECT a FROM AuditLogEntry a ORDER BY a.occurredAt DESC")
  Page<AuditLogEntry> findAllNewestFirst(Pageable pageable);

  /** Filter by action prefix (e.g. "USER_") for category drill-downs. */
  @Query("SELECT a FROM AuditLogEntry a WHERE a.action LIKE :prefix ORDER BY a.occurredAt DESC")
  Page<AuditLogEntry> findByActionPrefix(@Param("prefix") String prefix, Pageable pageable);
}
