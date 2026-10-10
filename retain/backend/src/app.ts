import cors from 'cors';
import express from 'express';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import budgetRoutes from './routes/budgets';
import categoryRoutes from './routes/categories';
import dashboardRoutes from './routes/dashboard';
import expenseRoutes from './routes/expenses';
import { errorHandler } from './utils/http';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL?.split(',') ?? true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' })); // hit this to warm up Render before the demo
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use(errorHandler);

export default app;
