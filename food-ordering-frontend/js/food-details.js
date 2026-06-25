const BASE_URL = `${API_BASE_URL}/api`;

let quantity = 1;
let favorites = [];
let foodPrice = 0;

function changeQty(value) {
  quantity += value;

  if (quantity < 1) {
    quantity = 1;
  }

  document.getElementById("foodQty").innerText = quantity;

  document.getElementById("foodPrice").innerText = foodPrice * quantity;
}

async function loadNavbarData() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const cartCountElement = document.getElementById("cartCount");
  const wishlistCountElement = document.getElementById("wishlistCount");

  if (!token || !userId) {
    if (cartCountElement) cartCountElement.innerText = "0";
    if (wishlistCountElement) wishlistCountElement.innerText = "0";
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

    if (cartResponse.ok && cartCountElement) {
      const cart = await cartResponse.json();
      const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCountElement.innerText = cartCount;
    } else if (cartCountElement) {
      cartCountElement.innerText = "0";
    }

    if (favoriteResponse.ok && wishlistCountElement) {
      const favorites = await favoriteResponse.json();
      wishlistCountElement.innerText = favorites.length;
    } else if (wishlistCountElement) {
      wishlistCountElement.innerText = "0";
    }
  } catch (error) {
    if (cartCountElement) cartCountElement.innerText = "0";
    if (wishlistCountElement) wishlistCountElement.innerText = "0";
  }
}

async function loadFavorites() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    favorites = [];
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites/${userId}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    favorites = response.ok ? await response.json() : [];
  } catch (error) {
    favorites = [];
  }
}

async function loadFood() {
  quantity = 1;
  const foodId = localStorage.getItem("foodId");
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/foods/${foodId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const food = await response.json();
  foodPrice = food.price;

  await loadFavorites();

  const isFav = favorites.some((f) => f.foodId == food.foodId);

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

<div class="health-score-card">
    <h3>Health Score</h3>
    <p class="health-score-description">
      We analyze calories, protein, and fat to help you choose a healthier meal.
    </p>
    <div class="health-score-body">
      <div class="health-score-value" id="healthScoreValue">—</div>
      <div id="healthNutrition" class="nutrition-grid">
        <div class="nutrition-chip">Calories: —</div>
        <div class="nutrition-chip">Protein: —</div>
        <div class="nutrition-chip">Fat: —</div>
      </div>
    </div>
    <button
      class="btn btn-secondary"
      onclick="loadHealthScore(${food.foodId})"
      type="button"
    >
      Refresh Health Score
    </button>
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

        <h2 class="food-price">
    ₹ <span id="foodPrice">${food.price}</span>
</h2>

        <button
class="wishlist-btn ${isFav ? "active" : ""}"
onclick="toggleFavorite(${food.foodId})">

${isFav ? "❤️ Added to Wishlist" : "🤍 Add To Wishlist"}

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

  await loadHealthScore(food.foodId);
}

async function loadHealthScore(foodId) {
  const scoreElement = document.getElementById("healthScoreValue");
  const nutritionElement = document.getElementById("healthNutrition");

  if (scoreElement) scoreElement.innerText = "Loading...";
  if (nutritionElement)
    nutritionElement.innerHTML =
      '<div class="nutrition-chip">Calories: —</div><div class="nutrition-chip">Protein: —</div><div class="nutrition-chip">Fat: —</div>';

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/health/${foodId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) throw new Error("Failed to load health score");

    const result = await response.json();

    if (scoreElement) scoreElement.innerText = result.healthScore;
    if (nutritionElement)
      nutritionElement.innerHTML = `
        <div class="nutrition-chip">Calories: ${result.calories}</div>
        <div class="nutrition-chip">Protein: ${result.protein}g</div>
        <div class="nutrition-chip">Fat: ${result.fat}g</div>
      `;
  } catch (error) {
    console.error(error);
    if (scoreElement) scoreElement.innerText = "—";
    if (nutritionElement)
      nutritionElement.innerHTML =
        '<div class="nutrition-chip">Unable to load nutrition data</div>';
  }
}

Promise.all([loadNavbarData(), loadFood()]);

async function addToCart(foodId) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    requireLogin();
    return;
  }

  const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
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

  await loadNavbarData();

  await loadFood();
}
