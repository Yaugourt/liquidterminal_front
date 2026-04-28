import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchEvmBridgeEvents } from "../api";
import type { EvmBridgeEvent, UseEvmBridgeEventsResult } from "../types";

export function useEvmBridgeEvents(limit = 10): UseEvmBridgeEventsResult {
  const { data, isLoading, error, refetch } = useDataFetching<EvmBridgeEvent[]>({
    fetchFn: () => fetchEvmBridgeEvents({ limit }),
    dependencies: [limit],
    refreshInterval: 30_000,
    maxRetries: 3,
  });

  return { events: data ?? [], isLoading, error, refetch };
}
