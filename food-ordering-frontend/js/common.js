const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "" ||
  window.location.protocol === "file:"
    ? "http://localhost:8080"
    : "https://smartbite-api-prod.onrender.com";

const NAV_LINKS = [
  { text: "Home", href: "index.html" },
  { text: "Dashboard", href: "dashboard.html" },
  { text: "Restaurants", href: "restaurants.html" },
  { text: "Menu", href: "foods.html" },
  { text: "Cart", href: "cart.html" },
  { text: "Wishlist", href: "favorites.html" },
  { text: "My Orders", href: "orders.html" },
];

function isLoggedIn() {
  return !!localStorage.getItem("token");
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function renderNavbar() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  const username = localStorage.getItem("username") || "Guest";
  const links = NAV_LINKS.map(
    (link) => `<a href="${link.href}">${link.text}</a>`,
  ).join("");

  const isHomePage =
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname === "";

  const searchInput = `<input type="search" id="globalSearch" placeholder="🔍 Search..." />`;
  const ctaButton = isHomePage
    ? `<button class="profile-btn btn-primary" onclick="location.href='foods.html'">Order Now</button>`
    : "";

  let rightContent = "";
  let centerContent = isHomePage ? links : `${links}${searchInput}`;

  const darkLabel = document.body.classList.contains("dark-mode")
    ? "☀️ Light"
    : "🌙 Dark";

  if (isLoggedIn()) {
    const role = (localStorage.getItem("role") || "").toUpperCase();

    rightContent = `
      ${ctaButton}
      <button id="darkModeToggle" class="profile-btn btn-secondary" onclick="toggleDarkMode()">${darkLabel}</button>
      <div class="profile-menu">
        <button class="profile-btn" onclick="toggleProfileMenu()">
          👤 <span id="username">${username}</span> ▼
        </button>
        <div class="profile-dropdown" id="profileDropdown">
          <div class="profile-header">
            <h3 id="profileName">${username}</h3>
            <p id="profileEmail"></p>
            <p id="profilePhone"></p>
          </div>
          <button onclick="location.href='profile.html'">👤 My Profile</button>
          ${role === "ADMIN" ? '<button id="adminDashboardBtn" onclick="location.href=\'admin-dashboard.html\'">🛠 Admin Dashboard</button>' : ""}
          <button onclick="location.href='dashboard.html'">🏠 Dashboard</button>
          <button onclick="location.href='restaurants.html'">🍽 Restaurants</button>
          <button onclick="location.href='foods.html'">🍔 Menu</button>
          <button onclick="location.href='cart.html'">🛒 Cart <span id="cartCount">0</span></button>
          <button onclick="location.href='favorites.html'">❤️ Wishlist <span id="wishlistCount">0</span></button>
          <button onclick="location.href='orders.html'">📦 My Orders</button>
          <button onclick="logout()">🚪 Logout</button>
        </div>
      </div>
    `;
  } else {
    rightContent = `
      ${ctaButton}
      <button id="darkModeToggle" class="profile-btn btn-secondary" onclick="toggleDarkMode()">${darkLabel}</button>
      <button class="profile-btn" onclick="location.href='login.html'">Login</button>
      <button class="profile-btn btn-secondary" onclick="location.href='register.html'">Sign Up</button>
    `;
  }

  navbar.innerHTML = `
    <div class="nav-left">
      <h2 onclick="location.href='index.html'" style="cursor:pointer;">🍔 SmartBite</h2>
    </div>
    <div class="nav-center">
      ${centerContent}
    </div>
    <button class="menu-toggle" onclick="toggleMenu()">☰</button>
    <div class="nav-right" id="navMenu">
      ${rightContent}
    </div>
  `;
}

function dispatchNavbarRendered() {
  document.dispatchEvent(new CustomEvent("navbarRendered"));
}

function onNavbarRendered(callback) {
  if (document.getElementById("navMenu")) {
    callback();
    return;
  }
  document.addEventListener("navbarRendered", callback, { once: true });
}

