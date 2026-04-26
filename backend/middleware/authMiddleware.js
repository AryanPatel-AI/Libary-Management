const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
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