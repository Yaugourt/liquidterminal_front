import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchProjectDefillamaMetrics } from '../api';
import { ProjectFundamentals, UseProjectMetricsResult } from '../types';

/**
 * Fetches the project's DefiLlama fundamentals (normalized metrics + the
 * multi-period fees/revenue blocks + token symbol) via GET /project/:id/defillama.
 * Projects without a `defillamaSlug` resolve to `undefined` metrics (the fetch
 * returns null, not an error), so pages render their listing-only state
 * without any retry loop.
 */
export const useProjectMetrics = (id: number): UseProjectMetricsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<ProjectFundamentals | null>({
    fetchFn: () => fetchProjectDefillamaMetrics(id),
    // Backend caches the aggregate for 5 min; refresh in step with it.
    refreshInterval: 120000,
    dependencies: [id],
    maxRetries: 2,
  });

  return {
    metrics: data?.metrics ?? undefined,
    fees: data?.fees ?? null,
    revenue: data?.revenue ?? null,
    tokenSymbol: data?.tokenSymbol ?? null,
    isLoading,
    error,
    refetch,
  };
};
