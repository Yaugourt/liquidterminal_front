import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchWikiResources, fetchAllWikiResources } from '../api';
import {
  EducationalResource,
  ResourcesResponse,
  WikiResourcesParams
} from '../types';

interface UseWikiLibraryResult {
  resources: EducationalResource[];
  pagination: ResourcesResponse['pagination'] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const EMPTY_RESPONSE: ResourcesResponse = {
  success: true,
  data: [],
  pagination: { total: 0, page: 1, limit: 0, totalPages: 0, hasNext: false, hasPrevious: false }
};

/**
 * Server-driven wiki library: one request with categoryIds/search/pagination,
 * APPROVED-only, previews inlined. Replaces the per-category fan-out plus the
 * per-card /link-preview calls.
 *
 * `refreshToken` is an opaque value callers bump to force a refetch (e.g.
 * after a submission) without remounting the consumer.
 */
export function useWikiLibrary(
  params: WikiResourcesParams,
  options?: { refreshToken?: number; skipWhenNoCategories?: boolean; fetchAll?: boolean }
): UseWikiLibraryResult {
  const skip = options?.skipWhenNoCategories === true
    && (!params.categoryIds || params.categoryIds.length === 0);
  const fetcher = options?.fetchAll ? fetchAllWikiResources : fetchWikiResources;

  const { data, isLoading, error, refetch } = useDataFetching<ResourcesResponse>({
    fetchFn: () => (skip ? Promise.resolve(EMPTY_RESPONSE) : fetcher(params)),
    dependencies: [
      params.categoryIds?.join(',') ?? '',
      params.search ?? '',
      params.page ?? 1,
      params.limit ?? 10,
      params.sort ?? 'createdAt',
      params.order ?? 'desc',
      options?.refreshToken ?? 0,
      skip
    ],
    refreshInterval: 60000
  });

  return {
    resources: data?.data || [],
    pagination: data?.pagination || null,
    isLoading,
    error,
    refetch
  };
}
