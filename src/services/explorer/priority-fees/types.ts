/**
 * Query for GET /indexer/analytics/priority-fees/stats
 */
export interface PriorityFeesStatsQuery {
  hours?: number;
  coin?: string | null;
}

/**
 * Upstream priority-fees stats payload (HypeDexer shape may vary).
 * Known keys are optional so the UI stays resilient.
 */
export interface PriorityFeesStats {
  total_priority_gas?: number | string;
  total_fills_with_priority?: number;
  fills_with_priority?: number;
  avg_priority_gas?: number | string;
  max_priority_gas?: number | string;
  unique_users?: number;
  window_hours?: number;
  /** Hourly or bucketed series when provided */
  buckets?: PriorityFeesStatsBucket[];
  hourly?: PriorityFeesStatsBucket[];
  by_hour?: PriorityFeesStatsBucket[];
  time_series?: PriorityFeesStatsBucket[];
}

export interface PriorityFeesStatsBucket {
  hour?: string;
  time?: string;
  timestamp?: number;
  t?: number;
  total_priority_gas?: number;
  count?: number;
  fills?: number;
  value?: number;
}

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
}

export interface PriorityFeesGossipHistoryQuery {
  slot_id?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  offset?: number;
  limit?: number;
}

/** Single gossip slot / history row — upstream-dependent */
export interface PriorityFeesGossipRecord {
  slot_id?: number;
  slotId?: number;
  status?: string;
  current_gas?: number | string;
  currentGas?: number | string;
  start_gas?: number | string;
  end_time?: string;
  endTime?: string;
  winner?: string;
  cycle_id?: string;
  [key: string]: unknown;
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
  priority_gas?: string | number;
  priorityGas?: string | number;
  hash?: string;
  tid?: string | number;
}

/** Hook result shapes */
export interface UsePriorityFeesStatsResult {
  data: PriorityFeesStats | null;
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

export interface UsePriorityFeesGossipStatusResult {
  data: PriorityFeesGossipRecord[] | null;
  raw: unknown;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UsePriorityFeesGossipHistoryResult {
  data: PriorityFeesGossipRecord[];
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

export type PriorityFeesChartMetric = "total_gas" | "fill_count";
