const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// --- Registration Validation ---
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

// --- Login Validation ---
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

// --- Book Creation/Update Validation ---
const bookValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Book title is required'),
  body('author')
    .trim()
    .notEmpty().withMessage('Author is required'),
  body('isbn')
    .trim()
    .notEmpty().withMessage('ISBN is required'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  body('totalCopies')
    .notEmpty().withMessage('Total copies is required')
    .isInt({ min: 0 }).withMessage('Total copies must be a non-negative integer'),
  validate
];

// --- Book Update Validation (partial — all fields optional) ---
const bookUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Book title cannot be empty'),
  body('author')
    .optional()
    .trim()
    .notEmpty().withMessage('Author cannot be empty'),
  body('isbn')
    .optional()
    .trim()
    .notEmpty().withMessage('ISBN cannot be empty'),
  body('category')
    .optional()
    .trim()
    .notEmpty().withMessage('Category cannot be empty'),
  body('totalCopies')
    .optional()
    .isInt({ min: 0 }).withMessage('Total copies must be a non-negative integer'),
  validate
];

// --- Issue Book Validation ---
const issueBookValidation = [
  body('bookId')
    .notEmpty().withMessage('Book ID is required')
    .isMongoId().withMessage('Invalid Book ID format'),
  validate
];

// --- MongoDB ObjectId Param Validation ---
const mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  bookValidation,
  bookUpdateValidation,
  issueBookValidation,
  mongoIdValidation
};
