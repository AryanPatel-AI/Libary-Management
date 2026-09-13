const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');
const { recordAuditLog } = require('../services/auditService');

// @desc    Create a new inventory audit session
// @route   POST /api/inventory/sessions
// @access  Private (Staff/Admin)
const createSession = asyncHandler(async (req, res) => {
  const { branchId, name, notes } = req.body;

  if (!branchId || !name) {
    res.status(400);
    throw new Error('Branch ID and Session Name are required');
  }

  // Count total expected copies in this branch (excluding WITHDRAWN or LOST)
  const totalExpected = await prisma.bookCopy.count({
    where: {
      branchId,
      status: { notIn: ['WITHDRAWN', 'LOST'] }
    }
  });

  const session = await prisma.inventorySession.create({
    data: {
      branchId,
      name: name.trim(),
      startedByUserId: req.user.id,
      status: 'IN_PROGRESS',
      totalExpected,
      notes: notes || null
    },
    include: {
      branch: true,
      startedByUser: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'INVENTORY_SESSION',
    entityId: session.id,
    action: 'INVENTORY_SESSION_STARTED',
    afterState: { branchId, name, totalExpected },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(201).json({
    success: true,
    message: `Inventory audit session '${session.name}' created with ${totalExpected} expected items`,
    data: session
  });
});

// @desc    Scan barcode during inventory audit session
// @route   POST /api/inventory/sessions/:id/scan
// @access  Private (Staff/Admin)
const scanItem = asyncHandler(async (req, res) => {
  const { id: sessionId } = req.params;
  const { barcode, currentShelfId } = req.body;

  if (!barcode) {
    res.status(400);
    throw new Error('Barcode is required');
  }

  const session = await prisma.inventorySession.findUnique({
    where: { id: sessionId },
    include: { branch: true }
  });

  if (!session) {
    res.status(404);
    throw new Error('Inventory session not found');
  }

  if (session.status !== 'IN_PROGRESS') {
    res.status(400);
    throw new Error(`Cannot scan into a session that is ${session.status.toLowerCase()}`);
  }

  const cleanBarcode = barcode.trim().toUpperCase();

  // Find physical copy
  const copy = await prisma.bookCopy.findUnique({
    where: { barcode: cleanBarcode },
    include: { book: true, shelf: true, branch: true }
  });

  if (!copy) {
    res.status(404);
    throw new Error(`Barcode ${cleanBarcode} is not recognized in system inventory`);
  }

  // Determine item verification status
  let status = 'MATCH';
  let resolutionNotes = 'Location verified';

  if (copy.branchId !== session.branchId) {
    status = 'UNEXPECTED';
    resolutionNotes = `Copy belongs to branch '${copy.branch.name}', not '${session.branch.name}'`;
  } else if (currentShelfId && copy.shelfId && currentShelfId !== copy.shelfId) {
    status = 'MISPLACED';
    resolutionNotes = `Expected shelf '${copy.shelf ? copy.shelf.shelfCode : 'None'}', but found on scanned shelf.`;
  }

  // Check if already scanned in this session
  const existingScan = await prisma.inventoryItem.findFirst({
    where: { sessionId, copyId: copy.id }
  });

  if (existingScan) {
    return res.json({
      success: true,
      message: `Barcode ${cleanBarcode} was already scanned in this audit session`,
      data: existingScan,
      alreadyScanned: true
    });
  }

  const isDiscrepancy = status !== 'MATCH';

  const [item] = await prisma.$transaction([
    prisma.inventoryItem.create({
      data: {
        sessionId,
        copyId: copy.id,
        scannedBarcode: cleanBarcode,
        scannedShelfId: currentShelfId || null,
        expectedShelfId: copy.shelfId || null,
        status,
        scannedByUserId: req.user.id,
        resolutionNotes
      }
    }),
    prisma.inventorySession.update({
      where: { id: sessionId },
      data: {
        totalScanned: { increment: 1 },
        totalDiscrepancies: isDiscrepancy ? { increment: 1 } : undefined
      }
    })
  ]);

  res.status(201).json({
    success: true,
    message: isDiscrepancy ? `⚠️ Scanned with status: ${status}` : '✅ Verified match',
    data: {
      ...item,
      bookTitle: copy.book.title,
      status
    }
  });
});

// @desc    Get session details, discrepancies, and scanned items
// @route   GET /api/inventory/sessions/:id
// @access  Private (Staff/Admin)
const getSessionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const session = await prisma.inventorySession.findUnique({
    where: { id },
    include: {
      branch: true,
      startedByUser: { select: { firstName: true, lastName: true, email: true } },
      items: {
        include: {
          copy: {
            include: {
              book: { select: { title: true, isbn13: true } },
              shelf: true
            }
          },
          scannedShelf: true,
          expectedShelf: true
        },
        orderBy: { scannedAt: 'desc' }
      }
    }
  });

  if (!session) {
    res.status(404);
    throw new Error('Inventory session not found');
  }

  res.json({
    success: true,
    data: session
  });
});

// @desc    Complete and reconcile inventory session
// @route   POST /api/inventory/sessions/:id/reconcile
// @access  Private (Admin/Librarian)
const reconcileSession = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const session = await prisma.inventorySession.findUnique({
    where: { id },
    include: { items: true }
  });

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  if (session.status === 'COMPLETED' || session.status === 'RECONCILED') {
    res.status(400);
    throw new Error('Session is already reconciled');
  }

  const scannedCopyIds = session.items.map((i) => i.copyId);

  // Find all branch copies that were NOT scanned
  const unscannedCopies = await prisma.bookCopy.findMany({
    where: {
      branchId: session.branchId,
      status: { notIn: ['WITHDRAWN', 'LOST'] },
      id: { notIn: scannedCopyIds }
    },
    include: { shelf: true }
  });

  await prisma.$transaction(async (tx) => {
    // Record missing items
    for (const copy of unscannedCopies) {
      await tx.inventoryItem.create({
        data: {
          sessionId: session.id,
          copyId: copy.id,
          scannedBarcode: copy.barcode,
          expectedShelfId: copy.shelfId,
          status: 'MISSING',
          scannedByUserId: req.user.id,
          resolutionNotes: 'Unscanned during physical inventory verification'
        }
      });
    }

    // Update session status
    await tx.inventorySession.update({
      where: { id: session.id },
      data: {
        status: 'RECONCILED',
        completedAt: new Date(),
        totalDiscrepancies: session.totalDiscrepancies + unscannedCopies.length
      }
    });
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'INVENTORY_SESSION',
    entityId: session.id,
    action: 'INVENTORY_SESSION_RECONCILED',
    afterState: { missingCount: unscannedCopies.length, status: 'RECONCILED' },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: `Inventory session reconciled. ${unscannedCopies.length} missing items flagged for review.`,
    missingCount: unscannedCopies.length
  });
});

// @desc    List all inventory sessions
// @route   GET /api/inventory/sessions
// @access  Private (Staff/Admin)
const listSessions = asyncHandler(async (req, res) => {
  const sessions = await prisma.inventorySession.findMany({
    include: {
      branch: true,
      startedByUser: { select: { firstName: true, lastName: true } },
      _count: { select: { items: true } }
    },
    orderBy: { startedAt: 'desc' }
  });

  res.json({
    success: true,
    data: sessions
  });
});

module.exports = {
  createSession,
  scanItem,
  getSessionById,
  reconcileSession,
  listSessions
};
