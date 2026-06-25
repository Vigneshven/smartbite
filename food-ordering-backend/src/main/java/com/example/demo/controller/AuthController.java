package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.LoginRequest;
import com.example.demo.model.LoginResponse;
import com.example.demo.model.OtpRequest;
import com.example.demo.service.OtpService;
import com.example.demo.dao.UserDAO;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    UserService userService;

    @Autowired
    OtpService otpService;

    @Autowired
    UserDAO userDAO;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        LoginResponse response = userService.login(request);

        if (response == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerWithOtp(@RequestBody com.example.demo.model.User user) {

        // simple validation
        if (user.getEmail() == null || user.getPassword() == null || user.getFullName() == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        // check if already exists
        if (userDAO.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists");
        }

        // store pending and send OTP
        otpService.createPending(user);
        otpService.sendOtp(user.getEmail());

        return ResponseEntity.ok("OTP sent to email (simulated)");
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestBody OtpRequest request) {
        if (request.getEmail() == null) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        if (!otpService.hasPendingUser(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No pending registration found for this email");
        }

        otpService.sendOtp(request.getEmail());
        return ResponseEntity.ok("OTP resent to email (simulated)");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<LoginResponse> verifyOtp(@RequestBody OtpRequest request) {

        if (request.getEmail() == null || request.getOtp() == null) {
            return ResponseEntity.badRequest().build();
        }

        boolean ok = otpService.verifyOtp(request.getEmail(), request.getOtp());

        if (!ok) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        com.example.demo.model.User pending = otpService.getPendingUser(request.getEmail());
        if (pending == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        // preserve raw password before registration encodes it
        String rawPassword = pending.getPassword();

        // finalize registration
        int result = userService.register(pending);
        if (result <= 0) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        // fetch created user and return LoginResponse (auto-login)
        com.example.demo.model.User created = userDAO.findByEmail(pending.getEmail());

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(pending.getEmail());
        loginRequest.setPassword(rawPassword);

        LoginResponse loginResponse = userService.login(loginRequest);
        if (loginResponse == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        LoginResponse resp = new LoginResponse();
        resp.setToken(loginResponse.getToken());
        resp.setUserId(loginResponse.getUserId());
        resp.setFullName(loginResponse.getFullName());
        resp.setRole(loginResponse.getRole());

        if (created != null) {
            String role = created.getRole();
            if (role != null && role.startsWith("ROLE_")) {
                role = role.substring(5);
            }
            resp.setRole(role);
        }

        otpService.removePending(request.getEmail());

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/user/{userId}")
    public User getUser(
            @PathVariable int userId) {

        return userService.getUserById(userId);
    }
}