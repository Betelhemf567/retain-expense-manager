import type { BudgetSummary, DashboardData } from '../types';
import { api } from './client';

export const fetchDashboard = async (month: string, signal?: AbortSignal): Promise<DashboardData> =>
  (await api.get<DashboardData>('/dashboard', { params: { month }, signal })).data;

export const saveBudget = async (month: string, amount: number): Promise<BudgetSummary> =>
  (await api.put<BudgetSummary>(`/budgets/${month}`, { amount })).data;
