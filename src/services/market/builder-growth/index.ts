import { useDataFetching } from "@/hooks/useDataFetching";
import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";

/**
 * Builder code growth: daily revenue, users, new users and volume per builder.
 * Computed by our backend from the per-builder daily fill files Hyperliquid
 * publishes (one file per builder and per UTC day), for every builder seen
 * active since builder codes went live.
 */

export type GrowthMetric = "fees" | "users" | "newUsers" | "volume";
export type GrowthRange = "30d" | "90d" | "180d" | "all";

export interface GrowthBuilder {
  address: string;
  /** On-chain builder code from the registry; null when unregistered. */
  name: string | null;
  /** Sum of the metric over the range (for users: sum of daily users). */
  total: number;
  /** One value per entry of `days`. */
  series: number[];
}

export interface GrowthSnapshot {
  metric: GrowthMetric;
  range: GrowthRange;
  /** UTC days, `YYYY-MM-DD`, oldest first. */
  days: string[];
  /** The top builders over the window, largest first. */
  builders: GrowthBuilder[];
  /** Every other builder with activity in the window, summed. */
  others: { count: number; total: number; series: number[] } | null;
  /** All builders summed, one value per day. */
  total: number[];
  coverage: {
    tracked: number;
    /** Builders with a non-zero value in the window. */
    active: number;
    /** Builders whose history is still being ingested. */
    backfilling: number;
    lastDay: string | null;
    /** Tracked share of all builder-code volume over 30 days; null when unknown. */
    volumeShare30d: number | null;
  };
  computedAt: string;
}

/** Fetch the per-builder daily series for one metric over one range. */
export const fetchBuilderGrowth = (metric: GrowthMetric, range: GrowthRange) =>
  withErrorHandling(async () => {
    const res = await get<{ data: GrowthSnapshot }>(
      "/builders/growth",
      { metric, range },
      { useCache: false, retryOnError: false }
    );
    return res.data;
  }, "fetching builder growth");

export function useBuilderGrowth(metric: GrowthMetric, range: GrowthRange) {
  return useDataFetching<GrowthSnapshot>({
    fetchFn: () => fetchBuilderGrowth(metric, range),
    refreshInterval: 300_000,
    dependencies: [metric, range],
    maxRetries: 2,
  });
}
