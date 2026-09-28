import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchEvmBridgeEvents } from "../api";
import type { EvmBridgeEvent, UseEvmBridgeEventsResult } from "../types";

/**
 * useEvmBridgeEvents — recent bridge events (USDC only).
 *
 * The HypeDexer upstream returns a very narrow default window if `start_time`
 * / `end_time` are not provided, so we always send both. **Timestamps are
 * milliseconds**, not seconds — verified against the actual API (the upstream
 * `nonce` field is itself a ms-grained Unix timestamp).
 *
 * `limit` is hard-capped at 100 by the backend Zod schema. Combined with a
 * busy bridge that can produce ~100 events / minute, the resulting fetch
 * typically covers only a few minutes — consumers should bucketise the
 * returned data on its actual time span (see `BridgeFlow.tsx`).
 */
export function useEvmBridgeEvents(
  limit = 100,
  hours = 24
): UseEvmBridgeEventsResult {
  const { data, isLoading, error, refetch } = useDataFetching<EvmBridgeEvent[]>({
    // The window is computed per fetch so polls move it forward (it used to be
    // frozen at mount: a tab left open kept asking for the same minutes).
    // Floored to the minute, so visitors in the same minute share one backend
    // cache entry.
    fetchFn: () => {
      const end_time = Math.floor(Date.now() / 60_000) * 60_000;
      return fetchEvmBridgeEvents({ limit, start_time: end_time - hours * 3_600_000, end_time });
    },
    dependencies: [limit, hours],
    refreshInterval: 30_000,
    maxRetries: 3,
  });

  return { events: data ?? [], isLoading, error, refetch };
}
