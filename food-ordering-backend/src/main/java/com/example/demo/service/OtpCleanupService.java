package com.example.demo.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.logging.Logger;

@Service
@EnableScheduling
public class OtpCleanupService {
    private static final Logger logger = Logger.getLogger(OtpCleanupService.class.getName());

    private final JdbcTemplate jdbcTemplate;

    public OtpCleanupService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Scheduled(fixedRate = 600000)
    public void cleanupExpiredRecords() {
        Instant now = Instant.now();
        int pendingDeleted = jdbcTemplate.update("DELETE FROM pending_users WHERE expires_at < ?",
                java.sql.Timestamp.from(now));
        int otpDeleted = jdbcTemplate.update("DELETE FROM email_otps WHERE expires_at < ?",
                java.sql.Timestamp.from(now));
        logger.info("Cleaned up expired auth records: pending_users=" + pendingDeleted + ", email_otps=" + otpDeleted);
    }
}
