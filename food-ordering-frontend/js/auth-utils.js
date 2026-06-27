/**
 * SmartBite Authentication Utilities
 * Shared functions for all auth pages
 */

/* ============================================
   TOAST NOTIFICATIONS
============================================ */
function showToast(message, type = "info", duration = 4000) {
  const toast = document.getElementById("toast") || createToastElement();

  // Remove previous classes
  toast.className = "toast";

  // Add type class
  toast.classList.add(type, "show");

  // Set message
  toast.innerText = message;

  // Show toast
  toast.style.display = "block";

  // Auto hide
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => {
      toast.style.display = "none";
    }, 400);
  }, duration);
}

function createToastElement() {
  const toast = document.createElement("div");
  toast.id = "toast";
  document.body.appendChild(toast);
  return toast;
}

/* ============================================
   PASSWORD STRENGTH CALCULATION
============================================ */
function calculatePasswordStrength(password) {
  if (!password)
    return { strength: 0, level: "weak", text: "Password too short" };

  let strength = 0;

  // Length check
  if (password.length >= 6) strength += 1;
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;

  // Lowercase check
  if (/[a-z]/.test(password)) strength += 1;

  // Uppercase check
  if (/[A-Z]/.test(password)) strength += 1;

  // Number check
  if (/\d/.test(password)) strength += 1;

  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1;

  let level = "weak";
  let text = "Weak password";

  if (strength >= 5) {
    level = "strong";
    text = "Strong password";
  } else if (strength >= 3) {
    level = "medium";
    text = "Medium password";
  }

  return { strength: Math.min(strength, 7), level, text };
}

/* ============================================
   PASSWORD STRENGTH METER UI UPDATE
============================================ */
function updatePasswordStrengthMeter(inputId, meterId) {
  const input = document.getElementById(inputId);
  const meter = document.getElementById(meterId);

  if (!input || !meter) return;

  input.addEventListener("input", () => {
    const pwd = input.value;
    const { strength, level, text } = calculatePasswordStrength(pwd);

    // Update strength segments
    const segments = meter.querySelectorAll(".strength-segment");
    segments.forEach((seg, idx) => {
      seg.classList.remove("filled", "weak", "medium", "strong");
      if (idx < strength) {
        seg.classList.add("filled", level);
      }
    });

    // Update strength text
    const textEl = meter.querySelector(".strength-text");
    if (textEl) {
      textEl.textContent = text;
      textEl.className = `strength-text ${level}`;
    }
  });
}

/* ============================================
   PASSWORD VISIBILITY TOGGLE
============================================ */
function setupPasswordToggle(inputId, toggleBtnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(toggleBtnId);

  if (!input || !btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    btn.textContent = isPassword ? "👁️" : "👁️‍🗨️";
    btn.setAttribute(
      "aria-label",
      isPassword ? "Hide password" : "Show password",
    );
  });
}

/* ============================================
   FORM VALIDATION & ERROR DISPLAY
============================================ */
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.classList.add("error");
  input.classList.remove("success");

  // Find or create validation message
  let validationMsg = input.parentElement.querySelector(".validation-message");
  if (!validationMsg) {
    validationMsg = document.createElement("div");
    validationMsg.className = "validation-message error";
    input.parentElement.appendChild(validationMsg);
  }

  validationMsg.textContent = message;
  validationMsg.classList.add("show", "error");
  validationMsg.classList.remove("success");
}

function clearError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.classList.remove("error", "success");

  const validationMsg = input.parentElement.querySelector(
    ".validation-message",
  );
  if (validationMsg) {
    validationMsg.classList.remove("show");
    setTimeout(() => {
      validationMsg.remove();
    }, 300);
  }
}

function showSuccess(inputId, message = "") {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.classList.remove("error");
  input.classList.add("success");

  if (message) {
    let validationMsg = input.parentElement.querySelector(
      ".validation-message",
    );
    if (!validationMsg) {
      validationMsg = document.createElement("div");
      validationMsg.className = "validation-message success";
      input.parentElement.appendChild(validationMsg);
    }

    validationMsg.textContent = message;
    validationMsg.classList.add("show", "success");
    validationMsg.classList.remove("error");
  }
}

/* ============================================
   FORM VALIDATION HELPERS
============================================ */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^\d{7,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
}

function isValidPassword(password) {
  return password && password.length >= 6;
}

function validateEmail(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return false;

  const email = input.value.trim();

  if (!email) {
    showError(inputId, "Email is required");
    return false;
  }

  if (!isValidEmail(email)) {
    showError(inputId, "Please enter a valid email address");
    return false;
  }

  clearError(inputId);
  return true;
}

function validatePassword(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return false;

  const pwd = input.value;

  if (!pwd) {
    showError(inputId, "Password is required");
    return false;
  }

  if (pwd.length < 6) {
    showError(inputId, "Password must be at least 6 characters");
    return false;
  }

  clearError(inputId);
  return true;
}

