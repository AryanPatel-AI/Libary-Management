const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');
const { recordAuditLog } = require('../services/auditService');

/**
 * Format a bibliographic book record for both legacy frontend compatibility and enterprise features
 */
function formatBook(book) {
  const authors = book.authors ? book.authors.map((ba) => ba.author.name) : [];
  const primaryAuthor = authors.join(', ') || 'Unknown Author';

  const categories = book.categories ? book.categories.map((bc) => bc.category.name) : [];
  const primaryCategory = categories[0] || 'General';

  const totalCopies = book.copies ? book.copies.length : 0;
  const availableCopies = book.copies
    ? book.copies.filter((c) => c.status === 'AVAILABLE').length
    : 0;

  // Group copies by branch
  const branchAvailability = {};
  if (book.copies) {
    book.copies.forEach((copy) => {
      const bName = copy.branch ? copy.branch.name : 'Main Library';
      if (!branchAvailability[bName]) {
        branchAvailability[bName] = { total: 0, available: 0, copies: [] };
      }
      branchAvailability[bName].total += 1;
      if (copy.status === 'AVAILABLE') branchAvailability[bName].available += 1;
      branchAvailability[bName].copies.push({
        id: copy.id,
        barcode: copy.barcode,
        status: copy.status,
        condition: copy.condition,
        shelf: copy.shelf ? copy.shelf.shelfCode : 'Unassigned'
      });
    });
  }

  return {
    id: book.id,
    _id: book.id, // For backward compatibility with legacy React frontend
    title: book.title,
    subtitle: book.subtitle || '',
    author: primaryAuthor,
    authors: authors,
    category: primaryCategory,
    categories: categories,
    isbn: book.isbn13 || book.isbn10 || '',
    isbn13: book.isbn13,
    isbn10: book.isbn10 || '',
    description: book.description || '',
    language: book.language || 'English',
    edition: book.edition || '',
    publishedYear: book.publicationYear,
    publisher: book.publisher ? book.publisher.name : '',
    pages: book.pages || 0,
    image: book.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    coverImageUrl: book.coverImageUrl,
    pdfUrl: book.digitalPdfUrl || '',
    isPaid: book.isPaid || false,
    price: (book.priceCents / 100) || 0,
    rating: book.rating || 0,
    numReviews: book.numReviews || 0,
    totalCopies,
    availableCopies,
    branchAvailability,
    copies: book.copies || [],
    createdAt: book.createdAt,
    updatedAt: book.updatedAt
  };
}

// @desc    Get all books with search, filter, and pagination
// @route   GET /api/books
// @access  Public
const getBooks = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    author,
    language,
    availableOnly,
    page = 1,
    limit = 12,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { subtitle: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { isbn13: { contains: search } },
      { isbn10: { contains: search } },
      { authors: { some: { author: { name: { contains: search, mode: 'insensitive' } } } } }
    ];
  }

  if (category && category !== 'All') {
    where.categories = {
      some: {
        category: {
          OR: [
            { name: { contains: category, mode: 'insensitive' } },
            { slug: { contains: category.toLowerCase().replace(/\s+/g, '-') } }
          ]
        }
      }
    };
  }

  if (author) {
    where.authors = {
      some: {
        author: { name: { contains: author, mode: 'insensitive' } }
      }
    };
  }

  if (language) {
    where.language = { equals: language, mode: 'insensitive' };
  }

  const [total, rawBooks] = await Promise.all([
    prisma.book.count({ where }),
    prisma.book.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        authors: { include: { author: true } },
        categories: { include: { category: true } },
        publisher: true,
        copies: {
          include: { branch: true, shelf: true }
        }
      },
      orderBy: { [sort === 'rating' ? 'rating' : 'createdAt']: order === 'asc' ? 'asc' : 'desc' }
    })
  ]);

  let formatted = rawBooks.map(formatBook);

  if (availableOnly === 'true' || availableOnly === true) {
    formatted = formatted.filter((b) => b.availableCopies > 0);
  }

  res.json({
    success: true,
    data: {
      books: formatted,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
      limit: limitNum
    },
    books: formatted,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const book = await prisma.book.findFirst({
    where: {
      OR: [{ id: id }, { isbn13: id }, { isbn10: id }]
    },
    include: {
      authors: { include: { author: true } },
      categories: { include: { category: true } },
      publisher: true,
      copies: {
        include: { branch: true, shelf: true }
      },
      reservations: {
        where: { status: { in: ['PENDING', 'READY_FOR_PICKUP'] } },
        include: { member: { include: { user: true } } }
      }
    }
  });

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  res.json({
    success: true,
    data: formatBook(book)
  });
});

