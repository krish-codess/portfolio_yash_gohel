const { Resend } = require('resend');
const config = require('../config');

let client = null;
function getClient() {
  if (!config.resendApiKey) return null;
  if (!client) client = new Resend(config.resendApiKey);
  return client;
}

async function sendPasswordResetEmail(toEmail, resetUrl) {
  const resend = getClient();
  if (!resend) {
    // No email provider configured yet (e.g. local dev) — log instead of failing silently.
    console.warn(`[email] RESEND_API_KEY not set. Reset link for ${toEmail}: ${resetUrl}`);
    return;
  }
  await resend.emails.send({
    from: config.resendFromEmail,
    to: toEmail,
    subject: 'Reset your admin password',
    html: `
      <p>Someone requested a password reset for your portfolio admin account.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a> (expires in 1 hour).</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
