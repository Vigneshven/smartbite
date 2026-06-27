package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.ErrorResponse;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.LoginRequest;
import com.example.demo.model.LoginResponse;
import com.example.demo.model.OtpRequest;
import com.example.demo.service.EmailService;
import com.example.demo.service.OtpService;
import com.example.demo.service.OtpSendResult;
import com.example.demo.service.RateLimitService;
import com.example.demo.dao.UserDAO;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.logging.Logger;
import java.util.logging.Level;

/**
 * AuthController - Handles user authentication, registration, and password
 * reset
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private static final Logger logger = Logger.getLogger(AuthController.class.getName());

    @Autowired
    UserService userService;

    @Autowired
    EmailService emailService;

    @Autowired
    OtpService otpService;

    @Autowired
    UserDAO userDAO;

    @Autowired
    RateLimitService rateLimitService;

    /**
     * User login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        if (request == null || request.getEmail() == null || request.getPassword() == null
                || request.getEmail().trim().isEmpty() || request.getPassword().trim().isEmpty()) {
            logger.warning("[AuthController] Login failed: missing email or password");
            return ResponseEntity.badRequest().build();
        }

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        request.setEmail(email);

        ResponseEntity<?> rateLimited = enforceRateLimit("/api/auth/login", email);
        if (rateLimited != null) {
            return (ResponseEntity<LoginResponse>) rateLimited;
        }

        logger.info("[AuthController] Login attempt for: " + email);

        LoginResponse response = userService.login(request);

        if (response == null) {
            logger.warning("[AuthController] Login failed for: " + email);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        logger.info("[AuthController] Login successful for: " + email);
        return ResponseEntity.ok(response);
    }

    /**
     * User registration - sends OTP to email
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerWithOtp(@RequestBody com.example.demo.model.User user) {

        logger.info("[AuthController] Registration attempt for: " + (user != null ? user.getEmail() : "null"));

        // Validate input
        if (user == null || user.getEmail() == null || user.getPassword() == null || user.getFullName() == null) {
            logger.warning("[AuthController] Registration failed: missing required fields");
            return ResponseEntity.badRequest().body("Missing required fields (email, password, fullName)");
        }

        String email = user.getEmail().trim().toLowerCase(Locale.ROOT);
        user.setEmail(email);

        ResponseEntity<?> rateLimited = enforceRateLimit("/api/auth/register", email);
        if (rateLimited != null) {
            return rateLimited;
        }

        logger.info("[AuthController] Validating registration for: " + email);

        // Check if user already exists
        if (userDAO.findByEmail(email) != null) {
            logger.warning("[AuthController] Registration failed: user already exists - " + email);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("User already exists with this email", 409));
        }

        if (otpService.hasPendingUser(email)) {
            logger.warning("[AuthController] Registration failed: pending registration exists - " + email);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(
                            "A registration is already pending for this email. Please verify the OTP or request a new one.",
                            409));
        }

        // Validate email format
        if (!isValidEmail(email)) {
            logger.warning("[AuthController] Registration failed: invalid email format - " + email);
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Invalid email format", 400));
        }

        // Validate password length
        if (user.getPassword().length() < 6) {
            logger.warning("[AuthController] Registration failed: password too short - " + email);
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Password must be at least 6 characters", 400));
        }

        try {
            if (!emailService.isEmailServiceAvailable()) {
                logger.severe("[AuthController] Email service is not available for registration.");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body("Email service is unavailable. Registration cannot be completed at this time.");
            }

            // Store pending user before sending OTP so user exists when verification begins
            logger.info("[AuthController] Creating pending user: " + email);
            otpService.createPending(user);

            // Send OTP email
            logger.info("[AuthController] Sending OTP email to: " + email);
            OtpSendResult result = otpService.sendOtp(email);

            if (result == null) {
                logger.severe("[AuthController] OTP result was null for: " + email);
                otpService.removePending(email);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Registration failed due to an unexpected server error.");
            }

            if (result.isSuccess()) {
                logger.info("[AuthController] OTP successfully sent to: " + email);
                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("message", "OTP sent to email. Please verify your email address.");
                if (result.getOtp() != null) {
                    responseBody.put("otp", result.getOtp());
                    responseBody.put("devMode", true);
                }
                return ResponseEntity.ok(responseBody);
            }

            logger.warning("[AuthController] OTP send failed for: " + email + ". Reason: " + result.getErrorMessage());
            otpService.removePending(email);
            Map<String, String> errorBody = new HashMap<>();
            errorBody.put("message", "Email delivery failed: " + result.getErrorMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(errorBody);

        } catch (Exception e) {
            logger.log(Level.SEVERE, "[AuthController] Exception during registration for " + email, e);
            otpService.removePending(email);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Registration failed: " + e.getMessage());
        }
    }

    /**
     * Resend OTP during registration
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestBody OtpRequest request) {

        logger.info("[AuthController] Resend OTP attempt for: " + request.getEmail());

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            logger.warning("[AuthController] Resend OTP failed: email is required");
            return ResponseEntity.badRequest().body("Email is required");
        }

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        ResponseEntity<?> rateLimited = enforceRateLimit("/api/auth/resend-otp", email);
        if (rateLimited != null) {
            return (ResponseEntity<String>) rateLimited;
        }

        if (!otpService.hasPendingUser(email)) {
            logger.warning("[AuthController] Resend OTP failed: no pending registration found - " + email);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("No pending registration found for this email. Please register first.");
        }

        try {
            logger.info("[AuthController] Resending OTP to: " + email);
            OtpSendResult result = otpService.sendOtp(email);

            if (result == null) {
                logger.severe("[AuthController] OTP result was null for resend: " + email);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to resend OTP email. Please try again later.");
            }

            if (result.isSuccess()) {
                logger.info("[AuthController] OTP resent successfully to: " + email);
                return ResponseEntity.ok("OTP has been resent to your email. Please check your inbox.");
            }

            logger.severe("[AuthController] Failed to resend OTP to: " + email + ". " + result.getErrorMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to resend OTP email. Please try again later.");

        } catch (Exception e) {
            logger.log(Level.SEVERE, "[AuthController] Exception while resending OTP to " + email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Resend failed: " + e.getMessage());
        }
    }

    /**
     * Verify OTP and complete registration
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpRequest request) {

        logger.info("[AuthController] OTP verification attempt for: " + request.getEmail());

        if (request.getEmail() == null || request.getOtp() == null) {
            logger.warning("[AuthController] OTP verification failed: missing email or otp");
            return ResponseEntity.badRequest().body("Email and OTP are required");
        }

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String otp = request.getOtp().trim();

        ResponseEntity<?> rateLimited = enforceRateLimit("/api/auth/verify-otp", email);
        if (rateLimited != null) {
            return rateLimited;
        }

        if (!otpService.hasPendingUser(email)) {
            logger.warning("[AuthController] OTP verification failed: no pending registration - " + email);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("No pending registration found for this email.");
        }

        logger.info("[AuthController] Verifying OTP for: " + email);
        boolean isValid = otpService.verifyOtp(email, otp);

        if (!isValid) {
            logger.warning("[AuthController] OTP verification failed: invalid OTP - " + email);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid or expired OTP. Please request a new code.");
        }

        com.example.demo.model.User pending = otpService.getPendingUser(email);
        if (pending == null) {
            logger.warning("[AuthController] OTP verification failed: no pending user - " + email);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("No pending registration found.");
        }

        try {
            // Preserve raw password
            String rawPassword = pending.getPassword();

            // Finalize registration
            logger.info("[AuthController] Completing registration for: " + email);
            int result = userService.register(pending);

            if (result <= 0) {
                logger.severe("[AuthController] Registration failed: database error - " + email);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to create account. Please try again.");
            }

            // Auto-login user
            logger.info("[AuthController] Auto-logging in user: " + email);
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setEmail(email);
            loginRequest.setPassword(rawPassword);

            LoginResponse loginResponse = userService.login(loginRequest);
            if (loginResponse == null) {
                logger.severe("[AuthController] Auto-login failed for: " + email);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Account created but login failed.");
            }

            LoginResponse resp = new LoginResponse();
            resp.setToken(loginResponse.getToken());
            resp.setUserId(loginResponse.getUserId());
            resp.setFullName(loginResponse.getFullName());
            resp.setRole(loginResponse.getRole());

            com.example.demo.model.User created = userDAO.findByEmail(email);
            if (created != null) {
                String role = created.getRole();
                if (role != null && role.startsWith("ROLE_")) {
                    role = role.substring(5);
                }
                resp.setRole(role);
            }

            // Clean up
            otpService.removePending(email);

            logger.info("[AuthController] Registration and verification successful for: " + email);
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            logger.log(Level.SEVERE, "[AuthController] Exception during OTP verification for " + email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Verification failed: " + e.getMessage());
        }
    }

    /**
     * Request password reset - sends OTP to email
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody OtpRequest request) {

        logger.info("[AuthController] Forgot password request for: " + request.getEmail());

        if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            logger.warning("[AuthController] Forgot password failed: email is required");
            return ResponseEntity.badRequest().body("Email is required");
        }

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        ResponseEntity<?> rateLimited = enforceRateLimit("/api/auth/forgot-password", email);
        if (rateLimited != null) {
            return (ResponseEntity<String>) rateLimited;
        }

        // Check if user exists
        com.example.demo.model.User existingUser = userDAO.findByEmail(email);
        if (existingUser == null) {
            logger.warning("[AuthController] Forgot password failed: user not found - " + email);
            // Don't reveal if user exists for security
            return ResponseEntity.ok("If an account exists with this email, a reset code has been sent.");
        }

        try {
            logger.info("[AuthController] Sending password reset OTP to: " + email);
            OtpSendResult result = otpService.sendPasswordResetOtp(email);

            if (!result.isSuccess()) {
                logger.severe("[AuthController] Failed to send password reset OTP to: " + email + ". "
                        + result.getErrorMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to send reset code email: " + result.getErrorMessage());
            }

            logger.info("[AuthController] Password reset OTP sent successfully to: " + email);
            return ResponseEntity.ok("If an account exists with this email, a reset code has been sent.");

        } catch (Exception e) {
            logger.log(Level.SEVERE, "[AuthController] Exception during forgot password for " + email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Request failed: " + e.getMessage());
        }
    }

    /**
     * Reset password with OTP verification
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody PasswordResetRequest request) {

        logger.info("[AuthController] Password reset attempt for: " + request.getEmail());

        if (request == null || request.getEmail() == null || request.getOtp() == null
                || request.getNewPassword() == null
                || request.getEmail().trim().isEmpty() || request.getOtp().trim().isEmpty()
                || request.getNewPassword().trim().isEmpty()) {
            logger.warning("[AuthController] Password reset failed: missing required fields");
            return ResponseEntity.badRequest().body("Email, OTP, and new password are required");
        }

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String otp = request.getOtp().trim();
        String newPassword = request.getNewPassword();

        ResponseEntity<?> rateLimited = enforceRateLimit("/api/auth/reset-password", email);
        if (rateLimited != null) {
            return (ResponseEntity<String>) rateLimited;
        }

        // Validate new password
        if (newPassword.length() < 6) {
            logger.warning("[AuthController] Password reset failed: new password too short - " + email);
            return ResponseEntity.badRequest().body("New password must be at least 6 characters");
        }

        try {
            // Verify OTP for password reset
            logger.info("[AuthController] Verifying password reset OTP for: " + email);
            boolean isValid = otpService.verifyPasswordResetOtp(email, otp);

            if (!isValid) {
                logger.warning("[AuthController] Password reset failed: invalid OTP - " + email);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid reset code. Please request a new one.");
            }

            // Get user
            com.example.demo.model.User user = userDAO.findByEmail(email);
            if (user == null) {
                logger.warning("[AuthController] Password reset failed: user not found - " + email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            // Update password
            logger.info("[AuthController] Updating password for: " + email);
            user.setPassword(newPassword);
            userService.updateUser(user);

            logger.info("[AuthController] Password reset successful for: " + email);
            return ResponseEntity.ok("Password has been reset successfully. Please login with your new password.");

        } catch (Exception e) {
            logger.log(Level.SEVERE, "[AuthController] Exception during password reset for " + email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Password reset failed: " + e.getMessage());
        }
    }

    /**
     * Get user by ID
     */
    @GetMapping("/user/{userId}")
    public User getUser(
            @PathVariable int userId) {

        logger.info("[AuthController] Fetching user by ID: " + userId);
        return userService.getUserById(userId);
    }

    private ResponseEntity<?> enforceRateLimit(String endpoint, String clientKey) {
        if (!rateLimitService.allowRequest(endpoint, clientKey)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many requests. Please wait a moment and try again.");
        }
        return null;
    }

    /**
     * Validate email format
     */
    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email.matches(emailRegex);
    }

    /**
     * Inner class for password reset request
     */
    public static class PasswordResetRequest {
        private String email;
        private String otp;
        private String newPassword;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getOtp() {
            return otp;
        }

        public void setOtp(String otp) {
            this.otp = otp;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}