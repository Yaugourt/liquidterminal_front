/**
 * Single source of truth for the HIP-3 coin identifier.
 *
 * A HIP-3 market is always addressed as `dexId:TICKER` (e.g. `xyz:CL`,
 * `flx:CRCL`). Every upstream keys on that full string — Hyperliquid's
 * `metaAndAssetCtxs.universe[].name`, the WS `coin` subscription field, the
 * HypeDexer `?coin=` query param, `Liquidation.coin`. The route, on the other
 * hand, splits it into two clean segments so the URL never carries an encoded
 * colon. These helpers are the only place that conversion happens.
 */

/** Matches `dex:TICKER` — dex is lowercase alphanumeric, ticker is alphanumeric. */
const HIP3_COIN_RE = /^([a-z0-9]+):([a-z0-9]+)$/i;

export interface Hip3CoinParts {
  /** DEX id, lowercased (e.g. `xyz`). */
  dexId: string;
  /** Asset ticker, uppercased (e.g. `CL`). */
  ticker: string;
}

/**
 * Parse a prefixed HIP-3 coin. Returns null for native perps (`BTC`), spot
 * indices (`@107`) or HIP-4 markets (`#123`), so callers can branch safely.
 */
export function parseHip3Coin(coin: string): Hip3CoinParts | null {
  const match = HIP3_COIN_RE.exec(coin.trim());
  if (!match) return null;
  return { dexId: match[1].toLowerCase(), ticker: match[2].toUpperCase() };
}

/**
 * Build the canonical coin string from route segments. Casing is normalised
 * here so `/market/perpdex/XYZ/cl` resolves the same market as `/xyz/CL`.
 */
export function buildHip3Coin(dexId: string, ticker: string): string {
  return `${dexId.trim().toLowerCase()}:${ticker.trim().toUpperCase()}`;
}

/** True when the string is a prefixed HIP-3 coin. */
export function isHip3Coin(coin: string): boolean {
  return HIP3_COIN_RE.test(coin.trim());
}

/**
 * Route to a HIP-3 asset page. Accepts either the full coin (`xyz:CL`) or the
 * two parts. Returns the parent DEX page when the input is not a HIP-3 coin,
 * so callers never emit a link to a route that cannot resolve.
 */
export function hip3AssetHref(coin: string): string;
export function hip3AssetHref(dexId: string, ticker: string): string;
export function hip3AssetHref(coinOrDex: string, ticker?: string): string {
  if (ticker !== undefined) {
    const parts = { dexId: coinOrDex.toLowerCase(), ticker: ticker.toUpperCase() };
    return `/market/perpdex/${parts.dexId}/${parts.ticker}`;
  }
  const parsed = parseHip3Coin(coinOrDex);
  if (!parsed) return "/market/perpdex";
  return `/market/perpdex/${parsed.dexId}/${parsed.ticker}`;
}

/** Display label for a HIP-3 coin: `xyz:CL` → `CL`. */
export function hip3Ticker(coin: string): string {
  return parseHip3Coin(coin)?.ticker ?? coin;
}
