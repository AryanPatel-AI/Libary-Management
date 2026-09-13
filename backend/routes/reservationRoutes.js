const express = require('express');
const router = express.Router();
const {
  reserveBook,
  getMyReservations,
  cancelReservation,
  getAllReservations
} = require('../controllers/reservationController');
const { protect, staffOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, reserveBook)
  .get(protect, staffOrAdmin, getAllReservations);

router.route('/my').get(protect, getMyReservations);
router.route('/my-reservations').get(protect, getMyReservations);
router.route('/:id').delete(protect, cancelReservation);

module.exports = router;
