const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true,
  },
  limit: {
    type: Number,
    required: [true, 'Please add a budget limit'],
    min: [0.01, 'Limit must be at least 0.01'],
  },
  currentSpending: {
    type: Number,
    default: 0,
  },
  month: {
    type: String,
    required: [true, 'Please add a month (YYYY-MM)'],
  },
}, { timestamps: true });

// Compound unique index: one budget per user per category per month
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
