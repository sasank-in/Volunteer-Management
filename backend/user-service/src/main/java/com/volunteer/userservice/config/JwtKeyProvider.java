package com.volunteer.userservice.config;

import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

@Component
public class JwtKeyProvider {
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
      throw new IllegalStateException(
          "JWT_SECRET is required. Configure a 32+ character secret.");
    }
    if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
      throw new IllegalStateException(
          "JWT secret too short. Use at least 32 characters for HS256.");
    }

    byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
    cachedKey = new SecretKeySpec(keyBytes, "HmacSHA256");
    return cachedKey;
  }
}
