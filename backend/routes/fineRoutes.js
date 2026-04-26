const express = require('express');
const router = express.Router();
const { getMyFines, getAllFines, payFine } = require('../controllers/fineController');
const { protect, admin } = require('../middleware/authMiddleware');
const { mongoIdValidation } = require('../middleware/validateRequest');

// User route (protected)
router.get('/my-fines', protect, getMyFines);

// Admin routes
router.get('/', protect, admin, getAllFines);
router.put('/:id/pay', protect, admin, mongoIdValidation, payFine);

module.exports = router;
