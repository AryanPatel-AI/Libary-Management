const transporter = require('../utils/emailService');

/**
 * Service to handle all email sending logic.
 * Includes templates, retry mechanism, and safe handling of missing SMTP config.
 */
class EmailSender {
  constructor() {
    this.from = `"Patel & Co. Library" <${process.env.SMTP_USER || 'noreply@patellibrary.com'}>`;
  }

  /**
   * Core send method with safe guarding and error handling.
   */
  async send({ to, subject, html, text }) {
    if (!to) {
      console.error('[EmailSender] Recipient email is required');
      return { success: false, error: 'Recipient required' };
    }

    const mailOptions = {
      from: this.from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''), // Fallback text
    };

    // Safe handling if SMTP is not configured
    if (!transporter) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('\n--- MOCK EMAIL ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('------------------\n');
        return { success: true, message: 'Mock email logged' };
      }
      console.warn(`[EmailSender] Skipping email to ${to} (SMTP not configured)`);
      return { success: false, error: 'SMTP not configured' };
    }

    try {
      const info = await this.retrySend(mailOptions);
      console.log(`[EmailSender] ✅ Sent: ${subject} to ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[EmailSender] ❌ Failed to send to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retry logic for failed email attempts
   */
  async retrySend(options, attempts = 3) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await transporter.sendMail(options);
      } catch (error) {
        if (i === attempts - 1) throw error;
        const delay = Math.pow(2, i) * 1000;
        console.warn(`[EmailSender] Retry ${i + 1}/${attempts} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // --- TEMPLATES ---

  async sendVerificationEmail(userEmail, userName, verifyToken) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${verifyToken}`;
    
    return this.send({
      to: userEmail,
      subject: '📚 Verify your Patel & Co. Account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Welcome to Patel & Co. Knowledge Center!</h2>
          <p>Hi ${userName},</p>
          <p>Please confirm your email address to activate your account by clicking the button below:</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Verify Email Address</a>
          <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      `
    });
  }

  async sendOrderConfirmation(userEmail, userName, bookTitle, dueDate) {
    return this.send({
      to: userEmail,
      subject: `📖 Order Confirmed: ${bookTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2>Hi ${userName},</h2>
          <p>Your order for <strong>"${bookTitle}"</strong> has been successfully placed and issued to your account.</p>
          <p>Please ensure it is returned by <strong>${new Date(dueDate).toLocaleDateString()}</strong> to avoid late fees.</p>
          <p>Happy Reading!</p>
        </div>
      `
    });
  }

  async sendOverdueNotice(userEmail, userName, bookTitle, dueDate, fine) {
    return this.send({
      to: userEmail,
      subject: `⚠️ Overdue Notice: ${bookTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #ef4444; border-radius: 10px;">
          <h2 style="color: #ef4444;">⚠️ Action Required: Overdue Book</h2>
          <p>Hi ${userName},</p>
          <p>The book <strong>"${bookTitle}"</strong> was due on <strong>${new Date(dueDate).toLocaleDateString()}</strong>.</p>
          <p style="font-weight: bold;">Current Fine: ₹${fine || 0}</p>
          <p>Please return it to the library as soon as possible to avoid further fines.</p>
        </div>
      `
    });
  }

  async sendReservationNotification(userEmail, userName, bookTitle) {
    return this.send({
      to: userEmail,
      subject: `✨ Book Available: ${bookTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2>Good News ${userName}!</h2>
          <p>The book <strong>"${bookTitle}"</strong> that you reserved is now available.</p>
          <p>You have 24 hours to claim it before it's passed to the next person in line.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="color: #4f46e5; font-weight: bold;">Go to Dashboard</a>
        </div>
      `
    });
  }
}

module.exports = new EmailSender();
