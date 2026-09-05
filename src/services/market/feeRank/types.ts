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
 * One protocol row as served by DefiLlama's fee overview. Only the fields the
 * ranking needs are typed; the payload carries many more we deliberately ignore.
 * Totals are nullable — a protocol can be tracked without a reported figure.
 */
export interface DefiLlamaFeeProtocol {
  name: string;
  total24h: number | null;
  total7d: number | null;
  total30d: number | null;
  change_1d: number | null;
}

/** Shape of the `overview/fees` response we consume. */
export interface DefiLlamaFeeOverview {
  protocols: DefiLlamaFeeProtocol[];
}

/**
 * The computed ranking, ready for the card.
 *
 * `rank` is Hyperliquid's 1-based position when the whole field is sorted by
 * 24h fees descending; `protocolCount` is the size of that field so the reader
 * can read the ordinal as "#N of M".
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
