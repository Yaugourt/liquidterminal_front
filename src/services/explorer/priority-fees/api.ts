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

/** Keys HypeDexer OpenAPI `APIResponse` may use; peel until we hit the business payload. */
const HYPE_DEXER_ENVELOPE_KEYS = new Set([
  "success",
  "message",
  "data",
  "total_count",
  "execution_time_ms",
  "next_cursor",
  "has_more",
]);

function isHypeDexerEnvelope(o: Record<string, unknown>): boolean {
  if (!("data" in o)) return false;
  const keys = Object.keys(o);
  return keys.length > 0 && keys.every((k) => HYPE_DEXER_ENVELOPE_KEYS.has(k));
}

/**
 * Removes LiquidTerminal `{ success, data }` then any nested HypeDexer APIResponse wrappers.
 * Keeps older backends working when they already send the leaf payload.
 */
function unwrapPriorityFeesChain(body: unknown): unknown {
  const first = unwrapIndexerData<unknown>(body);
  let cur: unknown = first;
  for (let i = 0; i < 6; i++) {
    if (!cur || typeof cur !== "object" || Array.isArray(cur)) break;
    const o = cur as Record<string, unknown>;
    if (o.success === false) {
      throw new Error(
        typeof o.message === "string"
          ? o.message
          : typeof o.error === "string"
            ? o.error
            : "Indexer upstream error"
      );
    }
    if (isHypeDexerEnvelope(o)) {
      cur = o.data;
      continue;
    }
    break;
  }
  return cur;
}

function looksLikeGossipSlot(o: Record<string, unknown>): boolean {
  return (
    "slot_id" in o ||
    "slotId" in o ||
    "current_gas" in o ||
    "currentGas" in o ||
    "status" in o ||
    "snapshotTs" in o ||
    "startGas" in o
  );
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

/** Live gossip status: `data.current_auctions` (HypeDexer HIP-3 REST). */
function normalizeGossipStatusSlots(data: unknown): PriorityFeesGossipRecord[] {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return normalizeArrayPayload(data);
  }
  const o = data as Record<string, unknown>;
  const auctions = o.current_auctions ?? o.currentAuctions;
  if (Array.isArray(auctions)) return auctions as PriorityFeesGossipRecord[];
  return normalizeArrayPayload(data);
}

function extractGossipPreviousWinners(data: unknown): (string | null)[] | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const o = data as Record<string, unknown>;
  const w = o.previous_winners ?? o.previousWinners;
  if (!Array.isArray(w)) return null;
  return w.map((item) =>
    item === null || typeof item === "string" ? item : String(item)
  ) as (string | null)[];
}

/** LT forwards `{ rows, total_count }`; legacy unwrap may still be a bare array. */
function normalizeGossipHistoryPayload(data: unknown): {
  rows: PriorityFeesGossipRecord[];
  totalCount: number | null;
} {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.rows)) {
      const tc = o.total_count;
      return {
        rows: o.rows as PriorityFeesGossipRecord[],
        totalCount: typeof tc === "number" && Number.isFinite(tc) ? tc : null,
      };
    }
  }
  return {
    rows: normalizeArrayPayload(data),
    totalCount: null,
  };
}

function normalizeArrayPayload(data: unknown): PriorityFeesGossipRecord[] {
  if (Array.isArray(data)) return data as PriorityFeesGossipRecord[];
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of [
      "slots",
      "items",
      "rows",
      "auctions",
      "history",
      "results",
      "records",
      "entries",
      "data",
    ]) {
      const v = o[key];
      if (Array.isArray(v)) return v as PriorityFeesGossipRecord[];
    }
    const nested = o.data;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const inner = normalizeArrayPayload(nested);
      if (inner.length > 0) return inner;
    }
    if (Array.isArray(nested)) return nested as PriorityFeesGossipRecord[];
    if (looksLikeGossipSlot(o)) return [o as PriorityFeesGossipRecord];
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
    const data = unwrapPriorityFeesChain(raw);
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
      buildLeaderboardQuery({ hours: params.hours ?? 24, limit: params.limit ?? 11 })
    );
    const data = unwrapPriorityFeesChain(raw);
    return normalizeLeaderboard(data);
  }, "fetching priority fees leaderboard");
};

/**
 * Live HIP-3 gossip priority-fee auction slots.
 */
export const fetchPriorityFeesGossipStatus = async (): Promise<{
  slots: PriorityFeesGossipRecord[];
  previousWinners: (string | null)[] | null;
  raw: unknown;
}> => {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(ENDPOINTS.INDEXER_HIP3_PRIORITY_FEES_GOSSIP_STATUS);
    const data = unwrapPriorityFeesChain(raw);
    const slots = normalizeGossipStatusSlots(data);
    return {
      slots,
      previousWinners: extractGossipPreviousWinners(data),
      raw: data,
    };
  }, "fetching priority fees gossip status");
};

/**
 * Historical gossip priority-fee auctions.
 */
export const fetchPriorityFeesGossipHistory = async (
  params: PriorityFeesGossipHistoryQuery = {}
): Promise<{ rows: PriorityFeesGossipRecord[]; totalCount: number | null }> => {
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
    const data = unwrapPriorityFeesChain(raw);
    return normalizeGossipHistoryPayload(data);
  }, "fetching priority fees gossip history");
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
    const data = unwrapPriorityFeesChain(raw);
    const rows = normalizeFills(data);
    return filterPositivePriorityGasRows(rows, wantPriorityOnly);
  }, "fetching recent priority-related fills");
};
