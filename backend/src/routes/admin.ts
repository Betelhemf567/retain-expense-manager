import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireAdmin } from '../middleware/auth';
import { Category } from '../models/Category';
import { Expense } from '../models/Expense';
import { User } from '../models/User';
import { HttpError, asyncHandler } from '../utils/http';
import { currentMonth, monthRange } from '../utils/month';

const router = Router();
router.use(authenticate, requireAdmin);

const categorySchema = z.object({ name: z.string().trim().min(2).max(40) });
const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.post(
  '/categories',
  asyncHandler(async (req, res) => {
    const { name } = categorySchema.parse(req.body);
    if (await Category.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') })) throw new HttpError(409, 'Category already exists');
    res.status(201).json(await Category.create({ name }));
  })
);

router.put(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const { name } = categorySchema.parse(req.body);
    const category = await Category.findById(req.params.id);
    if (!category) throw new HttpError(404, 'Category not found');
    if (category.isDefault) throw new HttpError(400, 'The default category cannot be renamed');
    category.name = name;
    await category.save();
    res.json(category);
  })
);

// Deleting a category moves its expenses to the default "Uncategorized" category.
router.delete(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw new HttpError(404, 'Category not found');
    if (category.isDefault) throw new HttpError(400, 'The default category cannot be deleted');
    const fallback = await Category.findOne({ isDefault: true });
    if (!fallback) throw new HttpError(500, 'Default category missing');
    const moved = await Expense.updateMany({ category: category._id }, { category: fallback._id });
    await category.deleteOne();
    res.json({ message: 'Category deleted', reassignedExpenses: moved.modifiedCount });
  })
);

router.get(
  '/insights',
  asyncHandler(async (_req, res) => {
    const { start, end } = monthRange(currentMonth());
    const [totalUsers, totals, thisMonth, perCategory, categories, recentExpenses, recentUsers] = await Promise.all([
      User.countDocuments(),
      Expense.aggregate<{ count: number; value: number }>([{ $group: { _id: null, count: { $sum: 1 }, value: { $sum: '$amount' } } }]),
      Expense.countDocuments({ date: { $gte: start, $lt: end } }),
      Expense.aggregate<{ _id: string; total: number; count: number }>([
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Category.find(),
      Expense.find().sort({ createdAt: -1 }).limit(5).populate('category', 'name').populate('user', 'name email'),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
    ]);

    const stats = new Map(perCategory.map((c) => [String(c._id), c]));
    const rows = categories.map((c) => ({
      categoryId: c.id as string,
      name: c.name,
      total: stats.get(c.id)?.total ?? 0,
      count: stats.get(c.id)?.count ?? 0,
    }));
    const byUse = [...rows].sort((a, b) => b.count - a.count);

    res.json({
      totalUsers,
      totalExpenses: totals[0]?.count ?? 0,
      totalExpenseValue: totals[0]?.value ?? 0,
      expensesThisMonth: thisMonth,
      spendingByCategory: [...rows].sort((a, b) => b.total - a.total),
      topCategories: byUse.slice(0, 5),
      bottomCategories: [...byUse].reverse().slice(0, 5),
      recentExpenses,
      recentUsers,
    });
  })
);

export default router;
