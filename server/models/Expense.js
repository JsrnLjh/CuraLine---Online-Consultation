const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['payroll', 'utilities', 'supplies', 'maintenance', 'marketing', 'insurance', 'equipment', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  payee: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'check', 'bank_transfer', 'card', 'other']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'paid'
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
