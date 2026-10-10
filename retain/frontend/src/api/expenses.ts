import type { Expense, ExpenseInput, PaginatedExpenses } from '../types';
import type { FiltersState } from '../store/filtersSlice';
import { api } from './client';

type Params = Record<string, string | number>;

/** Turns the Redux filter state into query-string params, skipping empty values. */
function toParams(f: FiltersState): Params {
  const params: Params = { sortBy: f.sortBy, order: f.order, page: f.page, limit: f.limit };
  if (f.search) params.search = f.search;
  if (f.category) params.category = f.category;
  if (f.paymentMethod) params.paymentMethod = f.paymentMethod;
  if (f.from) params.from = `${f.from}T00:00:00.000Z`;
  if (f.to) params.to = `${f.to}T23:59:59.999Z`;
  if (f.minAmount !== '') params.minAmount = f.minAmount;
  if (f.maxAmount !== '') params.maxAmount = f.maxAmount;
  return params;
}

export const fetchExpenses = async (filters: FiltersState, signal?: AbortSignal): Promise<PaginatedExpenses> =>
  (await api.get<PaginatedExpenses>('/expenses', { params: toParams(filters), signal })).data;

export const createExpense = async (input: ExpenseInput): Promise<Expense> => (await api.post<Expense>('/expenses', input)).data;

export const updateExpense = async (id: string, input: ExpenseInput): Promise<Expense> =>
  (await api.put<Expense>(`/expenses/${id}`, input)).data;

export const deleteExpense = async (id: string): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};
