(function () {
  const tagEl = document.getElementById('tag');
  const subEl = document.getElementById('sub');
  const msg = document.getElementById('msg');
  const statusHint = document.getElementById('statusHint');

  function showMsg(text, ok) {
    msg.textContent = text;
    msg.className = 'msg ' + (ok ? 'ok' : 'error') + ' show';
  }

  function updateStatus(entry) {
    if (!entry.publishedAt) statusHint.textContent = 'Never published yet.';
    else if (entry.hasUnpublishedChanges) statusHint.textContent = 'You have unpublished changes.';
    else statusHint.textContent = 'Draft matches the published version.';
  }

  async function load() {
    const entry = await Api.get('/api/admin/content/HERO/hero');
    tagEl.value = entry.draftJson.tag || '';
    subEl.value = entry.draftJson.sub || '';
    updateStatus(entry);
  }

  async function saveDraft() {
    const entry = await Api.put('/api/admin/content/HERO/hero', {
      draftJson: { tag: tagEl.value, sub: subEl.value },
    });
    updateStatus(entry);
    showMsg('Draft saved.', true);
  }

  document.getElementById('saveBtn').addEventListener('click', () => {
    saveDraft().catch((err) => showMsg(err.message, false));
  });

  document.getElementById('publishBtn').addEventListener('click', async () => {
    try {
      await saveDraft();
      const entry = await Api.post('/api/admin/content/HERO/hero/publish');
      updateStatus(entry);
      showMsg('Published. The live site will pick this up on next page load.', true);
    } catch (err) {
      showMsg(err.message, false);
    }
  });

  document.getElementById('revertBtn').addEventListener('click', async () => {
    if (!confirm('Discard unpublished changes and revert to the last published version?')) return;
    try {
      const entry = await Api.post('/api/admin/content/HERO/hero/revert-draft');
      tagEl.value = entry.draftJson.tag || '';
      subEl.value = entry.draftJson.sub || '';
      updateStatus(entry);
      showMsg('Reverted.', true);
    } catch (err) {
      showMsg(err.message, false);
    }
  });

  load().catch((err) => showMsg(err.message, false));
})();
