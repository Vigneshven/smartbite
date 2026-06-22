async function updateNavbar() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  // Username

  const userElement = document.getElementById("username");

  if (userElement) {
    userElement.innerText = "👤 " + username;
  }

  // Cart Count

  const cartBadge = document.getElementById("cartCount");

  if (cartBadge) {
    const cartResponse = await fetch(
      `http://localhost:8080/api/cart/user/${userId}`,

      {
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    const cart = await cartResponse.json();

    cartBadge.innerText = cart.length;
  }

  // Wishlist Count

  const wishlistBadge = document.getElementById("wishlistCount");

  if (wishlistBadge) {
    const favResponse = await fetch(
      `http://localhost:8080/api/favorites/${userId}`,

      {
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    const favorites = await favResponse.json();

    wishlistBadge.innerText = favorites.length;
  }
}
