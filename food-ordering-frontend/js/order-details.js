// ============================================
// ORDER TRACKING STATUSES
// ============================================
const ORDER_STATUSES = [
  {
    key: "CONFIRMED",
    label: "Order Confirmed",
    emoji: "✅",
    description: "Your order has been confirmed",
  },
  {
    key: "PREPARING",
    label: "Preparing",
    emoji: "🍳",
    description: "Our chef is preparing your food",
  },
  {
    key: "ON_THE_WAY",
    label: "Out For Delivery",
    emoji: "🚴",
    description: "Your order is on the way",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    emoji: "🎉",
    description: "Your order has been delivered",
  },
];

// ============================================
// LOAD ORDER DETAILS
// ============================================
async function loadOrderDetails() {
  const token = localStorage.getItem("token");
  const orderId = localStorage.getItem("orderId");

  if (!token || !orderId) {
    requireLogin("view order details");
    document.getElementById("orderDetailsContainer").innerHTML =
      '<p style="text-align: center; color: var(--text-muted);">Please login to view order details.</p>';
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/orders/details/${orderId}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to load order details");
    }

    const details = await response.json();
    renderOrderDetails(details);
  } catch (error) {
    console.error("Error loading order details:", error);
    document.getElementById("orderDetailsContainer").innerHTML =
      '<p style="text-align: center; color: var(--text-muted);">Unable to load order details</p>';
  }
}

// ============================================
// GET ORDER STATUS
// ============================================
async function getOrderStatus() {
  const token = localStorage.getItem("token");
  const orderId = localStorage.getItem("orderId");

  try {
    const response = await fetch(
      `http://localhost:8080/api/orders/status/${orderId}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      return data.status || "CONFIRMED";
    }
    return "CONFIRMED";
  } catch (error) {
    console.error("Error getting order status:", error);
    return "CONFIRMED";
  }
}

// ============================================
// RENDER ORDER DETAILS
// ============================================
async function renderOrderDetails(details) {
  const currentStatus = await getOrderStatus();
  const currentStatusIndex = ORDER_STATUSES.findIndex(
    (s) => s.key === currentStatus,
  );

  let itemsHtml = "";
  let total = 0;

  details.forEach((item) => {
    total += item.price * item.quantity;

    itemsHtml += `
<div class="order-item">
    <img src="${item.imageUrl}" alt="${item.foodName}" class="order-item-img">
    <div class="order-item-info">
        <h4>${item.foodName}</h4>
        <p>🏪 ${item.restaurantName}</p>
        <p class="quantity">Qty: ${item.quantity} × ₹${item.price}</p>
    </div>
    <div class="order-item-total">₹${item.price * item.quantity}</div>
</div>
    `;
  });

  let statusTimelineHtml = "";
  ORDER_STATUSES.forEach((status, index) => {
    const isCompleted = index <= currentStatusIndex;
    const isCurrent = index === currentStatusIndex;

    statusTimelineHtml += `
<div class="timeline-item ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}">
    <div class="timeline-marker">
        <div class="timeline-dot">${status.emoji}</div>
        ${index < ORDER_STATUSES.length - 1 ? '<div class="timeline-line"></div>' : ""}
    </div>
    <div class="timeline-content">
        <h4 class="timeline-label">${status.label}</h4>
        <p class="timeline-description">${status.description}</p>
        ${isCurrent ? '<p class="timeline-time">Now</p>' : ""}
    </div>
</div>
    `;
  });

  const html = `
<div class="order-container">
  <!-- ORDER TRACKING SECTION -->
  <div class="tracking-section">
    <h2>📦 Order Tracking</h2>
    <div class="order-timeline">
      ${statusTimelineHtml}
    </div>
  </div>

  <!-- ORDER ITEMS SECTION -->
  <div class="items-section">
    <h2>🍴 Order Items</h2>
    <div class="order-items-list">
      ${itemsHtml}
    </div>
  </div>

  <!-- ORDER SUMMARY SECTION -->
  <div class="summary-section">
    <h2>💰 Order Summary</h2>
    <div class="order-summary">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>₹${total}</span>
      </div>
      <div class="summary-row">
        <span>Delivery Fee</span>
        <span>FREE</span>
      </div>
      <div class="summary-row total-row">
        <span>Total</span>
        <span>₹${total}</span>
      </div>
    </div>
  </div>

  <!-- ACTIONS -->
  <div class="order-actions">
    <button class="action-btn back-btn" onclick="window.location.href='orders.html'">
      ← Back to Orders
    </button>
    <button class="action-btn contact-btn" onclick="showContactSupport()">
      💬 Contact Support
    </button>
  </div>
</div>
  `;

  document.getElementById("orderDetailsContainer").innerHTML = html;

  // Start polling for status updates every 10 seconds
  pollOrderStatus(currentStatus);
}

// ============================================
// POLL FOR STATUS UPDATES
// ============================================
let pollInterval = null;
async function pollOrderStatus(lastStatus) {
  if (pollInterval) clearInterval(pollInterval);

  pollInterval = setInterval(async () => {
    const newStatus = await getOrderStatus();
    if (newStatus !== lastStatus) {
      lastStatus = newStatus;
      loadOrderDetails(); // Reload to show new status
      showToast("📦 Order status updated!");
    }
  }, 10000); // Poll every 10 seconds
}

// ============================================
// SUPPORT FUNCTION
// ============================================
function showContactSupport() {
  showToast("💬 Support team will contact you soon");
  // You can implement actual support chat here
}

// ============================================
// INITIALIZE
// ============================================
function openFoodDetails(foodId) {
  localStorage.setItem("foodId", foodId);
  window.location.href = "food-details.html";
}

loadOrderDetails();
