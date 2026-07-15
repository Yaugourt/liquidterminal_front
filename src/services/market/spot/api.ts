import { SpotGlobalStats, SpotToken, SpotPairMeta, TokenHoldersResponse } from './types';
import { get, getExternal, postExternal } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { PaginatedResponse, buildQueryParams } from '../../common';
import { API_URLS, buildHypurrscanUrl } from '../../api/constants';

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
}): Promise<PaginatedResponse<SpotToken>> => {
  return withErrorHandling(async () => {
    const queryParams = buildQueryParams(params);
    const url = `/market/spot?${queryParams.toString()}`;
    return await get<PaginatedResponse<SpotToken>>(url);
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

    const map: Record<number, SpotPairMeta> = {};
    meta.universe.forEach((pair, i) => {
      // ctxs is aligned with the universe array order
      const rawSupply = ctxs[i]?.circulatingSupply;
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
 * Récupère les holders d'un token spécifique
 */
export const fetchTokenHolders = async (tokenName: string): Promise<TokenHoldersResponse> => {
  return withErrorHandling(async () => {
    const url = `${buildHypurrscanUrl('HYPURRSCAN_HOLDERS')}/${tokenName}`;
    // Hypurrscan is a THIRD-PARTY host — use the external client so the backend
    // Privy JWT is never attached to (and leaked toward) this request.
    return await getExternal<TokenHoldersResponse>(url);
  }, 'fetching token holders');
};

/**
 * Récupère les holders stakés d'un token spécifique
 */
export const fetchStakedHolders = async (tokenName: string): Promise<TokenHoldersResponse> => {
  return withErrorHandling(async () => {
    const url = `${buildHypurrscanUrl('HYPURRSCAN_HOLDERS')}/staked${tokenName}`;
    // Third-party host — external client (no Authorization header). See above.
    return await getExternal<TokenHoldersResponse>(url);
  }, 'fetching staked holders');
}; 