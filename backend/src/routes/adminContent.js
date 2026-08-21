const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const VALID_TYPES = ['HERO', 'PROJECT', 'HOBBY'];

function assertValidType(type, res) {
  if (!VALID_TYPES.includes(type)) {
    res.status(400).json({ error: `Invalid content type. Must be one of: ${VALID_TYPES.join(', ')}` });
    return false;
  }
  return true;
}

router.get('/', async (req, res) => {
  const entries = await prisma.contentEntry.findMany({ orderBy: [{ type: 'asc' }, { slug: 'asc' }] });
  res.json(
    entries.map((e) => ({
      type: e.type,
      slug: e.slug,
      draftJson: e.draftJson,
      publishedJson: e.publishedJson,
      draftUpdatedAt: e.draftUpdatedAt,
      publishedAt: e.publishedAt,
      hasUnpublishedChanges: !e.publishedAt || e.draftUpdatedAt > e.publishedAt,
    }))
  );
});

router.get('/:type/:slug', async (req, res) => {
  const { type, slug } = req.params;
  if (!assertValidType(type, res)) return;
  const entry = await prisma.contentEntry.findUnique({ where: { type_slug: { type, slug } } });
  if (!entry) return res.status(404).json({ error: 'Not found.' });
  res.json(entry);
});

// Autosave-friendly: only ever writes draftJson. publishedJson is untouched here,
// so an edit can never affect the public site until an explicit publish.
router.put('/:type/:slug', async (req, res) => {
  const { type, slug } = req.params;
  if (!assertValidType(type, res)) return;
  const { draftJson } = req.body || {};
  if (!draftJson || typeof draftJson !== 'object') {
    return res.status(400).json({ error: 'draftJson (object) is required.' });
  }

  const entry = await prisma.contentEntry.upsert({
    where: { type_slug: { type, slug } },
    update: { draftJson },
    create: { type, slug, draftJson },
  });
  res.json(entry);
});

router.post('/:type/:slug/publish', async (req, res) => {
  const { type, slug } = req.params;
  if (!assertValidType(type, res)) return;

  const entry = await prisma.contentEntry.findUnique({ where: { type_slug: { type, slug } } });
  if (!entry) return res.status(404).json({ error: 'Not found.' });

  const [updated] = await prisma.$transaction([
    prisma.contentEntry.update({
      where: { type_slug: { type, slug } },
      data: { publishedJson: entry.draftJson, publishedAt: new Date() },
    }),
    prisma.publishLog.create({
      data: { contentType: type, slug, snapshot: entry.draftJson },
    }),
  ]);

  res.json(updated);
});

// Discards unpublished edits by resetting the draft back to the last published version.
router.post('/:type/:slug/revert-draft', async (req, res) => {
  const { type, slug } = req.params;
  if (!assertValidType(type, res)) return;

  const entry = await prisma.contentEntry.findUnique({ where: { type_slug: { type, slug } } });
  if (!entry) return res.status(404).json({ error: 'Not found.' });
  if (!entry.publishedJson) return res.status(400).json({ error: 'Nothing has been published yet for this entry.' });

  const updated = await prisma.contentEntry.update({
    where: { type_slug: { type, slug } },
    data: { draftJson: entry.publishedJson },
  });
  res.json(updated);
});

module.exports = router;
