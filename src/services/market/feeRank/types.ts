/**
 * Fee rank — where Hyperliquid sits when every protocol on the public fee
 * aggregate is sorted by trailing-24h fees.
 *
 * Sourced from DefiLlama's `overview/fees` endpoint, the same public basis the
 * market quotes when it compares venues. The point of the card is a single
 * ordinal: not "how much" but "how high on the list", which is only meaningful
 * against the full field of protocols the aggregate tracks.
 */

/**
 * The ranking, ready for the card (backend `/defillama/fee-rank`).
 *
 * `rank` is Hyperliquid's 1-based position when the whole field is sorted by
 * 24h fees descending (ties share the lower rank); `protocolCount` is the size
 * of that field so the reader can read the ordinal as "#N of M". The row that
 * carries the venue is the name-matched one with the most 24h fees (perps, not
 * the HLP vault line).
 */
export interface FeeRankData {
  /** 1-based position of Hyperliquid in the field, by 24h fees. */
  rank: number;
  /** Total number of protocols the aggregate reports on. */
  protocolCount: number;
  /** Hyperliquid's 24h fees, in USD — the value the rank is computed from. */
  hlFees24h: number;
  /** The matched protocol's name, as the aggregate labels it. */
  name: string;
}

export interface UseFeeRankResult {
  data: FeeRankData | null;
  isLoading: boolean;
  /** True during a background/manual refresh (drives the freshness cue spinner). */
  isRefreshing: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  /** Epoch ms of the last successful fetch, or null before the first. */
  dataUpdatedAt: number | null;
}
