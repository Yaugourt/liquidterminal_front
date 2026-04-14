"use client";

import { useCallback, useMemo } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchPriorityFeesStats } from "../api";
import type { PriorityFeesStatsQuery, UsePriorityFeesStatsResult } from "../types";

/**
 * Rolling priority-fee statistics for the indexer window.
 */
export function usePriorityFeesStats(
  params: PriorityFeesStatsQuery = {}
): UsePriorityFeesStatsResult {
  const deps = useMemo(
    () => [params.hours ?? null, params.coin ?? null],
    [params.hours, params.coin]
  );

  const fetchFn = useCallback(
    () => fetchPriorityFeesStats({ hours: params.hours, coin: params.coin }),
    [params.hours, params.coin]
  );

  const { data, isLoading, error, refetch } = useDataFetching({
    fetchFn,
    refreshInterval: 45_000,
    dependencies: deps,
  });

  return {
    data: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
