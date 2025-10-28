const mongoose = require('mongoose');

const conn = async () => {
  try {
    await mongoose.connect(
  'mongodb+srv://paytonchirova_db_user:admin01@cluster0.3zwnrle.mongodb.net/ussdApp?retryWrites=true&w=majority'
);

    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = conn;
