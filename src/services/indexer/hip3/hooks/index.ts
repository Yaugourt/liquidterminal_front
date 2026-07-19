import { useDataFetching } from "@/hooks/useDataFetching";
import { REFRESH_INTERVALS } from "@/services/api/constants";
import {
  fetchHip3CoinTraders,
  fetchHip3Fills,
  fetchHip3Overview,
  fetchHip3Snapshot,
} from "../api";
import type { Hip3CoinTrader, Hip3Fill, Hip3Overview, Hip3Snapshot } from "../types";

/**
 * Every hook here exposes `refetch`. A 402 from the proxy is treated as a
 * permanent client error by `useDataFetching`, which stops the polling loop —
 * correct behaviour, but it means the UI must offer a manual retry or the card
 * stays dead until the user navigates away.
 */

export function useHip3Overview(): {
  data: Hip3Overview | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useDataFetching<Hip3Overview>({
    fetchFn: fetchHip3Overview,
    dependencies: [],
    refreshInterval: REFRESH_INTERVALS.STATIC,
    maxRetries: 3,
  });
  return { data: data ?? null, isLoading, error };
}

export function useHip3Snapshot(coin: string | null) {
  const { data, isLoading, error, refetch, dataUpdatedAt } =
    useDataFetching<Hip3Snapshot | null>({
      fetchFn: () => (coin ? fetchHip3Snapshot(coin) : Promise.resolve(null)),
      dependencies: [coin],
      refreshInterval: REFRESH_INTERVALS.DEFAULT,
      maxRetries: 1,
    });
  return { snapshot: data ?? null, isLoading, error, refetch, dataUpdatedAt };
}

export function useHip3CoinFills(params: {
  coin: string | null;
  minNotional?: number;
  liquidationsOnly?: boolean;
  limit?: number;
}) {
  const { coin, minNotional, liquidationsOnly, limit = 60 } = params;
  const { data, isLoading, error, refetch, dataUpdatedAt } = useDataFetching<Hip3Fill[]>({
    fetchFn: () =>
      coin
        ? fetchHip3Fills({
            coin,
            // Ask for more rows when filtering client-side, so the visible list
            // is not starved by a rare flag.
            limit: liquidationsOnly ? Math.max(limit, 200) : limit,
            min_notional: minNotional,
          })
        : Promise.resolve([]),
    dependencies: [coin, minNotional, liquidationsOnly, limit],
    refreshInterval: REFRESH_INTERVALS.FAST,
    maxRetries: 1,
  });

  const fills = data ?? [];
  return {
    fills: liquidationsOnly ? fills.filter((f) => f.is_liquidation === 1) : fills,
    isLoading,
    error,
    refetch,
    dataUpdatedAt,
  };
}

export function useHip3CoinTraders(coin: string | null, limit = 25) {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useDataFetching<Hip3CoinTrader[]>({
    fetchFn: () => (coin ? fetchHip3CoinTraders({ coin, limit }) : Promise.resolve([])),
    dependencies: [coin, limit],
    refreshInterval: REFRESH_INTERVALS.STATIC,
    maxRetries: 1,
  });
  return { traders: data ?? [], isLoading, error, refetch, dataUpdatedAt };
}
