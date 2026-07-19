import { CollateralToken } from '../perpDex/types';

/**
 * Market context for a single HIP-3 asset, joined from Hyperliquid's
 * `metaAndAssetCtxs` response.
 *
 * Why this type exists next to `PerpDexAssetWithMarketData`: that one is built
 * by `usePerpDexMarketData`, which pairs `allPerpMetas[i]` (REST) with the
 * `allDexsAssetCtxs` WS payload `[i]` — two different payloads aligned by array
 * position. On a directory table a drift is visible; on a single-asset page it
 * would silently render another market's price under this market's title.
 * `metaAndAssetCtxs` returns `universe[i]` and `ctxs[i]` in the *same* response,
 * so the pairing is internally consistent by construction.
 */
export interface Hip3AssetCtx {
  /** Prefixed coin, e.g. `xyz:CL`. */
  coin: string;
  dexId: string;
  ticker: string;

  // ── metadata (universe[i]) ──
  szDecimals: number;
  maxLeverage: number;
  marginTableId: number;
  onlyIsolated: boolean;
  isDelisted: boolean;
  growthMode: string | null;
  collateralToken: CollateralToken;

  // ── market context (ctxs[i]) ──
  markPx: number;
  midPx: number | null;
  oraclePx: number;
  prevDayPx: number | null;
  /** Percentage change vs prevDayPx, null when prevDayPx is unusable. */
  priceChange24h: number | null;
  funding: number | null;
  /** Open interest in BASE UNITS (contracts), not USD. See oiNotionalUsd(). */
  openInterest: number;
  dayNtlVlm: number;
  dayBaseVlm: number;
  premium: number | null;
  impactBid: number | null;
  impactAsk: number | null;
}

/** Raw asset entry inside `metaAndAssetCtxs[0].universe`. */
export interface Hip3UniverseEntry {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  marginTableId: number;
  onlyIsolated?: boolean;
  isDelisted?: boolean;
  growthMode?: string;
  lastGrowthModeChangeTime?: string;
}

/** Raw context entry inside `metaAndAssetCtxs[1]`. */
export interface Hip3RawCtx {
  funding?: string;
  openInterest?: string;
  prevDayPx?: string;
  dayNtlVlm?: string;
  premium?: string | null;
  oraclePx?: string;
  markPx?: string;
  midPx?: string | null;
  impactPxs?: [string, string] | null;
  dayBaseVlm?: string;
}

export type Hip3MetaAndCtxsResponse = [
  { universe: Hip3UniverseEntry[]; collateralToken?: number },
  Hip3RawCtx[]
];

/** Lifecycle of a HIP-3 market. Half the listed assets are not live. */
export type Hip3AssetStatus = 'live' | 'delisted' | 'unknown';
