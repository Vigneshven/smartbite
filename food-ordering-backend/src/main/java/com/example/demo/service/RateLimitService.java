package com.example.demo.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

@Service
public class RateLimitService {
    private static final Logger logger = Logger.getLogger(RateLimitService.class.getName());
    private static final int WINDOW_MINUTES = 5;
    private static final int MAX_REQUESTS = 10;

    private final JdbcTemplate jdbcTemplate;
    private final Map<String, Integer> fallbackCache = new ConcurrentHashMap<>();

    public RateLimitService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean allowRequest(String endpoint, String clientKey) {
        Instant now = Instant.now();
        Instant windowStart = now.minus(WINDOW_MINUTES, ChronoUnit.MINUTES);
        String normalizedKey = endpoint + ":" + clientKey;
        String sql = "SELECT request_count FROM api_rate_limits WHERE endpoint=? AND client_key=?";
        try {
            var rows = jdbcTemplate.queryForList(sql, endpoint, clientKey);
            if (!rows.isEmpty()) {
                var row = rows.get(0);
                int count = ((Number) row.get("request_count")).intValue();
                Timestamp storedWindow = (Timestamp) row.get("window_start");
                if (storedWindow != null && storedWindow.toInstant().isBefore(windowStart)) {
                    jdbcTemplate.update(
                            "UPDATE api_rate_limits SET request_count=1, window_start=?, last_request_at=?, updated_at=? WHERE endpoint=? AND client_key=?",
                            Timestamp.from(now), Timestamp.from(now), Timestamp.from(now), endpoint, clientKey);
                    return true;
                }
                if (count >= MAX_REQUESTS) {
                    logger.warning("Rate limit exceeded for " + normalizedKey);
                    return false;
                }
                jdbcTemplate.update(
                        "UPDATE api_rate_limits SET request_count=request_count+1, last_request_at=?, updated_at=? WHERE endpoint=? AND client_key=?",
                        Timestamp.from(now), Timestamp.from(now), endpoint, clientKey);
                return true;
            }
            jdbcTemplate.update(
                    "INSERT INTO api_rate_limits (endpoint, client_key, request_count, window_start, last_request_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    endpoint, clientKey, 1, Timestamp.from(now), Timestamp.from(now), Timestamp.from(now),
                    Timestamp.from(now));
            return true;
        } catch (Exception ex) {
            int count = fallbackCache.getOrDefault(normalizedKey, 0);
            if (count >= MAX_REQUESTS) {
                return false;
            }
            fallbackCache.put(normalizedKey, count + 1);
            return true;
        }
    }
}
