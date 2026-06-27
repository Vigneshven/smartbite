package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.logging.Logger;

@Service
@Profile("!dev")
public class SendGridEmailProvider implements EmailProvider {
    private static final Logger logger = Logger.getLogger(SendGridEmailProvider.class.getName());

    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    @Value("${sendgrid.api.key:}")
    private String apiKey;

    @Value("${sendgrid.api.url:https://api.sendgrid.com/v3/mail/send}")
    private String apiUrl;

    @Value("${email.from:}")
    private String fromEmail;

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank() && fromEmail != null && fromEmail.contains("@");
    }

    @Override
    public String sendOtpEmail(String toEmail, String otp, String purpose) {
        if (!isAvailable()) {
            return "Email provider not configured";
        }
        String subject = "SmartBite OTP";
        String body = "Your SmartBite OTP is " + otp + " for " + purpose.toLowerCase().replace("_", " ") + ".";
        String payload = "{\"personalizations\":[{\"to\":[{\"email\":\"" + escapeJson(toEmail)
                + "\"}]}],\"from\":{\"email\":\"" + escapeJson(fromEmail) + "\"},\"subject\":\"" + escapeJson(subject)
                + "\",\"content\":[{\"type\":\"text/plain\",\"value\":\"" + escapeJson(body) + "\"}]}";
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 202 || response.statusCode() == 200) {
                logger.info("OTP email sent via SendGrid to " + toEmail);
                return null;
            }
            return "SendGrid HTTP " + response.statusCode();
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            return e.getMessage();
        }
    }

    private String escapeJson(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
