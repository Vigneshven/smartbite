async function loadAdminStats() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "admin-login.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/admin/stats", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        window.location.href = "admin-login.html";
        return;
      }

      throw new Error("Failed to load admin stats");
    }

    const stats = await response.json();
    document.getElementById("totalUsers").textContent = stats.totalUsers;
    document.getElementById("totalFoods").textContent = stats.totalFoods;
    document.getElementById("totalRestaurants").textContent =
      stats.totalRestaurants;
    document.getElementById("totalOrders").textContent = stats.totalOrders;
    document.getElementById("totalRevenue").textContent =
      `₹${stats.totalRevenue}`;

    renderTopSellingFoods(stats.topSellingFoods);
  } catch (error) {
    console.error(error);
  }
}

function renderTopSellingFoods(foods) {
  const container = document.getElementById("topSellingFoods");
  if (!container) return;

  if (!foods || foods.length === 0) {
    container.innerHTML =
      '<p style="text-align:center;color:var(--text-muted)">No sales data available</p>';
    return;
  }

  container.innerHTML = foods
    .map(
      (food, index) => `
      <div class="top-selling-item">
        <span class="top-selling-rank">#${index + 1}</span>
        <div>
          <strong>${food.foodName}</strong>
          <p>${food.restaurantName}</p>
        </div>
        <span>Sold: ${food.salesCount}</span>
      </div>
    `,
    )
    .join("");
}

function logoutAdmin() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "admin-login.html";
}

loadAdminStats();
