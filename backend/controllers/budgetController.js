const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get budgets for a month
// @route   GET /api/budgets?month=YYYY-MM
const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const budgets = await Budget.find({ user: req.user._id, month });
    res.json({ success: true, count: budgets.length, data: budgets });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or upsert budget
// @route   POST /api/budgets
const createBudget = async (req, res, next) => {
  try {
    const { category, limit } = req.body;
    const now = new Date();
    const month = req.body.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Calculate current spending for this category/month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          category,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const currentSpending = result.length > 0 ? result[0].total : 0;

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month },
      { limit, currentSpending },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget limit
// @route   PUT /api/budgets/:id
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }
    if (budget.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    budget.limit = req.body.limit || budget.limit;
    const updated = await budget.save();

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }
    if (budget.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    await Budget.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };
