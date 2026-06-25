let favorites = [];
let allTrendingFoods = [];
let allRecommendedFoods = [];
let currentDashboardSearch = "";

// ============================================
// GREETING & TIME-BASED MESSAGES
// ============================================
function getGreetingMessage() {
  const hour = new Date().getHours();
  const username = localStorage.getItem("username") || "Guest";

  let greeting = "";
  if (hour < 12) {
    greeting = `Good Morning, ${username} 🌅`;
  } else if (hour < 18) {
    greeting = `Good Afternoon, ${username} 🌤️`;
  } else {
    greeting = `Good Evening, ${username} 🌙`;
  }

  return greeting;
}

function updateGreeting() {
  const greetingElement = document.getElementById("greetingMessage");
  if (greetingElement) {
    greetingElement.textContent = getGreetingMessage();
  }

  const timeGreetingElement = document.getElementById("timeGreeting");
  if (timeGreetingElement) {
    const options = { weekday: "long", month: "short", day: "numeric" };
    const today = new Date().toLocaleDateString("en-US", options);
    timeGreetingElement.textContent = `📅 ${today}`;
  }
}

// ============================================
// GENERIC CARD RENDERER
// ============================================
function renderFoodCards(foods, containerId, showTag = "") {
  let html = "";

  foods.forEach((food) => {
    const isFav = favorites.some((f) => f.foodId === food.foodId);

    html += `
<div class="dashboard-card" onclick="viewFood(${food.foodId})">
    <img src="${food.imageUrl}" alt="${food.foodName}">
    <div class="dashboard-body">
        <div class="dashboard-top">
            <h3>${food.foodName}</h3>
            <button class="heart-btn ${isFav ? "active" : ""}"
                onclick="event.stopPropagation();toggleFavorite(${food.foodId})">
                ${isFav ? "❤️" : "🤍"}
            </button>
        </div>
        ${showTag ? `<span class="dashboard-tag">${showTag}</span>` : ""}
        <p>🏪 ${food.restaurantName || "Popular Spot"}</p>
        <h4>₹ ${food.price}</h4>
    </div>
</div>
`;
  });

  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML =
      html ||
      '<p style="text-align: center; color: var(--text-muted);">No items found</p>';
  }
}

// ============================================
// LOAD DATA FUNCTIONS
// ============================================
async function loadFavorites() {
  if (!isLoggedIn()) {
    favorites = [];
    return;
  }

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites/${userId}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    if (!response.ok) {
      favorites = [];
      return;
    }
    favorites = await response.json();
  } catch (error) {
    console.error("Error loading favorites:", error);
    favorites = [];
  }
}

async function loadTrendingFoods() {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const response = await fetch(`${API_BASE_URL}/api/trending`, {
      headers,
    });

    allTrendingFoods = await response.json();
    renderFoodCards(allTrendingFoods, "trendingFoods", "🔥 Trending");
  } catch (error) {
    console.error("Error loading trending foods:", error);
    document.getElementById("trendingFoods").innerHTML =
      '<p style="text-align: center; color: var(--text-muted);">Unable to load trending foods</p>';
  }
}

async function loadRecommendations() {
  if (!isLoggedIn()) {
    renderFoodCards(
      allTrendingFoods.slice(0, 6),
      "recommendations",
      "⭐ Popular Foods",
    );
    return;
  }

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/recommendations/${userId}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    if (!response.ok) {
      renderFoodCards(
        allTrendingFoods.slice(0, 6),
        "recommendations",
        "⭐ Popular Foods",
      );
      return;
    }

    allRecommendedFoods = await response.json();
    renderFoodCards(allRecommendedFoods, "recommendations", "⭐ For You");
  } catch (error) {
    console.error("Error loading recommendations:", error);
    renderFoodCards(
      allTrendingFoods.slice(0, 6),
      "recommendations",
      "⭐ Popular Foods",
    );
  }
}

