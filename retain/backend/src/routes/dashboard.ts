import { Router } from 'express';
import { Types } from 'mongoose';
import { authenticate } from '../middleware/auth';
import { Expense } from '../models/Expense';
import { HttpError, asyncHandler } from '../utils/http';
import { MONTH_RE, currentMonth, monthRange } from '../utils/month';
import { getBudgetSummary } from './budgets';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const month = typeof req.query.month === 'string' ? req.query.month : currentMonth();
    if (!MONTH_RE.test(month)) throw new HttpError(400, 'Month must be YYYY-MM');
    const userId = req.user!.id;
    const { start, end } = monthRange(month);
    const match = { user: new Types.ObjectId(userId), date: { $gte: start, $lt: end } };

    const [summary, highest, byCategory, recent] = await Promise.all([
      getBudgetSummary(userId, month),
      Expense.findOne(match).sort({ amount: -1 }).populate('category', 'name'),
      Expense.aggregate([
        { $match: match },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
        { $project: { _id: 0, categoryId: '$_id', name: { $arrayElemAt: ['$cat.name', 0] }, total: 1, count: 1 } },
        { $sort: { total: -1 } },
      ]),
      Expense.find(match).sort({ date: -1, _id: -1 }).limit(5).populate('category', 'name'),
    ]);

    res.json({ ...summary, totalSpent: summary.spent, highestExpense: highest, spendingByCategory: byCategory, recentExpenses: recent });
  })
);

export default router;
