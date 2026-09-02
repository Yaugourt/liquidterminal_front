import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { useDataFetching } from "@/hooks/useDataFetching";

interface Envelope<T> {
  success: boolean;
  data: T;
}

/** A self-sampled headline metric with a stored hourly history. */
export type MetricKey = "total_oi" | "active_users_24h";

/** One stored hourly point of a metric. */
export interface MetricHistoryPoint {
  /** Epoch ms of the hour bucket. */
  time: number;
  value: number;
  meta?: Record<string, number> | null;
}

/**
 * Stored history of a headline metric (total open interest, 24h active users)
 * over the last `hours`, oldest first. These values have no upstream history,
 * so the backend samples them hourly; the series starts empty and fills going
 * forward.
 */
export const fetchMetricHistory = async (
  metric: MetricKey,
  hours = 168
): Promise<MetricHistoryPoint[]> => {
  return withErrorHandling(async () => {
    const res = await get<Envelope<MetricHistoryPoint[]>>(
      `/market/metrics/history?metric=${metric}&hours=${hours}`
    );
    return res.data ?? [];
  }, `fetching ${metric} history`);
};

export const useMetricHistory = (metric: MetricKey, hours = 168) => {
  const { data, isLoading, error, refetch } = useDataFetching<MetricHistoryPoint[]>({
    fetchFn: () => fetchMetricHistory(metric, hours),
    dependencies: [metric, hours],
    refreshInterval: 300000,
    maxRetries: 1,
  });
  return { history: data ?? [], isLoading, error, refetch };
};
