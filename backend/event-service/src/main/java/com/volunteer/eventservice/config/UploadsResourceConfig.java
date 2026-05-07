package com.volunteer.eventservice.config;

import com.volunteer.eventservice.service.storage.LocalFileStorage;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Maps {@code GET /uploads/**} to the on-disk upload directory so cover images
 * can be served by the same service that stored them. Only registered when
 * the local storage impl is active.
 */
@Configuration
@ConditionalOnBean(LocalFileStorage.class)
public class UploadsResourceConfig implements WebMvcConfigurer {

  private final LocalFileStorage storage;

  public UploadsResourceConfig(LocalFileStorage storage) {
    this.storage = storage;
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    String location = storage.getUploadRoot().toUri().toString();
    registry.addResourceHandler("/uploads/**")
        .addResourceLocations(location)
        .setCachePeriod(3600);
  }
}
