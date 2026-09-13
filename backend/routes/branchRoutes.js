const express = require('express');
const router = express.Router();
const {
  getBranches,
  getBranchById,
  createBranch,
  createShelf
} = require('../controllers/branchController');
const { protect, admin, staffOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getBranches)
  .post(protect, admin, createBranch);

router.route('/:id')
  .get(getBranchById);

router.route('/:branchId/shelves')
  .post(protect, staffOrAdmin, createShelf);

module.exports = router;
