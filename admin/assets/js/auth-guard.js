// Included on every protected page. Confirms the stored token is still
// valid before anything else runs; Api.get already redirects to login on 401.
(async function () {
  if (!Api.getToken()) {
    location.href = 'login.html';
    return;
  }
  try {
    const me = await Api.get('/api/admin/auth/me');
    document.querySelectorAll('[data-user-email]').forEach((el) => { el.textContent = me.email; });
  } catch (e) {
    // Api already redirects on 401; other errors just leave the page as-is.
  }
})();

function adminLogout() {
  Api.post('/api/admin/auth/logout').catch(() => {}).finally(() => {
    Api.clearToken();
    location.href = 'login.html';
  });
}
