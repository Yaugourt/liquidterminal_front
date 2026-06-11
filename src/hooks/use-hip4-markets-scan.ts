"use client";

import { useDataFetching } from "@/hooks/useDataFetching";
import {
  scanFootnote,
  scanHip4Deployment,
  type Hip4ScanDeploymentResult,
} from "@/services/hip4/markets-scan";

interface Hip4MarketsScanData {
  v1: Hip4ScanDeploymentResult;
  v2: Hip4ScanDeploymentResult;
}

export function useHip4MarketsScan() {
  const { data, isLoading, error, refetch } = useDataFetching<Hip4MarketsScanData>({
    fetchFn: async () => {
      const [v1, v2] = await Promise.all([
        scanHip4Deployment("v1"),
        scanHip4Deployment("v2"),
      ]);
      return { v1, v2 };
    },
    refreshInterval: 0, // one-shot scan — refreshed manually via `refresh`
    maxRetries: 0, // preserve previous no-retry behavior
  });

  return {
    v1: data?.v1 ?? null,
    v2: data?.v2 ?? null,
    loading: isLoading,
    error: error ? error.message : null,
    footnote: scanFootnote(),
    refresh: refetch,
  };
}
