let favorites = [];
let allFoods = [];
let currentSort = "";
let currentSearch = "";

async function loadFavorites() {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:8080/api/favorites/${userId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  favorites = await response.json();
}

async function loadNavbarData() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const username = localStorage.getItem("username");

  if (document.getElementById("username")) {
    document.getElementById("username").innerText = username || "User";
  }

  // Cart Count

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

  // Wishlist Count

  const favoriteResponse = await fetch(
    `http://localhost:8080/api/favorites/${userId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  favorites = await favoriteResponse.json();

  const wishlistBadge = document.getElementById("wishlistCount");

  if (wishlistBadge) {
    wishlistBadge.innerText = favorites.length;
  }
}

function renderFoods(foods) {
  let html = "";
  document.getElementById("foodCount").innerText =
    `Showing ${foods.length} food${foods.length !== 1 ? "s" : ""}`;

  foods.forEach((food) => {
    const isFav = favorites.some((f) => f.foodId === food.foodId);

    html += `
      <div class="food-card"
onclick="viewFood(${food.foodId})">

        <img
    src="${food.imageUrl}"
    class="food-img"
    onclick="viewFood(${food.foodId})">

<h3 onclick="viewFood(${food.foodId})">
    ${food.foodName}
</h3>

        <div class="food-body">

          <div class="food-top">

            <h3 class="food-title">${food.foodName}</h3>

            <button
              class="heart-btn ${isFav ? "active" : ""}"
              onclick="event.stopPropagation();toggleFavorite(${food.foodId})">

              ${isFav ? "❤️" : "🤍"}

            </button>

          </div>

          <p>${food.description}</p>
          <p>🔥 ${food.calories} Calories</p>
          <p>🍴 ${food.category}</p>

          <h4>₹ ${food.price}</h4>

          <button
onclick="event.stopPropagation();addToCart(${food.foodId})">
            🛒 Add To Cart
          </button>

        </div>

      </div>
    `;
  });

  document.getElementById("foods").innerHTML = html;
}

const searchBox = document.getElementById("foodSearch");

if (searchBox) {
  searchBox.addEventListener("input", function () {
    currentSearch = this.value.trim().toLowerCase();

    applyFilters();
  });
}

function applyFilters() {
  let foods = [...allFoods];

  // Search

  if (currentSearch.trim() !== "") {
    foods = foods.filter((food) =>
      food.foodName.toLowerCase().includes(currentSearch.toLowerCase()),
    );
  }

  // Sort

  if (currentSort === "low") {
    foods.sort((a, b) => a.price - b.price);
  }

  if (currentSort === "high") {
    foods.sort((a, b) => b.price - a.price);
  }

  renderFoods(foods);
}

async function loadFoods() {
  const restaurantId = localStorage.getItem("restaurantId");

  console.log("Restaurant ID from localStorage:", restaurantId);

  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:8080/api/foods/restaurant/${restaurantId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  await loadFavorites();

  const foods = await response.json();
  allFoods = foods;
  applyFilters();
}

async function addToCart(foodId) {
  const token = localStorage.getItem("token");

  console.log("TOKEN:", token);

  const userId = localStorage.getItem("userId");

  console.log("USER ID:", userId);

  const response = await fetch("http://localhost:8080/api/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      userId: Number(userId),
      foodId: foodId,
      quantity: 1,
    }),
  });

  console.log("STATUS:", response.status);

  const text = await response.text();
  console.log(text);

  showToast("🛒 Added To Cart");

  loadNavbarData();
}

async function toggleFavorite(foodId) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  await fetch("http://localhost:8080/api/favorites/toggle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      userId: Number(userId),
      foodId: foodId,
    }),
  });

  await loadFavorites();

  await loadNavbarData();

  applyFilters();
}

function openWishlist() {
  window.location.href = "favorites.html";
}

function openCart() {
  window.location.href = "cart.html";
}

function goBack() {
  window.location.href = "restaurants.html";
}

document.getElementById("sortFood").addEventListener("change", function () {
  currentSort = this.value;

  applyFilters();
});

Promise.all([loadNavbarData(), loadFoods()]);
