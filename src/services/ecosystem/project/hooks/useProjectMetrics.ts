import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchProjectDefillamaMetrics } from '../api';
import { NormalizedMetrics, UseProjectMetricsResult } from '../types';

/**
 * Fetches the project's DefiLlama metrics (TVL, volume, fees, revenue, price)
 * via GET /project/:id/defillama. Projects without a `defillamaSlug` resolve
 * to `undefined` metrics (the fetch returns null, not an error), so the panel
 * shows its empty state without any retry loop.
 */
export const useProjectMetrics = (id: number): UseProjectMetricsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<NormalizedMetrics | null>({
    fetchFn: () => fetchProjectDefillamaMetrics(id),
    // Backend caches the aggregate for 5 min; refresh in step with it.
    refreshInterval: 120000,
    dependencies: [id],
    maxRetries: 2,
  });

  return {
    metrics: data ?? undefined,
    isLoading,
    error,
    refetch,
  };
};
