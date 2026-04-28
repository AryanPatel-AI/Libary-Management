const { z } = require('zod');

// Middleware to validate request using Zod schema
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }
};

// --- Registration Schema ---
const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
  }),
});

// --- Login Schema ---
const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// --- Book Creation Schema ---
const bookSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().min(1, 'Author is required'),
    isbn: z.string().min(1, 'ISBN is required'),
    category: z.string().min(1, 'Category is required'),
    totalCopies: z.number().int().min(0, 'Total copies must be non-negative'),
    description: z.string().optional(),
    publisher: z.string().optional(),
    publishedYear: z.number().optional(),
    image: z.string().url().optional().or(z.literal('')),
    pdfUrl: z.string().url().optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
  }),
});

// --- Book Update Schema ---
const bookUpdateSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    isbn: z.string().optional(),
    category: z.string().optional(),
    totalCopies: z.number().int().min(0).optional(),
    description: z.string().optional(),
    publisher: z.string().optional(),
    publishedYear: z.number().optional(),
    image: z.string().url().optional().or(z.literal('')),
    pdfUrl: z.string().url().optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
  }),
});

// --- Issue Book Schema ---
const issueBookSchema = z.object({
  body: z.object({
    bookId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Book ID format'),
    memberId: z.string().optional(), // For librarian use
    days: z.number().int().min(1).max(30).optional(),
  }),
});

// --- MongoDB ObjectId Param Schema ---
const mongoIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  }),
});

module.exports = {
  validate,
  registerValidation: validate(registerSchema),
  loginValidation: validate(loginSchema),
  bookValidation: validate(bookSchema),
  bookUpdateValidation: validate(bookUpdateSchema),
  issueBookValidation: validate(issueBookSchema),
  mongoIdValidation: validate(mongoIdSchema),
};
