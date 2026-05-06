package com.volunteer.userservice.web.dto;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Bean Validation marker that runs the standard password rules:
 *  - 10+ characters
 *  - at least one letter
 *  - at least one digit
 *  - not in a small denylist of well-known passwords
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = StrongPasswordValidator.class)
public @interface StrongPassword {
  String message() default "Password must be at least 10 characters and include both letters and digits.";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
