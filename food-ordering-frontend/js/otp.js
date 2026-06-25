document.addEventListener("DOMContentLoaded", () => {
  const pendingEmail = localStorage.getItem("pendingEmail");
  if (pendingEmail) {
    const emailInput = document.getElementById("otpEmail");
    if (emailInput) {
      emailInput.value = pendingEmail;
    }
  }
});

async function verifyOtp() {
  const pendingEmail = localStorage.getItem("pendingEmail");
  const emailInput = document.getElementById("otpEmail");
  const otpInput = document.getElementById("otpValue");
  const msg = document.getElementById("otpMessage");
  msg.innerText = "";

  const email = (emailInput.value || pendingEmail || "").trim();
  const otp = otpInput.value.trim();

  if (!email || !otp) {
    msg.innerText = "Please enter email and OTP.";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (response.ok) {
      const data = await response.json();
      // auto-login: store token and redirect
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.fullName);
        localStorage.setItem("role", data.role);
        localStorage.removeItem("pendingEmail");
        window.location.href = "dashboard.html";
        return;
      }

      msg.innerText = "Verification succeeded but no token returned.";
    } else {
      const text = await response.text();
      msg.innerText = "Verification failed." + (text ? " " + text : "");
    }
  } catch (e) {
    msg.innerText = "Verification error: " + e.message;
  }
}

async function resendOtp() {
  const email = (
    document.getElementById("otpEmail").value ||
    localStorage.getItem("pendingEmail") ||
    ""
  ).trim();
  const msg = document.getElementById("otpMessage");
  msg.innerText = "";

  if (!email) {
    msg.innerText = "Enter your email to resend OTP.";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      msg.innerText = "OTP resent successfully. Check your email.";
    } else {
      const text = await response.text();
      msg.innerText = "Could not resend OTP." + (text ? " " + text : "");
    }
  } catch (e) {
    msg.innerText = "Resend failed: " + e.message;
  }
}
