"use client";

import { useCallback, useMemo } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchPriorityFeesGossipHistory } from "../api";
import type {
  PriorityFeesGossipHistoryQuery,
  PriorityFeesGossipRecord,
  UsePriorityFeesGossipHistoryResult,
} from "../types";

/**
 * Historical gossip priority-fee auctions (paginated server-side).
 */
export function usePriorityFeesGossipHistory(
  params: PriorityFeesGossipHistoryQuery
): UsePriorityFeesGossipHistoryResult {
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 50;
  const slotId = params.slot_id ?? null;
  const start = params.start_time ?? null;
  const end = params.end_time ?? null;

  const deps = useMemo(
    () => [offset, limit, slotId, start, end],
    [offset, limit, slotId, start, end]
  );

  const fetchFn = useCallback(
    () =>
      fetchPriorityFeesGossipHistory({
        offset,
        limit,
        slot_id: slotId ?? undefined,
        start_time: start ?? undefined,
        end_time: end ?? undefined,
      }),
    [offset, limit, slotId, start, end]
  );

  const empty: { rows: PriorityFeesGossipRecord[]; totalCount: number | null } = {
    rows: [],
    totalCount: null,
  };
  const { data, isLoading, error, refetch } = useDataFetching({
    fetchFn,
    refreshInterval: 120_000,
    dependencies: deps,
    initialData: empty,
  });

  const pack = data ?? empty;
  return {
    data: pack.rows,
    totalCount: pack.totalCount,
    isLoading,
    error,
    refetch,
  };
}
