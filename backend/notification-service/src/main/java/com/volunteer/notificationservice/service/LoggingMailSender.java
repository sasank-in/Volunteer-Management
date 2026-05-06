package com.volunteer.notificationservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Drops outbound mail to the log instead of sending it. Useful in dev / CI
 * environments where you do not want to hit a real SMTP provider.
 */
@Component
@ConditionalOnProperty(name = "app.mail.provider", havingValue = "log")
public class LoggingMailSender implements MailSender {

  private static final Logger logger = LoggerFactory.getLogger(LoggingMailSender.class);

  @Override
  public void send(String to, String subject, String text) {
    logger.info("[mail] to={} subject={} body={}", to, subject, text.replace("\n", " | "));
  }
}
