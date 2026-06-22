let allCartItems = [];
let discount = 0;
let appliedPromo = "";
let currentCartSearch = "";

function getDeliveryFee(total) {
  if (total >= 500) {
    return 0;
  }

  if (total >= 300) {
    return 20;
  }

  return 40;
}

async function loadNavbarData() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const username = localStorage.getItem("username");

  document.getElementById("username").innerText = username || "User";

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

function renderCart(items) {
  if (items.length === 0) {
    if (currentCartSearch !== "") {
      document.getElementById("cart").innerHTML = `
      <div class="empty-cart">

          <div style="font-size:90px;">🔍</div>

          <h2>No matching items found</h2>

          <p>Try searching with a different food name.</p>

      </div>
    `;

      const countElement = document.getElementById("cartItemCount");

      if (countElement) {
        countElement.innerText = "Showing 0 items";
      }

      return;
    }

    document.getElementById("cart").innerHTML = `
      <div class="empty-cart">

          <div style="font-size:90px;">🛒</div>

          <h2>Your Cart is Empty</h2>

          <p>Add some delicious food to continue.</p>

          <button class="shop-btn"
              onclick="window.location.href='restaurants.html'">

              🍔 Browse Restaurants

          </button>

      </div>
  `;

    const countElement = document.getElementById("cartItemCount");

    if (countElement) {
      countElement.innerText = "0 Items in Cart";
    }

    return;
  }
  let html = "";
  let total = 0;

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const countElement = document.getElementById("cartItemCount");

  const cartCount = document.getElementById("cartItemCount");

  if (cartCount) {
    cartCount.innerText = `Showing ${items.length} item${items.length !== 1 ? "s" : ""}`;
  }
  if (countElement) {
    countElement.innerText =
      itemCount + (itemCount === 1 ? " Item in Cart" : " Items in Cart");
  }

  items.forEach((item) => {
    total += item.price * item.quantity;

    html += `
<div class="cart-card">

    <img src="${item.imageUrl}"
         class="favorite-food-img"
         onclick="openFoodDetails(${item.foodId})">

    <div class="food-body">

        <h3 class="clickable-food"
            onclick="openFoodDetails(${item.foodId})">

            ${item.foodName}

        </h3>

        <p>
            🏪 ${item.restaurantName}
        </p>

        <div class="qty-container">

            <button class="qty-btn"
                onclick="updateQty(${item.cartId}, ${item.quantity - 1})"
                ${item.quantity <= 1 ? "disabled" : ""}>
                −
            </button>

            <span class="qty">${item.quantity}</span>

            <button class="qty-btn"
                onclick="updateQty(${item.cartId}, ${item.quantity + 1})">
                +
            </button>

        </div>

        <h4 class="price">
            ₹ ${item.itemTotal}
        </h4>

        <button class="action-btn"
            onclick="removeItem(${item.cartId})">

            ❌ Remove

        </button>

    </div>

</div>
`;
  });

  const deliveryFee = getDeliveryFee(total);

  const finalTotal = total + deliveryFee - discount;

  html += `
<div class="checkout-card">

    <h2 class="checkout-title">
        🧾 Order Summary
    </h2>

    <div class="price-row">

        <span>Subtotal</span>

        <span>₹ ${total}</span>

    </div>

    <div class="price-row">

    <span>Delivery Fee</span>

    <span>

        ${
          deliveryFee === 0
            ? '<span class="free-text">FREE</span>'
            : "₹ " + deliveryFee
        }

    </span>

    </div>

    ${
      deliveryFee > 0
        ? `
    <p class="delivery-note">

        🚚 Add ₹ ${500 - total} more for FREE Delivery

    </p>
    `
        : `
    <p class="delivery-success">

        🎉 You unlocked FREE Delivery!

    </p>
    `
    }

    <div class="promo-box">

    <input

        id="promoCode"

        class="checkout-input"

        placeholder="🎫 Enter Promo Code">

    <button

        class="promo-btn"

        onclick="applyPromo(${total})">

        Apply

    </button>

</div>

    <div class="price-row">

    <span>Discount</span>

    <span style="color:green;">

        - ₹ ${discount}

    </span>

</div>

    <div class="price-row total-row">

        <span>Total</span>

<span>₹ ${finalTotal}</span>

    </div>

    <input
        id="deliveryAddress"
        class="checkout-input"
        type="text"
        placeholder="📍 Enter Delivery Address">

    <div class="payment-container">

    <div class="payment-card active"

        onclick="selectPayment(this,'COD')">

        💵

        <h4>Cash</h4>

        <p>Pay after delivery</p>

    </div>

    <div class="payment-card"

        onclick="selectPayment(this,'UPI')">

        📱

        <h4>UPI</h4>

        <p>Google Pay / PhonePe</p>

    </div>

    <div class="payment-card"

        onclick="selectPayment(this,'CARD')">

        💳

        <h4>Card</h4>

        <p>Debit / Credit Card</p>

    </div>

</div>

<input

    type="hidden"

    id="paymentMethod"

    value="COD">

    <button
        class="place-order-btn"
        onclick="placeOrder()">

        Place Order

    </button>

</div>
`;

  document.getElementById("cart").innerHTML = html;
}

