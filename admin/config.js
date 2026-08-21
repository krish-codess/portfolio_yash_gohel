// Public API base URL — not a secret, safe to commit. Points local dev at
// localhost automatically; production deploys use the real Render URL.
window.ADMIN_CONFIG = {
  apiBaseUrl:
    location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      ? 'http://localhost:4000'
      : 'https://REPLACE-WITH-YOUR-RENDER-SERVICE.onrender.com',
};
