import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchPriorityFeesSeries } from "../api";
import type {
  PriorityFeesSeries,
  PriorityFeesSeriesWindow,
  UsePriorityFeesSeriesResult,
} from "../types";

/**
 * Subscribe to the priority-gas burn series for a window.
 *
 * The backend fans out across cumulative rollups and caches the result for 5
 * to 15 minutes depending on the window, so polling faster than a minute would
 * only round-trip the same payload.
 */
export function usePriorityFeesSeries(
  window: PriorityFeesSeriesWindow,
): UsePriorityFeesSeriesResult {
  const { data, isLoading, isRefreshing, error, refetch, dataUpdatedAt } =
    useDataFetching<PriorityFeesSeries>({
      fetchFn: () => fetchPriorityFeesSeries(window),
      refreshInterval: 60000,
      dependencies: [window],
    });

  return { series: data, isLoading, isRefreshing, error, refetch, dataUpdatedAt };
}
