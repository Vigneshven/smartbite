let favorites = [];
let allFoods = [];
let currentSort = "";
let currentSearch = "";

document.getElementById("sortFood")?.addEventListener("change", function () {
  currentSort = this.value;
  applyFilters();
});

async function loadFavorites() {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  if (!userId || !token) {
    favorites = [];
    return;
  }

  const response = await fetch(`${API_BASE_URL}/api/favorites/${userId}`, {
    headers: { Authorization: "Bearer " + token },
  });

  if (!response.ok) {
    favorites = [];
    return;
  }

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

  // If not logged in, show zero badges and skip protected calls
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
      favorites = await favoriteResponse.json();
      if (wishlistBadge) wishlistBadge.innerText = favorites.length;
    } else {
      if (wishlistBadge) wishlistBadge.innerText = "0";
    }
  } catch (e) {
    if (cartBadge) cartBadge.innerText = "0";
    if (wishlistBadge) wishlistBadge.innerText = "0";
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

function attachFoodSearchListener() {
  const searchBox =
    document.getElementById("foodSearch") ||
    document.getElementById("globalSearch");

  if (!searchBox) return;

  searchBox.addEventListener("input", function () {
    currentSearch = this.value.trim().toLowerCase();
    applyFilters();
  });
}

onNavbarRendered(attachFoodSearchListener);

function applyFilters() {
  let foods = [...allFoods];

  // Search
  if (currentSearch.trim() !== "") {
    const keyword = currentSearch.toLowerCase();

    foods = foods.filter(
      (food) =>
        food.foodName.toLowerCase().includes(keyword) ||
        food.description.toLowerCase().includes(keyword) ||
        food.category.toLowerCase().includes(keyword),
    );
  }

  // Sorting
  switch (currentSort) {
    case "low":
      foods.sort((a, b) => a.price - b.price);
      break;

    case "high":
      foods.sort((a, b) => b.price - a.price);
      break;

    case "nameAZ":
      foods.sort((a, b) => a.foodName.localeCompare(b.foodName));
      break;

    case "nameZA":
      foods.sort((a, b) => b.foodName.localeCompare(a.foodName));
      break;

    default:
      break;
  }

  renderFoods(foods);
}

function viewFood(foodId) {
  localStorage.setItem("foodId", foodId);

  window.location.href = "food-details.html";
}

function renderRatingStars(rating) {
  const stars = [1, 2, 3, 4, 5]
    .map(
      (value) =>
        `<button type="button" class="star-button ${
          value <= rating ? "active" : ""
        }" onclick="setReviewRating(${value})">★</button>`,
    )
    .join("");

  const starContainer = document.getElementById("ratingStars");

  if (starContainer) {
    starContainer.innerHTML = stars;
  }
}

function setReviewRating(value) {
  selectedReviewRating = value;
  renderRatingStars(value);
}

async function loadRestaurantInfo() {
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");

  if (!restaurantId) {
    window.location.href = "restaurants.html";
    return;
  }

  try {
    const restaurantHeaders = token ? { Authorization: "Bearer " + token } : {};
    const [restaurantResponse, averageResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}`, {
        headers: restaurantHeaders,
      }),
      fetch(`${API_BASE_URL}/api/reviews/restaurant/${restaurantId}/average`, {
        headers: restaurantHeaders,
      }),
    ]);

    const restaurant = await restaurantResponse.json();
    const averageRating = await averageResponse.json();

    const restaurantName = document.getElementById("restaurantName");
    const restaurantCuisine = document.getElementById("restaurantCuisine");
    const restaurantRating = document.getElementById("restaurantRating");
    const reviewAverage = document.getElementById("reviewAverage");
    const menuTitle = document.getElementById("menuTitle");

    if (restaurantName) {
      restaurantName.innerText = restaurant.restaurantName || "Restaurant Menu";
    }

    if (restaurantCuisine) {
      const cuisineText = restaurant.cuisine ? restaurant.cuisine : "";
      const addressText = restaurant.address ? ` • ${restaurant.address}` : "";
      restaurantCuisine.innerText = `${cuisineText}${addressText}`.trim();
    }

    if (restaurantRating) {
      restaurantRating.innerText = `⭐ ${
        averageRating ? averageRating.toFixed(1) : "0.0"
      }`;
    }

    if (reviewAverage) {
      reviewAverage.innerText = averageRating
        ? `${averageRating.toFixed(1)} average rating`
        : "Be the first to rate this restaurant";
    }

    if (menuTitle) {
      menuTitle.innerText = `🍽 Menu — ${restaurant.restaurantName || "Restaurant"}`;
    }
  } catch (error) {
    console.error("Failed to load restaurant info", error);
  }
}

async function loadReviews() {
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");

  if (!restaurantId) {
    return;
  }

  try {
    const reviewHeaders = token ? { Authorization: "Bearer " + token } : {};
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/restaurant/${restaurantId}`,
      {
        headers: reviewHeaders,
      },
    );

    if (!response.ok) {
      renderReviews([]);
      return;
    }

    const reviews = await response.json();
    renderReviews(reviews);
  } catch (error) {
    console.error("Failed to load reviews", error);
  }
}

