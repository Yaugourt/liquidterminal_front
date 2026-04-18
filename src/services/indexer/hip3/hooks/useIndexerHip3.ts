"use client";

import { useDataFetching } from "@/hooks/useDataFetching";
import {
  fetchHip3Overview,
  fetchHip3Dexs,
  fetchHip3DexById,
  fetchHip3TopMovers,
  fetchHip3Assets,
  fetchHip3Snapshots,
  fetchHip3Fills,
  fetchHip3Leaderboard,
  fetchHip3StatsTraders,
  fetchHip3Ohlcv,
  fetchHip3OracleStats,
  fetchHip3Auctions,
  fetchHip3AuctionCurrent,
  fetchHip3AuctionsHistory,
  fetchHip3UserOverview,
  fetchHip3UserCoins,
  fetchHip3UserFills,
} from "../api";
import type {
  Hip3FillsQuery,
  Hip3LeaderboardQuery,
  Hip3StatsTradersQuery,
  Hip3OhlcvQuery,
  Hip3OracleStatsQuery,
  Hip3UserFillsQuery,
} from "../types";

export function useHip3Overview() {
  return useDataFetching({
    fetchFn: () => fetchHip3Overview(),
    refreshInterval: 60_000,
    dependencies: [],
    maxRetries: 3,
  });
}

export function useHip3Dexs(params?: { limit?: number; offset?: number }) {
  const limit = params?.limit;
  const offset = params?.offset;
  return useDataFetching({
    fetchFn: () => fetchHip3Dexs({ limit, offset }),
    refreshInterval: 60_000,
    dependencies: [limit ?? "", offset ?? ""],
    maxRetries: 3,
  });
}

export function useHip3DexById(dexId: string) {
  return useDataFetching({
    fetchFn: () => fetchHip3DexById(dexId),
    refreshInterval: 60_000,
    dependencies: [dexId],
    maxRetries: 3,
  });
}

export function useHip3TopMovers(limit?: number) {
  return useDataFetching({
    fetchFn: () => fetchHip3TopMovers({ limit }),
    refreshInterval: 60_000,
    dependencies: [limit ?? ""],
    maxRetries: 3,
  });
}

export function useHip3Assets(params?: { dex_id?: string; search?: string; limit?: number; offset?: number }) {
  return useDataFetching({
    fetchFn: () => fetchHip3Assets(params),
    refreshInterval: 60_000,
    dependencies: [JSON.stringify(params ?? {})],
    maxRetries: 3,
  });
}

export function useHip3Snapshots(params?: { dex_id?: string; coin?: string }) {
  return useDataFetching({
    fetchFn: () => fetchHip3Snapshots(params),
    refreshInterval: 30_000,
    dependencies: [JSON.stringify(params ?? {})],
    maxRetries: 3,
  });
}

export function useHip3Fills(params?: Hip3FillsQuery) {
  return useDataFetching({
    fetchFn: () => fetchHip3Fills(params),
    refreshInterval: 30_000,
    dependencies: [JSON.stringify(params ?? {})],
    maxRetries: 3,
  });
}

export function useHip3Leaderboard(params?: Hip3LeaderboardQuery) {
  return useDataFetching({
    fetchFn: () => fetchHip3Leaderboard(params),
    refreshInterval: 60_000,
    dependencies: [JSON.stringify(params ?? {})],
    maxRetries: 3,
  });
}

export function useHip3StatsTraders(params?: Hip3StatsTradersQuery) {
  return useDataFetching({
    fetchFn: () => fetchHip3StatsTraders(params),
    refreshInterval: 60_000,
    dependencies: [JSON.stringify(params ?? {})],
    maxRetries: 3,
  });
}

export function useHip3Ohlcv(params: Hip3OhlcvQuery | null) {
  return useDataFetching({
    fetchFn: () => {
      if (!params?.coin) return Promise.resolve([]);
      return fetchHip3Ohlcv(params);
    },
    refreshInterval: 60_000,
    dependencies: [params ? JSON.stringify(params) : ""],
    maxRetries: 3,
  });
}

export function useHip3OracleStats(params: Hip3OracleStatsQuery | null) {
  return useDataFetching({
    fetchFn: () => {
      if (!params?.dex_id) return Promise.resolve([]);
      return fetchHip3OracleStats(params);
    },
    refreshInterval: 60_000,
    dependencies: [params ? JSON.stringify(params) : ""],
    maxRetries: 3,
  });
}

export function useHip3Auctions(params?: { status?: string; limit?: number; offset?: number }) {
  return useDataFetching({
    fetchFn: () => fetchHip3Auctions(params),
    refreshInterval: 60_000,
    dependencies: [JSON.stringify(params ?? {})],
    maxRetries: 3,
  });
}

export function useHip3AuctionCurrent() {
  return useDataFetching({
    fetchFn: () => fetchHip3AuctionCurrent(),
    refreshInterval: 30_000,
    dependencies: [],
    maxRetries: 3,
  });
}

export function useHip3AuctionsHistory(params?: { dex_id?: string; limit?: number; offset?: number }) {
  return useDataFetching({
    fetchFn: () => fetchHip3AuctionsHistory(params),
    refreshInterval: 60_000,
    dependencies: [JSON.stringify(params ?? {})],
    maxRetries: 3,
  });
}

const isHexAddress = (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a.trim());

export function useHip3UserOverview(address: string) {
  return useDataFetching({
    fetchFn: () => {
      if (!isHexAddress(address)) return Promise.resolve(null);
      return fetchHip3UserOverview(address);
    },
    refreshInterval: 60_000,
    dependencies: [address],
    maxRetries: 3,
  });
}

export function useHip3UserCoins(address: string, params?: { limit?: number }) {
  return useDataFetching({
    fetchFn: () => {
      if (!isHexAddress(address)) return Promise.resolve([]);
      return fetchHip3UserCoins(address, params);
    },
    refreshInterval: 60_000,
    dependencies: [address, params?.limit ?? ""],
    maxRetries: 3,
  });
}

export function useHip3UserFills(address: string, params?: Hip3UserFillsQuery) {
  return useDataFetching({
    fetchFn: () => {
      if (!isHexAddress(address)) return Promise.resolve([]);
      return fetchHip3UserFills(address, params);
    },
    refreshInterval: 30_000,
    dependencies: [address, JSON.stringify(params ?? {})],
    maxRetries: 3,
  });
}
