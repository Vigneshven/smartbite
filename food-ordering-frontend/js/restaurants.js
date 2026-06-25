let allRestaurants = [];

async function loadRestaurants() {
  const token = localStorage.getItem("token");

  const headers = token ? { Authorization: "Bearer " + token } : {};

  const response = await fetch(`${API_BASE_URL}/api/restaurants`, {
    headers,
  });

  if (!response.ok) {
    allRestaurants = [];
    return;
  }

  allRestaurants = await response.json();

  const searchQuery = localStorage.getItem("searchQuery");
  if (searchQuery) {
    const filtered = filterRestaurants(allRestaurants, searchQuery);
    renderRestaurants(filtered);
    localStorage.removeItem("searchQuery");
    const searchInput = document.getElementById("globalSearch");
    if (searchInput) {
      searchInput.value = searchQuery;
    }
  } else {
    renderRestaurants(allRestaurants);
  }
}

function filterRestaurants(restaurants, keyword) {
  const normalized = keyword.toLowerCase().trim();
  return restaurants.filter(
    (r) =>
      r.restaurantName.toLowerCase().includes(normalized) ||
      r.cuisine.toLowerCase().includes(normalized),
  );
}

function renderRestaurants(restaurants) {
  let html = "";

  restaurants.forEach((r) => {
    html += `
      <div
  class="restaurant-card"
  onclick="viewFoods(${r.restaurantId})"
>
        <img src="${r.imageUrl}" class="restaurant-img">

        <div class="rating-badge">
          ⭐ ${r.rating}
        </div>

        <h3>${r.restaurantName}</h3>

        <p>🍴 ${r.cuisine}</p>

        <button
onclick="event.stopPropagation();viewFoods(${r.restaurantId})">
          View Menu
        </button>
      </div>
    `;
  });

  document.getElementById("restaurants").innerHTML = html;
  document.getElementById("restaurantCount").innerText =
    "Showing " + restaurants.length + " Restaurants";
}

async function loadNavbarData() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // username

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
    const cartResponse = await fetch(
      `${API_BASE_URL}/api/cart/user/${userId}`,
      {
        headers: { Authorization: "Bearer " + token },
      },
    );

    if (cartResponse.ok) {
      const cartItems = await cartResponse.json();
      const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      if (cartBadge) cartBadge.innerText = cartCount;
    } else {
      if (cartBadge) cartBadge.innerText = "0";
    }

    const favoriteResponse = await fetch(
      `${API_BASE_URL}/api/favorites/${userId}`,
      {
        headers: { Authorization: "Bearer " + token },
      },
    );

    if (favoriteResponse.ok) {
      const favorites = await favoriteResponse.json();
      if (wishlistBadge) wishlistBadge.innerText = favorites.length;
    } else {
      if (wishlistBadge) wishlistBadge.innerText = "0";
    }
  } catch (e) {
    if (cartBadge) cartBadge.innerText = "0";
    if (wishlistBadge) wishlistBadge.innerText = "0";
  }
}

function attachRestaurantSearchListener() {
  const searchInput = document.getElementById("globalSearch");

  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    const keyword = this.value.toLowerCase().trim();

    const filtered = allRestaurants.filter(
      (r) =>
        r.restaurantName.toLowerCase().includes(keyword) ||
        r.cuisine.toLowerCase().includes(keyword),
    );

    renderRestaurants(filtered);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  onNavbarRendered(attachRestaurantSearchListener);
  Promise.all([loadNavbarData(), loadRestaurants()]);
});

function viewFoods(id) {
  localStorage.setItem("restaurantId", id);

  window.location.href = "foods.html";
}
