import { useDataFetching } from "@/hooks/useDataFetching";
import { REFRESH_INTERVALS } from "@/services/api/constants";
import { getProtocolFundamentals, HYPERLIQUID_SLUG } from "../api";
import type { ProtocolFundamentals, UseProtocolFundamentalsResult } from "../types";

/**
 * Protocol fundamentals for the HYPE financial statements.
 *
 * DefiLlama recomputes these on a daily cadence, so polling faster than the
 * hourly interval would only re-fetch the same numbers.
 */
export function useProtocolFundamentals(
  slug: string = HYPERLIQUID_SLUG
): UseProtocolFundamentalsResult {
  const { data, isLoading, error, refetch } = useDataFetching<ProtocolFundamentals>({
    fetchFn: () => getProtocolFundamentals(slug),
    refreshInterval: REFRESH_INTERVALS.HOURLY,
    dependencies: [slug],
    maxRetries: 2,
  });

  return { fundamentals: data, isLoading, error, refetch };
}
