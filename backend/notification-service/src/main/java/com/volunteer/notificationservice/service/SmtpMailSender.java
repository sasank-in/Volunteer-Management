package com.volunteer.notificationservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.mail.provider", havingValue = "smtp", matchIfMissing = true)
public class SmtpMailSender implements MailSender {

  private final JavaMailSender mailSender;
  private final String mailFrom;

  public SmtpMailSender(
      JavaMailSender mailSender,
      @Value("${MAIL_FROM:}") String mailFromEnv,
      @Value("${spring.mail.username:}") String mailUsername) {
    this.mailSender = mailSender;
    this.mailFrom = (mailFromEnv != null && !mailFromEnv.isBlank())
        ? mailFromEnv
        : (mailUsername != null && !mailUsername.isBlank()
            ? mailUsername
            : "noreply@volunteer-platform.com");
  }

  @Override
  public void send(String to, String subject, String text) {
    try {
      SimpleMailMessage message = new SimpleMailMessage();
      message.setTo(to);
      message.setSubject(subject);
      message.setText(text);
      message.setFrom(mailFrom);
      mailSender.send(message);
    } catch (Exception e) {
      throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
    }
  }
}