async function loadWishlistRecommendations() {
  if (!isLoggedIn()) {
    renderFoodCards(
      allTrendingFoods.slice(0, 4),
      "wishlistRecommendations",
      "❤️ Popular Foods",
    );
    return;
  }

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/wishlist/recommendations/${userId}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    if (response.ok) {
      const foods = await response.json();
      renderFoodCards(foods, "wishlistRecommendations", "❤️ Based On Wishlist");
    } else {
      renderFoodCards(
        allTrendingFoods.slice(0, 4),
        "wishlistRecommendations",
        "❤️ Popular Foods",
      );
    }
  } catch (error) {
    console.error("Error loading wishlist recommendations:", error);
    renderFoodCards(
      allTrendingFoods.slice(0, 4),
      "wishlistRecommendations",
      "❤️ Popular Foods",
    );
  }
}

async function loadOrderAgain() {
  if (!isLoggedIn()) {
    renderFoodCards(
      allTrendingFoods.slice(0, 4),
      "orderAgain",
      "🕒 Popular Picks",
    );
    return;
  }

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  try {
    const response = await fetch(`${API_BASE_URL}/api/reorder/${userId}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (response.ok) {
      const foods = await response.json();
      renderFoodCards(foods, "orderAgain", "🕒 Quick Reorder");
    } else {
      renderFoodCards(
        allTrendingFoods.slice(0, 4),
        "orderAgain",
        "🕒 Popular Picks",
      );
    }
  } catch (error) {
    console.error("Error loading reorder items:", error);
    renderFoodCards(
      allTrendingFoods.slice(0, 4),
      "orderAgain",
      "🕒 Popular Picks",
    );
  }
}

async function loadCategoryBased() {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/foods/category/South%20Indian`,
      {
        headers,
      },
    );

    if (response.ok) {
      const foods = await response.json();
      renderFoodCards(foods.slice(0, 6), "categoryBased", "🍕 South Indian");
    } else {
      renderFoodCards(
        allTrendingFoods.slice(0, 6),
        "categoryBased",
        "🍕 Popular",
      );
    }
  } catch (error) {
    console.error("Error loading category-based foods:", error);
    renderFoodCards(
      allTrendingFoods.slice(0, 6),
      "categoryBased",
      "🍕 Popular",
    );
  }
}

async function loadWeeklySpending() {
  if (!isLoggedIn()) {
    renderWeeklySpending({ totalSpent: 0, orderCount: 0, avgOrder: 0 });
    return;
  }

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/orders/weekly-spending/${userId}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      renderWeeklySpending(data);
    } else {
      renderWeeklySpending({ totalSpent: 0, orderCount: 0, avgOrder: 0 });
    }
  } catch (error) {
    console.error("Error loading weekly spending:", error);
    renderWeeklySpending({ totalSpent: 0, orderCount: 0, avgOrder: 0 });
  }
}

async function loadTopRestaurant() {
  if (!isLoggedIn()) {
    renderTopRestaurant(null);
    return;
  }

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/orders/top-restaurant/${userId}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    if (response.ok) {
      const text = await response.text();
      if (!text) {
        renderTopRestaurant(null);
      } else {
        const restaurant = JSON.parse(text);
        renderTopRestaurant(restaurant);
      }
    } else {
      renderTopRestaurant(null);
    }
  } catch (error) {
    console.error("Error loading top restaurant:", error);
    renderTopRestaurant(null);
  }
}

function renderWeeklySpending(data) {
  const container = document.getElementById("weeklySpendings");
  if (!container) return;

  const totalSpent = data.totalSpent || 0;
  const orderCount = data.orderCount || 0;
  const avgOrder = data.avgOrder || 0;

  const html = `
<div class="spending-stats">
    <div class="stat-item">
        <span class="stat-label">Total Spent</span>
        <span class="stat-value">₹${totalSpent}</span>
    </div>
    <div class="stat-item">
        <span class="stat-label">Orders This Week</span>
        <span class="stat-value">${orderCount}</span>
    </div>
    <div class="stat-item">
        <span class="stat-label">Average Order</span>
        <span class="stat-value">₹${avgOrder}</span>
    </div>
</div>
  `;

  container.innerHTML = html;
}

