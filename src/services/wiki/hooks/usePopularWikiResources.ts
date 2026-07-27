import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchPopularWikiResources } from '../api';
import { EducationalResource, PopularResourcesResponse } from '../types';

interface UsePopularWikiResourcesResult {
  resources: EducationalResource[];
  isLoading: boolean;
  isRefreshing?: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  dataUpdatedAt?: number | null;
}

/**
 * "Most saved" leaderboard for the library side rail: APPROVED resources
 * ranked by the number of read lists that include them.
 */
export function usePopularWikiResources(limit = 5): UsePopularWikiResourcesResult {
  const { data, isLoading, isRefreshing, error, refetch, dataUpdatedAt } = useDataFetching<PopularResourcesResponse>({
    fetchFn: () => fetchPopularWikiResources(limit),
    dependencies: [limit],
    refreshInterval: 60000
  });

  return {
    resources: data?.data || [],
    isLoading,
    isRefreshing,
    error,
    refetch,
    dataUpdatedAt
  };
}
