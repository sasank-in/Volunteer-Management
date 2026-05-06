package com.volunteer.userservice.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.volunteer.userservice.config.JwtProperties;
import com.volunteer.userservice.domain.Role;
import com.volunteer.userservice.domain.UserAccount;
import java.util.Base64;
import java.util.UUID;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

class JwtTokenServiceTest {

  private JwtTokenService service;
  private JwtDecoder decoder;
  private JwtProperties properties;

  @BeforeEach
  void setUp() {
    byte[] keyBytes = Base64.getDecoder().decode(Base64.getEncoder().encodeToString(new byte[32]));
    SecretKey key = new SecretKeySpec(keyBytes, "HmacSHA256");

    properties = new JwtProperties();
    properties.setIssuer("test-issuer");
    properties.setExpiresIn(3600);
    properties.setRefreshExpiresIn(7200);

    JwtEncoder encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
    decoder = NimbusJwtDecoder.withSecretKey(key).build();

    service = new JwtTokenService(encoder, properties);
  }

  private UserAccount account(Role role) {
    UserAccount u = new UserAccount();
    u.setId(UUID.randomUUID());
    u.setUsername("alice");
    u.setEmail("alice@example.com");
    u.setRole(role);
    return u;
  }

  @Test
  void accessTokenContainsExpectedClaims() {
    UserAccount user = account(Role.ADMIN);

    String token = service.generateAccessToken(user);
    var jwt = decoder.decode(token);

    assertThat(jwt.getSubject()).isEqualTo("alice");
    assertThat(jwt.getClaimAsString("iss")).isEqualTo("test-issuer");
    assertThat(jwt.getClaimAsString("role")).isEqualTo("ADMIN");
    assertThat(jwt.getClaimAsString("email")).isEqualTo("alice@example.com");
    assertThat(jwt.getClaimAsString("userId")).isEqualTo(user.getId().toString());
    assertThat(jwt.getExpiresAt()).isNotNull();
  }

  @Test
  void accessTokenDefaultsToVolunteerWhenRoleNull() {
    UserAccount user = account(null);
    var jwt = decoder.decode(service.generateAccessToken(user));
    assertThat(jwt.getClaimAsString("role")).isEqualTo("VOLUNTEER");
  }

  @Test
  void refreshTokenIsTaggedAsRefreshType() {
    var jwt = decoder.decode(service.generateRefreshToken(account(Role.VOLUNTEER)));
    assertThat(jwt.getClaimAsString("type")).isEqualTo("refresh");
    assertThat(jwt.getId()).isNotBlank();
  }
}
