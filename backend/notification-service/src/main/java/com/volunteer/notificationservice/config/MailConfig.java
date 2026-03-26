package com.volunteer.notificationservice.config;

import java.util.Properties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class MailConfig {

  @Bean
  @Primary
  public JavaMailSender javaMailSender(
      @Value("${spring.mail.host}") String host,
      @Value("${spring.mail.port}") int port,
      @Value("${spring.mail.username:}") String username,
      @Value("${spring.mail.password:}") String password,
      @Value("${spring.mail.properties.mail.smtp.auth}") boolean smtpAuth,
      @Value("${spring.mail.properties.mail.smtp.starttls.enable}") boolean startTls) {
    JavaMailSenderImpl sender = new JavaMailSenderImpl();
    sender.setHost(host);
    sender.setPort(port);
    sender.setUsername(username);
    sender.setPassword(sanitizePassword(password));

    Properties props = sender.getJavaMailProperties();
    props.put("mail.smtp.auth", Boolean.toString(smtpAuth));
    props.put("mail.smtp.starttls.enable", Boolean.toString(startTls));
    return sender;
  }

  private String sanitizePassword(String raw) {
    if (raw == null) {
      return null;
    }
    // Gmail app passwords are often copied with spaces for readability.
    // Strip all whitespace to keep auth working.
    return raw.replaceAll("\\s+", "");
  }
}
