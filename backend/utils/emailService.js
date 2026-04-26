const nodemailer = require('nodemailer');

/**
 * Singleton factory for Nodemailer transporter.
 * Refactored to never crash the application if SMTP is missing.
 */
const createTransporter = () => {
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  // If in production and variables are missing, log a warning and return null
  if (missingVars.length > 0) {
    const message = `⚠️ Email Service Disabled: Missing [${missingVars.join(', ')}]`;
    
    if (process.env.NODE_ENV === 'production') {
      console.warn('\n' + '!'.repeat(50));
      console.warn(message);
      console.warn('Set these environment variables to enable email notifications.');
      console.warn('!'.repeat(50) + '\n');
    } else {
      console.log(`[Email] Dev Mode: SMTP variables missing. Using console mock.`);
    }
    return null;
  }

  try {
    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false, // false for 587, true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    console.log(`✅ Email Service Enabled (${config.host})`);
    return nodemailer.createTransport(config);
  } catch (error) {
    console.error('❌ Failed to initialize Email Transporter:', error.message);
    return null;
  }
};

// Singleton instance
const transporter = createTransporter();

module.exports = transporter;

