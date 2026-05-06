package com.volunteer.notificationservice.service;

/**
 * Abstraction over outbound email so we can swap SMTP for SES/SendGrid/Postmark
 * without touching callers. Production deployments should provide a bean
 * backed by a transactional-email provider with bounce + suppression handling.
 */
public interface MailSender {
  void send(String to, String subject, String text);
}
