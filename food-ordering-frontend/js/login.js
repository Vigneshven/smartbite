/**
 * SmartBite Login Page
 * Handles user authentication with modern UX
 */

// Setup on page load
document.addEventListener("DOMContentLoaded", () => {
  // Setup password visibility toggle
  setupPasswordToggle("password", "passwordToggle");

  // Setup form submission with Enter key
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");

  [emailInput, passwordInput].forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        login();
      }
    });
  });

  // Real-time validation
  emailInput.addEventListener("blur", () => validateEmail("email"));
  passwordInput.addEventListener("blur", () => validatePassword("password"));
});

/**
 * Login function
 * Validates inputs and sends login request
 */
async function login() {
  // Clear previous error
  const messageEl = document.getElementById("message");
  messageEl.innerText = "";
  messageEl.className = "";

  // Validate inputs
  if (!validateEmail("email")) {
    return;
  }

  if (!validatePassword("password")) {
    return;
  }

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  // Set loading state
  setButtonLoading("loginBtn", true);
  showToast("Logging in...", "info");

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      // Store auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.fullName);
      if (data.role) {
        localStorage.setItem("role", data.role);
      }

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("rememberedEmail");
      }

      // Show success toast
      showToast("Login successful! Redirecting...", "success");

      // Clear form
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
      clearError("email");
      clearError("password");

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    } else {
      const errorText = await response.text();
      let errorMsg = "Login failed. Please check your credentials.";

      if (response.status === 401) {
        errorMsg = "Invalid email or password";
      } else if (response.status === 404) {
        errorMsg = "User not found";
      } else if (response.status === 429) {
        errorMsg = "Too many login attempts. Please try again later.";
      }

      // Show error
      messageEl.innerText = errorMsg;
      messageEl.className = "validation-message error show";
      showToast(errorMsg, "error");

      // Add error styling to password field
      showError("password", "");

      // Clear password for security
      document.getElementById("password").value = "";
    }
  } catch (e) {
    const errorMsg = `Login error: ${e.message}`;
    messageEl.innerText = errorMsg;
    messageEl.className = "validation-message error show";
    showToast(errorMsg, "error");
  } finally {
    // Reset loading state
    setButtonLoading("loginBtn", false);
  }
}

// Restore remembered email on page load
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("rememberMe") === "true") {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      document.getElementById("email").value = rememberedEmail;
      document.getElementById("rememberMe").checked = true;
      // Focus on password field
      document.getElementById("password").focus();
    }
  }
});
