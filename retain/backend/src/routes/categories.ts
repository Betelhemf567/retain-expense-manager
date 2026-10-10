import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { Category } from '../models/Category';
import { asyncHandler } from '../utils/http';

const router = Router();

// Any signed-in user can read categories (needed for the expense form and filters).
router.get(
  '/',
  authenticate,
  asyncHandler(async (_req, res) => {
    res.json(await Category.find().sort({ name: 1 }));
  })
);

export default router;
