const Transaction = require('../models/Transaction');
const { syncBudgetSpending } = require('../utils/budgetSync');

// Helper to get YYYY-MM from a date
const getMonth = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// @desc    Get all transactions (with filters, sorting, pagination)
// @route   GET /api/transactions
const getTransactions = async (req, res, next) => {
  try {
    const { category, type, search, sort = 'date_desc', page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };

    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { notes: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {
      date_desc: { date: -1 },
      date_asc: { date: 1 },
      amount_desc: { amount: -1 },
      amount_asc: { amount: 1 },
    };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .sort(sortOptions[sort] || { date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      count: transactions.length,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      totalTransactions: total,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, notes, date } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      category,
      notes,
      date: date || Date.now(),
    });

    // Sync budget if expense
    if (type === 'expense') {
      await syncBudgetSpending(req.user._id, category, getMonth(transaction.date));
    }

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }
    if (transaction.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    // Store old values for budget recalc
    const oldCategory = transaction.category;
    const oldMonth = getMonth(transaction.date);
    const oldType = transaction.type;

    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // Recalculate budgets for old and new category/month if expense
    if (oldType === 'expense') {
      await syncBudgetSpending(req.user._id, oldCategory, oldMonth);
    }
    if (updated.type === 'expense') {
      const newMonth = getMonth(updated.date);
      if (oldCategory !== updated.category || oldMonth !== newMonth) {
        await syncBudgetSpending(req.user._id, updated.category, newMonth);
      }
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }
    if (transaction.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    const { category, date, type } = transaction;
    await Transaction.findByIdAndDelete(req.params.id);

    // Recalculate budget if expense
    if (type === 'expense') {
      await syncBudgetSpending(req.user._id, category, getMonth(date));
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction };
