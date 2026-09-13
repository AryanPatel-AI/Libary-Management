const express = require('express');
const router = express.Router();
const { reserveBook, getMyReservations, cancelReservation, getAllReservations } = require('../controllers/reservationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, reserveBook).get(protect, admin, getAllReservations);
router.route('/my').get(protect, getMyReservations);
router.route('/:id').delete(protect, cancelReservation);

module.exports = router;
