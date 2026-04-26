const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const { sendEmail } = require('../utils/emailService');

/**
 * Daily job to check for overdue books and send reminders
 * Runs every day at 9:00 AM
 */
const startOverdueReminders = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Running overdue books check...');
    
    try {
      const today = new Date();
      
      // Find all transactions that are 'issued' and past their due date
      const overdueTransactions = await Transaction.find({
        status: 'issued',
        dueDate: { $lt: today },
        returnDate: null
      }).populate('user').populate('book');

      console.log(`[Cron] Found ${overdueTransactions.length} overdue books.`);

      for (const transaction of overdueTransactions) {
        try {
          const { user, book, dueDate } = transaction;

          if (!user || !book) {
            console.warn(`[Cron Warning] Skipping transaction ${transaction._id} due to missing user or book reference`);
            continue;
          }

          // Send Email Reminder
          await sendEmail({
            to: user.email,
            subject: `⚠️ Overdue Notice: ${book.title}`,
            html: `
              <h2>Hi ${user.name},</h2>
              <p>This is a friendly reminder that the book <strong>"${book.title}"</strong> was due on <strong>${new Date(dueDate).toLocaleDateString()}</strong>.</p>
              <p>Please return it to the library as soon as possible to avoid further fines.</p>
              <p>Current Fine: ₹${transaction.fine || 0}</p>
              <p>Thank you!</p>
            `
          });

          // Update transaction status to 'overdue' if not already
          if (transaction.status !== 'overdue') {
            transaction.status = 'overdue';
            await transaction.save();
          }
        } catch (error) {
          console.error(`[Cron Error] Failed to process overdue transaction ${transaction._id}:`, error);
          // Continue to next transaction
        }
      }
    } catch (error) {
      console.error('[Cron Error]', error);
    }
  });
};

module.exports = startOverdueReminders;
