import { useDataFetching } from "@/hooks/useDataFetching";
import { REFRESH_INTERVALS } from "@/services/api/constants";
import { getFeeRevenueHistory, HYPERLIQUID_SLUG } from "../api";
import type { FeeRevenueDay, UseFeeRevenueHistoryResult } from "../types";

const EMPTY: FeeRevenueDay[] = [];

/**
 * The full daily fee and revenue history for a protocol.
 *
 * One fetch feeds every window on the page: the series is closed at yesterday
 * and only grows by a point a day, so refetching faster than the hourly
 * interval returns the same six hundred rows. Components slice it themselves.
 */
export function useFeeRevenueHistory(
  slug: string = HYPERLIQUID_SLUG
): UseFeeRevenueHistoryResult {
  const { data, isLoading, error, refetch } = useDataFetching<FeeRevenueDay[]>({
    fetchFn: () => getFeeRevenueHistory(slug),
    refreshInterval: REFRESH_INTERVALS.HOURLY,
    dependencies: [slug],
    maxRetries: 2,
  });

  return { days: data ?? EMPTY, isLoading, error, refetch };
}
