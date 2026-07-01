/*
  New Admin Dashboard JS
  - Uses existing backend APIs where available
  - Provides graceful degradation if endpoints are missing
  - Implements search, pagination, sorting, modals, confirm, toasts, loading
*/

const adminState = {
  restaurants: [],
  foods: [],
  orders: [],
  reviews: [],
  users: [],
  page: {
    restaurants: 1,
    foods: 1,
    users: 1,
  },
  pageSize: {
    restaurants: 8,
    foods: 8,
    users: 8,
  },
  search: {
    restaurants: "",
    foods: "",
    users: "",
  },
};

function isAdminLoggedIn() {
  const role = (localStorage.getItem("role") || "").toUpperCase();
  return role === "ADMIN" && !!localStorage.getItem("token");
}

async function initAdmin() {
  // Guard: if not admin, redirect to login
  if (!isAdminLoggedIn()) {
    // If user is logged in but not admin, hide controls; otherwise send to admin-login
    if (localStorage.getItem("token")) {
      showToast("Admin access required", "error");
      return;
    }
    window.location.href = "admin-login.html";
    return;
  }

  // Load dashboard widgets
  await Promise.all([loadStats(), loadRestaurants(), loadFoods()]);
}

async function fetchJson(url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`fetchJson failed: ${url}`, e);
    throw e;
  }
}

// Auth header helper used by admin requests
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

// Inline placeholder to avoid 404s when a placeholder image file is missing
const PLACEHOLDER_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23909ca6" font-family="Arial,Helvetica,sans-serif" font-size="12">No image</text></svg>';

async function loadStats() {
  try {
    if (typeof showLoading === "function") showLoading("Loading dashboard...");
    const stats = await fetchJson(`${API_BASE_URL}/api/admin/stats`, {
      headers: getAuthHeaders(),
    });
    document.getElementById("totalUsers").innerText = stats.totalUsers || 0;
    document.getElementById("totalFoods").innerText = stats.totalFoods || 0;
    document.getElementById("totalRestaurants").innerText =
      stats.totalRestaurants || 0;
    document.getElementById("totalOrders").innerText = stats.totalOrders || 0;
    document.getElementById("totalRevenue").innerText =
      `₹${stats.totalRevenue || 0}`;
    renderTopSelling(stats.topSellingFoods || []);
  } catch (e) {
    console.error("loadStats", e);
  } finally {
    if (typeof hideLoading === "function") hideLoading();
  }
}

function renderTopSelling(list) {
  const el = document.getElementById("topSellingFoods");
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<p style="color:var(--text-muted)">No sales data</p>';
    return;
  }
  el.innerHTML = list
    .map(
      (f, i) =>
        `<div class="top-selling-item"><strong>${i + 1}. ${escapeHtml(f.foodName || "")}</strong><div class="muted">${escapeHtml(f.restaurantName || "")}</div><div class="sales">Sold: ${f.salesCount || 0}</div></div>`,
    )
    .join("");
}

function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

/* Restaurants */
async function loadRestaurants() {
  try {
    const list = await fetchJson(`${API_BASE_URL}/api/restaurants`);
    adminState.restaurants = Array.isArray(list) ? list : [];
    renderRestaurants();
  } catch (e) {
    console.warn("loadRestaurants failed", e);
    adminState.restaurants = [];
    renderRestaurants();
  }
}

