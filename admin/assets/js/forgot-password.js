(function () {
  const form = document.getElementById('forgotForm');
  const msg = document.getElementById('msg');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    try {
      await Api.post('/api/admin/auth/forgot-password', {
        email: document.getElementById('email').value.trim(),
      });
      msg.textContent = 'If that email is registered, a reset link is on its way. Check your inbox.';
      msg.className = 'msg ok show';
      form.reset();
    } catch (err) {
      msg.textContent = err.message;
      msg.className = 'msg error show';
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
