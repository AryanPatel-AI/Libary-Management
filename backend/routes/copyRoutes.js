const express = require('express');
const router = express.Router();
const {
  generateBarcode,
  createCopy,
  getCopyByBarcode,
  getCopies,
  updateCopyStatus
} = require('../controllers/copyController');
const { protect, staffOrAdmin } = require('../middleware/authMiddleware');

router.get('/generate-barcode', protect, staffOrAdmin, generateBarcode);
router.get('/barcode/:barcode', protect, staffOrAdmin, getCopyByBarcode);

router.route('/')
  .get(protect, staffOrAdmin, getCopies)
  .post(protect, staffOrAdmin, createCopy);

router.route('/:id/status')
  .patch(protect, staffOrAdmin, updateCopyStatus);

module.exports = router;