function renderTopRestaurant(restaurant) {
  const container = document.getElementById("topRestaurant");
  if (!container) return;

  if (!restaurant || !restaurant.restaurantName) {
    container.innerHTML =
      '<p style="text-align: center; color: var(--text-muted);">No orders yet</p>';
    return;
  }

  const html = `
<div class="restaurant-info">
    <div class="restaurant-header">
        <h3>🏆 ${restaurant.restaurantName}</h3>
        <span class="rating">⭐ ${restaurant.rating || 4.5}</span>
    </div>
    <p class="restaurant-location">📍 ${restaurant.location || "Your favorite spot"}</p>
    <p class="restaurant-orders">🛒 You've ordered ${restaurant.orderCount || 1} time${restaurant.orderCount !== 1 ? "s" : ""}</p>
    <button class="view-restaurant-btn" onclick="window.location.href='restaurants.html'">
        View Restaurant
    </button>
</div>
  `;

  container.innerHTML = html;
}

async function toggleFavorite(foodId) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    requireLogin();
    return;
  }

  try {
    await fetch(`${API_BASE_URL}/api/favorites/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        userId: Number(userId),
        foodId: Number(foodId),
      }),
    });

    showToast("❤️ Wishlist Updated");

    await loadFavorites();
    await loadTrendingFoods();
    await loadRecommendations();
    await loadWishlistRecommendations();
    await loadNavbarData();
  } catch (error) {
    console.error("Error toggling favorite:", error);
    showToast("❌ Error updating wishlist");
  }
}

function viewFood(foodId) {
  localStorage.setItem("foodId", foodId);
  window.location.href = "food-details.html";
}

async function loadNavbarData() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  if (document.getElementById("username")) {
    document.getElementById("username").innerText = username || "User";
  }

  const cartBadge = document.getElementById("cartCount");
  const wishlistBadge = document.getElementById("wishlistCount");

  if (!token || !userId) {
    if (cartBadge) cartBadge.innerText = "0";
    if (wishlistBadge) wishlistBadge.innerText = "0";
    return;
  }

  try {
    const [cartResponse, favoriteResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/cart/user/${userId}`, {
        headers: { Authorization: "Bearer " + token },
      }),
      fetch(`${API_BASE_URL}/api/favorites/${userId}`, {
        headers: { Authorization: "Bearer " + token },
      }),
    ]);

    if (cartResponse.ok) {
      const cartItems = await cartResponse.json();
      const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      if (cartBadge) {
        cartBadge.innerText = cartCount;
      }
    } else if (cartBadge) {
      cartBadge.innerText = "0";
    }

    if (favoriteResponse.ok) {
      const favs = await favoriteResponse.json();
      if (wishlistBadge) {
        wishlistBadge.innerText = favs.length;
      }
    } else if (wishlistBadge) {
      wishlistBadge.innerText = "0";
    }
  } catch (error) {
    console.error("Error loading navbar data:", error);
    if (cartBadge) cartBadge.innerText = "0";
    if (wishlistBadge) wishlistBadge.innerText = "0";
  }
}

function applyDashboardSearch() {
  const keyword = currentDashboardSearch.trim().toLowerCase();

  const trending = keyword
    ? allTrendingFoods.filter(
        (food) =>
          food.foodName.toLowerCase().includes(keyword) ||
          (food.restaurantName &&
            food.restaurantName.toLowerCase().includes(keyword)),
      )
    : allTrendingFoods;

  const recommended = keyword
    ? allRecommendedFoods.filter(
        (food) =>
          food.foodName.toLowerCase().includes(keyword) ||
          (food.restaurantName &&
            food.restaurantName.toLowerCase().includes(keyword)),
      )
    : allRecommendedFoods;

  renderFoodCards(trending, "trendingFoods", "🔥 Trending");
  renderFoodCards(recommended, "recommendations", "⭐ For You");
}

function attachDashboardSearchListener() {
  const dashboardSearchInput = document.getElementById("globalSearch");
  if (!dashboardSearchInput) return;

  dashboardSearchInput.addEventListener("input", function () {
    currentDashboardSearch = this.value;
    applyDashboardSearch();
  });
}

onNavbarRendered(attachDashboardSearchListener);

// ============================================
// MOBILE-FIRST RENDER FUNCTIONS
// ============================================

