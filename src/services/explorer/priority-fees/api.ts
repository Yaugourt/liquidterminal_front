import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { ENDPOINTS } from "@/services/api/constants";
import type {
  PriorityFeesStats,
  PriorityFeesStatsQuery,
  PriorityFeesLeaderboardEntry,
  PriorityFeesLeaderboardQuery,
  PriorityFeesGossipRecord,
  PriorityFeesGossipHistoryQuery,
  PriorityFeesRecentFillsQuery,
  PriorityFeesFillRow,
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

function normalizeArrayPayload(data: unknown): PriorityFeesGossipRecord[] {
  if (Array.isArray(data)) return data as PriorityFeesGossipRecord[];
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["slots", "items", "rows", "auctions", "history", "data"]) {
      const v = o[key];
      if (Array.isArray(v)) return v as PriorityFeesGossipRecord[];
    }
  }
  return [];
}

function normalizeLeaderboard(data: unknown): PriorityFeesLeaderboardEntry[] {
  if (Array.isArray(data)) return data as PriorityFeesLeaderboardEntry[];
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["leaderboard", "users", "rows", "items", "data"]) {
      const v = o[key];
      if (Array.isArray(v)) return v as PriorityFeesLeaderboardEntry[];
    }
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
  }
  return [];
}

function buildStatsQuery(params: PriorityFeesStatsQuery): Record<string, string> {
  const q: Record<string, string> = {};
  if (params.hours !== undefined && params.hours !== null) {
    q.hours = String(params.hours);
  }
  if (params.coin !== undefined && params.coin !== null && params.coin !== "") {
    q.coin = params.coin;
  }
  return q;
}

function buildLeaderboardQuery(params: PriorityFeesLeaderboardQuery): Record<string, string> {
  const q: Record<string, string> = {
    by: "priority_fees",
  };
  if (params.hours !== undefined) q.hours = String(params.hours);
  if (params.limit !== undefined) q.limit = String(params.limit);
  return q;
}

function buildGossipHistoryQuery(params: PriorityFeesGossipHistoryQuery): Record<string, string> {
  const q: Record<string, string> = {};
  if (params.slot_id !== undefined && params.slot_id !== null) {
    q.slot_id = String(params.slot_id);
  }
  if (params.start_time) q.start_time = params.start_time;
  if (params.end_time) q.end_time = params.end_time;
  if (params.offset !== undefined) q.offset = String(params.offset);
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
 * Priority gas statistics for the selected window (and optional coin).
 */
export const fetchPriorityFeesStats = async (
  params: PriorityFeesStatsQuery = {}
): Promise<PriorityFeesStats> => {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(ENDPOINTS.INDEXER_ANALYTICS_PRIORITY_FEES_STATS, buildStatsQuery(params));
    const data = unwrapIndexerData<unknown>(raw);
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data as PriorityFeesStats;
    }
    return {};
  }, "fetching priority fees stats");
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
      buildLeaderboardQuery({ hours: params.hours ?? 24, limit: params.limit ?? 25 })
    );
    const data = unwrapIndexerData<unknown>(raw);
    return normalizeLeaderboard(data);
  }, "fetching priority fees leaderboard");
};

/**
 * Live HIP-3 gossip priority-fee auction slots.
 */
export const fetchPriorityFeesGossipStatus = async (): Promise<{
  slots: PriorityFeesGossipRecord[];
  raw: unknown;
}> => {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(ENDPOINTS.INDEXER_HIP3_PRIORITY_FEES_GOSSIP_STATUS);
    const data = unwrapIndexerData<unknown>(raw);
    const slots = normalizeArrayPayload(data);
    return { slots, raw: data };
  }, "fetching priority fees gossip status");
};

/**
 * Historical gossip priority-fee auctions.
 */
export const fetchPriorityFeesGossipHistory = async (
  params: PriorityFeesGossipHistoryQuery = {}
): Promise<PriorityFeesGossipRecord[]> => {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      ENDPOINTS.INDEXER_HIP3_PRIORITY_FEES_GOSSIP_HISTORY,
      buildGossipHistoryQuery({
        offset: params.offset ?? 0,
        limit: params.limit ?? 50,
        slot_id: params.slot_id,
        start_time: params.start_time,
        end_time: params.end_time,
      })
    );
    const data = unwrapIndexerData<unknown>(raw);
    return normalizeArrayPayload(data);
  }, "fetching priority fees gossip history");
};

/**
 * Recent fills; use `has_priority_gas: true` to focus on priority gas fills.
 */
export const fetchPriorityFeesRecentFills = async (
  params: PriorityFeesRecentFillsQuery = {}
): Promise<PriorityFeesFillRow[]> => {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      ENDPOINTS.INDEXER_FILLS_RECENT,
      buildFillsQuery({
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
        coin: params.coin,
        user: params.user,
        has_priority_gas: params.has_priority_gas ?? true,
      })
    );
    const data = unwrapIndexerData<unknown>(raw);
    return normalizeFills(data);
  }, "fetching recent priority-related fills");
};
