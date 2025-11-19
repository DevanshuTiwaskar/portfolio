require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// === Resend setup ===
if (!process.env.RESEND_API_KEY) {
  console.warn('Warning: RESEND_API_KEY not set — email sending will fail.');
}
const resend = new Resend(process.env.RESEND_API_KEY);
// Use this email as the admin/owner recipient
const ADMIN_EMAIL = process.env.EMAIL_USER; // e.g. your inbox

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
  read: { type: Boolean, default: false }
});
const Message = mongoose.model('Message', messageSchema);

// --- Health endpoint ---
app.get('/', (req, res) => res.send('Backend is running!'));

// --- Contact endpoint ---
app.post('/api/contact', async (req, res) => {
  const { name, email, message, type } = req.body ?? {};

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required (name, email, message).' });
  }

  // Optional: simple rate limiting hint (lightweight)
  // TODO: add real rate limiting (express-rate-limit) in production.

  try {
    // 1) Save to DB
    const newMessage = new Message({ name, email, message, type });
    await newMessage.save();
    console.log(`[DB] Saved message from ${name} <${email}>`);

    // 2) Send admin notification and user confirmation concurrently using Resend
    // Prepare admin HTML
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

    // Prepare user confirmation HTML
    const userHtml = `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thanks for contacting me — I received your message and will reply shortly.</p>
      <hr />
      <p><strong>Your message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      <p>— Devanshu</p>
    `;

    // Use Resend to send both emails
    const sendPromises = [];

    // Admin notification
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
      console.warn('Admin email not configured; skipping admin notification email.');
    }

    // User confirmation
    sendPromises.push(
      resend.emails.send({
        from: `Devanshu Portfolio <no-reply@${getDomainFromEmail(ADMIN_EMAIL) || 'portfolio.dev'}>`,
        to: [email],
        subject: 'We received your message',
        html: userHtml
      })
    );

    // Wait for sends (if one fails, we'll catch below)
    await Promise.all(sendPromises);
    console.log('[EMAIL] Sent admin + confirmation emails (via Resend)');

    // 3) Respond to frontend
    return res.status(200).json({ message: 'Message received — thanks!'} );

  } catch (err) {
    console.error('CONTACT ROUTE ERROR:', err);
    // If DB save succeeded but email failed, we still keep the message in DB.
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

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} (port ${PORT})`));
