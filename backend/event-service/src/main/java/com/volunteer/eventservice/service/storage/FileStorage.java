package com.volunteer.eventservice.service.storage;

import java.io.InputStream;

/**
 * Abstracts where uploaded files live. Default impl writes to local disk;
 * production deployments can drop in an S3 / GCS / Azure Blob impl without
 * touching callers.
 */
public interface FileStorage {

  /**
   * Stores the supplied stream and returns a public URL path (relative to the
   * service root, e.g. {@code /uploads/abc123.jpg}).
   *
   * @param input    the binary stream to persist
   * @param filename the storage filename (caller-generated, already unique)
   * @param contentType MIME type (used for HTTP serving)
   * @return public URL path that {@code <img src>} can use
   */
  String store(InputStream input, String filename, String contentType);

  /**
   * Removes a previously stored file. Best-effort — silently ignores
   * not-found and forwards real I/O errors.
   */
  void delete(String publicPath);
}
