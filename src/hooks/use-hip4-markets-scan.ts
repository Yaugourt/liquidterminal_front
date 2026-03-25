"use client";

import { useCallback, useEffect, useState } from "react";
import {
  scanFootnote,
  scanHip4Deployment,
  type Hip4ScanDeploymentResult,
} from "@/services/hip4/markets-scan";

export function useHip4MarketsScan() {
  const [v1, setV1] = useState<Hip4ScanDeploymentResult | null>(null);
  const [v2, setV2] = useState<Hip4ScanDeploymentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    setV1(null);
    setV2(null);
    try {
      const [r1, r2] = await Promise.all([scanHip4Deployment("v1"), scanHip4Deployment("v2")]);
      setV1(r1);
      setV2(r2);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  return { v1, v2, loading, error, footnote: scanFootnote(), refresh: run };
}
