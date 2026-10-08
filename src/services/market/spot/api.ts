import { SpotGlobalStats, SpotToken, SpotPairMeta, TokenHoldersPage } from './types';
import { get, postExternal } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { PaginatedResponse, buildQueryParams } from '../../common';
import { API_URLS } from '../../api/constants';

/**
 * Récupère les statistiques globales du marché spot
 */
export const fetchSpotGlobalStats = async (): Promise<SpotGlobalStats> => {
  return withErrorHandling(async () => {
    return await get<SpotGlobalStats>('/market/spot/globalstats');
  }, 'fetching spot global stats');
};

/**
 * Récupère les tokens spot avec pagination
 */

export const fetchSpotTokens = async (params: {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}, signal?: AbortSignal): Promise<PaginatedResponse<SpotToken>> => {
  return withErrorHandling(async () => {
    const queryParams = buildQueryParams(params);
    const url = `/market/spot?${queryParams.toString()}`;
    return await get<PaginatedResponse<SpotToken>>(url, undefined, { signal });
  }, 'fetching spot tokens');
};

/**
 * Récupère un token spécifique par son nom
 */
export const getToken = async (tokenName: string): Promise<SpotToken | null> => {
  try {
    // Récupère tous les tokens et trouve celui qui correspond au nom
    const response = await fetchSpotTokens({ limit: 1000 });
    const token = response.data.find(t => t.name.toLowerCase() === tokenName.toLowerCase());
    return token || null;
  } catch {
    // Silent error handling
    return null;
  }
};

interface SpotMetaTokenRaw {
  name: string;
  index: number;
}

interface SpotMetaPairRaw {
  name: string;
  /** [base token index, quote token index] */
  tokens: [number, number];
  index: number;
}

interface SpotAssetCtxRaw {
  coin: string;
  circulatingSupply?: string;
}

/**
 * Per-market metadata from HL `spotMetaAndAssetCtxs`, keyed by market index:
 * the real quote asset symbol (USDC / USDT0 / USDH ...) and the on-HL
 * circulating supply of the base token. The backend spot payload has neither,
 * so pair labels and market caps are corrected with this map.
 */
export const fetchSpotPairMeta = async (): Promise<Record<number, SpotPairMeta>> => {
  return withErrorHandling(async () => {
    const res = await postExternal<
      [{ tokens: SpotMetaTokenRaw[]; universe: SpotMetaPairRaw[] }, SpotAssetCtxRaw[]]
    >(`${API_URLS.HYPERLIQUID_API}/info`, { type: 'spotMetaAndAssetCtxs' });

    const meta = res?.[0];
    const ctxs = res?.[1] ?? [];
    if (!meta) return {};

    const tokenNameByIndex = new Map<number, string>(
      meta.tokens.map((t) => [t.index, t.name])
    );
    // The contexts also list pairs the universe leaves out (1,005 vs 330 on
    // 2026-10-08), so positions don't line up: match them by coin name.
    const ctxByCoin = new Map<string, SpotAssetCtxRaw>(ctxs.map((c) => [c.coin, c]));

    const map: Record<number, SpotPairMeta> = {};
    meta.universe.forEach((pair) => {
      const rawSupply = ctxByCoin.get(pair.name)?.circulatingSupply;
      const circulating = rawSupply ? parseFloat(rawSupply) : NaN;
      map[pair.index] = {
        quote: tokenNameByIndex.get(pair.tokens[1]) ?? 'USDC',
        circulatingSupply: Number.isFinite(circulating) ? circulating : null,
      };
    });
    return map;
  }, 'fetching spot pair metadata');
};

/**
 * One page of a spot token's holders, largest first (spot + staked balances
 * summed per address), with the holder count, summed balance and cohorts of
 * every holder. The backend aggregates Hypurrscan's lists (HYPE's weigh
 * 17.7 MB) so the browser no longer downloads them.
 *
 * @param page starts at 1
 */
export const fetchTokenHolders = async (
  tokenName: string,
  page: number,
  limit: number,
  signal?: AbortSignal
): Promise<TokenHoldersPage> => {
  return withErrorHandling(async () => {
    const response = await get<{ success: boolean; data: TokenHoldersPage }>(
      `/market/holders/${encodeURIComponent(tokenName)}`,
      { page, limit },
      { signal }
    );
    return response.data;
  }, 'fetching token holders');
};
