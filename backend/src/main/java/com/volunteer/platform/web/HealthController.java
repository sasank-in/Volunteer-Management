package com.volunteer.platform.web;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
  private final DataSource dataSource;

  public HealthController(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  @GetMapping("/health")
  public Map<String, String> health() {
    Map<String, String> payload = new LinkedHashMap<>();
    payload.put("status", "ok");
    payload.put("db", checkDb());
    return payload;
  }

  @GetMapping("/health/db")
  public Map<String, String> dbHealth() {
    return Map.of("db", checkDb());
  }

  private String checkDb() {
    try (Connection connection = dataSource.getConnection()) {
      return connection.isValid(2) ? "up" : "down";
    } catch (SQLException ex) {
      return "down";
    }
  }
}
