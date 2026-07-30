export interface PriorityFeesLeaderboardQuery {
  hours?: number;
  limit?: number;
}

/**
 * Normalized leaderboard row (field names vary upstream).
 */
export interface PriorityFeesLeaderboardEntry {
  user?: string;
  address?: string;
  rank?: number;
  score?: number | string;
  value?: number | string;
  total_priority_gas?: number | string;
  priority_fees?: number | string;
  volume?: number | string;
  /** HypeDexer `by=priority_fees` */
  fill_count?: number;
}

export interface PriorityFeesRecentFillsQuery {
  limit?: number;
  offset?: number;
  coin?: string | null;
  user?: string | null;
  /** Restrict to fills that paid priority gas */
  has_priority_gas?: boolean;
}

export interface PriorityFeesFillRow {
  user?: string;
  coin?: string;
  side?: string;
  time?: number | string;
  px?: string | number;
  sz?: string | number;
  /** Snake_case (LiquidTerminal / some indexer payloads) */
  priority_gas?: string | number | null;
  /** Canonical HypeDexer field: priority fee paid, null if none */
  priorityGas?: string | number | null;
  block_number?: number | null;
  blockNumber?: number | null;
  hash?: string;
  tid?: string | number;
}

/**
 * Windows the burn series accepts. Capped at 7d because 168 h is the widest
 * lookback the upstream rollup answers, and the pre-aggregated daily chart it
 * would otherwise come from stopped advancing on 2026-07-11.
 */
export type PriorityFeesSeriesWindow = "24h" | "7d";

/**
 * One slice of the burn, differenced out of two cumulative rollups.
 *
 * `start`/`end` are the span the slice really covers, which is not always the
 * nominal bucket width: the upstream occasionally clamps a window short, and
 * the bucket inherits that rather than shifting every later bucket onto the
 * wrong hour.
 */
export interface PriorityFeesBucket {
  /** Unix ms, UTC. */
  start: number;
  /** Unix ms, UTC. */
  end: number;
  /** HYPE burned inside the span. */
  gas: number;
  /** Fills that paid priority inside the span. */
  fills: number;
}

/**
 * Window-wide aggregates. Read straight from the widest rollup, never summed
 * across buckets: payers, average, min and max are not additive.
 */
export interface PriorityFeesSeriesTotals {
  gas: number;
  fills: number;
  uniqueUsers: number;
  avgGas: number;
  minGas: number;
  maxGas: number;
  /** Every fill on the venue in the same window, priority-paying or not. */
  allFills: number | null;
  /** Every trader on the venue in the same window. */
  allUsers: number | null;
}

export interface PriorityFeesSeries {
  window: PriorityFeesSeriesWindow;
  /** Nominal bucket width in seconds. */
  bucketSeconds: number;
  /** Chronological, oldest first. */
  buckets: PriorityFeesBucket[];
  totals: PriorityFeesSeriesTotals;
  meta: {
    hypeUsd: number | null;
    generatedAt: number;
    maxWindowHours: number;
    /** Slices the upstream failed to answer for and that were left out. */
    missingBuckets: number;
  };
}

/**
 * A gossip priority auction snapshot.
 *
 * Quirk worth keeping in mind before rendering any of it: `winner` is the
 * gossip node's IPv4 address, not a wallet, so it must never be shown as one.
 * Only `snapshotTs` is used today, to say how current the feed is.
 */
export interface GossipAuctionSnapshot {
  slotId?: number;
  startTime?: string;
  durationSeconds?: number;
  startGas?: number | null;
  endGas?: number | null;
  winner?: string | null;
  snapshotTs?: string;
}

export interface UseGossipFreshnessResult {
  /** Newest snapshot the feed carries, or null when it has none. */
  lastSnapshotMs: number | null;
  isLoading: boolean;
  error: Error | null;
}

/** Hook result shapes */
export interface UsePriorityFeesSeriesResult {
  series: PriorityFeesSeries | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UsePriorityFeesLeaderboardResult {
  data: PriorityFeesLeaderboardEntry[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UsePriorityFeesRecentFillsResult {
  data: PriorityFeesFillRow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
