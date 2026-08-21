(function () {
  const form = document.getElementById('changeForm');
  const msg = document.getElementById('msg');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    try {
      await Api.post('/api/admin/auth/change-password', {
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: document.getElementById('newPassword').value,
      });
      msg.textContent = 'Password changed.';
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
