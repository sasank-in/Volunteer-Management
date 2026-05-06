package com.volunteer.userservice.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Base64;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;

class JwtKeyProviderTest {

  private JwtProperties props(String secret) {
    JwtProperties p = new JwtProperties();
    p.setSecret(secret);
    return p;
  }

  @Test
  void rejectsMissingSecret() {
    assertThatThrownBy(() -> new JwtKeyProvider(props(null)).getSigningKey())
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("JWT_SECRET is required");

    assertThatThrownBy(() -> new JwtKeyProvider(props("")).getSigningKey())
        .isInstanceOf(IllegalStateException.class);
  }

  @Test
  void rejectsNonBase64Secret() {
    assertThatThrownBy(() -> new JwtKeyProvider(props("!!! not base64 !!!")).getSigningKey())
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("Base64");
  }

  @Test
  void rejectsTooShortSecret() {
    String shortSecret = Base64.getEncoder().encodeToString(new byte[16]);
    assertThatThrownBy(() -> new JwtKeyProvider(props(shortSecret)).getSigningKey())
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("at least 32 bytes");
  }

  @Test
  void acceptsValid32ByteSecretAndCachesKey() {
    String secret = Base64.getEncoder().encodeToString(new byte[32]);
    JwtKeyProvider provider = new JwtKeyProvider(props(secret));

    SecretKey first = provider.getSigningKey();
    SecretKey second = provider.getSigningKey();

    assertThat(first).isNotNull();
    assertThat(first.getAlgorithm()).isEqualTo("HmacSHA256");
    assertThat(second).isSameAs(first);
  }
}
