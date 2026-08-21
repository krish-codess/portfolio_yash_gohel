const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');
const { getPresignedUploadUrl, deleteObject } = require('../lib/r2');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const media = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(media);
});

// Step 1 of upload: browser asks us for a presigned URL, then PUTs the file
// directly to R2 itself. The file's bytes never pass through this server.
router.post('/presign', async (req, res) => {
  const { filename, contentType } = req.body || {};
  if (!filename || !contentType) {
    return res.status(400).json({ error: 'filename and contentType are required.' });
  }
  const { key, uploadUrl, publicUrl } = await getPresignedUploadUrl({ filename, contentType });
  res.json({ key, uploadUrl, publicUrl });
});

// Step 2 of upload: after the direct-to-R2 PUT succeeds, the browser tells us
// so we can record it in the database.
router.post('/confirm', async (req, res) => {
  const { key, publicUrl, altText, width, height, contentType, sizeBytes } = req.body || {};
  if (!key || !publicUrl) return res.status(400).json({ error: 'key and publicUrl are required.' });

  const media = await prisma.media.create({
    data: { key, publicUrl, altText: altText || null, width, height, contentType, sizeBytes },
  });
  res.status(201).json(media);
});

router.patch('/:id', async (req, res) => {
  const { altText } = req.body || {};
  const media = await prisma.media.update({ where: { id: req.params.id }, data: { altText } });
  res.json(media);
});

router.delete('/:id', async (req, res) => {
  const media = await prisma.media.findUnique({ where: { id: req.params.id } });
  if (!media) return res.status(404).json({ error: 'Not found.' });
  await deleteObject(media.key).catch((err) => console.error('[r2] delete failed', err));
  await prisma.media.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

module.exports = router;
