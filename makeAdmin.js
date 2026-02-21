// Script to make a user an admin
// Usage: node makeAdmin.js user@email.com

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const makeAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();

    console.log(`✅ User ${user.name} (${user.email}) is now an admin!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

const email = process.argv[2];

if (!email) {
  console.log('Usage: node makeAdmin.js user@email.com');
  process.exit(1);
}

makeAdmin(email);
