const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Database configuration
const connectDB = require('./config/db');
const startOverdueReminders = require('./jobs/reminder');
const startReservationExpiryCheck = require('./jobs/reservationExpiryJob');




// Route imports
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const fineRoutes = require('./routes/fineRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const emailSender = require('./services/emailSender');

// Middleware imports
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Utility imports
const seedAdmin = require('./utils/seedAdmin');

const app = express();
app.set('trust proxy', 1); // Trust Hugging Face proxy for rate-limiting and security headers

// ─── Security Middleware ────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false, // Required for Google OAuth popup to communicate with the parent window
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Allow external scripts/images (like Google's)
  referrerPolicy: { policy: "no-referrer-when-downgrade" },
  frameguard: false, // Allow embedding in HF Spaces iframe
}));

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// ─── Core Middleware ────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') || [] : true,
  credentials: true
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev'));

// ─── Connect to MongoDB & Seed Admin ────────────────────────────────
(async () => {
  try {
    await connectDB();
    await seedAdmin();
    startOverdueReminders();
    startReservationExpiryCheck();
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
})();

// ─── API Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/watchlist', require('./routes/watchlistRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/fines', fineRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', require('./routes/uploadRoutes'));

// Serve Uploads Folder
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// ─── Test Email Route ───────────────────────────────────────────────
app.post('/api/test-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const result = await emailSender.send({
    to: email,
    subject: '🧪 Library System: Test Email',
    html: `<h3>Test Successful!</h3><p>Your SMTP configuration is working correctly.</p>`
  });

  if (result.success) {
    res.json({ success: true, message: 'Test email sent successfully' });
  } else {
    res.status(500).json({ success: false, message: result.error });
  }
});

// ─── Production Configuration ──────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));
console.log('✅ Serving static frontend from', frontendPath);

  app.get('*', (req, res, next) => {
    // If it's an API route, let it fall through to error handlers
    if (req.url.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // ─── Health Check (Dev only) ─────────────────────────────────────────
  app.get(['/', '/api'], (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

    res.json({
      success: true,
      message: '📚 Library Management API is running...',
      version: '1.0.0',
      dbStatus,
      endpoints: {
        auth: '/api/auth',
        books: '/api/books',
        transactions: '/api/transactions',
        users: '/api/users',
        fines: '/api/fines',
        analytics: '/api/analytics',
        reservations: '/api/reservations',
        watchlist: '/api/watchlist'
      }
    });
  });
}

// ─── Error Handling (must be last) ──────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// Export app for testing
module.exports = app;

// ─── Start Server ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, '::', () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT} (IPv6 Enabled)`);
    console.log(`📚 API: http://[::1]:${PORT}/ (Internal)\n`);
  });
}