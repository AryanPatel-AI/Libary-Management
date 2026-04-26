const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const initCronJobs = require('./utils/cronJobs');

// Load environment variables
dotenv.config();

// Database configuration
const connectDB = require('./config/db');
const startOverdueReminders = require('./jobs/reminder');
const startReservationExpiryCheck = require('./jobs/reservationExpiryJob');

// Start Cron Jobs
// startOverdueReminders(); 
// startReservationExpiryCheck(); 


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

// ─── Security Middleware ────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Optional: if CSP also blocks embedding
  frameguard: false, // This allows the app to be embedded in iframes (required for HF Spaces)
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
    initCronJobs();
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
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/analytics', analyticsRoutes);

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
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📚 API: http://localhost:${PORT}/\n`);
  });
}