import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchProjectContext } from '../api';
import { ProjectContext, UseProjectContextResult } from '../types';

/**
 * Hyperliquid context of a project (position, peers, chain banner) via
 * GET /project/:id/context. Unlinked projects get position=null and
 * DB-category peers — never an error, never a retry loop.
 */
export const useProjectContext = (id: number): UseProjectContextResult => {
  const { data, isLoading, error, refetch } = useDataFetching<ProjectContext>({
    fetchFn: () => fetchProjectContext(id),
    // Rankings move slowly (backend caches 10 min); no need to poll faster.
    refreshInterval: 300000,
    dependencies: [id],
    maxRetries: 2,
  });

  return { context: data ?? undefined, isLoading, error, refetch };
};
