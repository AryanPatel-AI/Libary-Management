const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

/**
 * Seed default admin user if one doesn't already exist
 */
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('ℹ️  ADMIN_EMAIL or ADMIN_PASSWORD not set in .env — skipping admin seed');
      return;
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
      return;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      forcePasswordChange: true
    });

    console.log(`✅ Admin user seeded: ${admin.email}`);
  } catch (error) {
    console.error(`❌ Error seeding admin: ${error.message}`);
  }
};

// If run directly via `node utils/seedAdmin.js`
if (require.main === module) {
  const connectDB = require('../config/db');

  const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');
    await seedAdmin();
    await mongoose.connection.close();
    console.log('Seeding complete. Connection closed.');
    process.exit(0);
  };

  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seedAdmin;