function openFoodDetails(foodId) {
  localStorage.setItem("foodId", foodId);
  window.location.href = "food-details.html";
}

async function loadCart() {
  const token = localStorage.getItem("token");

  const userId = localStorage.getItem("userId");

  const response = await fetch(
    `http://localhost:8080/api/cart/user/${userId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  const items = (await response.json()) || [];
  allCartItems = items;

  applyCartFilter();
}

async function removeItem(cartId) {
  const token = localStorage.getItem("token");

  await fetch(`http://localhost:8080/api/cart/${cartId}`, {
    method: "DELETE",

    headers: {
      Authorization: "Bearer " + token,
    },
  });
  showToast("❌ Item Removed");

  await loadNavbarData();

  loadCart();
}

Promise.all([loadNavbarData(), loadCart()]);

function applyCartFilter() {
  let filtered = [...allCartItems];

  if (currentCartSearch.trim() !== "") {
    filtered = filtered.filter((item) =>
      item.foodName.toLowerCase().includes(currentCartSearch),
    );
  }

  renderCart(filtered);
}

const cartSearch = document.getElementById("cartSearch");

if (cartSearch) {
  cartSearch.addEventListener("input", function () {
    currentCartSearch = this.value.trim().toLowerCase();

    applyCartFilter();
  });
}

async function placeOrder() {
  const token = localStorage.getItem("token");

  const userId = localStorage.getItem("userId");

  const paymentMethod = document.getElementById("paymentMethod").value;

  const deliveryAddress = document.getElementById("deliveryAddress").value;

  if (deliveryAddress.trim() === "") {
    showToast("📍 Please enter delivery address");

    return;
  }

  const response = await fetch(
    "http://localhost:8080/api/orders/place",

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: "Bearer " + token,
      },

      body: JSON.stringify({
        userId: Number(userId),

        paymentMethod: paymentMethod,

        deliveryAddress: deliveryAddress,

        discount: discount,

        promoCode: appliedPromo,
      }),
    },
  );

  const message = await response.text();

  if (response.ok) {
    showToast("🎉 Order Placed Successfully");

    await loadNavbarData();

    setTimeout(() => {
      window.location.href = "orders.html";
    }, 1500);
  } else {
    showToast(message);
  }
}

async function updateQty(cartId, quantity) {
  if (quantity < 1) return;

  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:8080/api/cart/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      cartId,
      quantity,
    }),
  });

  const text = await response.text();

  if (response.status === 200) {
    showToast("🛒 Cart Updated");

    await loadNavbarData();

    await loadCart();
  } else {
    alert("Update Failed: " + text);
  }
}

async function addToCart(foodId) {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  await fetch("http://localhost:8080/api/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      userId: userId,
      foodId: foodId,
      quantity: 1,
    }),
  });

  alert("Added to cart 🛒");
}
function applyPromo(total) {
  const promo = document.getElementById("promoCode").value.trim().toUpperCase();

  if (promo === "SAVE50") {
    discount = 50;

    appliedPromo = promo;

    showToast("🎉 SAVE50 Applied");
  } else if (promo === "SAVE100" && total >= 1000) {
    discount = 100;

    appliedPromo = promo;

    showToast("🎉 SAVE100 Applied");
  } else {
    discount = 0;

    appliedPromo = "";

    showToast("❌ Invalid Promo");
  }

  applyCartFilter();

  const promoInput = document.getElementById("promoCode");

  if (promoInput) {
    promoInput.value = appliedPromo;
  }
}

function selectPayment(card, method) {
  document
    .querySelectorAll(".payment-card")
    .forEach((c) => c.classList.remove("active"));

  card.classList.add("active");

  document.getElementById("paymentMethod").value = method;
}
