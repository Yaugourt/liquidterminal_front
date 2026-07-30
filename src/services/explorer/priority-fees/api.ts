import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { ENDPOINTS } from "@/services/api/constants";
import type {
  PriorityFeesLeaderboardEntry,
  PriorityFeesLeaderboardQuery,
  PriorityFeesRecentFillsQuery,
  PriorityFeesFillRow,
  PriorityFeesSeries,
  PriorityFeesSeriesWindow,
  GossipAuctionSnapshot,
} from "./types";

function unwrapIndexerData<T>(body: unknown): T {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid API response");
  }
  const r = body as { success?: boolean; data?: unknown; error?: string };
  if ("success" in r && r.success === false) {
    throw new Error(typeof r.error === "string" ? r.error : "Request failed");
  }
  if ("data" in r && r.data !== undefined) {
    return r.data as T;
  }
  return body as T;
}


/**
 * HypeDexer canonical field is `priorityGas` (null if none); keep `priority_gas` as alias.
 */
export function extractFillPriorityGas(row: PriorityFeesFillRow): number {
  const raw = row.priorityGas ?? row.priority_gas;
  if (raw === null || raw === undefined) return NaN;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

function normalizeLeaderboard(data: unknown): PriorityFeesLeaderboardEntry[] {
  if (Array.isArray(data)) return data as PriorityFeesLeaderboardEntry[];
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["leaderboard", "users", "rows", "items", "data"]) {
      const v = o[key];
      if (Array.isArray(v)) return v as PriorityFeesLeaderboardEntry[];
    }
    const nested = o.data;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const inner = normalizeLeaderboard(nested);
      if (inner.length > 0) return inner;
    }
    if (Array.isArray(nested)) return nested as PriorityFeesLeaderboardEntry[];
  }
  return [];
}

function normalizeFills(data: unknown): PriorityFeesFillRow[] {
  if (Array.isArray(data)) return data as PriorityFeesFillRow[];
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["fills", "items", "rows", "data"]) {
      const v = o[key];
      if (Array.isArray(v)) return v as PriorityFeesFillRow[];
    }
    const nested = o.data;
    if (Array.isArray(nested)) return nested as PriorityFeesFillRow[];
    if (nested && typeof nested === "object") {
      return normalizeFills(nested);
    }
  }
  return [];
}

/** Drop rows with no positive priority gas when the request asked for priority-only fills. */
function filterPositivePriorityGasRows(
  rows: PriorityFeesFillRow[],
  hasFilter: boolean
): PriorityFeesFillRow[] {
  if (!hasFilter) return rows;
  return rows.filter((row) => {
    const n = extractFillPriorityGas(row);
    return Number.isFinite(n) && n > 0;
  });
}

function buildLeaderboardQuery(params: PriorityFeesLeaderboardQuery): Record<string, string> {
  const q: Record<string, string> = {
    by: "priority_fees",
  };
  if (params.hours !== undefined) q.hours = String(params.hours);
  if (params.limit !== undefined) q.limit = String(params.limit);
  return q;
}

function buildFillsQuery(params: PriorityFeesRecentFillsQuery): Record<string, string> {
  const q: Record<string, string> = {};
  if (params.limit !== undefined) q.limit = String(params.limit);
  if (params.offset !== undefined) q.offset = String(params.offset);
  if (params.coin) q.coin = params.coin;
  if (params.user) q.user = params.user;
  if (params.has_priority_gas !== undefined) {
    q.has_priority_gas = String(params.has_priority_gas);
  }
  return q;
}

/**
 * Priority gas burned per bucket over the window.
 *
 * Served by our own backend rather than by the indexer directly: the series is
 * rebuilt there from cumulative rollups, because the upstream's pre-aggregated
 * daily chart stopped advancing on 2026-07-11 and still answers 200.
 */
export const fetchPriorityFeesSeries = async (
  window: PriorityFeesSeriesWindow,
): Promise<PriorityFeesSeries> => {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(ENDPOINTS.PRIORITY_FEES_SERIES, { window });
    return unwrapIndexerData<PriorityFeesSeries>(raw);
  }, "fetching priority fees series");
};

/**
 * Newest gossip-auction snapshot, used only to date the read-priority feed.
 *
 * A frozen feed keeps answering 200, so the age of its newest row is the only
 * way to tell a quiet auction from a dead pipeline.
 */
export const fetchGossipLastSnapshot = async (): Promise<number | null> => {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(ENDPOINTS.INDEXER_HIP3_PRIORITY_FEES_GOSSIP_HISTORY, {
      limit: "1",
      order: "DESC",
    });
    const data = unwrapIndexerData<{ rows?: GossipAuctionSnapshot[] }>(raw);
    const stamp = data?.rows?.[0]?.snapshotTs;
    if (typeof stamp !== "string" || stamp === "") return null;
    // Upstream stamps are UTC but not always suffixed.
    const ms = Date.parse(stamp.endsWith("Z") ? stamp : `${stamp}Z`);
    return Number.isFinite(ms) ? ms : null;
  }, "fetching gossip auction freshness");
};

/**
 * Users ranked by priority fees paid in the window.
 */
export const fetchPriorityFeesLeaderboard = async (
  params: PriorityFeesLeaderboardQuery = {}
): Promise<PriorityFeesLeaderboardEntry[]> => {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      ENDPOINTS.INDEXER_USERS_LEADERBOARD,
      buildLeaderboardQuery({ hours: params.hours ?? 24, limit: params.limit ?? 11 })
    );
    const data = unwrapIndexerData<unknown>(raw);
    return normalizeLeaderboard(data);
  }, "fetching priority fees leaderboard");
};

/**
 * Recent fills; use `has_priority_gas: true` to focus on priority gas fills.
 */
export const fetchPriorityFeesRecentFills = async (
  params: PriorityFeesRecentFillsQuery = {}
): Promise<PriorityFeesFillRow[]> => {
  const wantPriorityOnly = params.has_priority_gas ?? true;
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      ENDPOINTS.INDEXER_FILLS_RECENT,
      buildFillsQuery({
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
        coin: params.coin,
        user: params.user,
        has_priority_gas: wantPriorityOnly ? true : params.has_priority_gas,
      })
    );
    const data = unwrapIndexerData<unknown>(raw);
    const rows = normalizeFills(data);
    return filterPositivePriorityGasRows(rows, wantPriorityOnly);
  }, "fetching recent priority-related fills");
};
