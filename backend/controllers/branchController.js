const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Get all active branches with shelves
// @route   GET /api/branches
// @access  Public
const getBranches = asyncHandler(async (req, res) => {
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    include: {
      shelves: true,
      _count: {
        select: {
          copies: true,
          homeMembers: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  res.json({
    success: true,
    data: branches
  });
});

// @desc    Get single branch by ID with detailed inventory summary
// @route   GET /api/branches/:id
// @access  Public
const getBranchById = asyncHandler(async (req, res) => {
  const branch = await prisma.branch.findUnique({
    where: { id: req.params.id },
    include: {
      shelves: {
        include: {
          _count: { select: { copies: true } }
        }
      },
      policies: {
        include: { memberType: true }
      }
    }
  });

  if (!branch) {
    res.status(404);
    throw new Error('Branch not found');
  }

  res.json({
    success: true,
    data: branch
  });
});

// @desc    Create branch
// @route   POST /api/branches
// @access  Private (Admin)
const createBranch = asyncHandler(async (req, res) => {
  const { code, name, address, city, state, phone, email } = req.body;

  const branch = await prisma.branch.create({
    data: { code, name, address, city, state, phone, email }
  });

  res.status(201).json({
    success: true,
    data: branch
  });
});

// @desc    Create shelf in branch
// @route   POST /api/branches/:branchId/shelves
// @access  Private (Staff/Admin)
const createShelf = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const { floor, room, aisle, shelfCode, capacity } = req.body;

  const shelf = await prisma.locationShelf.create({
    data: {
      branchId,
      floor,
      room,
      aisle,
      shelfCode,
      capacity: capacity || 50
    }
  });

  res.status(201).json({
    success: true,
    data: shelf
  });
});

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  createShelf
};
