package com.example.demo.service;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Properties;
import java.util.logging.Logger;

/**
 * DevMailSender - a dev-only JavaMailSender that logs messages instead of
 * delivering them. Activated when profile=dev and mail.dev.allow=true.
 */
@Service
@Profile("dev")
@ConditionalOnProperty(prefix = "mail.dev", name = "allow", havingValue = "true")
public class DevMailSender implements JavaMailSender {

    private static final Logger logger = Logger.getLogger(DevMailSender.class.getName());

    @Override
    public MimeMessage createMimeMessage() {
        return new MimeMessage(Session.getDefaultInstance(new Properties()));
    }

    @Override
    public MimeMessage createMimeMessage(java.io.InputStream contentStream) {
        try {
            return new MimeMessage(Session.getDefaultInstance(new Properties()), contentStream);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void send(MimeMessage mimeMessage) {
        logger.info("[DevMailSender] Pretending to send MimeMessage (dev stub). Subject: " + safeSubject(mimeMessage));
    }

    @Override
    public void send(MimeMessage... mimeMessages) {
        for (MimeMessage m : mimeMessages)
            send(m);
    }

    @Override
    public void send(SimpleMailMessage simpleMessage) {
        logger.info("[DevMailSender] Pretending to send email to: " + String.join(",", simpleMessage.getTo())
                + ", subject: " + simpleMessage.getSubject());
        logger.info("[DevMailSender] Email body:\n" + simpleMessage.getText());
    }

    @Override
    public void send(SimpleMailMessage... simpleMessages) {
        for (SimpleMailMessage m : simpleMessages)
            send(m);
    }

    private String safeSubject(MimeMessage m) {
        try {
            String s = m.getSubject();
            return s == null ? "(no subject)" : s;
        } catch (Exception e) {
            return "(error reading subject)";
        }
    }
}
