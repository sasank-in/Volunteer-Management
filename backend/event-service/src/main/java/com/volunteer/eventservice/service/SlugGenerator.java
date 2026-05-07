package com.volunteer.eventservice.service;

import com.volunteer.eventservice.repository.EventRepository;
import java.security.SecureRandom;
import java.util.Locale;
import org.springframework.stereotype.Component;

/**
 * Builds URL-safe slugs from event titles, with a short random suffix for
 * uniqueness. Falls back to randomising more aggressively if the database
 * still reports a collision.
 */
@Component
public class SlugGenerator {

  private static final SecureRandom RNG = new SecureRandom();
  private static final String CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
  private static final int MAX_BASE_LEN = 80;

  private final EventRepository repository;

  public SlugGenerator(EventRepository repository) {
    this.repository = repository;
  }

  public String uniqueFromTitle(String title) {
    String base = slugify(title);
    if (base.isEmpty()) {
      base = "event";
    }
    if (base.length() > MAX_BASE_LEN) {
      base = base.substring(0, MAX_BASE_LEN).replaceAll("-+$", "");
    }
    for (int attempt = 0; attempt < 6; attempt++) {
      String candidate = base + "-" + randomSuffix(attempt < 3 ? 4 : 8);
      if (!repository.existsBySlug(candidate)) {
        return candidate;
      }
    }
    // Statistically unreachable, but better to fail loudly than silently overwrite.
    throw new IllegalStateException("Could not generate a unique event slug.");
  }

  private static String slugify(String input) {
    if (input == null) return "";
    String lowered = input.toLowerCase(Locale.ROOT);
    String stripped = lowered.replaceAll("[^a-z0-9]+", "-");
    return stripped.replaceAll("^-+|-+$", "");
  }

  private static String randomSuffix(int len) {
    StringBuilder sb = new StringBuilder(len);
    for (int i = 0; i < len; i++) {
      sb.append(CHARS.charAt(RNG.nextInt(CHARS.length())));
    }
    return sb.toString();
  }
}