function renderAuthModal() {
  if (document.getElementById("authModal")) return;

  const modal = document.createElement("div");
  modal.id = "authModal";
  modal.className = "auth-modal hidden";
  modal.innerHTML = `
    <div class="auth-modal-backdrop" onclick="closeAuthModal()"></div>
    <div class="auth-modal-content">
      <h3>🔒 Please login to continue.</h3>
      <p>Login or sign up to perform this action and unlock the full SmartBite experience.</p>
      <div class="auth-modal-actions">
        <button onclick="location.href='login.html'">Login</button>
        <button class="btn-secondary" onclick="location.href='register.html'">Sign Up</button>
      </div>
      <button class="auth-modal-close" onclick="closeAuthModal()">✕</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function showAuthModal() {
  renderAuthModal();
  const modal = document.getElementById("authModal");
  if (!modal) return;
  modal.classList.remove("hidden");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (!modal) return;
  modal.classList.add("hidden");
}

function requireLogin(actionDescription = "continue") {
  showToast(`🔒 Login required to ${actionDescription}.`, "error");
  showAuthModal();
}

function toggleMenu() {
  const navMenu = document.getElementById("navMenu");
  const navbar = document.querySelector(".navbar");
  if (navMenu) navMenu.classList.toggle("active");
  if (navbar) navbar.classList.toggle("nav-open");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");

  const theme = document.body.classList.contains("dark-mode")
    ? "dark"
    : "light";

  localStorage.setItem("theme", theme);
  updateDarkModeLabel();
}

function updateDarkModeLabel() {
  const button = document.getElementById("darkModeToggle");
  if (!button) return;
  button.innerText = document.body.classList.contains("dark-mode")
    ? "☀️ Light"
    : "🌙 Dark";
}

function toggleProfileMenu() {
  const dropdown = document.getElementById("profileDropdown");
  if (dropdown) {
    dropdown.classList.toggle("show");
  }
}

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

async function updateNavbarState() {
  const loggedIn = isLoggedIn();
  const username = localStorage.getItem("username") || "Guest";

  const userElement = document.getElementById("username");
  if (userElement) {
    userElement.innerText = username;
  }

  const profileName = document.getElementById("profileName");
  if (profileName) {
    profileName.innerText = username;
  }

  const profileEmail = document.getElementById("profileEmail");
  const email = localStorage.getItem("email");
  if (profileEmail) {
    profileEmail.innerText = email || "";
  }

  const profilePhone = document.getElementById("profilePhone");
  const phone = localStorage.getItem("phone");
  if (profilePhone) {
    profilePhone.innerText = phone || "";
  }

  const wishlistCount = document.getElementById("wishlistCount");
  const cartCount = document.getElementById("cartCount");

  if (!loggedIn) {
    if (wishlistCount) wishlistCount.innerText = "0";
    if (cartCount) cartCount.innerText = "0";
    updateCartBadge(0);
    return;
  }

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  if (!userId || !token) {
    if (wishlistCount) wishlistCount.innerText = "0";
    if (cartCount) cartCount.innerText = "0";
    updateCartBadge(0);
    return;
  }

  try {
    if (cartCount) {
      const cartResponse = await fetch(
        `${API_BASE_URL}/api/cart/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (cartResponse.ok) {
        const cartItems = await cartResponse.json();
        const totalItems = cartItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        cartCount.innerText = totalItems;
        updateCartBadge(totalItems);
      } else {
        cartCount.innerText = "0";
        updateCartBadge(0);
      }
    }

    if (wishlistCount) {
      const favoriteResponse = await fetch(
        `${API_BASE_URL}/api/favorites/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (favoriteResponse.ok) {
        const favorites = await favoriteResponse.json();
        wishlistCount.innerText = favorites.length;
      } else {
        wishlistCount.innerText = "0";
      }
    }
  } catch (error) {
    if (wishlistCount) wishlistCount.innerText = "0";
    if (cartCount) cartCount.innerText = "0";
    updateCartBadge(0);
  }

  // Ensure admin link appears in static profile-dropdowns for pages that have hard-coded HTML
  try {
    const role = (localStorage.getItem("role") || "").toUpperCase();
    const dropdown = document.getElementById("profileDropdown");
    if (dropdown) {
      const existing = document.getElementById("adminDashboardBtn");
      if (role === "ADMIN") {
        if (!existing) {
          const btn = document.createElement("button");
          btn.id = "adminDashboardBtn";
          btn.innerText = "🛠 Admin Dashboard";
          btn.onclick = () => (window.location.href = "admin-dashboard.html");

          // Insert before Dashboard button if present
          const dashboardBtn = Array.from(
            dropdown.querySelectorAll("button"),
          ).find(
            (b) =>
              b.getAttribute("onclick") &&
              b.getAttribute("onclick").includes("dashboard.html"),
          );
          if (dashboardBtn) dropdown.insertBefore(btn, dashboardBtn);
          else dropdown.appendChild(btn);
        }
      } else if (existing) {
        existing.remove();
      }
    }
  } catch (e) {
    // ignore
  }
}

// Update cart badge on bottom navigation
function updateCartBadge(count) {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;

  if (count > 0) {
    badge.style.display = "flex";
    badge.innerText = count > 99 ? "99+" : count;
  } else {
    badge.style.display = "none";
  }
}

// Update bottom navigation active state based on current page
function updateBottomNavActive() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // Remove active class from all nav items
  const navItems = document.querySelectorAll(".bottom-nav .nav-item");
  navItems.forEach((item) => item.classList.remove("active"));

  // Add active class to the matching nav item
  navItems.forEach((item) => {
    const href = item.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      item.classList.add("active");
    }
  });
}

async function initializeCommon() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  renderNavbar();
  updateDarkModeLabel();
  await updateNavbarState();
  updateBottomNavActive();
  dispatchNavbarRendered();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeCommon);
} else {
  initializeCommon();
}
