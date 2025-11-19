require('events').EventEmitter.defaultMaxListeners = 20; // optional short-term dev fix
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// === Resend safe-init ===
let resend;
if (process.env.RESEND_API_KEY) {
  try {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log('Resend initialized (API key present).');
  } catch (e) {
    console.error('Resend init error:', e);
    // fallback to emulator
    resend = createDevResendEmulator();
  }
} else {
  console.warn('Warning: RESEND_API_KEY not set — using dev-noop resend (emails will NOT be sent).');
  resend = createDevResendEmulator();
}
const ADMIN_EMAIL = process.env.EMAIL_USER || null;

// --- CORS Configuration ---
const VERCEL_ORIGIN = 'https://portfolio-xi-hazel-0kejq0gg2k.vercel.app';
const LOCAL_ORIGIN_VITE = 'http://localhost:5173';
const LOCAL_ORIGIN_ALT = 'http://127.0.0.1:5173';
const ALLOWED_ORIGINS = [VERCEL_ORIGIN, LOCAL_ORIGIN_VITE, LOCAL_ORIGIN_ALT];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);

    // Allow any vercel preview domains like https://my-app-abc.vercel.app
    if (origin.endsWith('.vercel.app')) return callback(null, true);

    console.log(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['POST', 'GET', 'OPTIONS'],
  credentials: true
}));
// --- End CORS ---

app.use(bodyParser.json());

// --- MongoDB connection ---
if (!process.env.MONGO_URI) {
  console.warn('Warning: MONGO_URI not set — DB operations will fail.');
}
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('FATAL: MongoDB connection error. Check MONGO_URI and IP access in Atlas.', err));

// --- Message Schema ---
const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  type: { type: String, default: 'General Inquiry' },
  message: String,
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});
const Message = mongoose.model('Message', messageSchema);

// --- Health endpoint ---
app.get('/', (req, res) => res.send('Backend is running!'));

// --- Test-send endpoint ---
app.get('/api/test-send', async (req, res) => {
  try {
    const to = process.env.EMAIL_USER || 'test@example.com';
    console.log('TEST SEND: using RESEND_API_KEY present?', !!process.env.RESEND_API_KEY);

    const response = await resend.emails.send({
      from: `Devanshu Portfolio <no-reply@${getDomainFromEmail(process.env.EMAIL_USER) || 'portfolio.dev'}>`,
      to: [to],
      subject: 'Test email — Resend connectivity check',
      html: `<p>Test email sent at ${new Date().toISOString()}</p>`
    });

    console.log('[TEST SEND RESPONSE]', response);
    return res.json({ ok: true, response });
  } catch (err) {
    console.error('[TEST SEND ERROR]', err);
    return res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
  }
});

// --- Contact endpoint ---
app.post('/api/contact', async (req, res) => {
  const { name, email, message, type } = req.body ?? {};

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required (name, email, message).' });
  }

  try {
    // 1) Save to DB
    const newMessage = new Message({ name, email, message, type });
    await newMessage.save();
    console.log(`[DB] Saved message from ${name} <${email}>`);

    // 2) Prepare emails
    const adminHtml = `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Type:</strong> ${escapeHtml(type || 'General Inquiry')}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      <hr/>
      <p>Received at: ${new Date().toISOString()}</p>
    `;

    const userHtml = `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thanks for contacting me — I received your message and will reply shortly.</p>
      <hr />
      <p><strong>Your message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      <p>— Devanshu</p>
    `;

    const sendPromises = [];

    // admin notification
    if (ADMIN_EMAIL) {
      sendPromises.push(
        resend.emails.send({
          from: `Devanshu Portfolio <no-reply@${getDomainFromEmail(ADMIN_EMAIL) || 'portfolio.dev'}>`,
          to: [ADMIN_EMAIL],
          subject: `New Contact: ${type || 'General Inquiry'} — ${name}`,
          html: adminHtml
        })
      );
    } else {
      console.warn('[EMAIL] ADMIN_EMAIL not configured; skipping admin notification.');
    }

    // user confirmation
    sendPromises.push(
      resend.emails.send({
        from: `Devanshu Portfolio <no-reply@${getDomainFromEmail(ADMIN_EMAIL) || 'portfolio.dev'}>`,
        to: [email],
        subject: 'We received your message',
        html: userHtml
      })
    );

    // Wait for all sends, but don't fail everything if one fails
    const results = await Promise.allSettled(sendPromises);
    console.log('[EMAIL SEND RESULTS]', results);

    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length) {
      console.warn('[EMAIL] Some sends failed:', failures.map(f => f.reason && (f.reason.message || String(f.reason))));
      // we still respond 200 because message is saved; but you may want to surface more info
      return res.status(200).json({ message: 'Message saved. Some emails failed to send; check logs.' });
    }

    console.log('[EMAIL] All sends succeeded (or were accepted).');
    return res.status(200).json({ message: 'Message received — thanks!' });

  } catch (err) {
    console.error('CONTACT ROUTE ERROR:', err);
    return res.status(500).json({ message: 'Internal Server Error: Failed to process submission.' });
  }
});

// --- Utility helpers ---
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
function getDomainFromEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const parts = email.split('@');
  return parts.length === 2 ? parts[1] : null;
}
function createDevResendEmulator() {
  return {
    emulator: true,
    emails: {
      send: async (opts) => {
        console.log('[DEV-RESEND-EMULATOR] send called:', {
          from: opts.from,
          to: opts.to,
          subject: opts.subject,
          htmlLength: opts.html ? opts.html.length : 0
        });
        return { id: 'dev-fake-id', status: 'skipped' };
      }
    }
  };
}

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} (port ${PORT})`));