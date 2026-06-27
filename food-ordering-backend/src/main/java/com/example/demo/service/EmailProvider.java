package com.example.demo.service;

public interface EmailProvider {
    boolean isAvailable();

    String sendOtpEmail(String toEmail, String otp, String purpose);
}
