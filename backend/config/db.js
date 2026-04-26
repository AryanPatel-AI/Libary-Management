const mongoose = require('mongoose');

let listenersRegistered = false;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('\n' + '!'.repeat(60));
    console.error('❌ CRITICAL ERROR: MONGO_URI is not defined.');
    console.error('Please add your MongoDB connection string to your environment variables.');
    console.error('On Hugging Face: Go to Settings > Secrets and add MONGO_URI.');
    console.error('!'.repeat(60) + '\n');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    if (!listenersRegistered) {
      mongoose.connection.on('error', (err) => {
        console.error(`❌ MongoDB connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
      });

      process.on('SIGINT', async () => {
        try {
          await mongoose.connection.close();
          console.log('MongoDB connection closed due to app termination');
          process.exit(0);
        } catch (error) {
          console.error(`❌ Error closing MongoDB connection: ${error.message}`);
          process.exit(1);
        }
      });

      listenersRegistered = true;
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
