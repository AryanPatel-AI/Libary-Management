const express = require('express');
const router = express.Router();
const {
  getMyFines,
  getFines,
  payFine,
  waiveFine
} = require('../controllers/fineController');
const { protect, staffOrAdmin, admin } = require('../middleware/authMiddleware');

router.get('/my-fines', protect, getMyFines);

router.route('/')
  .get(protect, staffOrAdmin, getFines);

router.post('/:id/pay', protect, payFine);
router.post('/:id/waive', protect, admin, waiveFine);

module.exports = router;
