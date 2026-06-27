/**
 * SmartBite Forgot Password Page
 * Handles password reset OTP request
 */

// Setup on page load
document.addEventListener("DOMContentLoaded", () => {
  // Setup form submission with Enter key
  const emailInput = document.getElementById("resetEmail");
  const sendOtpBtn = document.getElementById("sendOtpBtn");

  emailInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendResetOtp();
    }
  });

  // Real-time validation
  emailInput.addEventListener("blur", () => validateEmail("resetEmail"));
});

/**
 * Send reset OTP
 */
async function sendResetOtp() {
  // Clear previous error
  const messageEl = document.getElementById("resetMessage");
  messageEl.innerText = "";
  messageEl.className = "";

  // Validate email
  if (!validateEmail("resetEmail")) {
    return;
  }

  const email = document.getElementById("resetEmail").value.trim();

  // Set loading state
  setButtonLoading("sendOtpBtn", true);
  showToast("Sending reset code...", "info");

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      // Store email for next step
      localStorage.setItem("resetEmail", email);

      const successMsg = "Reset code sent successfully! Check your email.";
      messageEl.innerText = successMsg;
      messageEl.className = "validation-message success show";
      showToast(successMsg, "success");

      // Show success state
      const btn = document.getElementById("sendOtpBtn");
      btn.textContent = "✓ Code Sent";
      btn.disabled = true;

      // Redirect to reset password page after delay
      setTimeout(() => {
        window.location.href = "reset-password.html";
      }, 2000);
    } else if (response.status === 404) {
      const errorMsg =
        "Email not found. Please check or sign up for a new account.";
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");
      showError("resetEmail", "Email not found");
    } else if (response.status === 429) {
      const errorMsg =
        "Too many requests. Please wait a few minutes before trying again.";
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");
    } else {
      const errorText = await response.text();
      const errorMsg =
        errorText || "Failed to send reset code. Please try again.";
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
    setButtonLoading("sendOtpBtn", false);
  }
}
