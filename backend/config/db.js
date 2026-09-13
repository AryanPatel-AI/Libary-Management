const mongoose = require('mongoose');
const prisma = require('./prisma');

const connectDB = async () => {
  // 1. Verify PostgreSQL Primary Database Connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ PostgreSQL (Enterprise LMS Database) Connected successfully');
  } catch (pgError) {
    console.error('❌ PostgreSQL Connection Failed:', pgError.message);
  }

  // 2. Optional MongoDB connection if MONGO_URI is defined
  if (process.env.MONGO_URI) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`✅ MongoDB Connected (Legacy Store): ${conn.connection.host}`);
    } catch (mongoError) {
      console.warn(`⚠️ MongoDB Connection warning: ${mongoError.message}. Operating on PostgreSQL.`);
    }
  }
};

module.exports = connectDB;
