/**
 * Derived health metrics for a HIP-3 market.
 *
 * These live apart from the components because two of them are easy to get
 * wrong in a way that is invisible on screen — see `oiNotionalUsd`.
 */

/**
 * Mark-vs-oracle deviation in basis points.
 *
 * On HIP-3 the oracle is operated by the DEX deployer, not by Hyperliquid, so
 * this gap is the only on-chain trust signal available per market. Point-in-time
 * only: HypeDexer's `oracle/stats` history is unusable because `asset_id` is
 * always 0 upstream, which collides every asset of a DEX into one bucket.
 */
export function oracleDeviationBps(markPx: number, oraclePx: number): number | null {
  if (!Number.isFinite(markPx) || !Number.isFinite(oraclePx) || oraclePx <= 0) return null;
  return ((markPx - oraclePx) / oraclePx) * 10_000;
}

/** Impact bid/ask spread in basis points — a proxy for executable depth. */
export function impactSpreadBps(
  impactBid: number | null,
  impactAsk: number | null,
  midPx: number | null
): number | null {
  if (impactBid === null || impactAsk === null) return null;
  const reference = midPx && midPx > 0 ? midPx : (impactBid + impactAsk) / 2;
  if (!reference || reference <= 0) return null;
  return ((impactAsk - impactBid) / reference) * 10_000;
}

/**
 * Convert open interest to USD notional.
 *
 * `openInterest` is denominated in BASE UNITS (contracts), while the operator's
 * cap is in USD. Comparing them directly understates utilisation by the price
 * of the asset — for `xyz:CL` that is a factor of ~84 (0.21% instead of 17.8%).
 * Always route through here before comparing to a cap.
 */
export function oiNotionalUsd(openInterestBase: number, markPx: number): number {
  if (!Number.isFinite(openInterestBase) || !Number.isFinite(markPx)) return 0;
  return openInterestBase * markPx;
}

/** Share of the operator's OI cap in use, as a 0..1 ratio. Null when no cap. */
export function oiUtilisation(notionalUsd: number, capUsd: number | null): number | null {
  if (!capUsd || capUsd <= 0 || !Number.isFinite(notionalUsd)) return null;
  return notionalUsd / capUsd;
}

/** Semantic tone for an oracle deviation, at ±10 / ±25 bps thresholds. */
export function oracleTone(bps: number | null): 'default' | 'gold' | 'danger' {
  if (bps === null) return 'default';
  const magnitude = Math.abs(bps);
  if (magnitude > 25) return 'danger';
  if (magnitude > 10) return 'gold';
  return 'default';
}
