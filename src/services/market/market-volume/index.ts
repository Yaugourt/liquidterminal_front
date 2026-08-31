import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { useDataFetching } from "@/hooks/useDataFetching";

interface IndexerEnvelope<T> {
  success: boolean;
  data: T;
}

/** One day of market-wide traded volume, USD. `date` is `YYYY-MM-DD` (UTC). */
export interface DailyVolume {
  date: string;
  volume: number;
}

/**
 * Total market-wide traded volume per day over the last 10 days, from the
 * LiquidTerminal indexer proxy. The backend returns one row per UTC day,
 * newest last; the current UTC day is still accumulating, so consumers should
 * treat the last row as partial.
 */
export const fetchDailyVolume = async (): Promise<DailyVolume[]> => {
  return withErrorHandling(async () => {
    const res = await get<IndexerEnvelope<DailyVolume[]>>(`/indexer/overview/daily-volume-10d`);
    const rows = res.data ?? [];
    return rows
      .filter((r) => typeof r.volume === "number" && !!r.date)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, "fetching daily market volume");
};

export const useDailyVolume = () => {
  const { data, isLoading, error, refetch } = useDataFetching<DailyVolume[]>({
    fetchFn: fetchDailyVolume,
    refreshInterval: 300000,
    maxRetries: 1,
  });
  return { days: data ?? [], isLoading, error, refetch };
};
