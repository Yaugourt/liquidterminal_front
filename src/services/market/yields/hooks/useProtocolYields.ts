import { useDataFetching } from '@/hooks/useDataFetching';
import { REFRESH_INTERVALS } from '@/services/api/constants';
import { fetchYields } from '../api';
import { matchHyperfolioProtocol } from '../protocolMatch';
import { TOP_YIELDS_MIN_TVL } from './useTopYields';
import type { YieldFacet, YieldOpportunity } from '../types';

interface ProtocolYieldsResult {
  protocol: YieldFacet | null;
  items: YieldOpportunity[];
  total: number;
}

const EMPTY: ProtocolYieldsResult = { protocol: null, items: [], total: 0 };

/**
 * Best yield opportunities of one protocol, for a project page. The project is
 * matched to a Hyperfolio protocol id through the yield facets; unmatched
 * projects resolve to `protocol: null` so the card can self-gate.
 *
 * Thin LPs are dropped (same $100k floor as Top Yields) but lending markets,
 * which report no TVL upstream, are kept. Borrow rows are costs, not yields,
 * so they never make this list.
 */
export const useProtocolYields = (
  project: { title?: string | null; defillamaSlug?: string | null } | null | undefined,
  limit = 6
) => {
  const title = project?.title ?? '';
  const slug = project?.defillamaSlug ?? '';

  const { data, isLoading, error } = useDataFetching<ProtocolYieldsResult>({
    fetchFn: async () => {
      if (!title && !slug) return EMPTY;
      const facets = await fetchYields({ page: 1, pageSize: 1, sortBy: 'tvl', sortOrder: 'desc' });
      const protocol = matchHyperfolioProtocol({ title, defillamaSlug: slug }, facets.facets.protocols);
      if (!protocol) return EMPTY;
      const page = await fetchYields({
        page: 1,
        pageSize: 50,
        protocol: protocol.value,
        sortBy: 'apy',
        sortOrder: 'desc',
      });
      const items = page.items
        .filter((y) => y.type !== 'borrow' && y.apy.total > 0 && (y.tvl === null || y.tvl >= TOP_YIELDS_MIN_TVL))
        .slice(0, limit);
      return { protocol, items, total: page.total };
    },
    dependencies: [title, slug, limit],
    refreshInterval: REFRESH_INTERVALS.DAILY,
    maxRetries: 1,
  });

  return {
    protocol: data?.protocol ?? null,
    yields: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
  };
};
