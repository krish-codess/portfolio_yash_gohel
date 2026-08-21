(function () {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const mediaGrid = document.getElementById('mediaGrid');
  const msg = document.getElementById('msg');

  function showMsg(text, ok) {
    msg.textContent = text;
    msg.className = 'msg ' + (ok ? 'ok' : 'error') + ' show';
  }

  function getImageDimensions(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: null, height: null });
      img.src = URL.createObjectURL(file);
    });
  }

  async function uploadFile(file) {
    showMsg('Uploading…', true);
    const { width, height } = await getImageDimensions(file);

    const { key, uploadUrl, publicUrl } = await Api.post('/api/admin/media/presign', {
      filename: file.name,
      contentType: file.type,
    });

    // The presigned URL points straight at R2, not our API — this must be a
    // plain fetch, not Api.*, or it'd wrongly get our own Authorization header.
    const putRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    if (!putRes.ok) throw new Error('Upload to storage failed.');

    await Api.post('/api/admin/media/confirm', {
      key, publicUrl, width, height, contentType: file.type, sizeBytes: file.size,
    });

    showMsg('Uploaded.', true);
    await loadMedia();
  }

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) uploadFile(fileInput.files[0]).catch((err) => showMsg(err.message, false));
    fileInput.value = '';
  });
  ['dragenter', 'dragover'].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => { e.preventDefault(); dropZone.classList.add('drag'); });
  });
  ['dragleave', 'drop'].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => { e.preventDefault(); dropZone.classList.remove('drag'); });
  });
  dropZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file).catch((err) => showMsg(err.message, false));
  });

  async function loadMedia() {
    const items = await Api.get('/api/admin/media');
    mediaGrid.innerHTML = '';
    items.forEach((m) => {
      const div = document.createElement('div');
      div.className = 'media-item';
      div.innerHTML = `
        <img src="${m.publicUrl}" alt="${m.altText || ''}">
        <div class="meta">
          <input type="text" placeholder="Alt text" value="${m.altText || ''}" data-alt="${m.id}">
          <div class="row">
            <button class="danger" data-delete="${m.id}" style="width:100%">Delete</button>
          </div>
        </div>
      `;
      mediaGrid.appendChild(div);
    });

    mediaGrid.querySelectorAll('[data-alt]').forEach((input) => {
      let timer;
      input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          Api.patch(`/api/admin/media/${input.getAttribute('data-alt')}`, { altText: input.value }).catch(() => {});
        }, 600);
      });
    });
    mediaGrid.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this image? This cannot be undone, and it will disappear from any gallery using it.')) return;
        try {
          await Api.del(`/api/admin/media/${btn.getAttribute('data-delete')}`);
          await loadMedia();
        } catch (err) {
          showMsg(err.message, false);
        }
      });
    });
  }

  loadMedia().catch((err) => showMsg(err.message, false));
})();
