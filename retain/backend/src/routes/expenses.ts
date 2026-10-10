import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { Category } from '../models/Category';
import { Expense, PAYMENT_METHODS } from '../models/Expense';
import { HttpError, asyncHandler } from '../utils/http';

const router = Router();
router.use(authenticate);

const expenseSchema = z.object({
  title: z.string().trim().min(1).max(120),
  amount: z.number().positive(),
  category: z.string().optional(),
  date: z.coerce.date(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  notes: z.string().max(500).optional(),
});

const listSchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  sortBy: z.enum(['date', 'amount']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function resolveCategoryId(categoryId?: string): Promise<string> {
  if (categoryId) {
    const found = await Category.findById(categoryId);
    if (!found) throw new HttpError(400, 'Category does not exist');
    return found.id;
  }
  const fallback = await Category.findOne({ isDefault: true });
  if (!fallback) throw new HttpError(500, 'Default category missing');
  return fallback.id;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = listSchema.parse(req.query);
    const filter: Record<string, unknown> = { user: req.user!.id };
    if (q.search) {
      const rx = new RegExp(escapeRegex(q.search), 'i');
      filter.$or = [{ title: rx }, { notes: rx }];
    }
    if (q.category) filter.category = q.category;
    if (q.paymentMethod) filter.paymentMethod = q.paymentMethod;
    if (q.from || q.to) filter.date = { ...(q.from && { $gte: q.from }), ...(q.to && { $lte: q.to }) };
    if (q.minAmount !== undefined || q.maxAmount !== undefined)
      filter.amount = { ...(q.minAmount !== undefined && { $gte: q.minAmount }), ...(q.maxAmount !== undefined && { $lte: q.maxAmount }) };

    const [data, total] = await Promise.all([
      Expense.find(filter)
        .populate('category', 'name')
        .sort({ [q.sortBy]: q.order === 'asc' ? 1 : -1, _id: -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit),
      Expense.countDocuments(filter),
    ]);
    res.json({ data, total, page: q.page, pages: Math.max(1, Math.ceil(total / q.limit)) });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user!.id }).populate('category', 'name');
    if (!expense) throw new HttpError(404, 'Expense not found');
    res.json(expense);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = expenseSchema.parse(req.body);
    const category = await resolveCategoryId(body.category);
    const expense = await Expense.create({ ...body, category, user: req.user!.id });
    res.status(201).json(await expense.populate('category', 'name'));
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = expenseSchema.parse(req.body);
    const category = await resolveCategoryId(body.category);
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user!.id },
      { ...body, category },
      { new: true }
    ).populate('category', 'name');
    if (!expense) throw new HttpError(404, 'Expense not found');
    res.json(expense);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const deleted = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user!.id });
    if (!deleted) throw new HttpError(404, 'Expense not found');
    res.status(204).send();
  })
);

export default router;
