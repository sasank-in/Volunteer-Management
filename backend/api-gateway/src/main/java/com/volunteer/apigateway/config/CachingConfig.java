package com.volunteer.apigateway.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for response caching in the API Gateway.
 * Reduces load on backend services by caching frequently accessed data.
 */
@Configuration
@EnableCaching
public class CachingConfig {

  /**
   * Provides a simple in-memory cache manager for development/testing.
   * For production, consider using Redis or other distributed caching solutions.
   */
  @Bean
  public CacheManager cacheManager() {
    return new ConcurrentMapCacheManager(
        "users",
        "events",
        "notifications",
        "participations",
        "feedbacks"
    );
  }
}
