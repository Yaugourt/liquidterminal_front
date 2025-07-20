import { useState, useCallback, useEffect } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { UserFill } from '../types';
import { getUserFills } from '../api';

export interface UseUserFillsOptions {
  pageSize?: number;
  refreshInterval?: number;
}

export interface UseUserFillsResult {
  fills: UserFill[];
  data: UserFill[]; // Alias pour compatibilité
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  error: Error | null;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  refetch: () => Promise<void>;
}

export function useUserFills(
  address: string | undefined,
  options: UseUserFillsOptions = {}
): UseUserFillsResult {
  const { pageSize = 50, refreshInterval = 30000 } = options;
  const [currentPage, setCurrentPage] = useState(1);

  const { 
    data: allFills,
    isLoading,
    error,
    refetch
  } = useDataFetching<UserFill[]>({
    fetchFn: () => address ? getUserFills(address) : Promise.resolve([]),
    dependencies: [address],
    refreshInterval,
  });

  // Calculer les données paginées - trier par temps décroissant (plus récents en premier)
  const fills = (allFills || []).sort((a, b) => b.time - a.time);
  const totalPages = Math.ceil(fills.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedFills = fills.slice(startIndex, endIndex);

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Reset page when address changes
  useEffect(() => {
    setCurrentPage(1);
  }, [address]);

  return {
    fills: paginatedFills,
    data: fills, // Alias pour compatibilité - retourne tous les fills
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    error,
    nextPage,
    previousPage,
    goToPage,
    refetch,
  };
} 