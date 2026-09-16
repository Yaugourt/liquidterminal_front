import { useDataFetching } from '@/hooks/useDataFetching';
import { REFRESH_INTERVALS } from '@/services/api/constants';
import { fetchYields } from '../api';
import type { YieldsPage } from '../types';

/**
 * Pools with real depth only: an LP with $2k of liquidity can print a
 * four-digit APY that nobody can capture. Same gate as the directory's
 * "Deep pools" preset.
 */
export const TOP_YIELDS_MIN_TVL = 100_000;

/** Highest-APY opportunities above the TVL floor — the dashboard "Top Yields" card. */
export const useTopYields = (limit = 5) => {
  const { data, isLoading, isRefreshing, error, dataUpdatedAt, refetch } = useDataFetching<YieldsPage>({
    fetchFn: () =>
      fetchYields({
        page: 1,
        pageSize: limit,
        sortBy: 'apy',
        sortOrder: 'desc',
        minTvl: TOP_YIELDS_MIN_TVL,
      }),
    dependencies: [limit],
    refreshInterval: REFRESH_INTERVALS.DAILY,
    maxRetries: 1,
  });
  return {
    yields: data?.items ?? [],
    totals: data?.totals ?? null,
    isLoading,
    isRefreshing,
    error,
    dataUpdatedAt,
    refetch,
  };
};
