package com.volunteer.userservice.web.dto;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Set;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

  private static final int MIN_LENGTH = 10;

  /** Tiny denylist of trivial passwords. Keep small — a real deployment uses HIBP. */
  private static final Set<String> DENYLIST = Set.of(
      "password",
      "password1",
      "password123",
      "qwerty",
      "qwertyuiop",
      "12345678",
      "1234567890",
      "letmein",
      "welcome",
      "welcome123",
      "iloveyou",
      "admin",
      "administrator",
      "passw0rd");

  @Override
  public boolean isValid(String value, ConstraintValidatorContext context) {
    if (value == null) {
      return false;
    }
    if (value.length() < MIN_LENGTH) {
      return false;
    }
    boolean hasLetter = false;
    boolean hasDigit = false;
    for (int i = 0; i < value.length(); i++) {
      char c = value.charAt(i);
      if (Character.isLetter(c)) hasLetter = true;
      if (Character.isDigit(c)) hasDigit = true;
      if (hasLetter && hasDigit) break;
    }
    if (!hasLetter || !hasDigit) {
      return false;
    }
    return !DENYLIST.contains(value.toLowerCase());
  }
}
