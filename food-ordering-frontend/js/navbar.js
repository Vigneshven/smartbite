if (!window.toggleMenu) {
  window.toggleMenu = function () {
    const navMenu = document.getElementById("navMenu");
    const navbar = document.querySelector(".navbar");
    if (navMenu) navMenu.classList.toggle("active");
    if (navbar) navbar.classList.toggle("nav-open");
  };
}

window.onclick = function (e) {
  if (!e.target.closest(".navbar")) {
    const navMenu = document.getElementById("navMenu");
    const navbar = document.querySelector(".navbar");
    if (navMenu) navMenu.classList.remove("active");
    if (navbar) navbar.classList.remove("nav-open");
  }
};
