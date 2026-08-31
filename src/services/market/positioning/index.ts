import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { useDataFetching } from "@/hooks/useDataFetching";

interface Envelope<T> {
  success: boolean;
  data: T;
}

/** Collective positioning of the smart-money cohort on a single coin. */
export interface CoinPositioning {
  coin: string;
  longNotional: number;
  shortNotional: number;
  netNotional: number;
  longCount: number;
  shortCount: number;
  traderCount: number;
}

/** Aggregate open positioning of the smart-money cohort, computed server-side. */
export interface AggregatePositioning {
  coins: CoinPositioning[];
  totals: {
    longNotional: number;
    shortNotional: number;
    netNotional: number;
    /** longNotional / (longNotional + shortNotional), 0..1. */
    longShare: number;
  };
  tradersScanned: number;
  cohortSize: number;
  updatedAt: string;
}

/**
 * What the smart-money cohort (top traders by volume and PnL) is collectively
 * long vs short right now, per coin. All the fan-out and aggregation happen
 * server-side; the front only displays the validated snapshot.
 */
export const fetchAggregatePositioning = async (): Promise<AggregatePositioning | null> => {
  return withErrorHandling(async () => {
    const res = await get<Envelope<AggregatePositioning>>(`/top-traders/positioning`);
    return res.data ?? null;
  }, "fetching aggregate positioning");
};

export const useAggregatePositioning = () => {
  const { data, isLoading, error, refetch } = useDataFetching<AggregatePositioning | null>({
    fetchFn: fetchAggregatePositioning,
    refreshInterval: 60000,
    maxRetries: 1,
  });
  return { positioning: data ?? null, isLoading, error, refetch };
};

/** One stored hourly point of the cohort's net bias, for the trend chart. */
export interface PositioningHistoryPoint {
  /** Epoch ms of the hour bucket. */
  time: number;
  longNotional: number;
  shortNotional: number;
  netNotional: number;
  longShare: number;
}

/**
 * Net-bias history of the cohort over the last `hours`, oldest first. Empty
 * until the backend has accumulated stored snapshots (there is no upstream
 * history for open-position state, so it is built over time going forward).
 */
export const fetchPositioningHistory = async (
  hours = 168
): Promise<PositioningHistoryPoint[]> => {
  return withErrorHandling(async () => {
    const res = await get<Envelope<PositioningHistoryPoint[]>>(
      `/top-traders/positioning/history?hours=${hours}`
    );
    return res.data ?? [];
  }, "fetching positioning history");
};

export const usePositioningHistory = (hours = 168) => {
  const { data, isLoading, error, refetch } = useDataFetching<PositioningHistoryPoint[]>({
    fetchFn: () => fetchPositioningHistory(hours),
    dependencies: [hours],
    refreshInterval: 300000,
    maxRetries: 1,
  });
  return { history: data ?? [], isLoading, error, refetch };
};
