(function () {
  const params = new URLSearchParams(location.search);
  const type = params.get('type');
  const slug = params.get('slug');

  if (!type || !slug || !['PROJECT', 'HOBBY'].includes(type)) {
    document.body.innerHTML = '<div class="admin-shell"><p>Missing or invalid type/slug in the URL.</p></div>';
    return;
  }

  const eyebrowEl = document.getElementById('eyebrow');
  const titleEl = document.getElementById('title');
  const leadEl = document.getElementById('lead');
  const msg = document.getElementById('msg');
  const statusHint = document.getElementById('statusHint');
  const galleryItems = document.getElementById('galleryItems');
  const addImageSelect = document.getElementById('addImageSelect');

  document.getElementById('pageTitle').textContent = `Edit — ${slug}`;

  let currentGalleryIds = [];
  let mediaById = {};

  function showMsg(text, ok) {
    msg.textContent = text;
    msg.className = 'msg ' + (ok ? 'ok' : 'error') + ' show';
  }

  function updateStatus(entry) {
    if (!entry.publishedAt) statusHint.textContent = 'Never published yet.';
    else if (entry.hasUnpublishedChanges) statusHint.textContent = 'You have unpublished changes.';
    else statusHint.textContent = 'Draft matches the published version.';
  }

  function renderGallery() {
    galleryItems.innerHTML = '';
    if (!currentGalleryIds.length) {
      galleryItems.innerHTML = '<p class="hint" style="margin:0 0 10px">No images yet.</p>';
    }
    currentGalleryIds.forEach((id) => {
      const media = mediaById[id];
      const div = document.createElement('div');
      div.className = 'media-item';
      div.style.display = 'inline-block';
      div.style.width = '140px';
      div.style.marginRight = '10px';
      div.style.marginBottom = '10px';
      div.innerHTML = `
        <img src="${media ? media.publicUrl : ''}" alt="">
        <div class="meta">
          <button class="danger" data-remove="${id}" style="width:100%">Remove</button>
        </div>
      `;
      galleryItems.appendChild(div);
    });
    galleryItems.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentGalleryIds = currentGalleryIds.filter((id) => id !== btn.getAttribute('data-remove'));
        renderGallery();
      });
    });
  }

  async function loadMediaOptions() {
    const media = await Api.get('/api/admin/media');
    mediaById = {};
    media.forEach((m) => { mediaById[m.id] = m; });
    addImageSelect.innerHTML = '<option value="">Add an image from the media library…</option>' +
      media.map((m) => `<option value="${m.id}">${m.altText || m.key}</option>`).join('');
  }

  addImageSelect.addEventListener('change', () => {
    const id = addImageSelect.value;
    if (id && !currentGalleryIds.includes(id)) {
      currentGalleryIds.push(id);
      renderGallery();
    }
    addImageSelect.value = '';
  });

  function currentDraft() {
    return {
      eyebrow: eyebrowEl.value,
      title: titleEl.value,
      lead: leadEl.value,
      galleryImageIds: currentGalleryIds,
    };
  }

  async function load() {
    const entry = await Api.get(`/api/admin/content/${type}/${slug}`);
    eyebrowEl.value = entry.draftJson.eyebrow || '';
    titleEl.value = entry.draftJson.title || '';
    leadEl.value = entry.draftJson.lead || '';
    currentGalleryIds = entry.draftJson.galleryImageIds || [];
    updateStatus(entry);
    await loadMediaOptions();
    renderGallery();
  }

  async function saveDraft() {
    const entry = await Api.put(`/api/admin/content/${type}/${slug}`, { draftJson: currentDraft() });
    updateStatus(entry);
    showMsg('Draft saved.', true);
  }

  document.getElementById('saveBtn').addEventListener('click', () => {
    saveDraft().catch((err) => showMsg(err.message, false));
  });

  document.getElementById('publishBtn').addEventListener('click', async () => {
    try {
      await saveDraft();
      const entry = await Api.post(`/api/admin/content/${type}/${slug}/publish`);
      updateStatus(entry);
      showMsg('Published. The live site will pick this up on next page load.', true);
    } catch (err) {
      showMsg(err.message, false);
    }
  });

  document.getElementById('revertBtn').addEventListener('click', async () => {
    if (!confirm('Discard unpublished changes and revert to the last published version?')) return;
    try {
      const entry = await Api.post(`/api/admin/content/${type}/${slug}/revert-draft`);
      eyebrowEl.value = entry.draftJson.eyebrow || '';
      titleEl.value = entry.draftJson.title || '';
      leadEl.value = entry.draftJson.lead || '';
      currentGalleryIds = entry.draftJson.galleryImageIds || [];
      updateStatus(entry);
      renderGallery();
      showMsg('Reverted.', true);
    } catch (err) {
      showMsg(err.message, false);
    }
  });

  load().catch((err) => showMsg(err.message, false));
})();
