async function placeOrder() {
  const token = localStorage.getItem("token");

  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    requireLogin("place your order");
    return;
  }

  const paymentMethod = document.querySelector(
    'input[name="payment"]:checked',
  ).value;

  const deliveryAddress = document.getElementById("address").value;

  const response = await fetch(
    `${API_BASE_URL}/api/orders/place`,

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
      }),
    },
  );

  const result = await response.text();

  if (result === "Order Placed Successfully") {
    showToast("🎉 Order Placed Successfully");

    setTimeout(() => {
      window.location.href = "order-success.html";
    }, 1000);
  } else {
    showToast(result);
  }
}
