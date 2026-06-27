/**
 * SmartBite Reset Password Page
 * Handles password reset with OTP verification
 */

// Setup on page load
document.addEventListener("DOMContentLoaded", () => {
  // Setup password visibility toggles
  setupPasswordToggle("newPassword", "newPasswordToggle");
  setupPasswordToggle("confirmNewPassword", "confirmPasswordToggle");

  // Setup password strength meter
  updatePasswordStrengthMeter("newPassword", "passwordStrength");

  // Load reset email if available
  const resetEmail = localStorage.getItem("resetEmail");
  if (!resetEmail) {
    showToast("Please go through the forgot password flow first", "warning");
    setTimeout(() => (window.location.href = "forgot-password.html"), 2000);
  }

  // Real-time validation
  document.getElementById("resetOtp").addEventListener("blur", () => {
    validateOtp();
  });

  document.getElementById("newPassword").addEventListener("blur", () => {
    validatePassword("newPassword");
  });

  document
    .getElementById("confirmNewPassword")
    .addEventListener("input", () => {
      // Real-time password match check
      const pwd1 = document.getElementById("newPassword").value;
      const pwd2 = document.getElementById("confirmNewPassword").value;

      if (pwd2 && pwd1 !== pwd2) {
        showError("confirmNewPassword", "Passwords do not match");
      } else if (pwd2) {
        clearError("confirmNewPassword");
      }
    });
});

/**
 * Validate OTP
 */
function validateOtp() {
  const otp = document.getElementById("resetOtp").value.trim();

  if (!otp) {
    showError("resetOtp", "Verification code is required");
    return false;
  }

  if (otp.length !== 6) {
    showError("resetOtp", "Code must be 6 digits");
    return false;
  }

  if (!/^\d{6}$/.test(otp)) {
    showError("resetOtp", "Code must contain only numbers");
    return false;
  }

  clearError("resetOtp");
  return true;
}

/**
 * Reset password function
 */
async function resetPassword() {
  // Clear previous error
  const messageEl = document.getElementById("resetMessage");
  messageEl.innerText = "";
  messageEl.className = "";

  // Validate OTP
  if (!validateOtp()) {
    return;
  }

  // Validate new password
  if (!validatePassword("newPassword")) {
    return;
  }

  // Validate password match
  if (!validatePasswordMatch("newPassword", "confirmNewPassword")) {
    return;
  }

  const resetEmail = localStorage.getItem("resetEmail");
  if (!resetEmail) {
    const errorMsg = "Session expired. Please start over.";
    messageEl.innerText = errorMsg;
    messageEl.className = "validation-message error show";
    showToast(errorMsg, "error");
    setTimeout(() => (window.location.href = "forgot-password.html"), 2000);
    return;
  }

  const otp = document.getElementById("resetOtp").value.trim();
  const newPassword = document.getElementById("newPassword").value;

  // Set loading state
  setButtonLoading("resetBtn", true);
  showToast("Resetting your password...", "info");

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: resetEmail,
        otp,
        newPassword,
      }),
    });

    if (response.ok) {
      const successMsg = "Password reset successfully! Redirecting to login...";
      messageEl.innerText = successMsg;
      messageEl.className = "validation-message success show";
      showToast(successMsg, "success");

      // Clear stored email
      localStorage.removeItem("resetEmail");

      // Clear form
      clearFormInputs();

      // Redirect to login
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else if (response.status === 400) {
      const errorMsg =
        "Invalid verification code or password. Please try again.";
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");
      showError("resetOtp", "Invalid code");
    } else if (response.status === 404) {
      const errorMsg = "Email not found. Please sign up for a new account.";
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");
    } else if (response.status === 429) {
      const errorMsg = "Too many attempts. Please wait before trying again.";
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");
    } else {
      const errorText = await response.text();
      const errorMsg = errorText || "Password reset failed. Please try again.";
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");
    }
  } catch (e) {
    const errorMsg = `Error: ${e.message}`;
    messageEl.innerText = errorMsg;
    messageEl.className = "validation-message error show";
    showToast(errorMsg, "error");
  } finally {
    setButtonLoading("resetBtn", false);
  }
}

/**
 * Clear form inputs
 */
function clearFormInputs() {
  document.getElementById("resetOtp").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmNewPassword").value = "";

  clearError("resetOtp");
  clearError("newPassword");
  clearError("confirmNewPassword");
}
