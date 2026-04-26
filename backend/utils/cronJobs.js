const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const emailSender = require('../services/emailSender');

/**
 * Daily job to check for overdue books and send emails.
 * Uses the production-level emailSender service.
 */
const sendOverdueEmails = async () => {
  try {
    const today = new Date();
    // Find transactions that are issued and past due date
    const overdueTransactions = await Transaction.find({
      status: 'issued',
      dueDate: { $lt: today }
    }).populate('user', 'name email').populate('book', 'title');

    console.log(`[Cron] Processing ${overdueTransactions.length} overdue transactions...`);

    for (const transaction of overdueTransactions) {
      if (transaction.user && transaction.user.email) {
        await emailSender.sendOverdueNotice(
          transaction.user.email,
          transaction.user.name,
          transaction.book.title,
          transaction.dueDate,
          transaction.fine || 0
        );
      }
    }
  } catch (error) {
    console.error('[Cron Error] Error in sendOverdueEmails:', error.message);
  }
};

const initCronJobs = () => {
  // Run everyday at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Triggering daily overdue checks...');
    await sendOverdueEmails();
  }, {
    timezone: 'UTC'
  });
  
  console.log('✅ Cron jobs initialized');
};

module.exports = initCronJobs;


