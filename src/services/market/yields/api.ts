import { get } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { safeExternalHref } from '@/lib/safeUrl';
import type { RawYieldOpportunity, RawYieldResponse, YieldOpportunity, YieldsPage, YieldsQuery } from './types';

interface Envelope<T> {
  success: boolean;
  data: T;
}

const ENDPOINT = '/hyperfolio/yield';

const finite = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export const normalizeYield = (raw: RawYieldOpportunity): YieldOpportunity => {
  const tokens = [raw.pool.token0?.symbol, raw.pool.token1?.symbol].filter((s): s is string => Boolean(s));
  if (tokens.length === 0) {
    const single = raw.pool.underlyingToken?.symbol ?? raw.metadata?.underlyingSymbol ?? raw.pool.symbol;
    if (single) tokens.push(single);
  }
  return {
    id: raw.id,
    protocol: { id: raw.protocol.id, name: raw.protocol.name, website: safeExternalHref(raw.protocol.website) },
    category: raw.category,
    type: raw.type,
    poolName: raw.pool.name,
    poolAddress: raw.pool.address,
    tokens,
    apy: {
      total: finite(raw.apy.totalApy) ?? 0,
      base: finite(raw.apy.baseApy) ?? 0,
      reward: finite(raw.apy.rewardApy) ?? 0,
      apy7d: finite(raw.apy.historical?.apy7d),
      apy30d: finite(raw.apy.historical?.apy30d),
    },
    tvl: finite(raw.pool.tvlUsd),
    risk: {
      level: raw.risk.riskLevel,
      impermanentLoss: Boolean(raw.risk.impermanentLossRisk),
      liquidation: Boolean(raw.risk.liquidationRisk),
    },
    lastUpdated: Date.parse(raw.lastUpdated) || 0,
  };
};

/** Map the UI query onto Hyperfolio's `/yield` params (arrays are repeated keys, handled by axios). */
const toParams = (q: YieldsQuery): Record<string, unknown> => {
  const params: Record<string, unknown> = {
    page: q.page,
    page_size: q.pageSize,
    sort_by: q.sortBy,
    sort_order: q.sortOrder,
  };
  if (q.search) params.search = q.search;
  if (q.category && q.category !== 'all') params.categories = q.category;
  if (q.protocol && q.protocol !== 'all') params.protocols = q.protocol;
  if (q.tokenSymbol) params.token_symbols = q.tokenSymbol;
  if (q.minApy !== undefined) params.min_apy = q.minApy;
  if (q.maxApy !== undefined) params.max_apy = q.maxApy;
  // Lending markets report no TVL upstream, so a TVL floor would empty the
  // category entirely — drop it there instead of showing zero results.
  if (q.minTvl !== undefined && q.category !== 'lending') params.min_tvl = q.minTvl;
  return params;
};

/**
 * Ecosystem-wide yield opportunities (Hyperfolio `/yield`, proxied and cached
 * by the backend). Filters, sort and pagination are all server-side.
 */
export const fetchYields = async (query: YieldsQuery): Promise<YieldsPage> => {
  return withErrorHandling(async () => {
    const res = await get<Envelope<RawYieldResponse>>(ENDPOINT, toParams(query));
    const raw = res.data;
    return {
      items: (raw.data ?? []).map(normalizeYield),
      total: raw.pagination?.total ?? 0,
      page: raw.pagination?.page ?? query.page,
      pageSize: raw.pagination?.page_size ?? query.pageSize,
      totalPages: raw.pagination?.total_pages ?? 0,
      facets: {
        categories: (raw.metadata?.filters?.categories ?? []).map((f) => ({ value: f.value, label: f.label, count: f.count })),
        protocols: (raw.metadata?.filters?.protocols ?? [])
          .map((f) => ({ value: f.value, label: f.label, count: f.count }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      },
      totals: {
        tvl: finite(raw.metadata?.totals?.total_value_usd) ?? 0,
        weightedApy: finite(raw.metadata?.totals?.total_apy) ?? 0,
        count: raw.metadata?.totals?.opportunity_count ?? raw.pagination?.total ?? 0,
      },
    };
  }, 'fetching yield opportunities');
};
