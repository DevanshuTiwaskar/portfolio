require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

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

    // Email to you
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission - ${type}`,
      html: `<h3>${name} sent a message</h3>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Type:</strong> ${type}</p>
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

    res.json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
