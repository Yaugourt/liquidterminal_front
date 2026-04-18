"use client";

import { useDataFetching } from "@/hooks/useDataFetching";
import {
  fetchHip3Overview,
  fetchHip3TopMovers,
  fetchHip3AuctionCurrent,
  fetchHip3Leaderboard,
  fetchHip3Fills,
  fetchHip3OracleStats,
  fetchHip3StatsTraders,
  fetchHip3Ohlcv,
  fetchHip3Snapshots,
  fetchHip3GossipStatus,
  fetchHip3GossipHistory,
} from "../api";
import type {
  Hip3LeaderboardQuery,
  Hip3FillsQuery,
  Hip3StatsTradersQuery,
  Hip3OhlcvQuery,
} from "../types";

const HUB_REFRESH_MS = 60_000;
const DEX_REFRESH_MS = 45_000;

/** Global indexer HIP-3 overview (all DEXs). */
export function useHip3IndexerOverview() {
  return useDataFetching({
    fetchFn: () => fetchHip3Overview(),
    refreshInterval: HUB_REFRESH_MS,
    dependencies: [],
  });
}

export function useHip3IndexerTopMovers(limit = 12) {
  return useDataFetching({
    fetchFn: () => fetchHip3TopMovers({ limit }),
    refreshInterval: HUB_REFRESH_MS,
    dependencies: [limit],
  });
}

export function useHip3IndexerAuctionCurrent() {
  return useDataFetching({
    fetchFn: () => fetchHip3AuctionCurrent(),
    refreshInterval: HUB_REFRESH_MS,
    dependencies: [],
  });
}

export function useHip3DexLeaderboard(dexId: string, params?: Omit<Hip3LeaderboardQuery, "dex_id">) {
  return useDataFetching({
    fetchFn: () =>
      fetchHip3Leaderboard({
        dex_id: dexId,
        limit: params?.limit ?? 50,
        by: params?.by,
      }),
    refreshInterval: DEX_REFRESH_MS,
    dependencies: [dexId, params?.limit, params?.by],
  });
}

export function useHip3DexFills(dexId: string, params?: Omit<Hip3FillsQuery, "dex_id">) {
  return useDataFetching({
    fetchFn: () =>
      fetchHip3Fills({
        dex_id: dexId,
        limit: params?.limit ?? 40,
        offset: params?.offset,
        coin: params?.coin,
      }),
    refreshInterval: DEX_REFRESH_MS,
    dependencies: [dexId, params?.limit, params?.offset, params?.coin],
  });
}

export function useHip3DexOracleStats(dexId: string, params?: { limit?: number }) {
  return useDataFetching({
    fetchFn: () =>
      fetchHip3OracleStats({
        dex_id: dexId,
        limit: params?.limit ?? 120,
      }),
    refreshInterval: DEX_REFRESH_MS,
    dependencies: [dexId, params?.limit],
  });
}

export function useHip3DexStatsTraders(dexId: string, params?: Omit<Hip3StatsTradersQuery, "dex_id">) {
  return useDataFetching({
    fetchFn: () =>
      fetchHip3StatsTraders({
        dex_id: dexId,
        limit: params?.limit ?? 40,
        offset: params?.offset,
        coin: params?.coin,
      }),
    refreshInterval: DEX_REFRESH_MS,
    dependencies: [dexId, params?.limit, params?.offset, params?.coin],
  });
}

export function useHip3DexOhlcv(query: Hip3OhlcvQuery | null) {
  return useDataFetching({
    fetchFn: () => {
      if (!query) {
        return Promise.resolve([]);
      }
      return fetchHip3Ohlcv(query);
    },
    refreshInterval: DEX_REFRESH_MS,
    dependencies: [
      query?.coin ?? "",
      query?.dex_id ?? "",
      query?.start ?? "",
      query?.end ?? "",
      query?.limit ?? 0,
    ],
  });
}

export function useHip3DexSnapshots(dexId: string) {
  return useDataFetching({
    fetchFn: () => fetchHip3Snapshots({ dex_id: dexId }),
    refreshInterval: DEX_REFRESH_MS,
    dependencies: [dexId],
  });
}

export function useHip3GossipStatus() {
  return useDataFetching({
    fetchFn: () => fetchHip3GossipStatus(),
    refreshInterval: HUB_REFRESH_MS,
    dependencies: [],
  });
}

export function useHip3GossipHistory(limit = 8) {
  return useDataFetching({
    fetchFn: () => fetchHip3GossipHistory({ limit, order: "desc" }),
    refreshInterval: HUB_REFRESH_MS,
    dependencies: [limit],
  });
}
