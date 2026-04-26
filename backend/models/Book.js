const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a book title'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Please add an author'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'Please add an ISBN'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  publisher: {
    type: String,
    trim: true,
    default: ''
  },
  publishedYear: {
    type: Number
  },
  totalCopies: {
    type: Number,
    required: [true, 'Please add total copies'],
    min: [0, 'Total copies cannot be negative']
  },
  availableCopies: {
    type: Number,
    min: [0, 'Available copies cannot be negative']
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  }
}, { timestamps: true });

// Default availableCopies to totalCopies if not set
bookSchema.pre('save', function(next) {
  if (this.isNew && (this.availableCopies === undefined || this.availableCopies === null)) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

const auditLogPlugin = require('../utils/auditMiddleware');

// Text index for search across title, author, and category
bookSchema.index({ title: 'text', author: 'text', category: 'text' });

// Apply audit log plugin
bookSchema.plugin(auditLogPlugin, { entityType: 'Book' });

module.exports = mongoose.model('Book', bookSchema);