const rateLimit = require('express-rate-limit');

// Applied to auth endpoints that are callable without a token (login, forgot-password)
// to blunt brute-force/credential-stuffing attempts against the single admin account.
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
});

module.exports = { authRateLimit };
