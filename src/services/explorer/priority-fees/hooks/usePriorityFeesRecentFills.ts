"use client";

import { useCallback, useMemo } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchPriorityFeesRecentFills } from "../api";
import type { PriorityFeesRecentFillsQuery, UsePriorityFeesRecentFillsResult } from "../types";

/**
 * Recent fills from the indexer, optionally filtered to priority-gas fills only.
 */
export function usePriorityFeesRecentFills(
  params: PriorityFeesRecentFillsQuery = {}
): UsePriorityFeesRecentFillsResult {
  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;
  const coin = params.coin ?? null;
  const user = params.user ?? null;
  const hasPriority = params.has_priority_gas ?? true;

  const deps = useMemo(
    () => [limit, offset, coin, user, hasPriority],
    [limit, offset, coin, user, hasPriority]
  );

  const fetchFn = useCallback(
    () =>
      fetchPriorityFeesRecentFills({
        limit,
        offset,
        coin: coin ?? undefined,
        user: user ?? undefined,
        has_priority_gas: hasPriority,
      }),
    [limit, offset, coin, user, hasPriority]
  );

  const { data, isLoading, error, refetch } = useDataFetching({
    fetchFn,
    refreshInterval: 30_000,
    dependencies: deps,
    initialData: [],
  });

  return {
    data: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
