package com.volunteer.eventservice.service.storage;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Writes uploaded files to a directory on the local filesystem and exposes
 * them under {@code /uploads/{filename}}. Activated when
 * {@code app.storage.type=local} (the default).
 *
 * Production note: replace with an S3-backed impl before running >1 instance —
 * each pod would otherwise have its own isolated copy of the files.
 */
@Component
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorage implements FileStorage {

  private static final Logger logger = LoggerFactory.getLogger(LocalFileStorage.class);
  private static final String PUBLIC_PREFIX = "/uploads/";

  private final Path uploadRoot;

  public LocalFileStorage(@Value("${app.storage.local.root:./uploads}") String root) {
    this.uploadRoot = Paths.get(root).toAbsolutePath().normalize();
  }

  @PostConstruct
  void ensureDirExists() throws IOException {
    Files.createDirectories(uploadRoot);
    logger.info("Local file storage ready at {}", uploadRoot);
  }

  @Override
  public String store(InputStream input, String filename, String contentType) {
    Path target = resolveSafe(filename);
    try {
      Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
    } catch (IOException ex) {
      throw new IllegalStateException("Failed to write upload " + filename, ex);
    }
    return PUBLIC_PREFIX + filename;
  }

  @Override
  public void delete(String publicPath) {
    if (publicPath == null || !publicPath.startsWith(PUBLIC_PREFIX)) {
      return;
    }
    String filename = publicPath.substring(PUBLIC_PREFIX.length());
    try {
      Files.deleteIfExists(resolveSafe(filename));
    } catch (IOException ex) {
      logger.warn("Failed to delete upload {}: {}", filename, ex.getMessage());
    }
  }

  /** Defends against path traversal — refuses anything resolving outside uploadRoot. */
  private Path resolveSafe(String filename) {
    Path candidate = uploadRoot.resolve(filename).normalize();
    if (!candidate.startsWith(uploadRoot)) {
      throw new IllegalArgumentException("Invalid upload path: " + filename);
    }
    return candidate;
  }

  public Path getUploadRoot() {
    return uploadRoot;
  }
}
