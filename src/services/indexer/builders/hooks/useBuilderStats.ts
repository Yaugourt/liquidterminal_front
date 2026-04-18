import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchBuilderStats } from "../api";
import type { BuilderDetailStatsPayload, BuildersTimeframe, UseBuilderStatsResult } from "../types";

const ETH_ADDRESS = /^0x[a-fA-F0-9]{40}$/i;

export function useBuilderStats(
  address: string | undefined,
  timeframe?: BuildersTimeframe
): UseBuilderStatsResult {
  const { data, isLoading, error, refetch } = useDataFetching<BuilderDetailStatsPayload | null>({
    fetchFn: async () => {
      if (!address || !ETH_ADDRESS.test(address)) return null;
      return fetchBuilderStats(address, { timeframe });
    },
    dependencies: [address, timeframe],
    refreshInterval: 30_000,
    maxRetries: 3,
    initialData: null,
  });

  return {
    stats: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
