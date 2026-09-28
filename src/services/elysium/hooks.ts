import { useDataFetching } from "@/hooks/useDataFetching";
import {
  fetchElysiumBatches,
  fetchElysiumBlocks,
  fetchElysiumBridgeTransfers,
  fetchElysiumBridgedTokens,
  fetchElysiumDaily,
  fetchElysiumHead,
  fetchElysiumReserves,
  fetchElysiumRetryables,
  fetchElysiumStats,
  fetchElysiumTokens,
  fetchElysiumTransactions,
} from "./api";
import {
  fetchElysiumBridgeAnalytics,
  fetchElysiumContracts,
  fetchElysiumDeployments,
  fetchElysiumEconomics,
  fetchElysiumIngestStatus,
  fetchElysiumUsers,
} from "./api";
import type {
  ElysiumBridgeAnalytics,
  ElysiumContractRow,
  ElysiumDeploymentsAnalytics,
  ElysiumEconomicsAnalytics,
  ElysiumIngestStatus,
  ElysiumUsersAnalytics,
  ElysiumBatch,
  ElysiumBlock,
  ElysiumBridgeTransfer,
  ElysiumBridgedToken,
  ElysiumDailyStat,
  ElysiumReserve,
  ElysiumReserveRoute,
  ElysiumStats,
  ElysiumToken,
  ElysiumTransaction,
} from "./types";

/** Shared polling wrapper: every Elysium read degrades to empty on error. */
function usePoll<T>(fetchFn: () => Promise<T>, refreshInterval: number, dependencies: unknown[] = []) {
  const { data, isLoading, error, dataUpdatedAt, isRefreshing, refetch } = useDataFetching<T>({
    fetchFn,
    refreshInterval,
    dependencies,
    maxRetries: 1,
  });
  return { data, isLoading, error, dataUpdatedAt, isRefreshing, refetch };
}

export const useElysiumStats = () => usePoll<ElysiumStats>(fetchElysiumStats, 15_000);
export const useElysiumDaily = (days = 30) => usePoll<ElysiumDailyStat[]>(() => fetchElysiumDaily(days), 300_000, [days]);
export const useElysiumBlocks = (limit = 20) => usePoll<ElysiumBlock[]>(() => fetchElysiumBlocks(limit), 5_000, [limit]);
export const useElysiumTransactions = (limit = 20) =>
  usePoll<ElysiumTransaction[]>(() => fetchElysiumTransactions(limit), 5_000, [limit]);
export const useElysiumBatches = (limit = 5) => usePoll<ElysiumBatch[]>(() => fetchElysiumBatches(limit), 60_000, [limit]);
export const useElysiumBridgeTransfers = (limit = 15) =>
  usePoll<ElysiumBridgeTransfer[]>(() => fetchElysiumBridgeTransfers(limit), 10_000, [limit]);
export const useElysiumRetryables = () => usePoll<ElysiumBridgeTransfer[]>(() => fetchElysiumRetryables(), 60_000);
export const useElysiumReserves = (route: ElysiumReserveRoute) =>
  usePoll<ElysiumReserve[]>(() => fetchElysiumReserves(route), 120_000, [route]);
export const useElysiumBridgedTokens = () => usePoll<ElysiumBridgedToken[]>(() => fetchElysiumBridgedTokens(), 300_000);
export const useElysiumTokens = (limit = 10) => usePoll<ElysiumToken[]>(() => fetchElysiumTokens(limit), 300_000, [limit]);
/** Chain head straight from the public RPC, every 2s. */
export const useElysiumHead = () => usePoll<number>(fetchElysiumHead, 2_000);

// Computed analytics: server-side aggregates, refreshed each minute.
export const useElysiumIngestStatus = () => usePoll<ElysiumIngestStatus>(fetchElysiumIngestStatus, 30_000);
export const useElysiumDeployments = (days = 14) =>
  usePoll<ElysiumDeploymentsAnalytics>(() => fetchElysiumDeployments(days), 60_000, [days]);
export const useElysiumContracts = (window: "24h" | "7d" = "24h") =>
  usePoll<ElysiumContractRow[]>(() => fetchElysiumContracts(window), 60_000, [window]);
export const useElysiumUsers = (days = 14) => usePoll<ElysiumUsersAnalytics>(() => fetchElysiumUsers(days), 60_000, [days]);
export const useElysiumBridgeAnalytics = (days = 14) =>
  usePoll<ElysiumBridgeAnalytics>(() => fetchElysiumBridgeAnalytics(days), 60_000, [days]);
export const useElysiumEconomics = (days = 14) =>
  usePoll<ElysiumEconomicsAnalytics>(() => fetchElysiumEconomics(days), 60_000, [days]);
