package com.volunteer.userservice.web;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Method;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

/**
 * Guards against regression of the ADMIN role check on user-management endpoints.
 * If anyone removes the @PreAuthorize annotation, this test fails.
 */
class UserControllerSecurityTest {

  @Test
  void adminEndpointsRequireAdminRole() throws NoSuchMethodException {
    assertHasAdminGuard(UserController.class.getMethod("getAll", com.volunteer.userservice.domain.Role.class));
    assertHasAdminGuard(UserController.class.getMethod("getById", UUID.class));
    assertHasAdminGuard(UserController.class.getMethod("update", UUID.class,
        com.volunteer.userservice.web.dto.UpdateUserRequest.class,
        org.springframework.security.core.Authentication.class));
    assertHasAdminGuard(UserController.class.getMethod("delete", UUID.class,
        org.springframework.security.core.Authentication.class));
  }

  @Test
  void selfServiceEndpointsAreNotAdminGuarded() throws NoSuchMethodException {
    Method profile = UserController.class.getMethod("profile", java.security.Principal.class);
    Method me = UserController.class.getMethod("me", java.security.Principal.class);
    assertThat(profile.getAnnotation(PreAuthorize.class)).isNull();
    assertThat(me.getAnnotation(PreAuthorize.class)).isNull();
  }

  private void assertHasAdminGuard(Method m) {
    PreAuthorize ann = m.getAnnotation(PreAuthorize.class);
    assertThat(ann)
        .as("method %s must be annotated with @PreAuthorize", m.getName())
        .isNotNull();
    assertThat(ann.value()).contains("hasRole('ADMIN')");
  }
}
