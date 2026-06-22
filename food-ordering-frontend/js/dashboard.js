async function loadTrendingFoods() {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:8080/api/trending", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const foods = await response.json();

  let html = "";

  foods.forEach((food) => {
    html += `

        <div class="<div class="dashboard-card"
     onclick="viewFood(${food.foodId})">

            <img
    src="${food.imageUrl}"
    onclick="viewFood(${food.foodId})">

<h3 onclick="viewFood(${food.foodId})">
    ${food.foodName}
</h3>

            <div class="dashboard-body">

                <h3>${food.foodName}</h3>

                <p>🔥 Ordered ${food.totalOrders} times</p>

            </div>

        </div>

        `;
  });

  document.getElementById("trendingFoods").innerHTML = html;
}

async function loadRecommendations() {
  const token = localStorage.getItem("token");

  const userId = localStorage.getItem("userId");

  const response = await fetch(
    "http://localhost:8080/api/recommendations/" + userId,

    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  const foods = await response.json();

  let html = "";

  foods.forEach((food) => {
    html += `
<div class="dashboard-card">

    <img
    src="${food.imageUrl}"
    onclick="viewFood(${food.foodId})">

<h3 onclick="viewFood(${food.foodId})">
    ${food.foodName}
</h3>

    <div class="dashboard-body">

        <span class="dashboard-tag">⭐ Recommended</span>

        <h3>${food.foodName}</h3>

        <p>🍴 ${food.category}</p>

        <h4>₹ ${food.price}</h4>

        <button
class="dashboard-btn"
onclick="event.stopPropagation();viewFood(${food.foodId})">
         View Food
         </button>

    </div>

</div>
`;
  });

  document.getElementById("recommendations").innerHTML = html;
}

function viewFood(foodId) {
  localStorage.setItem("foodId", foodId);

  window.location.href = "food-details.html";
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
Promise.all([loadNavbarData(), loadTrendingFoods(), loadRecommendations()]);
