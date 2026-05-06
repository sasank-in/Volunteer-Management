package com.volunteer.apigateway.filter;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Applies the auth-service Resilience4j rate limiter to all /api/auth/** traffic
 * to mitigate brute-force login and abusive registration.
 */
@Component
public class AuthRateLimitFilter implements GlobalFilter, Ordered {

  private static final String AUTH_PATH_PREFIX = "/api/auth/";
  private final RateLimiter authRateLimiter;

  public AuthRateLimitFilter(RateLimiter authServiceRateLimiter) {
    this.authRateLimiter = authServiceRateLimiter;
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String path = exchange.getRequest().getURI().getPath();
    if (path == null || !path.startsWith(AUTH_PATH_PREFIX)) {
      return chain.filter(exchange);
    }
    try {
      RateLimiter.decorateCheckedRunnable(authRateLimiter, () -> {}).run();
    } catch (RequestNotPermitted ex) {
      exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
      return exchange.getResponse().setComplete();
    } catch (Throwable ex) {
      return Mono.error(ex);
    }
    return chain.filter(exchange);
  }

  @Override
  public int getOrder() {
    return -100;
  }
}
