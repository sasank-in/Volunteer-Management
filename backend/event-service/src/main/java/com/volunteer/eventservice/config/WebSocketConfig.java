package com.volunteer.eventservice.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  private final JwtDecoder jwtDecoder;
  private final List<String> allowedOrigins;

  public WebSocketConfig(
      JwtDecoder jwtDecoder,
      @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173}") String allowedOriginsCsv) {
    this.jwtDecoder = jwtDecoder;
    this.allowedOrigins = Arrays.stream(allowedOriginsCsv.split(","))
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .toList();
  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry registry) {
    // Server-pushed broadcasts go on /topic/**, client-bound destinations on /app/**.
    registry.enableSimpleBroker("/topic");
    registry.setApplicationDestinationPrefixes("/app");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
        .setAllowedOriginPatterns(allowedOrigins.toArray(new String[0]))
        .withSockJS();
  }

  /**
   * Authenticates the STOMP CONNECT frame using the JWT supplied in the
   * 'Authorization: Bearer <token>' STOMP header. Without this, anyone could
   * connect and subscribe to event topics.
   */
  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(new ChannelInterceptor() {
      @Override
      public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
          String authHeader = accessor.getFirstNativeHeader("Authorization");
          if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring("Bearer ".length());
            Jwt jwt = jwtDecoder.decode(token);
            AbstractAuthenticationToken auth = new JwtAuthenticationToken(jwt);
            accessor.setUser(auth);
          } else {
            throw new IllegalArgumentException("Missing Authorization header on STOMP CONNECT");
          }
        }
        return message;
      }
    });
  }
}
