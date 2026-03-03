package com.volunteer.apigateway.config;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.Duration;


/**
 * Configuration for API Gateway rate limiting using Resilience4j.
 * Protects backend services from being overwhelmed by requests.
 */
@Configuration
public class RateLimitingConfig {

  @Bean
  public RateLimiterRegistry rateLimiterRegistry() {
    RateLimiterRegistry registry = RateLimiterRegistry.of(
        RateLimiterConfig.custom()
            .limitRefreshPeriod(Duration.ofMinutes(1))
            .limitForPeriod(100)
            .timeoutDuration(Duration.ofSeconds(5))
            .build()
    );

    return registry;
  }

  @Bean
  public RateLimiter authServiceRateLimiter(RateLimiterRegistry registry) {
    return registry.rateLimiter("auth-service", RateLimiterConfig.custom()
        .limitRefreshPeriod(Duration.ofMinutes(1))
        .limitForPeriod(50)
        .timeoutDuration(Duration.ofMillis(100))
        .build());
  }

  @Bean
  public RateLimiter eventServiceRateLimiter(RateLimiterRegistry registry) {
    return registry.rateLimiter("event-service", RateLimiterConfig.custom()
        .limitRefreshPeriod(Duration.ofMinutes(1))
        .limitForPeriod(100)
        .timeoutDuration(Duration.ofMillis(100))
        .build());
  }

  @Bean
  public RateLimiter apiGatewayRateLimiter(RateLimiterRegistry registry) {
    return registry.rateLimiter("api-gateway", RateLimiterConfig.custom()
        .limitRefreshPeriod(Duration.ofMinutes(1))
        .limitForPeriod(500)
        .timeoutDuration(Duration.ofMillis(100))
        .build());
  }
}
