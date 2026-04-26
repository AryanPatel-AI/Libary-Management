const express = require('express');
const router = express.Router();
const { reserveBook, getMyReservations, cancelReservation } = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, reserveBook);
router.route('/my').get(protect, getMyReservations);
router.route('/:id').delete(protect, cancelReservation);

module.exports = router;