function renderReviews(reviews) {
  const reviewList = document.getElementById("reviewList");

  if (!reviewList) {
    return;
  }

  if (!reviews || reviews.length === 0) {
    reviewList.innerHTML =
      '<p class="no-reviews">No reviews yet. Be the first to share your experience!</p>';
    return;
  }

  reviewList.innerHTML = reviews
    .map(
      (review) => `
      <article class="review-item">
        <div class="review-meta">
          <span class="review-author">${review.userName || "Anonymous"}</span>
          <span class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(
            5 - review.rating,
          )}</span>
        </div>
        ${review.photoUrl ? `<img src="${review.photoUrl}" alt="Review photo" />` : ""}
        <p class="review-comment">${review.comment || "No comment"}</p>
      </article>
    `,
    )
    .join("");
}

async function submitReview(event) {
  event.preventDefault();

  const restaurantId = localStorage.getItem("restaurantId");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  if (!restaurantId || !userId) {
    requireLogin();
    return;
  }

  const commentInput = document.getElementById("reviewComment");
  const comment = commentInput ? commentInput.value.trim() : "";

  if (!comment) {
    showToast("Please write a review before submitting.", "error");
    return;
  }

  const photoInput = document.getElementById("reviewPhoto");
  const photo = photoInput ? photoInput.files[0] : null;

  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("restaurantId", restaurantId);
  formData.append("rating", selectedReviewRating);
  formData.append("comment", comment);
  if (photo) {
    formData.append("photo", photo);
  }

  if (!token || !userId) {
    requireLogin();
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    });

    if (response.ok) {
      showToast("⭐ Review submitted successfully");
      if (commentInput) {
        commentInput.value = "";
      }
      if (photoInput) {
        photoInput.value = "";
        document.getElementById("photoFileName").innerText = "";
      }
      selectedReviewRating = 5;
      renderRatingStars(selectedReviewRating);
      await loadRestaurantInfo();
      await loadReviews();
    } else {
      const errorText = await response.text();
      showToast(`Failed to submit review: ${errorText}`, "error");
    }
  } catch (error) {
    console.error("Submit review failed", error);
    showToast("Failed to submit review.", "error");
  }
}

async function loadFoods() {
  const restaurantId = localStorage.getItem("restaurantId");

  console.log("Restaurant ID from localStorage:", restaurantId);

  const token = localStorage.getItem("token");

  const headers = token ? { Authorization: "Bearer " + token } : {};

  const response = await fetch(
    `${API_BASE_URL}/api/foods/restaurant/${restaurantId}`,
    {
      headers,
    },
  );

  // load favorites (will be empty if not logged in)
  await loadFavorites();

  if (!response.ok) {
    allFoods = [];
    applyFilters();
    return;
  }

  const foods = await response.json();
  allFoods = foods;
  applyFilters();
}

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
      foodId: foodId,
      quantity: 1,
    }),
  });

  if (response.ok) showToast("🛒 Added To Cart");
  else showToast("Failed to add to cart", "error");

  loadNavbarData();
}

async function toggleFavorite(foodId) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    requireLogin();
    return;
  }

  const response = await fetch(`${API_BASE_URL}/api/favorites/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ userId: Number(userId), foodId: foodId }),
  });

  if (!response.ok) showToast("Failed to toggle favorite", "error");

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

const reviewForm = document.getElementById("reviewForm");
const photoInput = document.getElementById("reviewPhoto");
let selectedReviewRating = 5;

renderRatingStars(selectedReviewRating);

if (reviewForm) {
  reviewForm.addEventListener("submit", submitReview);
}

if (photoInput) {
  photoInput.addEventListener("change", function () {
    const photoFileName = document.getElementById("photoFileName");
    if (photoFileName) {
      photoFileName.innerText =
        this.files.length > 0 ? `✓ ${this.files[0].name}` : "";
    }
  });
}

Promise.all([
  loadNavbarData(),
  loadRestaurantInfo(),
  loadFoods(),
  loadReviews(),
]);
