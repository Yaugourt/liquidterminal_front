import { useDataFetching } from "../../../../hooks/useDataFetching";
import { getRevenueBreakdown } from "../api";
import type {
  RevenueBreakdown,
  RevenueWindow,
  UseRevenueBreakdownResult,
} from "../types";

/**
 * Subscribe to the protocol revenue breakdown for a given window.
 * Refresh cadence (60 s) is conservative — the backend already caches the
 * assembled breakdown for 5 min, so polling more often would just round-trip
 * the same payload.
 */
export function useRevenueBreakdown(
  window: RevenueWindow,
): UseRevenueBreakdownResult {
  const { data, isLoading, error, refetch } = useDataFetching<RevenueBreakdown>({
    fetchFn: () => getRevenueBreakdown(window),
    refreshInterval: 60000,
    dependencies: [window],
  });

  return {
    breakdown: data,
    isLoading,
    error,
    refetch,
  };
}
