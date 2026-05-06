package com.volunteer.notificationservice.service;

import org.springframework.stereotype.Service;

/**
 * Thin facade over {@link MailSender} so callers don't depend on the concrete
 * provider. The active provider is selected via {@code app.mail.provider}
 * (smtp by default, log in dev/CI).
 */
@Service
public class EmailService {
  private final MailSender mailSender;

  public EmailService(MailSender mailSender) {
    this.mailSender = mailSender;
  }

  public void sendEmail(String to, String subject, String text) {
    mailSender.send(to, subject, text);
  }
}
