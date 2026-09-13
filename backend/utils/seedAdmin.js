const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

dotenv.config();

/**
 * Seed default admin user in PostgreSQL if one doesn't already exist
 */
const seedAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@library.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    // 1. Check PostgreSQL
    const existingPgAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingPgAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      let superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
      if (!superAdminRole) {
        superAdminRole = await prisma.role.create({
          data: { name: 'SUPER_ADMIN', description: 'Full system control', isSystemRole: true }
        });
      }

      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          firstName: 'System',
          lastName: 'Administrator',
          status: 'ACTIVE',
          emailVerifiedAt: new Date()
        }
      });

      await prisma.userRole.create({
        data: {
          userId: admin.id,
          roleId: superAdminRole.id
        }
      });

      console.log(`✅ Admin user seeded in PostgreSQL: ${admin.email}`);
    } else {
      console.log(`ℹ️ Admin user already exists in PostgreSQL: ${adminEmail}`);
    }
  } catch (error) {
    console.warn(`ℹ️ Seed admin check note: ${error.message}`);
  }
};

module.exports = seedAdmin;
