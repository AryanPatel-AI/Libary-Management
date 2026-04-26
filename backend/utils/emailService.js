const nodemailer = require('nodemailer');

// Create a singleton transporter instance
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

/**
 * Send an email using Nodemailer. Logs to console in development.
 * @param {Object} options - Email options { to, subject, html }
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: '"Patel & Co. Library" <noreply@patellibrary.com>',
    to: options.to,
    subject: options.subject,
    html: options.html
  };

  if (process.env.NODE_ENV === 'production') {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`[Email] Sent successfully to ${options.to}`);
    } catch (error) {
      console.error('[Email Error]', error);
    }
  } else {
    // In development, mock the email to console to avoid needing real API keys immediately
    console.log('\n=================== MOCK EMAIL ===================');
    console.log(`TO:      ${options.to}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`BODY:    \n${options.html.replace(/<[^>]+>/g, '')}`); // Strip basic HTML for logging
    console.log('==================================================\n');
  }
};

/**
 * Pre-configured email templates
 */
const emailTemplates = {
  // 1. Account Verification
  sendVerificationEmail: async (userEmail, userName, verifyToken) => {
    // In a real app, this would be your frontend URL
    const verifyUrl = `http://localhost:3001/verify-email?token=${verifyToken}`;
    
    await sendEmail({
      to: userEmail,
      subject: 'Verify your Patel & Co. Account',
      html: `
        <h2>Welcome to Patel & Co. Knowledge Center, ${userName}!</h2>
        <p>Please confirm your email address to activate your account by clicking the link below:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background-color:#4f46e5;color:#ffffff;text-decoration:none;border-radius:5px;">Verify Email</a>
        <p>If you did not request this, please ignore this email.</p>
      `
    });
  },

  // 2. Order/Issue Confirmation
  sendOrderConfirmation: async (userEmail, userName, bookTitle, dueDate) => {
    await sendEmail({
      to: userEmail,
      subject: `Order Confirmed: ${bookTitle}`,
      html: `
        <h2>Hi ${userName},</h2>
        <p>Your order for <strong>"${bookTitle}"</strong> has been successfully placed and issued to your account.</p>
        <p>Please ensure it is returned by <strong>${new Date(dueDate).toLocaleDateString()}</strong> to avoid late fees.</p>
        <p>Happy Reading!</p>
      `
    });
  },

  // 3. Reservation Confirmation
  sendReservationConfirmation: async (userEmail, userName, bookTitle) => {
    await sendEmail({
      to: userEmail,
      subject: `Reservation Confirmed: ${bookTitle}`,
      html: `
        <h2>Hi ${userName},</h2>
        <p>Your reservation for <strong>"${bookTitle}"</strong> has been successfully recorded.</p>
        <p>We will notify you as soon as a copy becomes available.</p>
        <p>Thank you for using Patel & Co. Knowledge Center.</p>
      `
    });
  },

  // 4. Watchlist Update
  sendWatchlistUpdate: async (userEmail, userName, bookTitle, action) => {
    const actionText = action === 'add' ? 'added to' : 'removed from';
    await sendEmail({
      to: userEmail,
      subject: `Watchlist Update: ${bookTitle}`,
      html: `
        <h2>Hi ${userName},</h2>
        <p>The book <strong>"${bookTitle}"</strong> has been successfully ${actionText} your watchlist.</p>
        <p>You can view your complete watchlist from your dashboard.</p>
      `
    });
  }
};

module.exports = {
  sendEmail,
  ...emailTemplates
};
