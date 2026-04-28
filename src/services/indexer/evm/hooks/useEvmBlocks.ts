import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchEvmBlocks } from "../api";
import type { EvmBlock, UseEvmBlocksResult } from "../types";

export function useEvmBlocks(limit = 10): UseEvmBlocksResult {
  const { data, isLoading, error, refetch } = useDataFetching<EvmBlock[]>({
    fetchFn: () => fetchEvmBlocks({ limit }),
    dependencies: [limit],
    refreshInterval: 5_000,
    maxRetries: 3,
  });

  return { blocks: data ?? [], isLoading, error, refetch };
}
