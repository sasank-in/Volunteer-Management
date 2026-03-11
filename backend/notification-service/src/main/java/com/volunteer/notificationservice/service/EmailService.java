package com.volunteer.notificationservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
  private final JavaMailSender mailSender;
  private final String mailFrom;

  public EmailService(
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

  public void sendEmail(String to, String subject, String text) {
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
