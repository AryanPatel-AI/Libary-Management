const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Configure NodeMailer transporter
const createTransporter = () => {
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(`Missing required SMTP environment variables: ${missingVars.join(', ')}`);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP configuration is required in production');
    }
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
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

        // In production, we'd actually send this. Here we'll simulate.
        if (process.env.NODE_ENV === 'production') {
          await transporter.sendMail(mailOptions);
const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
};

// ... existing code ...

        } else {
          console.log(`[Cron Mock Email] Sent overdue notice to ${maskEmail(transaction.user.email)} for "${transaction.book.title}"`);
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
    timezone: 'UTC' // or 'America/New_York' etc.
  });
  console.log('Cron jobs initialized successfully.');
};

module.exports = initCronJobs;
