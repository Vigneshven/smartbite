/**
 * SmartBite Register Page
 * Handles user registration with validation and modern UX
 */

// Setup on page load
document.addEventListener("DOMContentLoaded", () => {
  // Setup password visibility toggles
  setupPasswordToggle("password", "passwordToggle");
  setupPasswordToggle("confirmPassword", "confirmPasswordToggle");

  // Setup password strength meter
  updatePasswordStrengthMeter("password", "passwordStrength");

  // Setup form submission with Enter key
  const form = document.querySelector("form") || document.body;
  const registerBtn = document.getElementById("registerBtn");

  registerBtn.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      registerUser();
    }
  });

  // Real-time validation
  document.getElementById("fullName").addEventListener("blur", () => {
    validateFullName();
  });

  document.getElementById("email").addEventListener("blur", () => {
    validateEmail("email");
  });

  document.getElementById("phone").addEventListener("blur", () => {
    const phone = document.getElementById("phone").value.trim();
    if (phone && !isValidPhone(phone)) {
      showError("phone", "Please enter a valid phone number");
    } else {
      clearError("phone");
    }
  });

  document.getElementById("password").addEventListener("blur", () => {
    validatePassword("password");
  });

  document.getElementById("confirmPassword").addEventListener("input", () => {
    // Real-time password match check
    const pwd1 = document.getElementById("password").value;
    const pwd2 = document.getElementById("confirmPassword").value;

    if (pwd2 && pwd1 !== pwd2) {
      showError("confirmPassword", "Passwords do not match");
    } else if (pwd2) {
      clearError("confirmPassword");
    }
  });
});

/**
 * Validate full name
 */
function validateFullName() {
  const fullName = document.getElementById("fullName").value.trim();

  if (!fullName) {
    showError("fullName", "Full name is required");
    return false;
  }

  if (fullName.length < 2) {
    showError("fullName", "Name must be at least 2 characters");
    return false;
  }

  if (fullName.length > 50) {
    showError("fullName", "Name must be less than 50 characters");
    return false;
  }

  clearError("fullName");
  return true;
}

/**
 * Register user function
 * Validates all inputs and sends registration request
 */
async function registerUser() {
  // Clear previous error
  const messageEl = document.getElementById("registerMessage");
  messageEl.innerText = "";
  messageEl.className = "";

  // Validate all fields
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const termsAccepted = document.getElementById("termsCheckbox").checked;

  // Validate full name
  if (!validateFullName()) {
    return;
  }

  // Validate email
  if (!validateEmail("email")) {
    return;
  }

  // Validate password
  if (!validatePassword("password")) {
    return;
  }

  // Validate password match
  if (!validatePasswordMatch("password", "confirmPassword")) {
    return;
  }

  // Validate phone (if provided)
  if (phone && !isValidPhone(phone)) {
    showError("phone", "Please enter a valid phone number");
    return;
  }

  // Validate terms accepted
  if (!termsAccepted) {
    showToast("Please accept the Terms & Conditions to continue", "warning");
    document.getElementById("termsCheckbox").focus();
    return;
  }

  // Set loading state
  setButtonLoading("registerBtn", true);
  showToast("Creating your account...", "info");

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        phone: phone || null,
        password,
      }),
    });

    let resultData = null;
    try {
      resultData = await response.json();
    } catch (_) {
      // ignore invalid JSON if backend returns plain text
    }

    if (response.ok) {
      localStorage.setItem("pendingEmail", email);
      if (resultData?.otp) {
        localStorage.setItem("pendingOtp", resultData.otp);
        showToast(
          `OTP created in development mode: ${resultData.otp}`,
          "success",
        );
      } else {
        showToast("OTP has been sent to your email.", "success");
      }
      clearFormInputs();
      setTimeout(() => {
        window.location.href = "otp.html";
      }, 500);
    } else if (response.status === 409) {
      const errorMsg =
        (resultData && resultData.message) ||
        "This email is already registered. Please login or use a different email.";
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");
      showError("email", "Email already in use");
    } else {
      const errorMsg =
        (resultData && resultData.message) ||
        "Registration failed. Please try again.";
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");
    }
  } catch (e) {
    const errorMsg = "Registration failed. Please try again.";
    messageEl.innerText = errorMsg;
    messageEl.className = "validation-message error show";
    showToast(errorMsg, "error");
  } finally {
    setButtonLoading("registerBtn", false);
  }
}

/**
 * Clear form inputs
 */
function clearFormInputs() {
  document.getElementById("fullName").value = "";
  document.getElementById("email").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("password").value = "";
  document.getElementById("confirmPassword").value = "";
  document.getElementById("termsCheckbox").checked = false;

  clearError("fullName");
  clearError("email");
  clearError("phone");
  clearError("password");
  clearError("confirmPassword");
}