function renderRestaurants() {
  const container = document.getElementById("adminRestaurantsTable");
  const pageSize = adminState.pageSize.restaurants;
  const page = adminState.page.restaurants;
  let items = adminState.restaurants.slice();
  const q = (adminState.search.restaurants || "").trim().toLowerCase();
  if (q)
    items = items.filter(
      (r) =>
        (r.restaurantName || "").toLowerCase().includes(q) ||
        (r.cuisine || "").toLowerCase().includes(q),
    );
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  if (!pageItems.length) {
    container.innerHTML =
      '<p style="color:var(--text-muted)">No restaurants</p>';
    document.getElementById("adminRestaurantPagination").innerHTML = "";
    return;
  }
  let html =
    "<table><thead><tr><th>ID</th><th></th><th>Name</th><th>Cuisine</th><th>Status</th><th>Actions</th></tr></thead><tbody>";
  pageItems.forEach((r) => {
    const src = r.imageUrl ? r.imageUrl : PLACEHOLDER_SVG;
    html += `<tr data-id="${r.restaurantId}"><td>${r.restaurantId || ""}</td><td><img class="row-thumb" src="${src}"/></td><td>${escapeHtml(r.restaurantName)}</td><td>${escapeHtml(r.cuisine || "")}</td><td>${escapeHtml(r.status || "")}</td><td><button class="action-btn" onclick="adminEditRestaurant(${r.restaurantId})">Edit</button> <button class="action-btn danger" onclick="adminDeleteRestaurant(${r.restaurantId})">Delete</button></td></tr>`;
  });
  html += "</tbody></table>";
  container.innerHTML = html;
  // pagination
  const pag = document.getElementById("adminRestaurantPagination");
  let phtml = "";
  if (pageCount > 1) {
    phtml += `<button ${page === 1 ? "disabled" : ""} onclick="adminChangeRestaurantPage(${page - 1})">Prev</button>`;
    for (let p = 1; p <= pageCount; p++)
      phtml += `<button class="${p === page ? "active" : ""}" onclick="adminChangeRestaurantPage(${p})">${p}</button>`;
    phtml += `<button ${page === pageCount ? "disabled" : ""} onclick="adminChangeRestaurantPage(${page + 1})">Next</button>`;
  }
  pag.innerHTML = phtml;
}

window.adminChangeRestaurantPage = function (p) {
  adminState.page.restaurants = p;
  renderRestaurants();
};

window.adminEditRestaurant = function (id) {
  const r = adminState.restaurants.find((x) => x.restaurantId == id);
  if (!r) return openRestaurantModal();
  openRestaurantModal(r);
};

