import type { Category } from '../types';
import { api } from './client';

export const fetchCategories = async (): Promise<Category[]> => (await api.get<Category[]>('/categories')).data;
