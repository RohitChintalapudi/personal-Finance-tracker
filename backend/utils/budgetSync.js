const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

/**
 * Recalculate budget spending for a given user, category, and month.
 * Aggregates all expense transactions matching user + category + month range,
 * then updates the Budget's currentSpending field.
 */
const syncBudgetSpending = async (userId, category, month) => {
  try {
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          category: category,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalSpending: { $sum: '$amount' },
        },
      },
    ]);

    const totalSpending = result.length > 0 ? result[0].totalSpending : 0;

    await Budget.findOneAndUpdate(
      { user: userId, category, month },
      { currentSpending: totalSpending }
    );
  } catch (error) {
    console.error('Budget sync error:', error.message);
  }
};

module.exports = { syncBudgetSpending };
