let allRestaurants = [];

async function loadRestaurants() {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:8080/api/restaurants", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  allRestaurants = await response.json();

  renderRestaurants(allRestaurants);
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

  // cart count

  const cartResponse = await fetch(
    `http://localhost:8080/api/cart/user/${userId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  const cartItems = await cartResponse.json();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const cartBadge = document.getElementById("cartCount");

  if (cartBadge) {
    cartBadge.innerText = cartCount;
  }

  // wishlist count

  const favoriteResponse = await fetch(
    `http://localhost:8080/api/favorites/${userId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  const favorites = await favoriteResponse.json();

  const wishlistBadge = document.getElementById("wishlistCount");

  if (wishlistBadge) {
    wishlistBadge.innerText = favorites.length;
  }
}

document.getElementById("searchInput").addEventListener("input", function () {
  const keyword = this.value.toLowerCase();

  const filtered = allRestaurants.filter((r) =>
    r.restaurantName.toLowerCase().includes(keyword),
  );

  renderRestaurants(filtered);
});

function viewFoods(id) {
  localStorage.setItem("restaurantId", id);

  window.location.href = "foods.html";
}
Promise.all([loadNavbarData(), loadRestaurants()]);
