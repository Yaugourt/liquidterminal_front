import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4Fills } from "../api";
import type { Hip4FillRow } from "../types";

/**
 * Fetch the recent fills for each outcome coin of a question, in parallel. The
 * caller turns these into an implied-probability time series (see
 * `buildProbabilitySeries`). One slow/failing coin degrades to an empty series
 * rather than failing the whole chart.
 */
async function fetchProbabilityHistory(
  coins: string[]
): Promise<Record<string, Hip4FillRow[]>> {
  const entries = await Promise.all(
    coins.map(async (coin) => {
      try {
        return [coin, await fetchHip4Fills({ coin, limit: 1000 })] as const;
      } catch {
        return [coin, [] as Hip4FillRow[]] as const;
      }
    })
  );
  return Object.fromEntries(entries);
}

export function useHip4ProbabilityHistory(coins: string[]) {
  // Stable cache key — re-fetch only when the *set* of coins changes.
  const key = [...coins].sort().join(",");

  const { data, isLoading, error, refetch } = useDataFetching<
    Record<string, Hip4FillRow[]>
  >({
    fetchFn: () => fetchProbabilityHistory(coins),
    refreshInterval: 30000,
    dependencies: [key],
    maxRetries: 2,
  });

  return {
    fillsByCoin: data ?? {},
    isLoading,
    error,
    refetch,
  };
}
