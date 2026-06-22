function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// Load user details on every page
document.addEventListener("DOMContentLoaded", function () {
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const phone = localStorage.getItem("phone");

  // Navbar username
  const userElement = document.getElementById("username");
  if (userElement && username) {
    userElement.innerText = username;
  }

  // Profile dropdown
  const profileName = document.getElementById("profileName");
  if (profileName && username) {
    profileName.innerText = username;
  }

  const profileEmail = document.getElementById("profileEmail");
  if (profileEmail && email) {
    profileEmail.innerText = email;
  }

  const profilePhone = document.getElementById("profilePhone");
  if (profilePhone && phone) {
    profilePhone.innerText = phone;
  }
});

// Profile dropdown
function toggleProfileMenu() {
  const dropdown = document.getElementById("profileDropdown");

  if (dropdown) {
    dropdown.classList.toggle("show");
  }
}

// Close dropdown when clicking outside
window.addEventListener("click", function (event) {
  const menu = document.querySelector(".profile-menu");

  if (menu && !menu.contains(event.target)) {
    const dropdown = document.getElementById("profileDropdown");

    if (dropdown) {
      dropdown.classList.remove("show");
    }
  }
});

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.innerText = message;

  toast.className = "toast";

  toast.classList.add(type);

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function viewFood(foodId) {
  localStorage.setItem("foodId", foodId);

  window.location.href = "food-details.html";
}

function logout() {
  localStorage.clear();

  window.location.href = "login.html";
}
