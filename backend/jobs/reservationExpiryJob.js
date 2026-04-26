const cron = require('node-cron');
const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const { processNextReservation } = require('../utils/reservationUtils');

/**
 * Job to check for expired reservations (where status is 'notified' but user didn't claim)
 * Runs every hour
 */
const startReservationExpiryCheck = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running reservation expiry check...');

    try {
      const now = new Date();

      // 1. Find all 'notified' reservations that have expired
      const expiredReservations = await Reservation.find({
        status: 'notified',
        expiresAt: { $lt: now }
      });

      console.log(`[Cron] Found ${expiredReservations.length} expired reservations.`);

      for (const reservation of expiredReservations) {
        try {
          // 2. Mark as expired
          reservation.status = 'expired';
          await reservation.save();

          console.log(`[Cron] Reservation ${reservation._id} for book ${reservation.book} expired.`);

          // 3. Try to notify the next person in line
          const processedNext = await processNextReservation(reservation.book);

          // 4. If NO ONE else is waiting, increment the book's available copies
          if (!processedNext) {
            await Book.updateOne(
              { _id: reservation.book },
              { $inc: { availableCopies: 1 } }
            );
            console.log(`[Cron] No more reservations for book ${reservation.book}. incremented availableCopies.`);
          }
        } catch (innerError) {
          console.error(`[Cron Error] Failed to process expired reservation ${reservation._id}:`, innerError);
        }
      }
    } catch (error) {
      console.error('[Cron Error] Reservation Expiry Job failed:', error);
    }
  });
};

module.exports = startReservationExpiryCheck;
