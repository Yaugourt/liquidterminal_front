"use client";

import { useCallback, useMemo } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchPriorityFeesFillsTimeseries } from "../api";
import type {
  PriorityFeesFillsTimeseriesBucketHours,
  PriorityFeesFillsTimeseriesResponse,
  UsePriorityFeesFillsTimeseriesResult,
} from "../types";

export interface UsePriorityFeesFillsTimeseriesParams {
  hours: number;
  bucketHours: PriorityFeesFillsTimeseriesBucketHours;
}

/**
 * Priority gas time series derived from indexer fills (per-bucket sums, LT-cached).
 */
export function usePriorityFeesFillsTimeseries(
  params: UsePriorityFeesFillsTimeseriesParams
): UsePriorityFeesFillsTimeseriesResult {
  const deps = useMemo(
    () => [params.hours, params.bucketHours],
    [params.hours, params.bucketHours]
  );

  const fetchFn = useCallback(
    () => fetchPriorityFeesFillsTimeseries({ hours: params.hours, bucketHours: params.bucketHours }),
    [params.hours, params.bucketHours]
  );

  const { data, isLoading, error, refetch } = useDataFetching<PriorityFeesFillsTimeseriesResponse>({
    fetchFn,
    refreshInterval: 90_000,
    dependencies: deps,
    /** Heavy endpoint; avoid hammering the API on 5xx or slow responses. */
    maxRetries: 1,
  });

  return {
    data: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
