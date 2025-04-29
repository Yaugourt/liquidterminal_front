import { useState, useEffect, useRef } from 'react';

interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any; // Pour les filtres supplémentaires
}

interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsePaginatedDataOptions<T> {
  fetchFn: (params: PaginationParams) => Promise<PaginationResult<T>>;
  defaultParams?: PaginationParams;
  refreshInterval?: number;
}

export function usePaginatedData<T>({
  fetchFn,
  defaultParams = {},
  refreshInterval,
}: UsePaginatedDataOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: 20,
    ...defaultParams,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const paramsRef = useRef(params);

  // Mettre à jour la ref quand params change
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn(paramsRef.current);
      setData(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      console.error('Erreur lors de la récupération des données:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Effet pour le fetch initial et les changements de params
  useEffect(() => {
    fetchData();
  }, [params.page, params.limit, params.sortBy, params.sortOrder]);

  // Effet pour l'intervalle de rafraîchissement
  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const updateParams = (newParams: Partial<PaginationParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  return {
    data,
    total,
    page: params.page ?? 1,
    totalPages,
    isLoading,
    error,
    updateParams,
    refetch: fetchData,
  };
} 