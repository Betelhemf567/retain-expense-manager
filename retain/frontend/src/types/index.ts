export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const PAYMENT_METHODS = ['cash', 'card', 'mobile_money', 'bank_transfer'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  mobile_money: 'Mobile money',
  bank_transfer: 'Bank transfer',
};

export interface Category {
  _id: string;
  name: string;
  isDefault: boolean;
}

export interface CategoryRef {
  _id: string;
  name: string;
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: CategoryRef;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  category?: string;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface PaginatedExpenses {
  data: Expense[];
  total: number;
  page: number;
  pages: number;
}

export type BudgetStatus = 'none' | 'within' | 'approaching' | 'over';

export interface BudgetSummary {
  month: string;
  budget: number | null;
  spent: number;
  remaining: number | null;
  status: BudgetStatus;
}

export interface CategorySpending {
  categoryId: string;
  name: string;
  total: number;
  count: number;
}

export interface DashboardData extends BudgetSummary {
  totalSpent: number;
  highestExpense: Expense | null;
  spendingByCategory: CategorySpending[];
  recentExpenses: Expense[];
}

export interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseValue: number;
  expensesThisMonth: number;
  spendingByCategory: CategorySpending[];
  topCategories: CategorySpending[];
  bottomCategories: CategorySpending[];
  recentExpenses: (Omit<Expense, 'category'> & { category: CategoryRef; user: { name: string; email: string } })[];
  recentUsers: { _id: string; name: string; email: string; role: Role; createdAt: string }[];
}
