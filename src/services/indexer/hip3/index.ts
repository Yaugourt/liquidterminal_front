import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { useDataFetching } from "@/hooks/useDataFetching";

/** Shape of `/indexer/hip3/overview` — builder-DEX venue totals + deploy auction state. */
export interface Hip3Overview {
  total_dexs: number;
  total_assets: number;
  total_volume_24h: number;
  total_fees_24h: number;
  total_trades_24h: number;
  total_open_interest: number;
  auction_active: boolean;
  auction_price_hype: number | null;
  auction_end_at: string | null;
  next_auction_at: string | null;
}

export async function fetchHip3Overview(): Promise<Hip3Overview> {
  return withErrorHandling(async () => {
    const raw = await get<{ success: boolean; data: Hip3Overview }>(
      "/indexer/hip3/overview",
      undefined,
      { retryOnError: false }
    );
    return raw.data;
  }, "fetching HIP-3 overview");
}

export function useHip3Overview(): {
  data: Hip3Overview | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useDataFetching<Hip3Overview>({
    fetchFn: fetchHip3Overview,
    dependencies: [],
    refreshInterval: 60_000,
    maxRetries: 3,
  });
  return { data: data ?? null, isLoading, error };
}
