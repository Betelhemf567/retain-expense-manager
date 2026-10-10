import { useEffect, useState } from 'react';
import { fetchCategories } from '../api/categories';
import type { Category } from '../types';

export function useCategories(): Category[] {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    let active = true;
    fetchCategories()
      .then((list) => active && setCategories(list))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  return categories;
}
