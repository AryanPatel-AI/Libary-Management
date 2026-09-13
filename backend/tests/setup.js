const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0 && process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI);
  }
}, 30000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
