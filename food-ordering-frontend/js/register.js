async function registerUser() {
  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  const respEl = document.getElementById("registerMessage");
  respEl.innerText = "";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{7,15}$/;

  if (!fullName || !email || !password) {
    respEl.innerText = "Please fill in all required fields.";
    return;
  }

  if (!emailRegex.test(email)) {
    respEl.innerText = "Please enter a valid email address.";
    return;
  }

  if (password.length < 6) {
    respEl.innerText = "Password must be at least 6 characters.";
    return;
  }

  if (phone && !phoneRegex.test(phone)) {
    respEl.innerText = "Please enter a valid phone number.";
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, phone, password }),
    });

    if (response.ok) {
      // remember pending email for OTP page
      localStorage.setItem("pendingEmail", email);
      window.location.href = "otp.html";
    } else if (response.status === 409) {
      respEl.innerText = "User already exists.";
    } else {
      const text = await response.text();
      respEl.innerText = "Registration error." + (text ? " " + text : "");
    }
  } catch (e) {
    respEl.innerText = "Registration failed: " + e.message;
  }
}
