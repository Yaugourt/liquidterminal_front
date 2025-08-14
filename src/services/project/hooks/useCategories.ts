import { useState, useEffect } from 'react';
import { fetchCategories } from '../api';
import { Category, UseCategoriesResult } from '../types';

export const useCategories = (): UseCategoriesResult => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchCategories();
      setCategories(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    isLoading,
    error,
    refetch: loadCategories
  };
}; 