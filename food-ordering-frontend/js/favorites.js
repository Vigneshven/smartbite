let allFavorites = [];

async function loadNavbarData() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const username = localStorage.getItem("username");
  const usernameElement = document.getElementById("username");

  if (usernameElement) {
    usernameElement.innerText = username || "User";
  }

  // Wishlist Count
  const favResponse = await fetch(
    `http://localhost:8080/api/favorites/${userId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  const favorites = await favResponse.json();

  const wishlistCount = document.getElementById("wishlistCount");

  if (wishlistCount) {
    wishlistCount.innerText = favorites.length;
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

  const totalCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const cartCount = document.getElementById("cartCount");

  if (cartCount) {
    cartCount.innerText = totalCart;
  }
}
function renderFavorites(foods) {
  // Update count first
  const countText = document.querySelector(".food-count");

  if (countText) {
    countText.innerText = `Showing ${foods.length} favorite${foods.length !== 1 ? "s" : ""}`;
  }

  // Empty state
  if (foods.length === 0) {
    document.getElementById("favorites").innerHTML = `
      <div class="empty-cart">

          <div style="font-size:90px;">❤️</div>

          <h2>No Favorites Found</h2>

          <p>Save your favourite foods and they'll appear here.</p>

          <button class="shop-btn"
              onclick="window.location.href='restaurants.html'">

              🍽 Browse Restaurants

          </button>

      </div>
    `;

    return;
  }

  let html = "";

  foods.forEach((food) => {
    html += `
<div class="food-card">

    <img src="${food.imageUrl}"
         class="favorite-food-img"
         onclick="openFoodDetails(${food.foodId})">

    <div class="food-body">

        <h3 class="clickable-food"
            onclick="openFoodDetails(${food.foodId})">
            ${food.foodName}
        </h3>

        <h4>₹ ${food.price}</h4>

        <button onclick="removeFavorite(${food.foodId})">
            ❌ Remove
        </button>

        <button onclick="addToCart(${food.foodId})">
            🛒 Add To Cart
        </button>

    </div>

</div>
`;
  });

  document.getElementById("favorites").innerHTML = html;
}

function openFoodDetails(foodId) {
  localStorage.setItem("foodId", foodId);
  window.location.href = "food-details.html";
}

async function loadFavoritesPage() {
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

  const foods = await response.json();

  allFavorites = foods;

  renderFavorites(foods);
}

async function removeFavorite(foodId) {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:8080/api/favorites/remove?userId=${userId}&foodId=${foodId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  const text = await response.text();

  if (response.ok) {
    showToast("❤️ Removed From Favorites", "success");
  } else {
    showToast(text, "error");
  }

  loadNavbarData();
  loadFavoritesPage();
}

async function addToCart(foodId) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

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

  const text = await response.text();
  if (response.ok) {
    showToast("🛒 Added To Cart", "success");

    await loadNavbarData();
  } else {
    showToast(text, "error");
  }
}

function goBack() {
  window.location.href = "foods.html";
}

const favoriteSearch = document.getElementById("favoriteSearch");

if (favoriteSearch) {
  favoriteSearch.addEventListener("input", function () {
    const keyword = this.value.toLowerCase();

    const filtered = allFavorites.filter((food) =>
      food.foodName.toLowerCase().includes(keyword),
    );

    renderFavorites(filtered);
  });
}

Promise.all([loadNavbarData(), loadFavoritesPage()]);