function renderRestaurantsScroll(restaurants, containerId) {
  if (!restaurants || restaurants.length === 0) {
    document.getElementById(containerId).innerHTML =
      '<p style="padding: 16px; text-align: center; color: var(--text-muted);">No restaurants found</p>';
    return;
  }

  let html = "";
  restaurants.slice(0, 6).forEach((restaurant) => {
    const name = restaurant.restaurantName || restaurant.name || "Restaurant";
    const image =
      restaurant.imageUrl ||
      "https://via.placeholder.com/180x120?text=Restaurant";
    const rating = restaurant.rating || 4.5;
    const deliveryTime = restaurant.deliveryTime || "30 min";
    const cuisine = restaurant.cuisineType || "Cuisine";

    html += `
<a href="restaurants.html" class="restaurant-card-mobile">
  <img src="${image}" alt="${name}">
  <div class="restaurant-card-mobile-info">
    <h3>${name}</h3>
    <p class="restaurant-meta">
      <span>⭐ ${rating}</span>
      <span>🕐 ${deliveryTime}</span>
    </p>
    <p class="restaurant-meta" style="font-size: 0.75rem;">${cuisine}</p>
  </div>
</a>
`;
  });

  document.getElementById(containerId).innerHTML = html;
}

function renderFoodCardsMobile(foods, containerId) {
  if (!foods || foods.length === 0) {
    document.getElementById(containerId).innerHTML =
      '<p style="padding: 16px; text-align: center; color: var(--text-muted);">No foods found</p>';
    return;
  }

  let html = "";
  foods.slice(0, 4).forEach((food) => {
    const isFav = favorites.some((f) => f.foodId === food.foodId);
    const image =
      food.imageUrl || "https://via.placeholder.com/180x120?text=Food";

    html += `
<div class="food-card-mobile" onclick="viewFood(${food.foodId})">
  <img src="${image}" alt="${food.foodName}">
  <div class="food-card-mobile-info">
    <h4>${food.foodName}</h4>
    <p>₹ ${food.price}</p>
    <button class="heart-btn ${isFav ? "active" : ""}"
      onclick="event.stopPropagation();toggleFavorite(${food.foodId})">
      ${isFav ? "❤️" : "🤍"}
    </button>
  </div>
</div>
`;
  });

  document.getElementById(containerId).innerHTML = html;
}

function renderOffersBanner(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const html = `
<h3>🎉 50% OFF</h3>
<p>On your first order! Use code: WELCOME50</p>
`;

  container.innerHTML = html;
}

async function loadCategoriesGrid() {
  const categories = [
    { name: "Biryani", icon: "🍚" },
    { name: "Pizza", icon: "🍕" },
    { name: "Burgers", icon: "🍔" },
    { name: "Chicken", icon: "🍗" },
    { name: "Desserts", icon: "🍰" },
  ];

  let html = "";
  categories.forEach((cat) => {
    html += `
<a href="foods.html" class="category-item">
  <div class="category-icon">${cat.icon}</div>
  <div class="category-name">${cat.name}</div>
</a>
`;
  });

  const container = document.getElementById("categories");
  if (container) {
    container.innerHTML = html;
  }
}

async function initializeDashboard() {
  updateGreeting();
  await loadFavorites();
  await loadNavbarData();

  // Load data for both mobile and desktop sections
  await Promise.all([
    loadTrendingFoods(),
    loadRecommendations(),
    loadWishlistRecommendations(),
    loadOrderAgain(),
    loadCategoryBased(),
    loadWeeklySpending(),
    loadTopRestaurant(),
  ]);

  // Mobile sections
  const restaurantsContainer = document.getElementById("trendingRestaurants");
  const foodsContainer = document.getElementById("popularFoods");

  if (restaurantsContainer && allTrendingFoods.length > 0) {
    renderRestaurantsScroll(allTrendingFoods, "trendingRestaurants");
  }

  if (foodsContainer && allTrendingFoods.length > 0) {
    renderFoodCardsMobile(allTrendingFoods, "popularFoods");
  }

  renderOffersBanner("todaysOffers");
  await loadCategoriesGrid();
}

initializeDashboard();
