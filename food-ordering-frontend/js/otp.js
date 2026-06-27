/**
 * SmartBite OTP Verification Page
 * Handles 6-digit OTP input with auto-focus and countdown
 */

const OTP_INPUT_IDS = ["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"];
let countdownInterval = null;

// Setup on page load
document.addEventListener("DOMContentLoaded", () => {
  // Load pending email
  const pendingEmail = localStorage.getItem("pendingEmail");
  if (pendingEmail) {
    document.getElementById("emailDisplay").textContent = pendingEmail;
  }

  // Setup OTP inputs with auto-focus and auto-submit
  setupOtpInputs(OTP_INPUT_IDS);

  // Prefill OTP in dev mode if available
  const pendingOtp = localStorage.getItem("pendingOtp");
  // Disable dev mode in production - set this to false for production builds
  const isDevMode = false;

  if (isDevMode && pendingOtp && pendingOtp.length === 6) {
    setOtpValue(OTP_INPUT_IDS, pendingOtp);
    showToast("OTP pre-filled for development mode.", "info");
    localStorage.removeItem("pendingOtp");
  }

  // Start countdown timer
  startCountdownTimer();

  // Focus first input
  setTimeout(() => {
    document.getElementById("otp1").focus();
  }, 100);
});

/**
 * Start countdown timer (60 seconds)
 */
function startCountdownTimer() {
  let timeRemaining = 60;

  const updateTimer = () => {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    const timerEl = document.getElementById("countdownTimer");
    if (timerEl) {
      timerEl.textContent = timeStr;
    }

    if (timeRemaining <= 0) {
      if (countdownInterval) clearInterval(countdownInterval);
      handleTimerExpired();
    }

    timeRemaining--;
  };

  updateTimer(); // Call immediately
  countdownInterval = setInterval(updateTimer, 1000);
}

/**
 * Handle timer expiration
 */
function handleTimerExpired() {
  showToast("OTP has expired. Please request a new one.", "warning");
  disableResendButton(false);
}

/**
 * Override setupOtpInputs to add auto-submit on 6th digit
 */
function setupOtpInputs(inputIds) {
  const inputs = inputIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  inputs.forEach((input, idx) => {
    input.addEventListener("input", (e) => {
      // Only allow numbers
      e.target.value = e.target.value.replace(/\D/g, "");

      // Only keep first digit
      if (e.target.value.length > 1) {
        e.target.value = e.target.value.slice(0, 1);
      }

      // Mark as filled
      if (e.target.value) {
        e.target.classList.add("filled");

        // Move to next input
        if (idx < inputs.length - 1) {
          inputs[idx + 1].focus();
        } else {
          // Auto-submit on 6th digit
          setTimeout(() => {
            if (checkOtpComplete(inputIds)) {
              verifyOtp();
            }
          }, 100);
        }
      } else {
        e.target.classList.remove("filled");
      }
    });

    input.addEventListener("keydown", (e) => {
      // Move to previous on backspace
      if (e.key === "Backspace") {
        if (!e.target.value && idx > 0) {
          inputs[idx - 1].focus();
          inputs[idx - 1].value = "";
          inputs[idx - 1].classList.remove("filled");
        }
      }

      // Handle paste
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        navigator.clipboard.read().then((items) => {
          items[0]
            .getType("text/plain")
            .stream()
            .then((stream) => {
              const text = stream.text();
              if (text) {
                const digits = text.replace(/\D/g, "").split("");
                digits.forEach((digit, i) => {
                  if (i < inputs.length) {
                    inputs[i].value = digit;
                    inputs[i].classList.add("filled");
                  }
                });
                if (digits.length === inputs.length) {
                  verifyOtp();
                }
              }
            });
        });
      }

      // Allow Enter to verify
      if (e.key === "Enter") {
        e.preventDefault();
        if (checkOtpComplete(inputIds)) {
          verifyOtp();
        }
      }
    });

    // Prevent copy/cut
    input.addEventListener("copy cut", (e) => {
      e.preventDefault();
    });
  });
}

/**
 * Change email function
 */
function changeEmail() {
  const confirmed = confirm("You will be redirected to sign up. Continue?");
  if (confirmed) {
    localStorage.removeItem("pendingEmail");
    window.location.href = "register.html";
  }
}

