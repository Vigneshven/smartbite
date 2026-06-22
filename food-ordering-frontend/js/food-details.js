let quantity = 1;

function changeQty(value) {
  quantity += value;

  if (quantity < 1) {
    quantity = 1;
  }

  document.getElementById("foodQty").innerText = quantity;
}

async function loadNavbarData() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Cart Count
  const cartResponse = await fetch(
    `http://localhost:8080/api/cart/user/${userId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  const cart = await cartResponse.json();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  document.getElementById("cartCount").innerText = cartCount;

  // Wishlist Count
  const favoriteResponse = await fetch(
    `http://localhost:8080/api/favorites/${userId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  const favorites = await favoriteResponse.json();

  document.getElementById("wishlistCount").innerText = favorites.length;
}

async function loadFood() {
  const foodId = localStorage.getItem("foodId");
  const token = localStorage.getItem("token");

  const response = await fetch(
    "http://localhost:8080/api/foods/" + foodId,

    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  const food = await response.json();

  document.getElementById("foodDetails").innerHTML = `

<div class="food-details-container">

    <div class="food-image-section">
        <img src="${food.imageUrl}" class="food-details-img">
    </div>

    <div class="food-info-section">

        <span class="food-category">${food.category}</span>

        <h1>${food.foodName}</h1>

        <p class="food-description">${food.description}</p>

<div class="food-stats">

    <div class="stat-box">
        🔥 <b>${food.calories}</b><br>
        Calories
    </div>

    <div class="stat-box">
        🍽 <b>${food.category}</b><br>
        Category
    </div>

</div>

<div class="ingredients-card">

    <h3>🥗 Ingredients</h3>

    <div class="ingredients-list">

        ${
          food.ingredients
            ? food.ingredients
                .split(",")
                .map(
                  (item) =>
                    `<span class="ingredient-chip">${item.trim()}</span>`,
                )
                .join("")
            : "<span>No ingredients available</span>"
        }

    </div>

</div>

        <h2 class="food-price">₹ ${food.price}</h2>

        <button
class="wishlist-btn"
onclick="toggleFavorite(${food.foodId})">

❤️ Add To Wishlist

</button>

<div class="qty-container">

    <button class="qty-btn" onclick="changeQty(-1)">
        -
    </button>

    <span id="foodQty">1</span>

    <button class="qty-btn" onclick="changeQty(1)">
        +
    </button>

</div>

        <button class="add-cart-btn"
            onclick="addToCart(${food.foodId})">

            🛒 Add To Cart

        </button>

    </div>

</div>

`;
}

Promise.all([loadNavbarData(), loadFood()]);

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
      foodId: Number(foodId),
      quantity: quantity,
    }),
  });

  console.log("STATUS =", response.status);

  const text = await response.text();

  console.log("BODY =", text);

  if (response.ok) {
    showToast("🛒 Added To Cart");

    await loadNavbarData();
  } else {
    showToast("❌ " + text);
  }
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

      foodId: Number(foodId),
    }),
  });

  showToast("❤️ Wishlist Updated");

  await loadNavbarData();
}
