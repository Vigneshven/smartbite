package com.example.demo.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.logging.Logger;

@Service
public class EmailService {

    private static final Logger logger = Logger.getLogger(EmailService.class.getName());

    @Value("${email.enabled:true}")
    private boolean emailEnabled;

    @Value("${email.dev.stub:false}")
    private boolean emailDevStub;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    private final List<EmailProvider> emailProviders;
    private EmailProvider activeProvider;
    private volatile boolean emailAvailable;
    private volatile boolean useDevStub;
    private volatile String lastEmailError;

    @Autowired
    public EmailService(List<EmailProvider> emailProviders) {
        this.emailProviders = emailProviders;
    }

    @PostConstruct
    public void initialize() {
        logger.info("[EmailService] Active profile: " + activeProfile);
        this.activeProvider = emailProviders.stream().findFirst().orElse(null);
        this.useDevStub = emailDevStub || "dev".equalsIgnoreCase(activeProfile);
        this.emailAvailable = emailEnabled && activeProvider != null && activeProvider.isAvailable();
        if (!emailEnabled) {
            this.lastEmailError = "Email delivery disabled by configuration.";
        } else if (activeProvider == null || !activeProvider.isAvailable()) {
            this.lastEmailError = "Email provider is not configured.";
        } else {
            this.lastEmailError = null;
        }
        logEmailServiceStatus();
    }

    public String sendOtpEmail(String toEmail, String otp) {
        if (!emailEnabled) {
            return "Email delivery is disabled by configuration.";
        }
        if (!emailAvailable || activeProvider == null) {
            return "Email service is unavailable: "
                    + (lastEmailError == null ? "Configuration or provider issue." : lastEmailError);
        }
        if (useDevStub) {
            logger.info("[EmailService] Dev email stub enabled for recipient " + toEmail);
            return null;
        }
        return activeProvider.sendOtpEmail(toEmail, otp, "REGISTER");
    }

    public String sendPasswordResetEmail(String toEmail, String otp) {
        if (!emailEnabled) {
            return "Email delivery is disabled by configuration.";
        }
        if (!emailAvailable || activeProvider == null) {
            return "Email service is unavailable: "
                    + (lastEmailError == null ? "Configuration or provider issue." : lastEmailError);
        }
        if (useDevStub) {
            logger.info("[EmailService] Dev email stub enabled for recipient " + toEmail);
            return null;
        }
        return activeProvider.sendOtpEmail(toEmail, otp, "FORGOT_PASSWORD");
    }

    public boolean isEmailServiceAvailable() {
        return emailAvailable;
    }

    public boolean isDevStub() {
        return useDevStub;
    }

    public void logEmailServiceStatus() {
        if (!emailEnabled) {
            logger.warning("[EmailService] Email sending is DISABLED (email.enabled=false)");
        } else if (!emailAvailable) {
            logger.warning("[EmailService] Email service is UNAVAILABLE: "
                    + (lastEmailError == null ? "unknown" : lastEmailError));
        } else {
            logger.info("[EmailService] Email service is properly configured and ready.");
        }
    }
}
