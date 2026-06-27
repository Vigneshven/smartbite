package com.example.demo.service;

import com.example.demo.model.OtpRecord;
import com.example.demo.model.PendingUserRecord;
import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class OtpService {

    private static final Logger logger = Logger.getLogger(OtpService.class.getName());
    private static final Duration OTP_EXPIRATION = Duration.ofMinutes(10);
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final int MAX_RESENDS = 5;
    private static final int MAX_ATTEMPTS = 5;
    private static final String REGISTER_PURPOSE = "REGISTER";
    private static final String FORGOT_PASSWORD_PURPOSE = "FORGOT_PASSWORD";

    private final SecureRandom random = new SecureRandom();

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EmailService emailService;

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public void createPending(User user) {
        if (user == null || user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            logger.warning("[OtpService] Cannot create pending registration for invalid user");
            return;
        }

        String normalizedEmail = normalizeEmail(user.getEmail());
        String expiresAt = Timestamp.from(Instant.now().plus(OTP_EXPIRATION)).toString();
        String now = Timestamp.from(Instant.now()).toString();

        jdbcTemplate.update("DELETE FROM pending_users WHERE email=? AND purpose=?", normalizedEmail, REGISTER_PURPOSE);
        jdbcTemplate.update(
                "INSERT INTO pending_users (email, full_name, password, phone, role, purpose, status, created_at, expires_at, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                normalizedEmail,
                user.getFullName(),
                user.getPassword(),
                user.getPhone(),
                user.getRole() == null ? "USER" : user.getRole(),
                REGISTER_PURPOSE,
                "PENDING",
                now,
                expiresAt,
                null);
        logger.info("[OtpService] Stored pending registration for " + normalizedEmail);
    }

    public User getPendingUser(String email) {
        String normalizedEmail = normalizeEmail(email);
        PendingUserRecord record = findPendingUserRecord(normalizedEmail, REGISTER_PURPOSE);
        if (record == null) {
            logger.info("[OtpService] No pending user found for: " + normalizedEmail);
            return null;
        }
        logger.info("[OtpService] Retrieving pending user: " + normalizedEmail);
        return toUser(record);
    }

    public boolean hasPendingUser(String email) {
        String normalizedEmail = normalizeEmail(email);
        boolean hasPending = existsPendingUser(normalizedEmail, REGISTER_PURPOSE);
        logger.info("[OtpService] Checking pending user " + normalizedEmail + ": " + hasPending);
        return hasPending;
    }

    public void removePending(String email) {
        String normalizedEmail = normalizeEmail(email);
        logger.info("[OtpService] Removing pending user: " + normalizedEmail);
        jdbcTemplate.update("DELETE FROM pending_users WHERE email=? AND purpose=?", normalizedEmail, REGISTER_PURPOSE);
        jdbcTemplate.update("DELETE FROM email_otps WHERE email=? AND purpose=?", normalizedEmail, REGISTER_PURPOSE);
    }

    public OtpSendResult sendOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isEmpty()) {
            return new OtpSendResult(false, "Invalid email address.");
        }
        if (!hasPendingUser(normalizedEmail)) {
            return new OtpSendResult(false, "No pending registration found for this email.");
        }

        try {
            OtpRecord existing = findOtpRecord(normalizedEmail, REGISTER_PURPOSE);
            Instant now = Instant.now();
            if (existing != null && !isExpired(existing.getExpiresAt())) {
                if (existing.getResendCount() >= MAX_RESENDS) {
                    return new OtpSendResult(false, "Maximum resend limit reached.");
                }
                if (existing.getLastSentAt() != null
                        && Duration.between(existing.getLastSentAt(), now).toSeconds() < RESEND_COOLDOWN.getSeconds()) {
                    return new OtpSendResult(false, "Please wait 60 seconds before requesting a new OTP.");
                }
            }

            String otp = generateOtp();
            String otpHash = hashOtp(otp);
            Timestamp expiresAt = Timestamp.from(now.plus(OTP_EXPIRATION));
            Timestamp sentAt = Timestamp.from(now);
            if (existing != null && !isExpired(existing.getExpiresAt())) {
                jdbcTemplate.update(
                        "UPDATE email_otps SET otp_hash=?, expires_at=?, updated_at=?, last_sent_at=?, resend_count=resend_count+1 WHERE email=? AND purpose=?",
                        otpHash, expiresAt, sentAt, sentAt, normalizedEmail, REGISTER_PURPOSE);
            } else {
                jdbcTemplate.update(
                        "INSERT INTO email_otps (email, otp_hash, purpose, status, expires_at, created_at, updated_at, last_sent_at, attempt_count, resend_count, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NULL)",
                        normalizedEmail, otpHash, REGISTER_PURPOSE, "PENDING", expiresAt, sentAt, sentAt, sentAt);
            }

            String emailError = emailService.sendOtpEmail(normalizedEmail, otp);
            if (emailError != null) {
                logger.warning("[OtpService] Failed to send OTP to " + normalizedEmail + " because " + emailError);
                return new OtpSendResult(false, emailError);
            }

            logger.info("[OtpService] OTP sent for registration to " + normalizedEmail);
            return new OtpSendResult(true, null, emailService.isDevStub() ? otp : null);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "[OtpService] Exception while sending OTP", e);
            return new OtpSendResult(false, "Internal error while sending OTP.");
        }
    }

    public OtpSendResult sendPasswordResetOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isEmpty()) {
            return new OtpSendResult(false, "Invalid email address.");
        }

        try {
            OtpRecord existing = findOtpRecord(normalizedEmail, FORGOT_PASSWORD_PURPOSE);
            Instant now = Instant.now();
            if (existing != null && !isExpired(existing.getExpiresAt())) {
                if (existing.getResendCount() >= MAX_RESENDS) {
                    return new OtpSendResult(false, "Maximum resend limit reached.");
                }
                if (existing.getLastSentAt() != null
                        && Duration.between(existing.getLastSentAt(), now).toSeconds() < RESEND_COOLDOWN.getSeconds()) {
                    return new OtpSendResult(false, "Please wait 60 seconds before requesting a new OTP.");
                }
            }

            String otp = generateOtp();
            String otpHash = hashOtp(otp);
            Timestamp expiresAt = Timestamp.from(now.plus(OTP_EXPIRATION));
            Timestamp sentAt = Timestamp.from(now);
            if (existing != null && !isExpired(existing.getExpiresAt())) {
                jdbcTemplate.update(
                        "UPDATE email_otps SET otp_hash=?, expires_at=?, updated_at=?, last_sent_at=?, resend_count=resend_count+1 WHERE email=? AND purpose=?",
                        otpHash, expiresAt, sentAt, sentAt, normalizedEmail, FORGOT_PASSWORD_PURPOSE);
            } else {
                jdbcTemplate.update(
                        "INSERT INTO email_otps (email, otp_hash, purpose, status, expires_at, created_at, updated_at, last_sent_at, attempt_count, resend_count, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NULL)",
                        normalizedEmail, otpHash, FORGOT_PASSWORD_PURPOSE, "PENDING", expiresAt, sentAt, sentAt,
                        sentAt);
            }

            String emailError = emailService.sendPasswordResetEmail(normalizedEmail, otp);
            if (emailError != null) {
                logger.warning("[OtpService] Failed to send password reset OTP to " + normalizedEmail + " because "
                        + emailError);
                return new OtpSendResult(false, emailError);
            }

            logger.info("[OtpService] Password reset OTP sent to " + normalizedEmail);
            return new OtpSendResult(true, null);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "[OtpService] Exception while sending password reset OTP", e);
            return new OtpSendResult(false, "Internal error while sending password reset OTP.");
        }
    }

    public boolean verifyOtp(String email, String otp) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null || otp == null) {
            return false;
        }

        OtpRecord record = findOtpRecord(normalizedEmail, REGISTER_PURPOSE);
        if (record == null || isExpired(record.getExpiresAt())) {
            markExpired(normalizedEmail, REGISTER_PURPOSE);
            return false;
        }

        int nextAttemptCount = record.getAttemptCount() + 1;
        if (nextAttemptCount > MAX_ATTEMPTS) {
            jdbcTemplate.update("UPDATE email_otps SET status='LOCKED', updated_at=? WHERE email=? AND purpose=?",
                    Timestamp.from(Instant.now()), normalizedEmail, REGISTER_PURPOSE);
            return false;
        }

        if (matchesOtp(record.getOtpHash(), otp)) {
            jdbcTemplate.update(
                    "UPDATE email_otps SET status='VERIFIED', verified_at=?, updated_at=? WHERE email=? AND purpose=?",
                    Timestamp.from(Instant.now()), Timestamp.from(Instant.now()), normalizedEmail, REGISTER_PURPOSE);
            return true;
        }

        jdbcTemplate.update("UPDATE email_otps SET attempt_count=?, updated_at=? WHERE email=? AND purpose=?",
                nextAttemptCount, Timestamp.from(Instant.now()), normalizedEmail, REGISTER_PURPOSE);
        if (nextAttemptCount >= MAX_ATTEMPTS) {
            jdbcTemplate.update("UPDATE email_otps SET status='LOCKED', updated_at=? WHERE email=? AND purpose=?",
                    Timestamp.from(Instant.now()), normalizedEmail, REGISTER_PURPOSE);
        }
        return false;
    }

    public boolean verifyPasswordResetOtp(String email, String otp) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null || otp == null) {
            return false;
        }

        OtpRecord record = findOtpRecord(normalizedEmail, FORGOT_PASSWORD_PURPOSE);
        if (record == null || isExpired(record.getExpiresAt())) {
            markExpired(normalizedEmail, FORGOT_PASSWORD_PURPOSE);
            return false;
        }

        int nextAttemptCount = record.getAttemptCount() + 1;
        if (nextAttemptCount > MAX_ATTEMPTS) {
            jdbcTemplate.update("UPDATE email_otps SET status='LOCKED', updated_at=? WHERE email=? AND purpose=?",
                    Timestamp.from(Instant.now()), normalizedEmail, FORGOT_PASSWORD_PURPOSE);
            return false;
        }

        if (matchesOtp(record.getOtpHash(), otp)) {
            jdbcTemplate.update(
                    "UPDATE email_otps SET status='VERIFIED', verified_at=?, updated_at=? WHERE email=? AND purpose=?",
                    Timestamp.from(Instant.now()), Timestamp.from(Instant.now()), normalizedEmail,
                    FORGOT_PASSWORD_PURPOSE);
            return true;
        }

        jdbcTemplate.update("UPDATE email_otps SET attempt_count=?, updated_at=? WHERE email=? AND purpose=?",
                nextAttemptCount, Timestamp.from(Instant.now()), normalizedEmail, FORGOT_PASSWORD_PURPOSE);
        if (nextAttemptCount >= MAX_ATTEMPTS) {
            jdbcTemplate.update("UPDATE email_otps SET status='LOCKED', updated_at=? WHERE email=? AND purpose=?",
                    Timestamp.from(Instant.now()), normalizedEmail, FORGOT_PASSWORD_PURPOSE);
        }
        return false;
    }

    public boolean hasValidOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        return existsActiveOtp(normalizedEmail, REGISTER_PURPOSE);
    }

    public boolean hasValidPasswordResetOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        return existsActiveOtp(normalizedEmail, FORGOT_PASSWORD_PURPOSE);
    }

    public boolean isEmailServiceAvailable() {
        return emailService.isEmailServiceAvailable();
    }

    public void logServiceStatus() {
        logger.info("[OtpService] Auth OTP persistence is enabled and backed by the database.");
        emailService.logEmailServiceStatus();
    }

    private boolean existsPendingUser(String email, String purpose) {
        if (email == null) {
            return false;
        }
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM pending_users WHERE email=? AND purpose=? AND status='PENDING' AND expires_at > ?",
                Integer.class,
                email,
                purpose,
                Timestamp.from(Instant.now()));
        return count != null && count > 0;
    }

    private PendingUserRecord findPendingUserRecord(String email, String purpose) {
        if (email == null) {
            return null;
        }
        List<PendingUserRecord> rows = jdbcTemplate.query(
                "SELECT * FROM pending_users WHERE email=? AND purpose=? AND status='PENDING' AND expires_at > ?",
                (rs, rowNum) -> mapPendingUser(rs),
                email,
                purpose,
                Timestamp.from(Instant.now()));
        if (rows.isEmpty()) {
            return null;
        }
        return rows.get(0);
    }

    private OtpRecord findOtpRecord(String email, String purpose) {
        if (email == null) {
            return null;
        }
        List<OtpRecord> rows = jdbcTemplate.query(
                "SELECT * FROM email_otps WHERE email=? AND purpose=?",
                (rs, rowNum) -> mapOtpRecord(rs),
                email,
                purpose);
        if (rows.isEmpty()) {
            return null;
        }
        return rows.get(0);
    }

    private boolean existsActiveOtp(String email, String purpose) {
        if (email == null) {
            return false;
        }
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM email_otps WHERE email=? AND purpose=? AND status='PENDING' AND expires_at > ?",
                Integer.class,
                email,
                purpose,
                Timestamp.from(Instant.now()));
        return count != null && count > 0;
    }

    private void markExpired(String email, String purpose) {
        jdbcTemplate.update("UPDATE email_otps SET status='EXPIRED', updated_at=? WHERE email=? AND purpose=?",
                Timestamp.from(Instant.now()), email, purpose);
    }

    private boolean isExpired(Instant expiresAt) {
        return expiresAt == null || Instant.now().isAfter(expiresAt);
    }

    private String hashOtp(String otp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(otp.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Unable to hash OTP", e);
        }
    }

    private boolean matchesOtp(String storedHash, String otp) {
        return storedHash != null && storedHash.equals(hashOtp(otp));
    }

    private String generateOtp() {
        int otpValue = random.nextInt(1000000);
        return String.format("%06d", otpValue);
    }

    private User toUser(PendingUserRecord record) {
        User user = new User();
        user.setEmail(record.getEmail());
        user.setFullName(record.getFullName());
        user.setPassword(record.getPassword());
        user.setPhone(record.getPhone());
        user.setRole(record.getRole());
        return user;
    }

    private PendingUserRecord mapPendingUser(ResultSet rs) throws SQLException {
        PendingUserRecord record = new PendingUserRecord();
        record.setId(rs.getLong("id"));
        record.setEmail(rs.getString("email"));
        record.setFullName(rs.getString("full_name"));
        record.setPassword(rs.getString("password"));
        record.setPhone(rs.getString("phone"));
        record.setRole(rs.getString("role"));
        record.setPurpose(rs.getString("purpose"));
        record.setStatus(rs.getString("status"));
        record.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        record.setExpiresAt(rs.getTimestamp("expires_at").toInstant());
        Timestamp verifiedAt = rs.getTimestamp("verified_at");
        record.setVerifiedAt(verifiedAt != null ? verifiedAt.toInstant() : null);
        return record;
    }

    private OtpRecord mapOtpRecord(ResultSet rs) throws SQLException {
        OtpRecord record = new OtpRecord();
        record.setId(rs.getLong("id"));
        record.setEmail(rs.getString("email"));
        record.setOtpHash(rs.getString("otp_hash"));
        record.setPurpose(rs.getString("purpose"));
        record.setStatus(rs.getString("status"));
        record.setExpiresAt(rs.getTimestamp("expires_at").toInstant());
        record.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        record.setUpdatedAt(rs.getTimestamp("updated_at").toInstant());
        Timestamp lastSentAt = rs.getTimestamp("last_sent_at");
        record.setLastSentAt(lastSentAt != null ? lastSentAt.toInstant() : null);
        record.setAttemptCount(rs.getInt("attempt_count"));
        record.setResendCount(rs.getInt("resend_count"));
        Timestamp verifiedAt = rs.getTimestamp("verified_at");
        record.setVerifiedAt(verifiedAt != null ? verifiedAt.toInstant() : null);
        return record;
    }
}
