require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS Configuration ---
const VERCEL_ORIGIN = 'https://portfolio-xi-hazel-0kejq0gg2k.vercel.app';
const ALLOWED_ORIGINS = [VERCEL_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like curl, postman, or same-origin local requests)
        if (!origin) return callback(null, true);
        // Allow explicitly listed origins
        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        // Allow Vercel preview deploys
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        console.log(`CORS error: Origin ${origin} not allowed`);
        return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['POST', 'GET'],
    credentials: true,
}));
// --- End CORS Configuration ---

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Message schema
const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
    type: { type: String, default: 'General Inquiry' },
    message: String,
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', messageSchema);

// NodeMailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Test endpoint
app.get('/', (req, res) => res.send('Backend is running!'));

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, message, type } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Save message to DB
        const newMessage = new Message({ name, email, message, type });
        await newMessage.save();

        // Email to you (Devanshu)
        await transporter.sendMail({
            from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `New Contact Form Submission - ${type || 'General Inquiry'}`,
            html: `<h3>${name} sent a message</h3>
                   <p><strong>Email:</strong> ${email}</p>
                   <p><strong>Type:</strong> ${type || 'General Inquiry'}</p>
                   <p><strong>Message:</strong> ${message}</p>`
        });

        // Confirmation email to user
        await transporter.sendMail({
            from: `"Portfolio" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'We received your message!',
            html: `<p>Hi ${name},</p>
                   <p>Thank you for contacting me. I have received your message and will get back to you shortly.</p>
                   <p>— Devanshu</p>`
        });

        // Send a successful response back to the frontend
        res.status(200).json({ message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Contact Form Submission Error:', error);
        // Ensure proper status code is returned on error
        res.status(500).json({ message: 'Internal Server Error: Failed to send message.' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));