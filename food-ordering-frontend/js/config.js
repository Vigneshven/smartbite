const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://your-backend-domain.com";

export default API_BASE_URL;
