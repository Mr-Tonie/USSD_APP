// index.js
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://confirm:WsDoONZEE4tx1aNJ@cluster0.0qhljvv.mongodb.net/uzi-music-platform?retryWrites=true&w=majority"
    );
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
connectDB();

// Loan Schema
const LoanSchema = new mongoose.Schema({
  phoneNumber: String,
  loanType: String,
  amount: Number,
  period: Number,
  status: { type: String, default: "Pending" },
  dateApplied: { type: Date, default: Date.now },
});
const Loan = mongoose.model("Loan", LoanSchema);

// Mock accounts (replace with MongoDB later)
const accounts = {
  "+263771234567": {
    balance: 125.0,
    loanBalance: 320.0,
    nextPayment: "30 Oct 2025",
  },
};

// Test route
app.get("/api/test", (req, res) => {
  res.send("✅ Server & MongoDB running fine!");
});

// USSD route
app.post("/ussd", async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  let response = "";
  const userAccount = accounts[phoneNumber] || {
    balance: 0,
    loanBalance: 0,
    nextPayment: "N/A",
  };
  const textArray = text.split("*");

  switch (textArray[0]) {
    case "":
      response = `CON Welcome to Microfinance Name
1. Apply for a Loan
2. Check Loan Balance
3. Repay Loan
4. Check Loan Status
5. My Account
0. Exit`;
      break;

    case "1": // Apply for Loan
      if (!textArray[1]) {
        response = `CON Select Loan Type
1. Personal Loan
2. Business Loan
3. School Fees Loan`;
      } else if (!textArray[2]) {
        response = `CON Enter Loan Amount (USD):`;
      } else if (!textArray[3]) {
        response = `CON Enter Repayment Period (Months):`;
      } else if (!textArray[4]) {
        response = `CON Confirm Application:
1. Confirm
2. Cancel`;
      } else if (textArray[4] === "1") {
        // Save loan in MongoDB
        const loan = new Loan({
          phoneNumber,
          loanType:
            textArray[1] === "1"
              ? "Personal"
              : textArray[1] === "2"
              ? "Business"
              : "School Fees",
          amount: Number(textArray[2]),
          period: Number(textArray[3]),
        });
        await loan.save();
        response = `END ✅ Loan application received.
We'll notify you once it's approved.`;
      } else {
        response = `END Loan application cancelled.`;
      }
      break;

    case "2": // Check Loan Balance
      response = `END Your current loan balance is USD ${userAccount.loanBalance.toFixed(
        2
      )}.
Next payment: USD 50.00 due on ${userAccount.nextPayment}.`;
      break;

    case "3": // Repay Loan
      if (!textArray[1]) {
        response = `CON Choose Payment Method:
1. Mobile Money (EcoCash/OneMoney)
2. Bank Transfer`;
      } else if (textArray[1] === "1" && !textArray[2]) {
        response = `CON Enter Mobile Number for Payment:`;
      } else if (textArray[1] === "1" && textArray[2]) {
        response = `END Payment request sent to your phone. Confirm to complete.`;
      } else if (textArray[1] === "2") {
        response = `END Please transfer the amount to our bank account.`;
      }
      break;

    case "4": // Check Loan Status
      const loanStatus = await Loan.findOne({ phoneNumber }).sort({
        dateApplied: -1,
      });
      if (loanStatus) {
        response = `END Your loan of USD ${loanStatus.amount} (${loanStatus.loanType}) is currently ${loanStatus.status}.`;
      } else {
        response = `END No active loans found.`;
      }
      break;

    case "5": // My Account
      if (!textArray[1]) {
        response = `CON My Account
1. Check Savings Balance
2. Update Personal Info
3. Change PIN`;
      } else if (textArray[1] === "1") {
        response = `END Your savings account balance is USD ${userAccount.balance.toFixed(
          2
        )}.`;
      } else if (textArray[1] === "2") {
        response = `END Personal info update feature coming soon.`;
      } else if (textArray[1] === "3") {
        response = `END PIN change feature coming soon.`;
      }
      break;

    case "0":
      response = `END Thank you for using Microfinance Name.`;
      break;

    default:
      response = `END Invalid option. Please try again.`;
      break;
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🚀 USSD Server running on http://localhost:${PORT}`)
);
