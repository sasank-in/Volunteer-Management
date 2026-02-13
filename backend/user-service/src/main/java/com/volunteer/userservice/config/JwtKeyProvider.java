package com.volunteer.userservice.config;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class JwtKeyProvider {
  private static final Logger log = LoggerFactory.getLogger(JwtKeyProvider.class);
  private final JwtProperties properties;
  private SecretKey cachedKey;

  public JwtKeyProvider(JwtProperties properties) {
    this.properties = properties;
  }

  public synchronized SecretKey getSigningKey() {
    if (cachedKey != null) {
      return cachedKey;
    }

    String secret = properties.getSecret();
    if (secret == null || secret.isBlank()) {
      secret = generateSecret();
      log.warn(
          "JWT_SECRET not provided. Generated a temporary secret for this runtime only. "
              + "Tokens will be invalid after restart. Set JWT_SECRET to a 32+ char value.");
    } else if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
      throw new IllegalStateException(
          "JWT secret too short. Use at least 32 characters for HS256.");
    }

    byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
    cachedKey = new SecretKeySpec(keyBytes, "HmacSHA256");
    return cachedKey;
  }

  private String generateSecret() {
    byte[] bytes = new byte[64];
    new SecureRandom().nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }
}
