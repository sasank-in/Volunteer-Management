package com.volunteer.userservice.web;

import com.volunteer.userservice.repository.AuditLogRepository;
import com.volunteer.userservice.web.dto.AuditLogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit-log")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditLogController {

  private static final int MAX_PAGE_SIZE = 100;

  private final AuditLogRepository repository;

  public AdminAuditLogController(AuditLogRepository repository) {
    this.repository = repository;
  }

  @GetMapping
  public Page<AuditLogResponse> list(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "25") int size,
      @RequestParam(required = false) String actionPrefix) {
    int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    int safePage = Math.max(page, 0);
    var pageable = PageRequest.of(safePage, safeSize);
    var entries = (actionPrefix != null && !actionPrefix.isBlank())
        ? repository.findByActionPrefix(actionPrefix + "%", pageable)
        : repository.findAllNewestFirst(pageable);
    return entries.map(AuditLogResponse::from);
  }
}
