package com.example.demo.service;

import com.example.demo.model.User;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final Map<String, String> otpStore = new ConcurrentHashMap<>();
    private final Map<String, User> pendingUsers = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public void createPending(User user) {
        pendingUsers.put(user.getEmail(), user);
    }

    public User getPendingUser(String email) {
        return pendingUsers.get(email);
    }

    public boolean hasPendingUser(String email) {
        return pendingUsers.containsKey(email);
    }

    public void removePending(String email) {
        pendingUsers.remove(email);
        otpStore.remove(email);
    }

    public String sendOtp(String email) {
        String otp = String.format("%04d", random.nextInt(10000));
        otpStore.put(email, otp);

        // Simulate sending OTP - in real app integrate SMS/Email provider
        System.out.println("[OtpService] OTP for " + email + " is: " + otp);

        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        String expected = otpStore.get(email);
        if (expected == null)
            return false;
        boolean ok = expected.equals(otp);
        if (ok) {
            // once verified remove it
            otpStore.remove(email);
        }
        return ok;
    }
}
