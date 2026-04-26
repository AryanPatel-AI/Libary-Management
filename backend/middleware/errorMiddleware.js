// Centralized error handling middleware

// 404 Not Found handler — catches unmatched routes
const notFound = (req, res, next) => {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  // Default to 500 if status code is still 200 (unhandled)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    let field = 'unknown';
    if (err.keyValue && typeof err.keyValue === 'object') {
      field = Object.keys(err.keyValue)[0];
    } else if (err.keyPattern && typeof err.keyPattern === 'object') {
      field = Object.keys(err.keyPattern)[0];
    } else if (err.message) {
      const match = err.message.match(/index: (\w+)/);
      if (match) field = match[1];
    }
    message = `Duplicate value for field: ${field}. This ${field} already exists.`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = { notFound, errorHandler };