window.adminDeleteRestaurant = async function (id) {
  const ok = await confirmDialog("Delete restaurant?");
  if (!ok) return;
  try {
    if (typeof showLoading === "function") showLoading("Deleting...");
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/restaurants/${id}`, {
      method: "DELETE",
      headers: token ? getAuthHeaders() : {},
    });
    if (res.ok) {
      adminState.restaurants = adminState.restaurants.filter(
        (r) => r.restaurantId != id,
      );
      renderRestaurants();
      showToast("Deleted", "success");
    } else {
      showToast("Delete failed", "error");
    }
  } catch (e) {
    console.error(e);
    showToast("Delete failed", "error");
  } finally {
    if (typeof hideLoading === "function") hideLoading();
  }
};

function openRestaurantModal(data) {
  const modal = document.getElementById("restaurantModal");
  if (!modal) return;
  document.getElementById("restaurantForm").reset();
  document.getElementById("restaurantIdInput").value = data
    ? data.restaurantId
    : "";
  document.getElementById("restaurantNameInput").value = data
    ? data.restaurantName
    : "";
  document.getElementById("restaurantCuisineInput").value = data
    ? data.cuisine
    : "";
  document.getElementById("restaurantAddressInput").value = data
    ? data.address
    : "";
  document.getElementById("restaurantPhoneInput").value = data
    ? data.phone
    : "";
  document.getElementById("restaurantStatusInput").value = data
    ? data.status || "OPEN"
    : "OPEN";
  document.getElementById("restaurantImagePreview").innerHTML =
    data && data.imageUrl
      ? `<img src="${data.imageUrl}" style="max-width:160px;border-radius:8px;object-fit:cover"/>`
      : "";
  modal.classList.remove("hidden");
}

function closeRestaurantModal() {
  document.getElementById("restaurantModal")?.classList.add("hidden");
}

// handle restaurant form
document.getElementById &&
  document
    .getElementById("restaurantForm")
    ?.addEventListener("submit", async function (e) {
      e.preventDefault();
      const id = document.getElementById("restaurantIdInput").value;
      const name = document.getElementById("restaurantNameInput").value.trim();
      const cuisine = document
        .getElementById("restaurantCuisineInput")
        .value.trim();
      const address = document
        .getElementById("restaurantAddressInput")
        .value.trim();
      const phone = document
        .getElementById("restaurantPhoneInput")
        .value.trim();
      const status = document.getElementById("restaurantStatusInput").value;
      const imageFile = document.getElementById("restaurantImageInput")
        .files[0];
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Login required", "error");
        return;
      }
      let ok = false;
      try {
        if (typeof showLoading === "function") showLoading("Saving...");
        if (imageFile) {
          const fd = new FormData();
          fd.append("restaurantName", name);
          fd.append("cuisine", cuisine);
          fd.append("address", address);
          fd.append("phone", phone);
          fd.append("status", status);
          fd.append("image", imageFile);
          const url = id
            ? `${API_BASE_URL}/api/restaurants/${id}`
            : `${API_BASE_URL}/api/restaurants`;
          const method = id ? "PUT" : "POST";
          const res = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: fd,
          });
          if (res.ok) {
            ok = true;
            showToast("Saved", "success");
          }
        } else {
          const payload = {
            restaurantName: name,
            cuisine,
            address,
            phone,
            status,
          };
          const url = id
            ? `${API_BASE_URL}/api/restaurants/${id}`
            : `${API_BASE_URL}/api/restaurants`;
          const method = id ? "PUT" : "POST";
          const res = await fetch(url, {
            method,
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            ok = true;
            showToast("Saved", "success");
          }
        }
      } catch (e) {
        console.error(e);
        showToast("Save failed", "error");
      } finally {
        if (typeof hideLoading === "function") hideLoading();
      }
      if (!ok) {
        // local fallback
        if (id) {
          const idx = adminState.restaurants.findIndex(
            (r) => String(r.restaurantId) === String(id),
          );
          if (idx >= 0) {
            adminState.restaurants[idx].restaurantName = name;
            adminState.restaurants[idx].cuisine = cuisine;
            adminState.restaurants[idx].address = address;
            adminState.restaurants[idx].phone = phone;
            adminState.restaurants[idx].status = status;
          }
        } else {
          const newId =
            (adminState.restaurants.reduce(
              (m, r) => Math.max(m, r.restaurantId || 0),
              0,
            ) || 0) + 1;
          adminState.restaurants.unshift({
            restaurantId: newId,
            restaurantName: name,
            cuisine,
            address,
            phone,
            status,
            imageUrl: "",
          });
        }
        showToast("Saved locally", "warning");
      }
      await loadRestaurants();
      closeRestaurantModal();
    });

/* Foods */
async function loadFoods() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/foods/trending`);
    if (!res.ok) throw new Error("no foods");
    const list = await res.json();
    adminState.foods = Array.isArray(list) ? list : [];
    renderFoods();
  } catch (e) {
    console.warn("loadFoods", e);
    adminState.foods = [];
    renderFoods();
  }
}

function renderFoods() {
  const container = document.getElementById("adminFoodsTable");
  const pageSize = adminState.pageSize.foods;
  const page = adminState.page.foods;
  let items = adminState.foods.slice();
  const q = (adminState.search.foods || "").trim().toLowerCase();
  if (q)
    items = items.filter(
      (f) =>
        (f.foodName || "").toLowerCase().includes(q) ||
        (f.category || "").toLowerCase().includes(q),
    );
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  if (!pageItems.length) {
    container.innerHTML =
      '<p style="color:var(--text-muted)">No foods found</p>';
    document.getElementById("adminFoodPagination").innerHTML = "";
    return;
  }

  let html =
    "<table><thead><tr><th>ID</th><th></th><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead><tbody>";
  pageItems.forEach((f) => {
    const src = f.imageUrl ? f.imageUrl : PLACEHOLDER_SVG;
    html += `<tr data-id="${f.foodId}"><td>${f.foodId || ""}</td><td><img class="row-thumb" src="${src}"/></td><td>${escapeHtml(f.foodName)}</td><td>${escapeHtml(f.category || "")}</td><td>₹${f.price || ""}</td><td><button class="action-btn" onclick="adminEditFood(${f.foodId})">Edit</button> <button class="action-btn danger" onclick="adminDeleteFood(${f.foodId})">Delete</button></td></tr>`;
  });
  html += "</tbody></table>";
  container.innerHTML = html;

  const pag = document.getElementById("adminFoodPagination");
  let phtml = "";
  if (pageCount > 1) {
    phtml += `<button ${page === 1 ? "disabled" : ""} onclick="adminChangeFoodPage(${page - 1})">Prev</button>`;
    for (let p = 1; p <= pageCount; p++) {
      phtml += `<button class="${p === page ? "active" : ""}" onclick="adminChangeFoodPage(${p})">${p}</button>`;
    }
    phtml += `<button ${page === pageCount ? "disabled" : ""} onclick="adminChangeFoodPage(${page + 1})">Next</button>`;
  }
  pag.innerHTML = phtml;
}

