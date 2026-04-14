"use client";

import { useCallback, useMemo } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchPriorityFeesGossipStatus } from "../api";
import type { UsePriorityFeesGossipStatusResult } from "../types";

/**
 * Live HIP-3 gossip auction slots for priority fees.
 */
export function usePriorityFeesGossipStatus(): UsePriorityFeesGossipStatusResult {
  const fetchFn = useCallback(() => fetchPriorityFeesGossipStatus(), []);

  const { data, isLoading, error, refetch } = useDataFetching({
    fetchFn,
    refreshInterval: 15_000,
    dependencies: [],
  });

  const normalized = useMemo(() => {
    if (!data) return { slots: null as null, raw: null as unknown };
    return { slots: data.slots, raw: data.raw };
  }, [data]);

  return {
    data: normalized.slots,
    raw: normalized.raw,
    isLoading,
    error,
    refetch,
  };
}
