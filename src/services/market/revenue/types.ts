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

export interface RevenueMeta {
  spotMultiplier: number;
  hypeUsd: number | null;
  lastUpdate: number;
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
  error: Error | null;
  refetch: () => Promise<void>;
}
