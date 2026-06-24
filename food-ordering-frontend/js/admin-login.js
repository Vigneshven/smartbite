async function adminLogin() {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  const response = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  try {
    if (response.ok) {
      const data = await response.json();
      const normalizedRole = data.role
        ? data.role.replace(/^ROLE_/i, "").toUpperCase()
        : "";

      if (normalizedRole !== "ADMIN") {
        document.getElementById("adminMessage").innerText =
          "You are not authorized to access admin pages.";
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.fullName);
      localStorage.setItem("role", normalizedRole);

      window.location.href = "admin-dashboard.html";
    } else {
      const errorText = await response.text();
      document.getElementById("adminMessage").innerText =
        "Login failed." + (errorText ? " " + errorText : "");
    }
  } catch (error) {
    document.getElementById("adminMessage").innerText =
      "Login failed: " + error.message;
  }
}
