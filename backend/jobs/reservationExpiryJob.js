const cron = require('node-cron');
const prisma = require('../config/prisma');

/**
 * Checks for expired holds (status: READY_FOR_PICKUP and readyUntil < now)
 * Automatically advances to the next reservation in queue or sets copy to AVAILABLE.
 */
const startReservationExpiryCheck = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ [Cron] Running reservation hold expiry check...');

    try {
      const now = new Date();

      const expiredHolds = await prisma.reservation.findMany({
        where: {
          status: 'READY_FOR_PICKUP',
          readyUntil: { lt: now }
        },
        include: {
          allocatedCopy: true,
          book: true
        }
      });

      if (expiredHolds.length === 0) return;

      console.log(`[Cron] Found ${expiredHolds.length} expired hold(s) to process.`);

      for (const hold of expiredHolds) {
        await prisma.$transaction(async (tx) => {
          // 1. Mark this hold expired
          await tx.reservation.update({
            where: { id: hold.id },
            data: {
              status: 'EXPIRED',
              allocatedCopyId: null
            }
          });

          // 2. Check for next pending member
          const nextMemberHold = await tx.reservation.findFirst({
            where: {
              bookId: hold.bookId,
              status: 'PENDING'
            },
            orderBy: { queuePosition: 'asc' },
            include: { member: { include: { user: true } } }
          });

          if (nextMemberHold && hold.allocatedCopyId) {
            const nextReadyUntil = new Date(Date.now() + 48 * 60 * 60 * 1000);
            await tx.reservation.update({
              where: { id: nextMemberHold.id },
              data: {
                allocatedCopyId: hold.allocatedCopyId,
                status: 'READY_FOR_PICKUP',
                readyUntil: nextReadyUntil
              }
            });

            await tx.notification.create({
              data: {
                userId: nextMemberHold.member.userId,
                title: '📖 Book Ready for Pickup!',
                message: `The reserved book '${hold.book.title}' is now available for you! Please pick it up within 48 hours.`,
                channel: 'IN_APP',
                eventType: 'RESERVATION_READY',
                payload: { bookId: hold.bookId, readyUntil: nextReadyUntil }
              }
            });
          } else if (hold.allocatedCopyId) {
            // No one waiting, return copy to AVAILABLE
            await tx.bookCopy.update({
              where: { id: hold.allocatedCopyId },
              data: { status: 'AVAILABLE', version: { increment: 1 } }
            });
          }
        });
      }
    } catch (error) {
      console.error('⚠️ [Cron Error] Failed reservation expiry check:', error.message);
    }
  });
};

module.exports = startReservationExpiryCheck;
