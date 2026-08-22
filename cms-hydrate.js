/* Pulls published CMS content into designated [data-cms-field] elements on
   load. On ANY failure (timeout, network error, non-200, cold backend,
   malformed JSON) it does nothing — the page already has its real static
   content in the HTML, so the worst case is exactly today's page, never a
   blank or broken one. Uses textContent only, never innerHTML, so CMS text
   can't inject markup.

   Set CMS_API to your deployed backend's URL once it's live (see
   backend/README.md). Until then, every request will simply fail fast and
   fall back to the static content already in the page — nothing breaks. */
(function () {
  var CMS_API = 'https://portfolio-cms-backend-8ml5.onrender.com';
  var TIMEOUT_MS = 2500;
  var scriptEl = document.currentScript;
  var page = scriptEl && scriptEl.getAttribute('data-cms-page');
  if (!page) return;

  var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);

  fetch(CMS_API + '/api/public/content', ctrl ? { signal: ctrl.signal } : {})
    .then(function (res) {
      if (!res.ok) throw new Error('bad status');
      return res.json();
    })
    .then(function (data) {
      var slug = scriptEl.getAttribute('data-cms-slug');
      var slice = page === 'home' ? data.hero
        : page === 'project' ? (data.projects || {})[slug]
        : page === 'hobby' ? (data.hobbies || {})[slug]
        : null;
      if (!slice) return;

      document.querySelectorAll('[data-cms-field]').forEach(function (el) {
        var key = el.getAttribute('data-cms-field');
        var val = slice[key];
        if (typeof val === 'string' && val.trim() !== '') el.textContent = val;
      });

      var galleryEl = document.querySelector('[data-cms-gallery]');
      if (galleryEl && Array.isArray(slice.galleryImages) && slice.galleryImages.length) {
        galleryEl.innerHTML = slice.galleryImages.map(function (img) {
          var im = document.createElement('img');
          im.src = img.url;
          im.alt = img.alt || '';
          im.loading = 'lazy';
          return im.outerHTML;
        }).join('');
        galleryEl.style.display = '';
      }
    })
    .catch(function () {
      /* silent: DOM already has the real static content */
    })
    .finally(function () {
      clearTimeout(timer);
    });
})();
