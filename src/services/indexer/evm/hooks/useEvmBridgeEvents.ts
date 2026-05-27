import { useMemo } from "react";
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
  // Round to the nearest minute so the request keys stay stable across
  // unrelated React re-renders.
  const { start_time, end_time } = useMemo(() => {
    const nowMs = Math.floor(Date.now() / 60_000) * 60_000;
    return {
      end_time: nowMs,
      start_time: nowMs - hours * 3_600_000,
    };
  }, [hours]);

  const { data, isLoading, error, refetch } = useDataFetching<EvmBridgeEvent[]>({
    fetchFn: () =>
      fetchEvmBridgeEvents({ limit, start_time, end_time }),
    dependencies: [limit, start_time, end_time],
    refreshInterval: 30_000,
    maxRetries: 3,
  });

  return { events: data ?? [], isLoading, error, refetch };
}
