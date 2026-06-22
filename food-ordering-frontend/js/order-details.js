async function loadOrderDetails() {
  const token = localStorage.getItem("token");

  const orderId = localStorage.getItem("orderId");

  const response = await fetch(
    `http://localhost:8080/api/orders/details/${orderId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  const details = await response.json();

  let html = "";

  let total = 0;

  details.forEach((item) => {
    total += item.price * item.quantity;

    html += `
<div class="order-card">

    <img
        src="${item.imageUrl}"
        class="order-food-img"
        onclick="openFoodDetails(${item.foodId})">

    <div class="order-food-info">

        <h3 class="clickable-food"
            onclick="openFoodDetails(${item.foodId})">

            ${item.foodName}

        </h3>

        <p>🏪 ${item.restaurantName}</p>

        <p>Quantity : ${item.quantity}</p>

        <h4 class="price">

            ₹ ${item.price}

        </h4>

        <h3 class="total-price">

            Total ₹ ${item.price * item.quantity}

        </h3>

    </div>

</div>
`;
  });

  html += `
<div class="order-summary-card">

    <h2>📦 Order Summary</h2>

    <div class="summary-row">

        <span>Grand Total</span>

        <span>₹ ${total}</span>

    </div>

</div>
`;

  document.getElementById("orderDetails").innerHTML = html;
}

function openFoodDetails(foodId) {
  localStorage.setItem("foodId", foodId);
  window.location.href = "food-details.html";
}

loadOrderDetails();