/**
 * Verify OTP function
 */
async function verifyOtp() {
  // Clear previous error
  const messageEl = document.getElementById("otpMessage");
  messageEl.innerText = "";
  messageEl.className = "";

  const pendingEmail = localStorage.getItem("pendingEmail");
  const email =
    document.getElementById("emailDisplay").textContent || pendingEmail;
  const otp = getOtpValue(OTP_INPUT_IDS);

  if (!email) {
    showToast("Email not found. Please sign up again.", "error");
    setTimeout(() => (window.location.href = "register.html"), 2000);
    return;
  }

  if (!otp || otp.length !== 6) {
    showToast("Please enter a 6-digit OTP", "warning");
    setOtpError(OTP_INPUT_IDS);
    return;
  }

  // Set loading state
  setButtonLoading("verifyBtn", true);
  showToast("Verifying OTP...", "info");

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (response.ok) {
      const data = await response.json();

      // Auto-login: store token and redirect
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.fullName);
        if (data.role) {
          localStorage.setItem("role", data.role);
        }
        localStorage.removeItem("pendingEmail");

        // Show success with animation
        showToast("Email verified successfully! Welcome! 🎉", "success");
        clearOtpInputs(OTP_INPUT_IDS);

        // Redirect after short delay
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
        return;
      }

      const errorMsg =
        "Verification succeeded but no token returned. Please try logging in.";
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");
    } else if (response.status === 400) {
      const errorMsg = "Invalid OTP. Please check and try again.";
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");
      setOtpError(OTP_INPUT_IDS);
      clearOtpInputs(OTP_INPUT_IDS);
    } else if (response.status === 429) {
      const errorMsg = "Too many attempts. Please try again later.";
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");
    } else {
      const text = await response.text();
      const errorMsg = text || "Verification failed. Please try again.";
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");
      setOtpError(OTP_INPUT_IDS);
    }
  } catch (e) {
    const errorMsg = `Verification error: ${e.message}`;
    messageEl.innerText = errorMsg;
    messageEl.className = "validation-message error show";
    showToast(errorMsg, "error");
  } finally {
    setButtonLoading("verifyBtn", false);
  }
}

/**
 * Resend OTP function
 */
async function resendOtp() {
  const email =
    document.getElementById("emailDisplay").textContent ||
    localStorage.getItem("pendingEmail");
  const messageEl = document.getElementById("otpMessage");

  messageEl.innerText = "";
  messageEl.className = "";

  if (!email) {
    showToast("Email not found. Please sign up again.", "error");
    return;
  }

  // Disable resend button
  disableResendButton(true);
  setButtonLoading("resendBtn", true);
  showToast("Sending new OTP...", "info");

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      const successMsg = "New OTP sent successfully! Check your email.";
      messageEl.innerText = successMsg;
      messageEl.className = "validation-message success show";
      showToast(successMsg, "success");

      // Reset countdown
      if (countdownInterval) clearInterval(countdownInterval);
      clearOtpInputs(OTP_INPUT_IDS);
      clearOtpError(OTP_INPUT_IDS);
      startCountdownTimer();
    } else if (response.status === 429) {
      const errorMsg =
        "Too many resend attempts. Please wait before trying again.";
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");
    } else {
      const text = await response.text();
      const errorMsg = text || "Could not resend OTP. Please try again.";
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");
    }
  } catch (e) {
    const errorMsg = `Resend failed: ${e.message}`;
    messageEl.innerText = errorMsg;
    messageEl.className = "validation-message error show";
    showToast(errorMsg, "error");
  } finally {
    setButtonLoading("resendBtn", false);
    disableResendButton(false);
  }
}

/**
 * Disable/enable resend button
 */
function disableResendButton(disable) {
  const resendBtn = document.getElementById("resendBtn");
  if (resendBtn) {
    resendBtn.disabled = disable;
    if (disable) {
      resendBtn.style.opacity = "0.6";
      resendBtn.style.cursor = "not-allowed";
    } else {
      resendBtn.style.opacity = "1";
      resendBtn.style.cursor = "pointer";
    }
  }
}

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (countdownInterval) clearInterval(countdownInterval);
});
