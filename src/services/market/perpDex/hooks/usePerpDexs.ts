import { useState, useCallback, useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchPerpDexs, calculateGlobalStats } from '../api';
import { 
  PerpDex, 
  PerpDexGlobalStats, 
  PerpDexParams, 
  UsePerpDexsOptions 
} from '../types';

/**
 * Hook pour récupérer la liste des PerpDexs
 */
export function usePerpDexs({
  defaultParams = {},
  refreshInterval = 30000
}: UsePerpDexsOptions = {}) {
  const [params, setParams] = useState<PerpDexParams>(() => ({
    sortBy: defaultParams.sortBy || 'totalOiCap',
    sortOrder: defaultParams.sortOrder || 'desc',
    ...defaultParams
  }));

  const { 
    data: rawData, 
    isLoading, 
    isInitialLoading,
    error,
    refetch
  } = useDataFetching<PerpDex[]>({
    fetchFn: fetchPerpDexs,
    refreshInterval,
    maxRetries: 3
  });

  // Sort data based on params
  const sortedData = useMemo(() => {
    if (!rawData) return [];
    
    const sorted = [...rawData].sort((a, b) => {
      const { sortBy, sortOrder } = params;
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'totalAssets':
          comparison = a.totalAssets - b.totalAssets;
          break;
        case 'totalOiCap':
        default:
          comparison = a.totalOiCap - b.totalOiCap;
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }, [rawData, params]);

  // Calculate global stats
  const globalStats = useMemo(() => {
    if (!rawData) return null;
    return calculateGlobalStats(rawData);
  }, [rawData]);

  const updateParams = useCallback((newParams: Partial<PerpDexParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  return {
    data: sortedData,
    globalStats,
    isLoading,
    isInitialLoading,
    error,
    params,
    updateParams,
    refetch
  };
}

/**
 * Hook pour récupérer les stats globales des PerpDexs
 */
export function usePerpDexGlobalStats() {
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useDataFetching<PerpDex[]>({
    fetchFn: fetchPerpDexs,
    refreshInterval: 30000,
    maxRetries: 3
  });

  const stats: PerpDexGlobalStats | null = useMemo(() => {
    if (!data) return null;
    return calculateGlobalStats(data);
  }, [data]);

  return {
    stats,
    isLoading,
    error,
    refetch
  };
}

