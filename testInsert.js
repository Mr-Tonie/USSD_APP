const mongoose = require('mongoose');

// Replace this with your conn.js connection code or your Atlas URI
const MONGO_URI = "mongodb+srv://paytonchirova_db_user:admin01@cluster0.3zwnrle.mongodb.net/ussdApp?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Loan Schema
const LoanSchema = new mongoose.Schema({
  phoneNumber: String,
  loanType: String,
  amount: Number,
  period: Number,
  status: { type: String, default: 'Pending' },
  dateApplied: { type: Date, default: Date.now },
});

const Loan = mongoose.model('Loan', LoanSchema);

const insertDummyLoan = async () => {
  await connectDB();

  const loan = new Loan({
    phoneNumber: '+263771234567',
    loanType: 'Personal',
    amount: 500,
    period: 6,
  });

  const savedLoan = await loan.save();
  console.log('✅ Dummy loan inserted:', savedLoan);

  mongoose.connection.close();
};

insertDummyLoan();