function validatePasswordMatch(pwd1Id, pwd2Id) {
  const pwd1 = document.getElementById(pwd1Id)?.value || "";
  const pwd2 = document.getElementById(pwd2Id)?.value || "";

  if (!pwd2) {
    showError(pwd2Id, "Please confirm your password");
    return false;
  }

  if (pwd1 !== pwd2) {
    showError(pwd2Id, "Passwords do not match");
    return false;
  }

  clearError(pwd2Id);
  return true;
}

/* ============================================
   BUTTON LOADING STATE
============================================ */
function setButtonLoading(btnId, isLoading = true) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  if (isLoading) {
    btn.classList.add("loading");
    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
  } else {
    btn.classList.remove("loading");
    btn.disabled = false;
    btn.setAttribute("aria-busy", "false");
  }
}

/* ============================================
   OTP UTILITIES
============================================ */
function setupOtpInputs(inputIds) {
  const inputs = inputIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  inputs.forEach((input, idx) => {
    input.addEventListener("input", (e) => {
      // Only allow numbers
      e.target.value = e.target.value.replace(/\D/g, "");

      // Move to next input
      if (e.target.value && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }

      // Check if all filled
      checkOtpComplete(inputIds);
    });

    input.addEventListener("keydown", (e) => {
      // Move to previous on backspace
      if (e.key === "Backspace" && !e.target.value && idx > 0) {
        inputs[idx - 1].focus();
      }

      // Allow paste
      if (e.ctrlKey && e.key === "v") {
        e.preventDefault();
        // Handle paste in next event
        setTimeout(() => {
          handleOtpPaste(inputs, e);
        }, 0);
      }
    });
  });
}

function handleOtpPaste(inputs, e) {
  const pastedData = window.clipboardData?.getData("text") || "";
  if (pastedData) {
    const digits = pastedData.replace(/\D/g, "").split("");
    digits.forEach((digit, idx) => {
      if (idx < inputs.length) {
        inputs[idx].value = digit;
      }
    });
    checkOtpComplete(inputs.map((i) => i.id));
  }
}

function getOtpValue(inputIds) {
  return inputIds
    .map((id) => (document.getElementById(id)?.value || "").trim())
    .join("");
}

function setOtpValue(inputIds, value) {
  const digits = (value || "").replace(/\D/g, "").split("");
  inputIds.forEach((id, idx) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = digits[idx] || "";
      if (digits[idx]) {
        input.classList.add("filled");
      } else {
        input.classList.remove("filled");
      }
    }
  });
}

function checkOtpComplete(inputIds) {
  const otp = getOtpValue(inputIds);
  return otp.length === inputIds.length;
}

function clearOtpInputs(inputIds) {
  inputIds.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = "";
      input.classList.remove("filled", "error");
    }
  });
}

function setOtpError(inputIds) {
  inputIds.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.classList.add("error");
    }
  });
}

function clearOtpError(inputIds) {
  inputIds.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.classList.remove("error");
    }
  });
}

/* ============================================
   COUNTDOWN TIMER
============================================ */
function startCountdown(elementId, seconds = 60, onComplete = null) {
  let remaining = seconds;
  const element = document.getElementById(elementId);

  if (!element) return;

  const interval = setInterval(() => {
    remaining--;

    if (remaining <= 0) {
      clearInterval(interval);
      element.innerHTML = `<strong>00:00</strong>`;
      if (onComplete) onComplete();
    } else {
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      element.innerHTML = `<strong>${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}</strong>`;
    }
  }, 1000);

  return interval;
}

/* ============================================
   FORM SUBMISSION HELPERS
============================================ */
function disableFormInputs(formElement, disable = true) {
  const inputs = formElement.querySelectorAll(
    "input, button, textarea, select",
  );
  inputs.forEach((input) => {
    if (input.type !== "hidden") {
      input.disabled = disable;
    }
  });
}

function enableFormInputs(formElement) {
  disableFormInputs(formElement, false);
}

/* ============================================
   MODAL/ALERT HELPERS (Optional)
============================================ */
function showAlert(title, message, type = "info") {
  // Create simple alert (can be enhanced with modal library)
  const alertEl = document.createElement("div");
  alertEl.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 16px 48px rgba(45, 52, 54, 0.16);
    z-index: 10000;
    max-width: 400px;
    text-align: center;
  `;

  const titleEl = document.createElement("h3");
  titleEl.textContent = title;

  const msgEl = document.createElement("p");
  msgEl.textContent = message;

  const btn = document.createElement("button");
  btn.textContent = "OK";
  btn.className = "btn btn-primary";
  btn.onclick = () => {
    alertEl.remove();
    overlay.remove();
  };

  alertEl.appendChild(titleEl);
  alertEl.appendChild(msgEl);
  alertEl.appendChild(btn);

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
  `;
  overlay.onclick = () => {
    alertEl.remove();
    overlay.remove();
  };

  document.body.appendChild(overlay);
  document.body.appendChild(alertEl);
}

/* ============================================
   UTILITIES
============================================ */
function redirectTo(path) {
  window.location.href = path;
}

function getQueryParam(param) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(param);
}

function setQueryParam(param, value) {
  const params = new URLSearchParams(window.location.search);
  params.set(param, value);
  window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
}

/* Initialize on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
  // Ensure toast element exists
  if (!document.getElementById("toast")) {
    createToastElement();
  }
});
