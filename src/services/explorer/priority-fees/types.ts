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
  min_priority_gas?: number | string;
  max_priority_gas?: number | string;
  unique_users?: number;
  window_hours?: number;
  /** HypeDexer: effective window for aggregates (no hourly buckets on this endpoint). */
  time_range?: { start?: string; end?: string };
  /** Hourly or bucketed series if upstream adds them later */
  buckets?: PriorityFeesStatsBucket[];
  hourly?: PriorityFeesStatsBucket[];
  by_hour?: PriorityFeesStatsBucket[];
  time_series?: PriorityFeesStatsBucket[];
}

interface PriorityFeesStatsBucket {
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
  /** HypeDexer `by=priority_fees` */
  fill_count?: number;
}

export interface PriorityFeesGossipHistoryQuery {
  slot_id?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  offset?: number;
  limit?: number;
}

/**
 * Gossip slot (live) or history row — HypeDexer uses camelCase on HIP-3 REST;
 * snake_case kept for older payloads.
 */
export interface PriorityFeesGossipRecord {
  slot_id?: number;
  slotId?: number;
  status?: string;
  current_gas?: number | string;
  currentGas?: number | string;
  start_gas?: number | string;
  startGas?: number | string;
  endGas?: number | string | null;
  end_time?: string;
  endTime?: string;
  startTime?: string;
  lastUpdate?: string;
  durationSeconds?: number;
  snapshotTs?: string;
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
  /** Snake_case (LiquidTerminal / some indexer payloads) */
  priority_gas?: string | number | null;
  /** Canonical HypeDexer field: priority fee paid, null if none */
  priorityGas?: string | number | null;
  block_number?: number | null;
  blockNumber?: number | null;
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

export interface UsePriorityFeesGossipHistoryResult {
  data: PriorityFeesGossipRecord[];
  /** Total matching rows when LiquidTerminal forwards HypeDexer `total_count` */
  totalCount: number | null;
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
