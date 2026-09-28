import { get, postExternal } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
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

const BASE = "/indexer/elysium";
/** Upstream is young and testnet-only: fail fast, the hooks poll again. */
const OPTS = { retryOnError: false } as const;
/** Official public Elysium testnet RPC (CORS open), used for the live head. */
export const ELYSIUM_RPC_URL = "https://testnet-rpc.elysium.kinetiq.xyz";

interface Envelope<T> {
  success: boolean;
  data: T;
}

/** Elysium timestamps are UTC without a suffix; read them as UTC. */
export function elysiumTimeMs(time: string | null | undefined): number {
  if (!time) return NaN;
  return Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(time) ? time : `${time}Z`);
}

async function getData<T>(path: string, params?: Record<string, unknown>, context = path): Promise<T> {
  return withErrorHandling(async () => {
    const res = await get<Envelope<T>>(`${BASE}${path}`, params, OPTS);
    return res.data;
  }, `fetching elysium ${context}`);
}

/** Network totals since genesis. */
export const fetchElysiumStats = () => getData<ElysiumStats>("/stats");

/** Per-day activity, newest first. */
export const fetchElysiumDaily = (days = 30) => getData<ElysiumDailyStat[]>("/stats/daily", { days });

/** Latest blocks, newest first. */
export const fetchElysiumBlocks = (limit = 20) => getData<ElysiumBlock[]>("/blocks", { limit });

/** Latest transactions; system and spam transactions are excluded by default. */
export const fetchElysiumTransactions = (limit = 20) =>
  getData<ElysiumTransaction[]>("/transactions", { limit, include_spam: false, include_system: false });

/** Batches posted to HyperEVM, newest first. */
export const fetchElysiumBatches = (limit = 5) => getData<ElysiumBatch[]>("/batches", { limit });

/** Latest bridge transfers (both directions). */
export const fetchElysiumBridgeTransfers = (limit = 15) =>
  getData<ElysiumBridgeTransfer[]>("/bridge/transfers", { limit });

/** Retryable tickets in a given state (e.g. failed redemptions). */
export const fetchElysiumRetryables = (status = "failed", limit = 20) =>
  getData<ElysiumBridgeTransfer[]>("/bridge/retryables", { status, limit });

/** Escrow vs supply per bridged asset, for one bridge route. */
export const fetchElysiumReserves = (route: ElysiumReserveRoute) =>
  getData<ElysiumReserve[]>("/bridge/reserves", { route });

/** Tokens bridged through a given route, with deposit / withdrawal counts. */
export const fetchElysiumBridgedTokens = (route: "canonical" | "mirror" = "canonical", limit = 20) =>
  getData<ElysiumBridgedToken[]>("/bridge/tokens", { route, limit });

/** Tokens seen on Elysium, most transferred first. */
export const fetchElysiumTokens = (limit = 10) => getData<ElysiumToken[]>("/tokens", { limit, standard: "erc20" });

/** Current head from the public RPC (keyless). */
export const fetchElysiumHead = async (): Promise<number> => {
  return withErrorHandling(async () => {
    const res = await postExternal<{ result?: string }>(
      ELYSIUM_RPC_URL,
      { jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] },
      { useCache: false, retryOnError: false }
    );
    const n = res.result ? parseInt(res.result, 16) : NaN;
    if (!Number.isFinite(n)) throw new Error("Elysium RPC returned no block number");
    return n;
  }, "fetching elysium head");
};

// ── Computed analytics (backend aggregates over the ingested chain) ──────────

const ANALYTICS = "/elysium/analytics";

async function getAnalytics<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  return withErrorHandling(async () => {
    const res = await get<Envelope<T>>(`${ANALYTICS}${path}`, params, OPTS);
    return res.data;
  }, `fetching elysium analytics ${path}`);
}

export const fetchElysiumIngestStatus = () => getAnalytics<ElysiumIngestStatus>("/status");
export const fetchElysiumDeployments = (days = 14) => getAnalytics<ElysiumDeploymentsAnalytics>("/deployments", { days });
export const fetchElysiumContracts = (window: "24h" | "7d" = "24h") =>
  getAnalytics<{ rows: ElysiumContractRow[] }>("/contracts", { window }).then((r) => r.rows);
export const fetchElysiumUsers = (days = 14) => getAnalytics<ElysiumUsersAnalytics>("/users", { days });
export const fetchElysiumBridgeAnalytics = (days = 14) => getAnalytics<ElysiumBridgeAnalytics>("/bridge", { days });
export const fetchElysiumEconomics = (days = 14) => getAnalytics<ElysiumEconomicsAnalytics>("/economics", { days });
