export const CATEGORY_COLORS = ['#1b7f5c', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#ef4444', '#84cc16', '#f97316', '#64748b'];

export const colorAt = (index: number): string => CATEGORY_COLORS[index % CATEGORY_COLORS.length];
