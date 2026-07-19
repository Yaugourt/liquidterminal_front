import { postExternal } from '../../api/http/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { API_URLS } from '../../api/constants';
import { COLLATERAL_TOKEN_MAP, CollateralToken } from '../perpDex/types';
import { parseHip3Coin } from '@/lib/hip3/coin';
import {
  Hip3AssetCtx,
  Hip3MetaAndCtxsResponse,
  Hip3RawCtx,
  Hip3UniverseEntry,
} from './types';

/** Parse a numeric string field, returning null rather than NaN. */
const num = (value: string | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const join = (
  entry: Hip3UniverseEntry,
  ctx: Hip3RawCtx | undefined,
  collateralToken: CollateralToken
): Hip3AssetCtx | null => {
  const parts = parseHip3Coin(entry.name);
  const markPx = num(ctx?.markPx);
  // A market with no mark price carries no usable context — drop it rather
  // than emit a row the UI has to defend against.
  if (!parts || markPx === null) return null;

  const prevDayPx = num(ctx?.prevDayPx);
  const impact = ctx?.impactPxs ?? null;

  return {
    coin: entry.name,
    dexId: parts.dexId,
    ticker: parts.ticker,

    szDecimals: entry.szDecimals,
    maxLeverage: entry.maxLeverage,
    marginTableId: entry.marginTableId,
    onlyIsolated: entry.onlyIsolated ?? false,
    isDelisted: entry.isDelisted ?? false,
    growthMode: entry.growthMode ?? null,
    collateralToken,

    markPx,
    midPx: num(ctx?.midPx),
    oraclePx: num(ctx?.oraclePx) ?? markPx,
    prevDayPx,
    priceChange24h:
      prevDayPx !== null && prevDayPx > 0 ? ((markPx - prevDayPx) / prevDayPx) * 100 : null,
    funding: num(ctx?.funding),
    openInterest: num(ctx?.openInterest) ?? 0,
    dayNtlVlm: num(ctx?.dayNtlVlm) ?? 0,
    dayBaseVlm: num(ctx?.dayBaseVlm) ?? 0,
    premium: num(ctx?.premium),
    impactBid: impact ? num(impact[0]) : null,
    impactAsk: impact ? num(impact[1]) : null,
  };
};

/**
 * All market contexts for one HIP-3 DEX, in a single request.
 *
 * Feeds both the asset page and its sibling-markets module, so opening a page
 * costs one call rather than one per module.
 */
export const fetchHip3DexCtxs = async (dexId: string): Promise<Hip3AssetCtx[]> => {
  return withErrorHandling(async () => {
    const url = `${API_URLS.HYPERLIQUID_API}/info`;
    const response = await postExternal<Hip3MetaAndCtxsResponse>(url, {
      type: 'metaAndAssetCtxs',
      dex: dexId.toLowerCase(),
    });

    const [meta, ctxs] = response ?? [];
    const universe = meta?.universe ?? [];
    const collateralToken = COLLATERAL_TOKEN_MAP[meta?.collateralToken ?? 0] ?? 'USDC';

    return universe
      .map((entry, index) => join(entry, ctxs?.[index], collateralToken))
      .filter((asset): asset is Hip3AssetCtx => asset !== null);
  }, `fetching HIP-3 market contexts for dex ${dexId}`);
};
