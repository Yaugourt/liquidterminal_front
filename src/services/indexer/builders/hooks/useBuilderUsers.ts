import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchBuilderUsers } from "../api";
import type { BuilderUsersPayload, BuildersTimeframe, UseBuilderUsersResult } from "../types";

const ETH_ADDRESS = /^0x[a-fA-F0-9]{40}$/i;

export function useBuilderUsers(
  address: string | undefined,
  params?: { timeframe?: BuildersTimeframe; limit?: number }
): UseBuilderUsersResult {
  const timeframe = params?.timeframe;
  const limit = params?.limit;
  const { data, isLoading, error, refetch } = useDataFetching<BuilderUsersPayload | null>({
    fetchFn: async () => {
      if (!address || !ETH_ADDRESS.test(address)) return null;
      return fetchBuilderUsers(address, { timeframe, limit });
    },
    dependencies: [address, timeframe, limit],
    refreshInterval: 30_000,
    maxRetries: 3,
    initialData: null,
  });

  return {
    data: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
