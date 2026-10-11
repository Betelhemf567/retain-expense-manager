import type { AdminInsights, Category } from '../types';
import { api } from './client';

export const fetchInsights = async (signal?: AbortSignal): Promise<AdminInsights> =>
  (await api.get<AdminInsights>('/admin/insights', { signal })).data;

export const createCategory = async (name: string): Promise<Category> => (await api.post<Category>('/admin/categories', { name })).data;

export const renameCategory = async (id: string, name: string): Promise<Category> =>
  (await api.put<Category>(`/admin/categories/${id}`, { name })).data;

export const deleteCategory = async (id: string): Promise<{ message: string; reassignedExpenses: number }> =>
  (await api.delete<{ message: string; reassignedExpenses: number }>(`/admin/categories/${id}`)).data;
