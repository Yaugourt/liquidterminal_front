import { PerpMarketData, PerpGlobalStats, PerpMarketParams } from './types';
import { get } from '../../api/axios-config';
import { postExternal } from '../../api/http/axios-config';
import { API_URLS } from '../../api/constants';
import { withErrorHandling } from '../../api/error-handler';
import { PaginatedResponse, buildQueryParams } from '../../common';

export async function fetchPerpMarkets(params: PerpMarketParams, signal?: AbortSignal): Promise<PaginatedResponse<PerpMarketData>> {
  return withErrorHandling(async () => {
    const queryParams = buildQueryParams(params);
    const url = `/market/perp?${queryParams.toString()}`;
    return await get<PaginatedResponse<PerpMarketData>>(url, undefined, { signal });
  }, 'fetching perp markets');
}

/**
 * Find a single perp market by coin name (e.g. "BTC"), case-insensitively. The
 * backend has no single-market endpoint, so the full directory is fetched once
 * and searched. Resolves null when the directory loaded without that coin and
 * rejects when it did not load, so "unknown coin" and "backend down" differ.
 */
export const findPerpMarket = async (coinName: string): Promise<PerpMarketData | null> => {
  const response = await fetchPerpMarkets({ limit: 1000, page: 1 });
  return (
    response.data.find((m) => m.name.toLowerCase() === coinName.toLowerCase()) ?? null
  );
};

/** Same lookup, but a failed directory load resolves null (callers keep placeholder values). */
export const getPerpMarket = async (coinName: string): Promise<PerpMarketData | null> => {
  try {
    return await findPerpMarket(coinName);
  } catch {
    // Silent error handling: the caller falls back to placeholder values
    return null;
  }
};

export interface PerpAssetCtx {
  /** Canonical Hyperliquid coin name (case matters for chart, book and trades). */
  name: string;
  markPx: number | null;
  oraclePx: number | null;
  premium: number | null;
}

interface HlPerpCtx {
  markPx?: string;
  oraclePx?: string;
  premium?: string;
}
type HlPerpMetaAndCtxs = [{ universe: { name: string }[] }, HlPerpCtx[]];

const ctxNum = (value: string | undefined): number | null => {
  if (value == null) return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Live mark / oracle / premium for one core perp, from Hyperliquid
 * `metaAndAssetCtxs` (keyless, main dex). The perp directory endpoint doesn't
 * carry these, so they're fetched here on demand. Returns null on failure so
 * the caller keeps its directory values.
 */
export const getPerpAssetCtx = async (coin: string): Promise<PerpAssetCtx | null> => {
  try {
    const url = `${API_URLS.HYPERLIQUID_API}/info`;
    const response = await postExternal<HlPerpMetaAndCtxs>(url, { type: 'metaAndAssetCtxs' });
    const [meta, ctxs] = response ?? [];
    const universe = meta?.universe ?? [];
    const idx = universe.findIndex((u) => u.name.toLowerCase() === coin.toLowerCase());
    if (idx < 0) return null;
    const ctx = ctxs?.[idx];
    if (!ctx) return null;
    return {
      name: universe[idx].name,
      markPx: ctxNum(ctx.markPx),
      oraclePx: ctxNum(ctx.oraclePx),
      premium: ctxNum(ctx.premium),
    };
  } catch {
    return null;
  }
};

/**
 * Récupère les statistiques globales du marché perp
 */
export const fetchPerpGlobalStats = async (): Promise<PerpGlobalStats> => {
  return withErrorHandling(async () => {
    return await get<PerpGlobalStats>('/market/perp/globalstats');
  }, 'fetching perp global stats');
}; 