import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchProjectTvlHistory } from '../api';
import { ProjectTvlHistory, UseTvlHistoryResult } from '../types';

/**
 * Daily TVL series for a project's DefiLlama slug. Pass `null` when the
 * project isn't linked — the hook stays idle (no request, no error).
 */
export const useTvlHistory = (slug: string | null): UseTvlHistoryResult => {
  const { data, isLoading, error } = useDataFetching<ProjectTvlHistory | null>({
    fetchFn: () => (slug ? fetchProjectTvlHistory(slug) : Promise.resolve(null)),
    // Daily series: one fetch per page view is enough.
    refreshInterval: 0,
    dependencies: [slug],
    maxRetries: 2,
  });

  return { history: data ?? undefined, isLoading: slug ? isLoading : false, error };
};
