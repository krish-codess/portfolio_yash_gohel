const express = require('express');
const cors = require('cors');
const config = require('./config');
const publicContentRoutes = require('./routes/publicContent');
const adminAuthRoutes = require('./routes/adminAuth');
const adminContentRoutes = require('./routes/adminContent');
const adminMediaRoutes = require('./routes/adminMedia');

const app = express();
app.use(express.json({ limit: '1mb' }));

// Public read endpoints: no auth, no sensitive data, so allow any origin.
// This is what the live portfolio's cms-hydrate.js calls.
app.use('/api/public', cors({ origin: '*' }), publicContentRoutes);

// Admin endpoints carry a bearer token and must only be callable from the
// admin site itself (and localhost during development).
const adminCors = cors({
  origin(origin, callback) {
    if (!origin || config.adminAllowedOrigins.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
});
app.use('/api/admin/auth', adminCors, adminAuthRoutes);
app.use('/api/admin/content', adminCors, adminContentRoutes);
app.use('/api/admin/media', adminCors, adminMediaRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Unexpected server error.' });
});

app.listen(config.port, () => {
  console.log(`CMS backend listening on port ${config.port}`);
});
