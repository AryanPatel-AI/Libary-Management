const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Configure NodeMailer transporter
const createTransporter = () => {
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn(`[SMTP] Missing environment variables: ${missingVars.join(', ')}. Email features will be disabled.`);
    return null;
  }

  try {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } catch (error) {
    console.error('[SMTP] Failed to create transporter:', error);
    return null;
  }
};

const transporter = createTransporter();

const sendOverdueEmails = async () => {
  try {
    const today = new Date();
    // Find transactions that are issued and past due date
    const overdueTransactions = await Transaction.find({
      status: 'issued',
      dueDate: { $lt: today }
    }).populate('user', 'name email').populate('book', 'title');

    console.log(`[Cron] Found ${overdueTransactions.length} overdue transactions. Processing emails...`);

    for (const transaction of overdueTransactions) {
      if (transaction.user && transaction.user.email) {
        const mailOptions = {
          from: '"Patel & Co. Library" <noreply@patellibrary.com>',
          to: transaction.user.email,
          subject: 'Action Required: Overdue Book',
          html: `<p>Dear ${transaction.user.name},</p>
                 <p>This is a reminder that the book <strong>"${transaction.book.title}"</strong> was due on <strong>${new Date(transaction.dueDate).toLocaleDateString()}</strong>.</p>
                 <p>Please return it as soon as possible to avoid further fines.</p>
                 <br/>
                 <p>Thank you,<br/>Patel & Co. Knowledge Center</p>`
        };

        // Only attempt to send if transporter exists and is in production
        if (process.env.NODE_ENV === 'production' && transporter) {
          try {
            await transporter.sendMail(mailOptions);
            console.log(`[Cron] Sent overdue notice to ${transaction.user.email}`);
          } catch (mailError) {
            console.error(`[Cron] Failed to send email to ${transaction.user.email}:`, mailError);
          }
        } else if (process.env.NODE_ENV === 'production') {
          console.warn(`[Cron] Skipping email to ${transaction.user.email} (Transporter not configured)`);
        } else {
          console.log(`[Cron Mock Email] Would send overdue notice to ${transaction.user.email} for "${transaction.book.title}"`);
        }
      }
    }
  } catch (error) {
    console.error('[Cron] Error processing overdue emails:', error);
  }
};

const initCronJobs = () => {
  // Run everyday at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Running daily overdue checks...');
    try {
      await sendOverdueEmails();
    } catch (error) {
      console.error('[Cron] Failed to send overdue emails:', error);
    }
  }, {
    timezone: 'UTC'
  });
  console.log('Cron jobs initialized successfully.');
};

module.exports = initCronJobs;

