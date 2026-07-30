/**
 * Revenue breakdown types — mirror of the backend `RevenueBreakdown` shape
 * served by `GET /market/revenue/history`.
 */

export type RevenueWindow = "7d" | "30d" | "90d" | "1y" | "all";

export interface RevenueDay {
  date: string;
  perp: number;
  spot: number;
  hip1: number;
  hip3: number;
  hip4: number;
  priority: number;
  total: number;
}

export interface RevenueLifetime {
  perp: number;
  spot: number;
  hip1: number;
  hip3: number;
  hip4: number;
  priority: number;
  total: number;
}

export type RevenueSourceStatus = "ok" | "stale" | "error" | "not_yet_live";

/**
 * Newest UTC day each series actually populates. A frozen upstream feed keeps
 * answering with a stale payload, which bucketing turns into zeros that read
 * exactly like a quiet day, so a series has to be stopped at its real end
 * rather than drawn down to the floor.
 *
 * Absent on responses from a backend older than the coverage field.
 */
export interface RevenueCoverage {
  perpSpot: string | null;
  priority: string | null;
}

export interface RevenueMeta {
  spotMultiplier: number;
  hypeUsd: number | null;
  lastUpdate: number;
  coverage?: RevenueCoverage;
  sourceStatus: {
    perpSpot: RevenueSourceStatus;
    hip1: RevenueSourceStatus;
    hip3: RevenueSourceStatus;
    hip4: RevenueSourceStatus;
    priority: RevenueSourceStatus;
  };
}

export interface RevenueBreakdown {
  window: RevenueWindow;
  days: RevenueDay[];
  lifetime: RevenueLifetime;
  meta: RevenueMeta;
}

export interface UseRevenueBreakdownResult {
  breakdown: RevenueBreakdown | null;
  isLoading: boolean;
  isRefreshing?: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  dataUpdatedAt?: number | null;
}
