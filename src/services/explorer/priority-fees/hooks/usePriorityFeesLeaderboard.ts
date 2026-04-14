"use client";

import { useCallback, useMemo } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchPriorityFeesLeaderboard } from "../api";
import type { PriorityFeesLeaderboardQuery, UsePriorityFeesLeaderboardResult } from "../types";

/**
 * Leaderboard of users by priority fees paid.
 */
export function usePriorityFeesLeaderboard(
  params: PriorityFeesLeaderboardQuery = {}
): UsePriorityFeesLeaderboardResult {
  const hours = params.hours ?? 24;
  const limit = params.limit ?? 11;
  const deps = useMemo(() => [hours, limit], [hours, limit]);

  const fetchFn = useCallback(
    () => fetchPriorityFeesLeaderboard({ hours, limit }),
    [hours, limit]
  );

  const { data, isLoading, error, refetch } = useDataFetching({
    fetchFn,
    refreshInterval: 60_000,
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
