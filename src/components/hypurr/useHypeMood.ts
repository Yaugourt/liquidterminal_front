"use client";

import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchSpotTokens } from "@/services/market/spot/api";
import { marketMood, type HypurrMood } from "./Hypurr";

interface HypeMoodResult {
  mood: HypurrMood | null;
  label: string | null;
  change24h: number | null;
}

/**
 * HYPE 24h move as a Hypurr mood, shared by the landing ribbon and the
 * dashboard PulseBar. Top-of-volume spot page always contains HYPE.
 */
export function useHypeMood(): HypeMoodResult {
  const { data } = useDataFetching({
    fetchFn: () => fetchSpotTokens({ limit: 10, sortBy: "volume", sortOrder: "desc" }),
    refreshInterval: 60000,
    maxRetries: 2,
  });
  const change24h = data?.data?.find((t) => t.name === "HYPE")?.change24h ?? null;
  const result = marketMood(change24h);
  return { mood: result?.mood ?? null, label: result?.label ?? null, change24h };
}
