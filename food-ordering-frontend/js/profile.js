const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

// Check if user is logged in when page loads
function checkProfileAccess() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    // Show auth unlock message
    document.getElementById("profileContent").innerHTML = `
      <div class="auth-unlock-message">
        <h2>🔒 Login to Unlock Profile</h2>
        <p>Access your profile, orders, and more.</p>
        <button class="btn btn-primary" onclick="location.href='login.html'">Login</button>
        <button class="btn btn-secondary" onclick="location.href='register.html'">Sign Up</button>
      </div>
    `;
  }
}

async function loadUserProfile() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // If not logged in, show login message
  if (!token || !userId) {
    document.getElementById("profileContent").innerHTML = `
      <div class="auth-unlock-message">
        <h2>🔒 Login to Unlock Profile</h2>
        <p>Access your profile, orders, and more.</p>
        <button class="btn btn-primary" onclick="location.href='login.html'">Login</button>
        <button class="btn btn-secondary" onclick="location.href='register.html'">Sign Up</button>
      </div>
    `;
    return;
  }

  try {
    // Fetch user data
    const userResponse = await fetch(
      `${API_BASE_URL}/api/auth/user/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!userResponse.ok) throw new Error("Failed to load user data");
    const userData = await userResponse.json();

    // Fetch user orders
    let orderCount = 0;
    let recentOrders = [];
    try {
      const ordersResponse = await fetch(
        `${API_BASE_URL}/api/orders/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        orderCount = orders.length;
        recentOrders = orders.slice(0, 3); // Get last 3 orders
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }

    // Display profile
    const profileContent = document.getElementById("profileContent");
    profileContent.innerHTML = `
      <div class="profile-card">
        <div class="profile-avatar">
          <span class="avatar-icon">👤</span>
        </div>
        
        <div class="profile-info">
          <h2>${userData.fullName || "User"}</h2>
          <p class="profile-detail">
            <strong>📧 Email:</strong> ${userData.email}
          </p>
          <p class="profile-detail">
            <strong>📱 Phone:</strong> ${userData.phone || "Not provided"}
          </p>
        </div>

        <div class="profile-stats">
          <div class="stat">
            <span class="stat-value">${orderCount}</span>
            <span class="stat-label">Total Orders</span>
          </div>
          <div class="stat">
            <span class="stat-value">${userData.role || "User"}</span>
            <span class="stat-label">Account Type</span>
          </div>
        </div>

        <hr class="profile-divider" />

        <h3>📦 Recent Orders</h3>
        ${
          recentOrders.length > 0
            ? `
          <div class="recent-orders-list">
            ${recentOrders
              .map(
                (order) => `
              <div class="order-item">
                <div class="order-info">
                  <p class="order-id">Order #${order.orderId}</p>
                  <p class="order-date">${new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <div class="order-details">
                  <p class="order-amount">₹${order.totalAmount}</p>
                  <p class="order-status ${order.status.toLowerCase()}">${order.status}</p>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : `<p class="no-orders">No orders yet. Start ordering now!</p>`
        }

        <div class="profile-actions">
          <button class="btn btn-secondary" onclick="logout()">🚪 Logout</button>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error loading profile:", error);
    document.getElementById("profileContent").innerHTML = `
      <div class="error-message">
        <p>Failed to load profile. Please try again.</p>
        <button class="btn btn-secondary" onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}

// Initialize profile page
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    updateBottomNavActive();
  });
} else {
  loadUserProfile();
  updateBottomNavActive();
}
