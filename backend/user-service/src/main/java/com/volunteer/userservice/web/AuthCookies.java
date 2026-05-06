package com.volunteer.userservice.web;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Helpers for issuing and clearing the refresh-token cookie. The cookie is
 * scoped to {@code /api/auth} so it travels only with refresh/logout calls.
 */
@Component
public class AuthCookies {

  public static final String REFRESH_COOKIE = "refresh_token";
  private static final String COOKIE_PATH = "/api/auth";

  private final boolean secureCookie;
  private final String sameSite;

  public AuthCookies(
      @Value("${app.auth.cookie.secure:true}") boolean secureCookie,
      @Value("${app.auth.cookie.same-site:Strict}") String sameSite) {
    this.secureCookie = secureCookie;
    this.sameSite = sameSite;
  }

  public void writeRefreshCookie(HttpServletResponse response, String token, long maxAgeSeconds) {
    String header = String.format(
        "%s=%s; Max-Age=%d; Path=%s; HttpOnly; SameSite=%s%s",
        REFRESH_COOKIE,
        token,
        maxAgeSeconds,
        COOKIE_PATH,
        sameSite,
        secureCookie ? "; Secure" : "");
    response.addHeader("Set-Cookie", header);
  }

  public void clearRefreshCookie(HttpServletResponse response) {
    String header = String.format(
        "%s=; Max-Age=0; Path=%s; HttpOnly; SameSite=%s%s",
        REFRESH_COOKIE,
        COOKIE_PATH,
        sameSite,
        secureCookie ? "; Secure" : "");
    response.addHeader("Set-Cookie", header);
  }

  public String readRefreshCookie(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies == null) return null;
    for (Cookie c : cookies) {
      if (REFRESH_COOKIE.equals(c.getName())) {
        return c.getValue();
      }
    }
    return null;
  }
}
