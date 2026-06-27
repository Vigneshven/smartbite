package com.example.demo.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

@Service
@Profile("dev")
public class DevEmailProvider implements EmailProvider {
    private static final Logger logger = Logger.getLogger(DevEmailProvider.class.getName());

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public String sendOtpEmail(String toEmail, String otp, String purpose) {
        logger.info("[DEV EMAIL] OTP for " + purpose + " sent to " + toEmail + ": " + otp);
        return null;
    }
}
