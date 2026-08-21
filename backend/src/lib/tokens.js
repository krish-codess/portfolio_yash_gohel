const crypto = require('crypto');

// 32 random bytes, hex-encoded -> used directly as a Session row's id (the bearer token itself).
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Password-reset tokens: the raw value is emailed once and never stored;
// only its sha256 hash is persisted, so a DB leak can't be used to reset accounts.
function generateResetToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

function hashResetToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, sliding
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour, single use

module.exports = {
  generateSessionToken,
  generateResetToken,
  hashResetToken,
  SESSION_TTL_MS,
  RESET_TOKEN_TTL_MS,
};
