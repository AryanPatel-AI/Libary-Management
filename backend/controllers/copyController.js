const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');
const { recordAuditLog } = require('../services/auditService');

// @desc    Generate a new unique barcode
// @route   GET /api/copies/generate-barcode
// @access  Private (Staff/Admin)
const generateBarcode = asyncHandler(async (req, res) => {
  const branchCode = req.query.branch || 'MAIN';
  const year = new Date().getFullYear();
  const count = await prisma.bookCopy.count();
  const barcode = `LIB-${year}-${branchCode}-${String(count + 1).padStart(6, '0')}`;
  const accessionNumber = `ACC-${year}-${String(count + 1).padStart(6, '0')}`;

  res.json({
    success: true,
    data: { barcode, accessionNumber }
  });
});

// @desc    Create a physical book copy
// @route   POST /api/copies
// @access  Private (Staff/Admin)
const createCopy = asyncHandler(async (req, res) => {
  const { bookId, barcode, accessionNumber, branchId, shelfId, condition, priceCents } = req.body;

  if (!bookId || !barcode || !accessionNumber || !branchId) {
    res.status(400);
    throw new Error('bookId, barcode, accessionNumber, and branchId are required');
  }

  // Check unique barcode
  const existingBarcode = await prisma.bookCopy.findUnique({ where: { barcode } });
  if (existingBarcode) {
    res.status(400);
    throw new Error(`Barcode ${barcode} already exists`);
  }

  const existingAccession = await prisma.bookCopy.findUnique({ where: { accessionNumber } });
  if (existingAccession) {
    res.status(400);
    throw new Error(`Accession number ${accessionNumber} already exists`);
  }

  const copy = await prisma.bookCopy.create({
    data: {
      bookId,
      barcode: barcode.trim().toUpperCase(),
      accessionNumber: accessionNumber.trim().toUpperCase(),
      branchId,
      shelfId: shelfId || null,
      condition: condition || 'GOOD',
      priceCents: priceCents || 0,
      status: 'AVAILABLE'
    },
    include: {
      book: true,
      branch: true,
      shelf: true
    }
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'BOOK_COPY',
    entityId: copy.id,
    action: 'COPY_CREATED',
    afterState: copy,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(201).json({
    success: true,
    message: 'Physical copy created successfully',
    data: copy
  });
});

// @desc    Get physical copy by barcode (Optimized for rapid scanner lookup)
// @route   GET /api/copies/barcode/:barcode
// @access  Private (Staff/Admin)
const getCopyByBarcode = asyncHandler(async (req, res) => {
  const barcode = req.params.barcode.trim().toUpperCase();

  const copy = await prisma.bookCopy.findUnique({
    where: { barcode },
    include: {
      book: {
        include: {
          authors: { include: { author: true } },
          publisher: true
        }
      },
      branch: true,
      shelf: true,
      loans: {
        where: { status: 'ACTIVE' },
        include: {
          member: {
            include: {
              user: true,
              memberType: true
            }
          }
        }
      }
    }
  });

  if (!copy) {
    res.status(404);
    throw new Error(`Book copy with barcode '${barcode}' not found`);
  }

  res.json({
    success: true,
    data: copy
  });
});

// @desc    List physical copies with filters & pagination
// @route   GET /api/copies
// @access  Private (Staff/Admin)
const getCopies = asyncHandler(async (req, res) => {
  const { bookId, branchId, status, condition, search, page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {};
  if (bookId) where.bookId = bookId;
  if (branchId) where.branchId = branchId;
  if (status) where.status = status;
  if (condition) where.condition = condition;
  if (search) {
    where.OR = [
      { barcode: { contains: search, mode: 'insensitive' } },
      { accessionNumber: { contains: search, mode: 'insensitive' } },
      { book: { title: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const [total, copies] = await Promise.all([
    prisma.bookCopy.count({ where }),
    prisma.bookCopy.findMany({
      where,
      skip,
      take,
      include: {
        book: { select: { id: true, title: true, isbn13: true, coverImageUrl: true } },
        branch: { select: { id: true, name: true, code: true } },
        shelf: { select: { id: true, shelfCode: true, floor: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  res.json({
    success: true,
    data: copies,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / take)
    }
  });
});

// @desc    Update physical copy status (e.g. mark DAMAGED, LOST, MAINTENANCE)
// @route   PATCH /api/copies/:id/status
// @access  Private (Staff/Admin)
const updateCopyStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, condition, reason } = req.body;

  const copy = await prisma.bookCopy.findUnique({ where: { id } });
  if (!copy) {
    res.status(404);
    throw new Error('Physical copy not found');
  }

  const beforeState = { status: copy.status, condition: copy.condition };

  const updatedCopy = await prisma.bookCopy.update({
    where: { id },
    data: {
      status: status !== undefined ? status : undefined,
      condition: condition !== undefined ? condition : undefined,
      version: { increment: 1 }
    }
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'BOOK_COPY',
    entityId: id,
    action: 'COPY_STATUS_CHANGED',
    beforeState,
    afterState: { status: updatedCopy.status, condition: updatedCopy.condition, reason },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: `Copy status updated to ${updatedCopy.status}`,
    data: updatedCopy
  });
});

module.exports = {
  generateBarcode,
  createCopy,
  getCopyByBarcode,
  getCopies,
  updateCopyStatus
};
