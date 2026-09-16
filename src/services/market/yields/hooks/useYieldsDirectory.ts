import { useCallback, useMemo, useState } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { REFRESH_INTERVALS } from '@/services/api/constants';
import { fetchYields } from '../api';
import { TOP_YIELDS_MIN_TVL } from './useTopYields';
import type { YieldFacet, YieldsPage, YieldsQuery } from '../types';

/**
 * Defaults: best APY first among pools with real depth. Sorting by TVL alone
 * surfaces upstream artefacts (0% APY pools reporting $1B of TVL) and thin
 * pools print uncapturable four-digit APYs — the $100k floor removes both.
 */
const DEFAULT_QUERY: YieldsQuery = {
  page: 1,
  pageSize: 20,
  category: 'all',
  protocol: 'all',
  minTvl: TOP_YIELDS_MIN_TVL,
  sortBy: 'apy',
  sortOrder: 'desc',
};

/** Facets from the last successful answer survive an empty filtered page. */
const EMPTY_FACETS: YieldsPage['facets'] = { categories: [], protocols: [] };

/**
 * Page-level state for /market/yields — call once, pass the result down
 * (same contract as useVaultsDirectory). Every filter, the sort and the page
 * are applied by the backend, so `items` is exactly one page.
 */
export function useYieldsDirectory(initial: Partial<YieldsQuery> = {}) {
  const [query, setQuery] = useState<YieldsQuery>(() => ({ ...DEFAULT_QUERY, ...initial }));
  const [facets, setFacets] = useState<YieldsPage['facets']>(EMPTY_FACETS);

  const { data, isLoading, isRefreshing, error, dataUpdatedAt, refetch } = useDataFetching<YieldsPage>({
    fetchFn: async () => {
      const page = await fetchYields(query);
      if (page.facets.protocols.length > 0) setFacets(page.facets);
      return page;
    },
    dependencies: [JSON.stringify(query)],
    refreshInterval: REFRESH_INTERVALS.DAILY,
    maxRetries: 1,
  });

  const updateQuery = useCallback((next: Partial<YieldsQuery>) => {
    setQuery((prev) => {
      const merged = { ...prev, ...next };
      // A filter or sort change always restarts from page 1.
      return next.page === undefined ? { ...merged, page: 1 } : merged;
    });
  }, []);

  const resetFilters = useCallback(() => setQuery(DEFAULT_QUERY), []);

  return useMemo(
    () => ({
      items: data?.items ?? [],
      total: data?.total ?? 0,
      totalPages: data?.totalPages ?? 0,
      totals: data?.totals ?? { tvl: 0, weightedApy: 0, count: 0 },
      facets,
      categoryFacets: facets.categories as YieldFacet[],
      protocolFacets: facets.protocols as YieldFacet[],
      query,
      updateQuery,
      resetFilters,
      isLoading,
      isRefreshing,
      error,
      dataUpdatedAt,
      refetch,
    }),
    [data, facets, query, updateQuery, resetFilters, isLoading, isRefreshing, error, dataUpdatedAt, refetch]
  );
}

export type UseYieldsDirectoryResult = ReturnType<typeof useYieldsDirectory>;
