package com.volunteer.notificationservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class InternalTokenFilter extends OncePerRequestFilter {
  private static final String HEADER = "X-Internal-Token";
  private static final String ROLE = "ROLE_SYSTEM";

  @Value("${notification.internal.token:dev-notify-token}")
  private String internalToken;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    if (internalToken != null && !internalToken.isBlank()) {
      String header = request.getHeader(HEADER);
      if (internalToken.equals(header)) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
            "internal-service",
            null,
            Collections.singletonList(new SimpleGrantedAuthority(ROLE)));
        SecurityContextHolder.getContext().setAuthentication(auth);
      }
    }
    filterChain.doFilter(request, response);
  }
}
