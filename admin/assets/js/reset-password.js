(function () {
  const form = document.getElementById('resetForm');
  const msg = document.getElementById('msg');
  const submitBtn = document.getElementById('submitBtn');
  const token = new URLSearchParams(location.search).get('token');

  if (!token) {
    msg.textContent = 'This reset link is missing its token. Request a new one from the forgot-password page.';
    msg.className = 'msg error show';
    form.style.display = 'none';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    try {
      await Api.post('/api/admin/auth/reset-password', {
        token,
        newPassword: document.getElementById('newPassword').value,
      });
      msg.textContent = 'Password updated. Redirecting to login…';
      msg.className = 'msg ok show';
      setTimeout(() => { location.href = 'login.html'; }, 1500);
    } catch (err) {
      msg.textContent = err.message;
      msg.className = 'msg error show';
      submitBtn.disabled = false;
    }
  });
})();
