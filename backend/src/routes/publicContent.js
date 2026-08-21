const express = require('express');
const prisma = require('../db');

const router = express.Router();

// The only endpoint the live portfolio calls. Read-only, no auth, only ever
// reads publishedJson — an unpublished draft edit can never appear here.
router.get('/content', async (req, res) => {
  const entries = await prisma.contentEntry.findMany({
    where: { publishedJson: { not: null } },
    select: { type: true, slug: true, publishedJson: true },
  });

  const result = { hero: null, projects: {}, hobbies: {} };
  for (const entry of entries) {
    if (entry.type === 'HERO') {
      result.hero = entry.publishedJson;
    } else if (entry.type === 'PROJECT') {
      result.projects[entry.slug] = entry.publishedJson;
    } else if (entry.type === 'HOBBY') {
      result.hobbies[entry.slug] = entry.publishedJson;
    }
  }

  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json(result);
});

module.exports = router;
