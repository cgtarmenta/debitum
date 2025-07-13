'use strict';

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/debitum';

const debtSchema = new mongoose.Schema({
  title: { type: String, required: true },
  debt: { type: Number, required: true },
  periodicity: { type: String, required: true },
  payment_term: { type: Number, required: true },
  nir: { type: Number, required: true },
  aer: { type: Number, required: true },
  start_date: { type: Date, required: true },
  amortization: { type: String, enum: ['french'], default: 'french' },
});

const amortizationSchema = new mongoose.Schema({
  debt_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Debt', required: true },
  schedule: [
    {
      month: { type: Number, required: true },
      interest: { type: Number, required: true },
      principal: { type: Number, required: true },
      remaining_balance: { type: Number, required: true },
    },
  ],
});

const globalInfoSchema = new mongoose.Schema({
  monthly_income: { type: Number, default: 0 },
  max_debt_percentage: { type: Number, default: 0 },
});

const Debt = mongoose.model('Debt', debtSchema);
const Amortization = mongoose.model('Amortization', amortizationSchema);
const GlobalInfo = mongoose.model('GlobalInfo', globalInfoSchema);

/**
 * Initializes the Mongoose connection.
 */
async function initializeDatabase() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to the MongoDB database using Mongoose.');

  // Ensure the global_info collection has a default document
  const count = await GlobalInfo.countDocuments();
  if (count === 0) {
    await GlobalInfo.create({ monthly_income: 0, max_debt_percentage: 0 });
    console.log('Inserted default global info.');
  }
}

module.exports = { initializeDatabase, Debt, GlobalInfo, Amortization };