let allOrders = [];

async function loadNavbarData() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const usernameElement = document.getElementById("username");
  if (usernameElement) {
    usernameElement.innerText = localStorage.getItem("username") || "User";
  }

  const cartCountElement = document.getElementById("cartCount");

  if (!token || !userId) {
    if (cartCountElement) cartCountElement.innerText = "0";
    return;
  }

  try {
    const cartResponse = await fetch(
      `http://localhost:8080/api/cart/user/${userId}`,
      {
        headers: { Authorization: "Bearer " + token },
      },
    );

    if (cartResponse.ok) {
      const cart = await cartResponse.json();
      const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      if (cartCountElement) cartCountElement.innerText = cartCount;
    } else if (cartCountElement) {
      cartCountElement.innerText = "0";
    }
  } catch (error) {
    if (cartCountElement) cartCountElement.innerText = "0";
  }
}

function formatDateTime(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function renderOrders(orders) {
  if (orders.length === 0) {
    document.getElementById("orders").innerHTML = `
    <div class="empty-cart">

      <div style="font-size:90px;">📦</div>

      <h2>No Orders Yet</h2>

      <p>Your placed orders will appear here.</p>

      <button
      class="shop-btn"
      onclick="window.location.href='restaurants.html'">

      🍔 Order Now

      </button>

    </div>
  `;

    return;
  }
  let html = "";

  const count = document.getElementById("orderCount");

  if (count) {
    count.innerText = `Showing ${orders.length} order${orders.length !== 1 ? "s" : ""}`;
  }

  orders.forEach((order) => {
    html += `
<div class="order-card">

    <div class="order-top">

        <h3>📦 Order #${order.orderId}</h3>

        <span class="status-badge ${order.status.toLowerCase()}">
            ${order.status}
        </span>

    </div>

    <p>📅 ${formatDateTime(order.orderDate)}</p>

    <h4 class="price">
        ₹ ${order.totalAmount}
    </h4>

    <button onclick="viewDetails(${order.orderId})">
        View Details →
    </button>

</div>
`;
  });

  document.getElementById("orders").innerHTML = html;
}

async function loadOrders() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    allOrders = [];
    renderOrders([]);
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/orders/user/${userId}`,
      {
        headers: { Authorization: "Bearer " + token },
      },
    );

    const orders = response.ok ? await response.json() : [];
    allOrders = orders;
    renderOrders(allOrders);
  } catch (error) {
    allOrders = [];
    renderOrders([]);
  }
}

function viewDetails(orderId) {
  localStorage.setItem("orderId", orderId);

  window.location.href = "order-details.html";
}

function attachOrderSearchListener() {
  const orderSearch =
    document.getElementById("orderSearch") ||
    document.getElementById("globalSearch");

  if (!orderSearch) return;

  orderSearch.addEventListener("keyup", function () {
    const keyword = this.value.toLowerCase();

    const filtered = allOrders.filter(
      (order) =>
        order.orderId.toString().includes(keyword) ||
        order.status.toLowerCase().includes(keyword),
    );

    renderOrders(filtered);
  });
}

onNavbarRendered(attachOrderSearchListener);
Promise.all([loadNavbarData(), loadOrders()]);
