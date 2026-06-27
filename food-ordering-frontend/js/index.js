// API Configuration
const BASE_URL = `${API_BASE_URL}/api`;

// Helper function to get authorization headers
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ======================= API ENDPOINTS =======================

// 1. RESTAURANT ENDPOINTS
async function getAllRestaurants() {
  try {
    const response = await fetch(`${BASE_URL}/restaurants`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch restaurants");
    return await response.json();
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return [];
  }
}

async function getRestaurantById(id) {
  try {
    const response = await fetch(`${BASE_URL}/restaurants/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch restaurant");
    return await response.json();
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return null;
  }
}

async function searchRestaurants(keyword) {
  try {
    const response = await fetch(
      `${BASE_URL}/restaurants/search?keyword=${encodeURIComponent(keyword)}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) throw new Error("Failed to search restaurants");
    return await response.json();
  } catch (error) {
    console.error("Error searching restaurants:", error);
    return [];
  }
}

// 2. FOOD ENDPOINTS
async function getFoodsByRestaurant(restaurantId) {
  try {
    const response = await fetch(
      `${BASE_URL}/foods/restaurant/${restaurantId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) throw new Error("Failed to fetch foods");
    return await response.json();
  } catch (error) {
    console.error("Error fetching foods:", error);
    return [];
  }
}

async function searchFoods(keyword) {
  try {
    const response = await fetch(
      `${BASE_URL}/foods/search?keyword=${encodeURIComponent(keyword)}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) throw new Error("Failed to search foods");
    return await response.json();
  } catch (error) {
    console.error("Error searching foods:", error);
    return [];
  }
}

async function getTrendingFoods() {
  try {
    const response = await fetch(`${BASE_URL}/foods/trending`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch trending foods");
    return await response.json();
  } catch (error) {
    console.error("Error fetching trending foods:", error);
    return [];
  }
}

async function getFoodsByCategory(category) {
  try {
    const response = await fetch(
      `${BASE_URL}/foods/category/${encodeURIComponent(category)}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) throw new Error("Failed to fetch foods by category");
    return await response.json();
  } catch (error) {
    console.error("Error fetching foods by category:", error);
    return [];
  }
}

async function filterFoods(category, maxPrice, minCalories, maxCalories) {
  try {
    let url = `${BASE_URL}/foods/filter?`;
    const params = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (maxPrice) params.push(`maxPrice=${maxPrice}`);
    if (minCalories) params.push(`minCalories=${minCalories}`);
    if (maxCalories) params.push(`maxCalories=${maxCalories}`);
    url += params.join("&");

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to filter foods");
    return await response.json();
  } catch (error) {
    console.error("Error filtering foods:", error);
    return [];
  }
}

async function getFoodById(foodId) {
  try {
    const response = await fetch(`${BASE_URL}/foods/${foodId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch food");
    return await response.json();
  } catch (error) {
    console.error("Error fetching food:", error);
    return null;
  }
}

// ======================= PAGE INTERACTION FUNCTIONS =======================

function performFindFood() {
  const locationInput = document.getElementById("locationInput");
  const query = locationInput ? locationInput.value.trim() : "";

  if (query) {
    localStorage.setItem("searchQuery", query);
  } else {
    localStorage.removeItem("searchQuery");
  }

  window.location.href = "restaurants.html";
}

function searchCategory(category) {
  localStorage.setItem("searchQuery", category);
  window.location.href = "restaurants.html";
}

function attachBudgetPlanner() {
  const budgetForm = document.getElementById("budgetForm");
  if (budgetForm) {
    budgetForm.addEventListener("submit", function (event) {
      event.preventDefault();
      findBudgetMeals();
    });
  }
}

async function findBudgetMeals() {
  const amountInput = document.getElementById("budgetAmount");
  const amount = amountInput ? Number(amountInput.value.trim()) : 0;

  if (!amount || amount <= 0) {
    showToast("Please enter a valid budget amount.", "error");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/budget/${amount}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Unable to load recommendations.");
    }

    const budgetResult = await response.json();
    renderBudgetResults(budgetResult);
  } catch (error) {
    console.error(error);
    showToast("Failed to fetch budget meals. Try again.", "error");
  }
}

function renderBudgetResults(result) {
  const container = document.getElementById("budgetResults");
  if (!container) return;

  const mealsHtml = result.foods
    .map(
      (food) =>
        `<li class="budget-item"><span>${food.foodName}</span><strong>₹ ${food.price.toFixed(2)}</strong></li>`,
    )
    .join("");

  container.innerHTML = `
    <div class="budget-summary">
      <div>
        <span>Budget</span>
        <strong>₹ ${result.budget.toFixed(2)}</strong>
      </div>
      <div>
        <span>Spent</span>
        <strong>₹ ${result.spent.toFixed(2)}</strong>
      </div>
      <div>
        <span>Saved</span>
        <strong>₹ ${result.saved.toFixed(2)}</strong>
      </div>
    </div>
    <div class="budget-menu">
      <h3>Recommended items</h3>
      <ul>${mealsHtml || '<li class="empty-state">No meal ideas found.</li>'}</ul>
    </div>
  `;
}

function clearBudgetResults() {
  const container = document.getElementById("budgetResults");
  if (!container) return;

  container.innerHTML = `
    <p>
      Enter your budget above to discover meal recommendations and see how
      much you can save.
    </p>
  `;

  // Clear the budget input
  const budgetInput = document.getElementById("budgetAmount");
  if (budgetInput) budgetInput.value = "";

  // Clear common search inputs if present and notify listeners
  const globalSearch = document.getElementById("globalSearch");
  if (globalSearch) {
    globalSearch.value = "";
    globalSearch.dispatchEvent(new Event("input", { bubbles: true }));
  }

  const foodSearch = document.getElementById("foodSearch");
  if (foodSearch) {
    foodSearch.value = "";
    foodSearch.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // Clear any persisted search query
  localStorage.removeItem("searchQuery");

  showToast("Cleared Meal Ideas", "success");
}

function viewRestaurant(id) {
  localStorage.setItem("restaurantId", id);
  window.location.href = "foods.html";
}

// ======================= PAGE INITIALIZATION =======================

async function initializeHomepage() {
  // Load trending foods if available
  loadTrendingFoods();

  // Optionally load popular restaurants
  loadPopularRestaurants();

  // Check if user is logged in
  checkUserLoginStatus();

  // Budget meal planner
  attachBudgetPlanner();
}

async function loadPopularRestaurants() {
  try {
    const restaurants = await getAllRestaurants();
    // Filter or use first 4 as popular (optional: could be improved with ratings)
    const popular = restaurants.slice(0, 4);
    updateRestaurantGrid(popular);
  } catch (error) {
    console.error("Error loading popular restaurants:", error);
  }
}

async function loadTrendingFoods() {
  try {
    const trending = await getTrendingFoods();
  } catch (error) {
    console.error("Error loading trending foods:", error);
  }
}

function updateRestaurantGrid(restaurants) {
  const grid = document.querySelector(".restaurant-grid");
  if (!grid || restaurants.length === 0) return;

  // Map API data to grid cards
  restaurants.forEach((restaurant) => {
    const card = grid.querySelector(
      `[onclick="viewRestaurant(${restaurant.id})"]`,
    );
    if (card) {
      const nameEl = card.querySelector(".restaurant-name");
      const cuisineEl = card.querySelector("p");
      const ratingEl = card.querySelector(".restaurant-meta span:first-child");
      const timeEl = card.querySelector(".restaurant-meta span:nth-child(2)");

      if (nameEl) nameEl.textContent = restaurant.name;
      if (cuisineEl) cuisineEl.textContent = restaurant.cuisine || "Cuisine";
      if (ratingEl) ratingEl.textContent = `${restaurant.rating || 4.5} ⭐`;
      if (timeEl)
        timeEl.textContent = `${restaurant.deliveryTime || "30-40"} min`;
    }
  });
}

function checkUserLoginStatus() {
  const token = localStorage.getItem("token");
  const loginBtn = document.querySelector(
    ".profile-btn[onclick=\"location.href = 'login.html'\"]",
  );
  const signupBtn = document.querySelector(
    ".profile-btn[onclick=\"location.href = 'register.html'\"]",
  );

  if (token) {
    if (loginBtn) loginBtn.textContent = "Profile";
    if (signupBtn) signupBtn.textContent = "Logout";
    if (loginBtn) loginBtn.onclick = () => (location.href = "profile.html");
    if (signupBtn)
      signupBtn.onclick = () => {
        localStorage.removeItem("token");
        location.href = "index.html";
      };
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initializeHomepage);
