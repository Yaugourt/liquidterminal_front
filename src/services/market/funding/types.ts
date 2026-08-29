// Cross-venue predicted funding (Hyperliquid `predictedFundings` info endpoint).
// The raw payload is a 2D array: one row per coin, each carrying a list of
// [venueKey, data|null] pairs. Venues seen: HlPerp, BinPerp, BybitPerp.

export interface HlVenueFunding {
  fundingRate: string;
  nextFundingTime: number;
  /** Funding interval in hours. HL funds hourly (1); Binance/Bybit 4 or 8. May be absent. */
  fundingIntervalHours?: number;
}

export type HlVenueEntry = [string, HlVenueFunding | null];
export type HlPredictedFundingRow = [string, HlVenueEntry[]];
export type HlPredictedFundingsResponse = HlPredictedFundingRow[];

/**
 * One coin's predicted funding annualized (APR %) per venue, plus the carry
 * spread between the venue paying the most and the least. A cross-venue basis
 * screen: short the highest-funding venue, long the lowest, capture the spread.
 */
export interface FundingCarryRow {
  coin: string;
  /** Annualized funding (APR %) on Hyperliquid, or null when unavailable. */
  hlApr: number | null;
  binanceApr: number | null;
  bybitApr: number | null;
  /** Highest APR minus lowest APR across available venues (APR %). Null when <2 venues quote. */
  spread: number | null;
  /** Venue to be long (lowest funding). Null when spread is null. */
  longVenue: string | null;
  /** Venue to be short (highest funding). Null when spread is null. */
  shortVenue: string | null;
  /** How many venues quoted this coin (1-3). */
  venueCount: number;
}