// @desc    Create new book & optional initial copies
// @route   POST /api/books
// @access  Private (Staff/Admin)
const createBook = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    author,
    isbn,
    isbn13,
    isbn10,
    category,
    publisher,
    publishedYear,
    pages,
    description,
    image,
    coverImageUrl,
    pdfUrl,
    language,
    isPaid,
    price,
    totalCopies = 1
  } = req.body;

  if (!title || (!isbn && !isbn13)) {
    res.status(400);
    throw new Error('Title and ISBN are required');
  }

  const finalIsbn13 = isbn13 || isbn;
  const finalIsbn10 = isbn10 || null;

  // Check unique ISBN
  const existing = await prisma.book.findFirst({
    where: { OR: [{ isbn13: finalIsbn13 }, ...(finalIsbn10 ? [{ isbn10: finalIsbn10 }] : [])] }
  });
  if (existing) {
    res.status(400);
    throw new Error(`A book with ISBN ${finalIsbn13} already exists`);
  }

  // Find or create Author
  const authorName = author ? author.trim() : 'Unknown Author';
  let authorRecord = await prisma.author.findFirst({ where: { name: authorName } });
  if (!authorRecord) {
    authorRecord = await prisma.author.create({ data: { name: authorName } });
  }

  // Find or create Category
  const categoryName = category ? category.trim() : 'General';
  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
  let categoryRecord = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!categoryRecord) {
    categoryRecord = await prisma.category.create({
      data: { name: categoryName, slug: categorySlug }
    });
  }

  // Find or create Publisher if passed
  let publisherId = null;
  if (publisher) {
    let pubRecord = await prisma.publisher.findUnique({ where: { name: publisher.trim() } });
    if (!pubRecord) {
      pubRecord = await prisma.publisher.create({ data: { name: publisher.trim() } });
    }
    publisherId = pubRecord.id;
  }

  // Get default branch
  const defaultBranch = await prisma.branch.findFirst({ where: { isActive: true } });
  const defaultShelf = defaultBranch
    ? await prisma.locationShelf.findFirst({ where: { branchId: defaultBranch.id } })
    : null;

  // Create Book and Copies in transaction
  const createdBook = await prisma.$transaction(async (tx) => {
    const newBook = await tx.book.create({
      data: {
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : null,
        isbn13: finalIsbn13.trim(),
        isbn10: finalIsbn10 ? finalIsbn10.trim() : null,
        description: description || '',
        language: language || 'English',
        publicationYear: publishedYear ? parseInt(publishedYear) : null,
        pages: pages ? parseInt(pages) : null,
        publisherId,
        coverImageUrl: coverImageUrl || image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
        digitalPdfUrl: pdfUrl || '',
        isPaid: Boolean(isPaid),
        priceCents: price ? Math.round(parseFloat(price) * 100) : 0
      }
    });

    await tx.bookAuthor.create({
      data: { bookId: newBook.id, authorId: authorRecord.id, authorOrder: 1 }
    });

    await tx.bookCategory.create({
      data: { bookId: newBook.id, categoryId: categoryRecord.id }
    });

    // Create initial physical copies
    const copyCount = Math.max(1, parseInt(totalCopies) || 1);
    const year = new Date().getFullYear();
    const existingCopies = await tx.bookCopy.count();

    for (let i = 1; i <= copyCount; i++) {
      const seq = String(existingCopies + i).padStart(6, '0');
      await tx.bookCopy.create({
        data: {
          bookId: newBook.id,
          barcode: `LIB-${year}-MAIN-${seq}`,
          accessionNumber: `ACC-${year}-${seq}`,
          branchId: defaultBranch.id,
          shelfId: defaultShelf ? defaultShelf.id : null,
          status: 'AVAILABLE',
          condition: 'GOOD',
          priceCents: newBook.priceCents
        }
      });
    }

    return await tx.book.findUnique({
      where: { id: newBook.id },
      include: {
        authors: { include: { author: true } },
        categories: { include: { category: true } },
        publisher: true,
        copies: { include: { branch: true, shelf: true } }
      }
    });
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'BOOK',
    entityId: createdBook.id,
    action: 'BOOK_CREATED',
    afterState: { title: createdBook.title, isbn: createdBook.isbn13, copies: totalCopies },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(201).json({
    success: true,
    message: 'Book and physical inventory copies created successfully',
    data: formatBook(createdBook)
  });
});

