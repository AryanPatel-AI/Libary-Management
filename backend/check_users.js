const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}, 'name email role password');
    console.log('Current Users in DB:');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) [${u.role}]`);
    });
    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }
};

checkUsers();
