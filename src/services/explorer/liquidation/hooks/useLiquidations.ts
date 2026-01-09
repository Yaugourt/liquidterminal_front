import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchLiquidations, fetchRecentLiquidations } from '../api';
import {
  UseLiquidationsResult,
  UseLiquidationsOptions,
  LiquidationResponse,
  LiquidationsParams
} from '../types';
import { useState, useCallback, useEffect } from 'react';

/**
 * Hook pour récupérer les liquidations avec pagination keyset et filtres
 */
export const useLiquidations = ({
  coin,
  user,
  start_time,
  end_time,
  amount_dollars,
  limit = 100,
  cursor,
  order = 'DESC',
  refreshInterval = 30000
}: UseLiquidationsOptions = {}): UseLiquidationsResult => {
  const [params, setParams] = useState<LiquidationsParams>({
    coin,
    user,
    start_time,
    end_time,
    amount_dollars,
    limit,
    cursor,
    order
  });

  const { data, isLoading, error, refetch } = useDataFetching<LiquidationResponse>({
    fetchFn: () => fetchLiquidations(params),
    dependencies: [params],
    refreshInterval
  });

  const updateParams = useCallback((newParams: Partial<LiquidationsParams>) => {
    setParams(prev => ({ ...prev, ...newParams, cursor: undefined })); // Reset cursor on param change
  }, []);

  const loadMore = useCallback(() => {
    if (data?.next_cursor) {
      setParams(prev => ({ ...prev, cursor: data.next_cursor! }));
    }
  }, [data?.next_cursor]);

  return {
    liquidations: data?.data || [],
    totalCount: data?.total_count ?? null,
    nextCursor: data?.next_cursor ?? null,
    hasMore: data?.has_more ?? false,
    isLoading,
    error,
    refetch,
    updateParams,
    loadMore
  };
};

/**
 * Hook pour récupérer les liquidations récentes (fenêtre de 2h par défaut)
 */
export const useRecentLiquidations = ({
  coin,
  user,
  amount_dollars,
  limit = 50,
  hours = 2,
  order = 'DESC',
  refreshInterval = 10000 // Refresh plus fréquent pour les données récentes
}: Omit<UseLiquidationsOptions, 'start_time' | 'end_time' | 'cursor'> & { hours?: number } = {}): UseLiquidationsResult => {
  const [params, setParams] = useState<LiquidationsParams>({
    coin,
    user,
    amount_dollars,
    limit,
    hours,
    order
  });

  // Sync params when hours changes
  useEffect(() => {
    setParams(prev => ({ ...prev, hours }));
  }, [hours]);

  const { data, isLoading, error, refetch } = useDataFetching<LiquidationResponse>({
    fetchFn: () => fetchRecentLiquidations(params),
    dependencies: [params],
    refreshInterval
  });

  const updateParams = useCallback((newParams: Partial<LiquidationsParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const loadMore = useCallback(() => {
    if (data?.next_cursor) {
      setParams(prev => ({ ...prev, cursor: data.next_cursor! }));
    }
  }, [data?.next_cursor]);

  return {
    liquidations: data?.data || [],
    totalCount: data?.total_count ?? null,
    nextCursor: data?.next_cursor ?? null,
    hasMore: data?.has_more ?? false,
    isLoading,
    error,
    refetch,
    updateParams,
    loadMore
  };
};
