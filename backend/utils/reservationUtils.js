const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const emailService = require('./emailService');

/**
 * Processes the next reservation in the waitlist for a specific book.
 * @param {string} bookId - The ID of the book.
 * @param {Object} session - Mongoose session for atomicity.
 * @returns {Promise<boolean>} - True if a reservation was processed/notified.
 */
const processNextReservation = async (bookId) => {
  // 1. Find the first waiting reservation for this book
  const nextReservation = await Reservation.findOne({
    book: bookId,
    status: 'waiting'
  })
    .sort({ createdAt: 1 })
    .populate('user')
    .populate('book');

  if (!nextReservation) {
    return false;
  }

  // 2. Set expiry (24 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // 3. Update reservation status to notified
  nextReservation.status = 'notified';
  nextReservation.notifiedAt = new Date();
  nextReservation.expiresAt = expiresAt;
  await nextReservation.save();

  // 4. Notify user via email
  try {
    await emailService.sendEmail({
      to: nextReservation.user.email,
      subject: `📚 Good News! "${nextReservation.book.title}" is available`,
      html: `
        <h2>Hi ${nextReservation.user.name},</h2>
        <p>The book <strong>"${nextReservation.book.title}"</strong> you reserved is now available for you!</p>
        <p>We have held it for you for <strong>24 hours</strong>. Please log in and issue it from your dashboard before it expires.</p>
        <p>Expiry: ${expiresAt.toLocaleString()}</p>
        <p>Happy Reading!</p>
      `
    });
  } catch (error) {
    console.error(`[Reservation] Failed to send notification email to ${nextReservation.user.email}:`, error);
  }

  // 5. Update other waiting positions (optional but good for UX)
  await updateWaitlistPositions(bookId);

  return true;
};

/**
 * Updates the 'position' field for all waiting reservations for a book.
 * @param {string} bookId 
 */
const updateWaitlistPositions = async (bookId) => {
  const waitingReservations = await Reservation.find({
    book: bookId,
    status: 'waiting'
  })
    .sort({ createdAt: 1 });

  for (let i = 0; i < waitingReservations.length; i++) {
    waitingReservations[i].position = i + 1;
    await waitingReservations[i].save();
  }
};

module.exports = {
  processNextReservation,
  updateWaitlistPositions
};
