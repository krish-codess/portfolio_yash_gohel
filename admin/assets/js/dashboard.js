(function () {
  const NAMES = {
    'goodflip': 'GoodFlip', 'marketing-skill': 'Ladder & Leap', 'playlist-sync': 'Playlist Sync',
    'quicko': 'Quicko', 'streak': 'Streak AI Technologies', 'tools': 'Tools',
    'art': 'Art & Illustration', 'cooking': 'Cooking', 'playlists': 'Playlists',
  };

  function chip(entry) {
    if (!entry.publishedAt) return '<span class="chip unpublished">never published</span>';
    if (entry.hasUnpublishedChanges) return '<span class="chip dirty">unpublished changes</span>';
    return '<span class="chip clean">published</span>';
  }

  function row(entry, href) {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <div class="name">${NAMES[entry.slug] || entry.slug}</div>
        <div class="slug">${entry.slug}</div>
      </div>
      <div class="row" style="margin-top:0">${chip(entry)}<a class="btn" href="${href}">Edit</a></div>
    `;
    return li;
  }

  (async function load() {
    const entries = await Api.get('/api/admin/content');
    const heroList = document.getElementById('heroList');
    const projectList = document.getElementById('projectList');
    const hobbyList = document.getElementById('hobbyList');

    entries.forEach((entry) => {
      if (entry.type === 'HERO') heroList.appendChild(row(entry, 'hero.html'));
      if (entry.type === 'PROJECT') projectList.appendChild(row(entry, `entry-edit.html?type=PROJECT&slug=${entry.slug}`));
      if (entry.type === 'HOBBY') hobbyList.appendChild(row(entry, `entry-edit.html?type=HOBBY&slug=${entry.slug}`));
    });
  })();
})();
