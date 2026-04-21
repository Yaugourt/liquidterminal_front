import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4Settlements } from "../api";
import type { Hip4SettlementRow, Hip4SettlementsQuery, UseHip4SettlementsResult } from "../types";

export function useHip4Settlements(params?: Hip4SettlementsQuery): UseHip4SettlementsResult {
  const { data, isLoading, error, refetch } = useDataFetching<Hip4SettlementRow[]>({
    fetchFn: () => fetchHip4Settlements(params),
    refreshInterval: 30000,
    dependencies: [JSON.stringify(params)],
    maxRetries: 3,
  });

  return {
    settlements: Array.isArray(data) ? data : [],
    isLoading,
    error,
    refetch,
  };
}
