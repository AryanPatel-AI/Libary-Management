const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — verify JWT token
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

// Admin-only access
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

// Librarian-only access
const librarian = (req, res, next) => {
  if (req.user && req.user.role === 'librarian') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized as a librarian' });
  }
};

// Admin or Librarian access
const adminOrLibrarian = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'librarian')) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized. Admin or Librarian access required.' });
  }
};

module.exports = { protect, admin, librarian, adminOrLibrarian };