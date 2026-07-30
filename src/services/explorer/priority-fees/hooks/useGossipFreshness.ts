import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchGossipLastSnapshot } from "../api";
import type { UseGossipFreshnessResult } from "../types";

/**
 * How current the gossip (read priority) auction feed is.
 *
 * We do not chart read priority, because the only endpoints that carry it
 * report the winning gossip node's IP rather than a wallet. What we can do
 * honestly is say when that feed last moved, so the absence of read gas on this
 * page reads as a missing source instead of a missing market.
 */
export function useGossipFreshness(): UseGossipFreshnessResult {
  const { data, isLoading, error } = useDataFetching<number | null>({
    fetchFn: fetchGossipLastSnapshot,
    refreshInterval: 300000,
  });

  return { lastSnapshotMs: data ?? null, isLoading, error };
}
