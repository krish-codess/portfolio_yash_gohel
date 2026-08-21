(function () {
  if (Api.getToken()) { location.href = 'dashboard.html'; return; }

  const form = document.getElementById('loginForm');
  const msg = document.getElementById('msg');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.classList.remove('show');
    submitBtn.disabled = true;
    try {
      const { token } = await Api.post('/api/admin/auth/login', {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
      });
      Api.setToken(token);
      location.href = 'dashboard.html';
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add('show');
      submitBtn.disabled = false;
    }
  });
})();