// @desc    Update book bibliographic details
// @route   PUT /api/books/:id
// @access  Private (Staff/Admin)
const updateBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    subtitle,
    description,
    language,
    publishedYear,
    pages,
    coverImageUrl,
    image,
    pdfUrl,
    isPaid,
    price
  } = req.body;

  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) {
    res.status(404);
    throw new Error('Book not found');
  }

  const updatedBook = await prisma.book.update({
    where: { id },
    data: {
      title: title !== undefined ? title : undefined,
      subtitle: subtitle !== undefined ? subtitle : undefined,
      description: description !== undefined ? description : undefined,
      language: language !== undefined ? language : undefined,
      publicationYear: publishedYear !== undefined ? parseInt(publishedYear) : undefined,
      pages: pages !== undefined ? parseInt(pages) : undefined,
      coverImageUrl: (coverImageUrl || image) !== undefined ? (coverImageUrl || image) : undefined,
      digitalPdfUrl: pdfUrl !== undefined ? pdfUrl : undefined,
      isPaid: isPaid !== undefined ? Boolean(isPaid) : undefined,
      priceCents: price !== undefined ? Math.round(parseFloat(price) * 100) : undefined
    },
    include: {
      authors: { include: { author: true } },
      categories: { include: { category: true } },
      publisher: true,
      copies: { include: { branch: true, shelf: true } }
    }
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'BOOK',
    entityId: id,
    action: 'BOOK_UPDATED',
    beforeState: { title: existing.title },
    afterState: { title: updatedBook.title },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: 'Book updated successfully',
    data: formatBook(updatedBook)
  });
});

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Admin)
const deleteBook = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if any copy is currently ON_LOAN
  const activeLoans = await prisma.loan.findFirst({
    where: { copy: { bookId: id }, status: 'ACTIVE' }
  });

  if (activeLoans) {
    res.status(400);
    throw new Error('Cannot delete book while physical copies are currently loaned out');
  }

  await prisma.$transaction(async (tx) => {
    await tx.bookCopy.deleteMany({ where: { bookId: id } });
    await tx.bookAuthor.deleteMany({ where: { bookId: id } });
    await tx.bookCategory.deleteMany({ where: { bookId: id } });
    await tx.reservation.deleteMany({ where: { bookId: id } });
    await tx.book.delete({ where: { id } });
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'BOOK',
    entityId: id,
    action: 'BOOK_DELETED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: 'Book and copies deleted successfully'
  });
});

// @desc    Get public library stats for landing / header
// @route   GET /api/books/stats/public
// @access  Public
const getLibraryStats = asyncHandler(async (req, res) => {
  const [totalBooks, totalCopies, availableCopies, totalCategories, totalUsers] = await Promise.all([
    prisma.book.count(),
    prisma.bookCopy.count(),
    prisma.bookCopy.count({ where: { status: 'AVAILABLE' } }),
    prisma.category.count(),
    prisma.user.count()
  ]);

  res.json({
    success: true,
    data: {
      totalBooks,
      totalCopies,
      availableCopies,
      totalCategories,
      totalUsers
    }
  });
});

// @desc    Verify if user has access to book
// @route   GET /api/books/:id/verify-access
// @access  Private
const verifyAccess = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const book = await prisma.book.findUnique({ where: { id } });

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  res.json({
    success: true,
    hasAccess: true,
    pdfUrl: book.digitalPdfUrl || ''
  });
});

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getLibraryStats,
  verifyAccess
};
