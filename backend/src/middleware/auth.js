const prisma = require('../db');
const { SESSION_TTL_MS } = require('../lib/tokens');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated.' });

  const session = await prisma.session.findUnique({ where: { id: token }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) {
    return res.status(401).json({ error: 'Session expired.' });
  }

  // Sliding expiry: every authenticated request extends the session, so an
  // actively-used login never expires mid-work.
  await prisma.session.update({
    where: { id: token },
    data: { expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
  });

  req.user = session.user;
  req.sessionId = session.id;
  next();
}

module.exports = { requireAuth };
