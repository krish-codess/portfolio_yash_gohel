const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');
const { authRateLimit } = require('../middleware/rateLimit');
const { hashPassword, verifyPassword } = require('../lib/passwords');
const { generateSessionToken, generateResetToken, hashResetToken, SESSION_TTL_MS, RESET_TOKEN_TTL_MS } = require('../lib/tokens');
const { sendPasswordResetEmail } = require('../lib/email');
const config = require('../config');

const router = express.Router();

router.post('/login', authRateLimit, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const user = await prisma.adminUser.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !ok) return res.status(401).json({ error: 'Invalid email or password.' });

  const token = generateSessionToken();
  await prisma.session.create({
    data: {
      id: token,
      userId: user.id,
      userAgent: req.headers['user-agent'] || null,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });

  res.json({ token, user: { email: user.email } });
});

router.post('/logout', requireAuth, async (req, res) => {
  await prisma.session.delete({ where: { id: req.sessionId } }).catch(() => {});
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ email: req.user.email });
});

router.post('/forgot-password', authRateLimit, async (req, res) => {
  const { email } = req.body || {};
  // Always respond 200 regardless of whether the email matches, to avoid account enumeration.
  if (email) {
    const user = await prisma.adminUser.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (user) {
      const { raw, hash } = generateResetToken();
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash: hash, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
      });
      const resetUrl = `${config.adminPublicUrl.replace(/\/$/, '')}/reset-password.html?token=${raw}`;
      await sendPasswordResetEmail(user.email, resetUrl).catch((err) => {
        console.error('[email] failed to send reset email', err);
      });
    }
  }
  res.json({ ok: true });
});

router.post('/reset-password', authRateLimit, async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required.' });
  if (String(newPassword).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const tokenHash = hashResetToken(token);
  const record = await prisma.passwordResetToken.findFirst({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.adminUser.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Resetting the password logs out every existing session, everywhere.
    prisma.session.deleteMany({ where: { userId: record.userId } }),
  ]);

  res.json({ ok: true });
});

router.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password are required.' });
  if (String(newPassword).length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });

  const ok = await verifyPassword(currentPassword, req.user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Current password is incorrect.' });

  const passwordHash = await hashPassword(newPassword);
  await prisma.adminUser.update({ where: { id: req.user.id }, data: { passwordHash } });
  res.json({ ok: true });
});

module.exports = router;
