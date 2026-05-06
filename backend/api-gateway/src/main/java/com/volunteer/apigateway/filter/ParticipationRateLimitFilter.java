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
 * Rate-limits the event-registration / cancellation hot path so a single
 * actor cannot exhaust capacity for an entire event.
 */
@Component
public class ParticipationRateLimitFilter implements GlobalFilter, Ordered {

  private static final String PARTICIPATION_PREFIX = "/api/participations/";
  private final RateLimiter eventRateLimiter;

  public ParticipationRateLimitFilter(RateLimiter eventServiceRateLimiter) {
    this.eventRateLimiter = eventServiceRateLimiter;
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String path = exchange.getRequest().getURI().getPath();
    if (path == null || !path.startsWith(PARTICIPATION_PREFIX)) {
      return chain.filter(exchange);
    }
    try {
      RateLimiter.decorateCheckedRunnable(eventRateLimiter, () -> {}).run();
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
    return -90;
  }
}
