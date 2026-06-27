package com.example.demo.service;

/**
 * Result object for OTP email send operations.
 */
public class OtpSendResult {

    private final boolean emailSent;
    private final String errorMessage;
    private final String otp;

    public OtpSendResult(boolean emailSent, String errorMessage) {
        this(emailSent, errorMessage, null);
    }

    public OtpSendResult(boolean emailSent, String errorMessage, String otp) {
        this.emailSent = emailSent;
        this.errorMessage = errorMessage;
        this.otp = otp;
    }

    public boolean isEmailSent() {
        return emailSent;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public String getOtp() {
        return otp;
    }

    public boolean isSuccess() {
        return emailSent;
    }
}
