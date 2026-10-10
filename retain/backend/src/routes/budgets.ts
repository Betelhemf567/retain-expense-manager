import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { Budget } from '../models/Budget';
import { Expense } from '../models/Expense';
import { HttpError, asyncHandler } from '../utils/http';
import { MONTH_RE, currentMonth, monthRange } from '../utils/month';

export type BudgetStatus = 'none' | 'within' | 'approaching' | 'over';

export async function getBudgetSummary(userId: string, month: string) {
  const { start, end } = monthRange(month);
  const [budget, agg] = await Promise.all([
    Budget.findOne({ user: userId, month }),
    Expense.aggregate<{ total: number }>([
      { $match: { user: new Types.ObjectId(userId), date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);
  const spent = agg[0]?.total ?? 0;
  const amount = budget?.amount ?? 0;
  let status: BudgetStatus = 'none';
  if (budget) status = spent > amount ? 'over' : spent >= amount * 0.8 ? 'approaching' : 'within';
  return { month, budget: budget ? amount : null, spent, remaining: budget ? amount - spent : null, status };
}

const router = Router();
router.use(authenticate);

const monthParam = (value: string | undefined): string => {
  const month = value ?? currentMonth();
  if (!MONTH_RE.test(month)) throw new HttpError(400, 'Month must be YYYY-MM');
  return month;
};

router.get(
  '/:month',
  asyncHandler(async (req, res) => {
    res.json(await getBudgetSummary(req.user!.id, monthParam(req.params.month)));
  })
);

router.put(
  '/:month',
  asyncHandler(async (req, res) => {
    const month = monthParam(req.params.month);
    const { amount } = z.object({ amount: z.number().min(0) }).parse(req.body);
    await Budget.findOneAndUpdate({ user: req.user!.id, month }, { amount }, { upsert: true, new: true });
    res.json(await getBudgetSummary(req.user!.id, month));
  })
);

export default router;