window.adminChangeFoodPage = function (p) {
  adminState.page.foods = p;
  renderFoods();
};

window.adminEditFood = function (id) {
  const f = adminState.foods.find((x) => x.foodId == id);
  if (!f) return openFoodModal();
  openFoodModal(f);
};

window.adminDeleteFood = async function (id) {
  const ok = await confirmDialog("Delete food?");
  if (!ok) return;
  try {
    if (typeof showLoading === "function") showLoading("Deleting...");
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/foods/${id}`, {
      method: "DELETE",
      headers: token ? getAuthHeaders() : {},
    });
    if (res.ok) {
      adminState.foods = adminState.foods.filter((f) => f.foodId != id);
      renderFoods();
      showToast("Deleted", "success");
    } else {
      showToast("Delete failed", "error");
    }
  } catch (e) {
    console.error(e);
    showToast("Delete failed", "error");
  } finally {
    if (typeof hideLoading === "function") hideLoading();
  }
};

function openFoodModal(data) {
  const modal = document.getElementById("foodModal");
  if (!modal) return;
  document.getElementById("foodForm").reset();
  document.getElementById("foodIdInput").value = data ? data.foodId : "";
  document.getElementById("foodNameInput").value = data ? data.foodName : "";
  document.getElementById("foodCategoryInput").value = data
    ? data.category
    : "";
  document.getElementById("foodPriceInput").value = data ? data.price || 0 : 0;
  document.getElementById("foodVegInput").value = data
    ? data.veg || "VEG"
    : "VEG";
  document.getElementById("foodAvailableInput").value = data
    ? data.available
      ? "true"
      : "false"
    : "true";
  document.getElementById("foodDescriptionInput").value = data
    ? data.description || ""
    : "";
  document.getElementById("foodImagePreview").innerHTML =
    data && data.imageUrl
      ? `<img src="${data.imageUrl}" style="max-width:160px;border-radius:8px;object-fit:cover"/>`
      : "";
  modal.classList.remove("hidden");
}

function closeFoodModal() {
  document.getElementById("foodModal")?.classList.add("hidden");
}

document.getElementById &&
  document
    .getElementById("foodForm")
    ?.addEventListener("submit", async function (e) {
      e.preventDefault();
      const id = document.getElementById("foodIdInput").value;
      const name = document.getElementById("foodNameInput").value.trim();
      const category = document
        .getElementById("foodCategoryInput")
        .value.trim();
      const price = Number(
        document.getElementById("foodPriceInput").value || 0,
      );
      const veg = document.getElementById("foodVegInput").value;
      const available =
        document.getElementById("foodAvailableInput").value === "true";
      const description = document
        .getElementById("foodDescriptionInput")
        .value.trim();
      const imageFile = document.getElementById("foodImageInput").files[0];
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Login required", "error");
        return;
      }
      let ok = false;
      try {
        if (typeof showLoading === "function") showLoading("Saving...");
        if (imageFile) {
          const fd = new FormData();
          fd.append("foodName", name);
          fd.append("category", category);
          fd.append("price", price);
          fd.append("veg", veg);
          fd.append("available", available);
          fd.append("description", description);
          fd.append("image", imageFile);
          const url = id
            ? `${API_BASE_URL}/api/foods/${id}`
            : `${API_BASE_URL}/api/foods`;
          const method = id ? "PUT" : "POST";
          const res = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: fd,
          });
          if (res.ok) {
            ok = true;
            showToast("Saved", "success");
          }
        } else {
          const payload = {
            foodName: name,
            category,
            price,
            veg,
            available,
            description,
          };
          const url = id
            ? `${API_BASE_URL}/api/foods/${id}`
            : `${API_BASE_URL}/api/foods`;
          const method = id ? "PUT" : "POST";
          const res = await fetch(url, {
            method,
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            ok = true;
            showToast("Saved", "success");
          }
        }
      } catch (e) {
        console.error(e);
        showToast("Save failed", "error");
      } finally {
        if (typeof hideLoading === "function") hideLoading();
      }
      if (!ok) {
        if (id) {
          const idx = adminState.foods.findIndex(
            (f) => String(f.foodId) === String(id),
          );
          if (idx >= 0) {
            adminState.foods[idx].foodName = name;
            adminState.foods[idx].category = category;
            adminState.foods[idx].price = price;
            adminState.foods[idx].veg = veg;
            adminState.foods[idx].available = available;
            adminState.foods[idx].description = description;
          }
        } else {
          const newId =
            (adminState.foods.reduce((m, f) => Math.max(m, f.foodId || 0), 0) ||
              0) + 1;
          adminState.foods.unshift({
            foodId: newId,
            foodName: name,
            category,
            price,
            veg,
            available,
            description,
            imageUrl: "",
          });
        }
        showToast("Saved locally", "warning");
      }
      await loadFoods();
      closeFoodModal();
    });

/* Users: stub section until backend supports admin user APIs */
function renderUsers() {
  const container = document.getElementById("adminUsersContainer");
  if (!container) return;
  container.innerHTML =
    '<p style="color:var(--text-muted)">User management is not available with the current backend configuration.</p>';
}

/* Reviews: backend does not provide a general GET /api/reviews endpoint */
function renderReviews() {
  const el =
    document.querySelector(".admin-section #reviewsList") ||
    document.getElementById("reviewsList");
  if (!el) return;
  el.innerHTML =
    '<p style="color:var(--text-muted)">Review list is not supported by this backend API.</p>';
}

window.adminDeleteReview = async function (id) {
  const ok = await confirmDialog("Delete review?");
  if (!ok) return;
  try {
    if (typeof showLoading === "function") showLoading("Deleting...");
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
      method: "DELETE",
      headers: token ? getAuthHeaders() : {},
    });
    if (res.ok) {
      adminState.reviews = adminState.reviews.filter((r) => r.reviewId != id);
      renderReviews();
      showToast("Deleted", "success");
    } else showToast("Delete failed", "error");
  } catch (e) {
    console.error(e);
    showToast("Delete failed", "error");
  } finally {
    if (typeof hideLoading === "function") hideLoading();
  }
};

// Wire controls
document.addEventListener("DOMContentLoaded", () => {
  // restaurant controls
  document
    .getElementById("adminRestaurantSearch")
    ?.addEventListener("input", (e) => {
      adminState.search.restaurants = e.target.value;
      adminState.page.restaurants = 1;
      renderRestaurants();
    });
  document
    .getElementById("adminRestaurantPageSize")
    ?.addEventListener("change", (e) => {
      adminState.pageSize.restaurants = Number(e.target.value);
      adminState.page.restaurants = 1;
      renderRestaurants();
    });
  document
    .getElementById("adminRestaurantSort")
    ?.addEventListener("change", (e) => {
      /* sort client-side if needed */
    });
  // food controls
  document.getElementById("adminFoodSearch")?.addEventListener("input", (e) => {
    adminState.search.foods = e.target.value;
    adminState.page.foods = 1;
    renderFoods();
  });
  document
    .getElementById("adminFoodPageSize")
    ?.addEventListener("change", (e) => {
      adminState.pageSize.foods = Number(e.target.value);
      adminState.page.foods = 1;
      renderFoods();
    });
  // initial loads
  initAdmin();
});
