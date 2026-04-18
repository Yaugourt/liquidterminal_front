import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import type {
  Hip3Overview,
  Hip3DexRow,
  Hip3AssetRow,
  Hip3SnapshotRow,
  Hip3FillRow,
  Hip3LeaderboardRow,
  Hip3TraderStatRow,
  Hip3OhlcvBar,
  Hip3OracleBucket,
  Hip3AuctionRow,
  Hip3AuctionHistoryRow,
  Hip3UserOverview,
  Hip3UserCoinRow,
  Hip3FillsQuery,
  Hip3LeaderboardQuery,
  Hip3StatsTradersQuery,
  Hip3OhlcvQuery,
  Hip3OracleStatsQuery,
  Hip3UserFillsQuery,
} from "./types";

const HIP3 = "/indexer/hip3";

function assertLtData<T>(body: unknown): T {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Invalid API response");
  }
  const r = body as { success?: boolean; data?: unknown; error?: string };
  if (r.success === false) {
    throw new Error(typeof r.error === "string" ? r.error : "Request failed");
  }
  if (!("data" in r)) {
    throw new Error("Invalid API response");
  }
  return r.data as T;
}

function toQuery(params: unknown): Record<string, unknown> {
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    return {};
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out;
}

/** Global HIP-3 stats from indexer. */
export async function fetchHip3Overview(): Promise<Hip3Overview> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/overview`);
    return assertLtData<Hip3Overview>(raw);
  }, "fetching HIP-3 overview");
}

export async function fetchHip3Dexs(params?: { limit?: number; offset?: number }): Promise<Hip3DexRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/dexs`, toQuery(params ?? {}));
    return assertLtData<Hip3DexRow[]>(raw);
  }, "fetching HIP-3 dex list");
}

export async function fetchHip3DexById(dexId: string): Promise<Hip3DexRow> {
  return withErrorHandling(async () => {
    const enc = encodeURIComponent(dexId);
    const raw = await get<unknown>(`${HIP3}/dexs/${enc}`);
    return assertLtData<Hip3DexRow>(raw);
  }, "fetching HIP-3 dex by id");
}

export async function fetchHip3TopMovers(params?: { limit?: number }): Promise<Hip3SnapshotRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/top-movers`, toQuery(params ?? {}));
    return assertLtData<Hip3SnapshotRow[]>(raw);
  }, "fetching HIP-3 top movers");
}

export async function fetchHip3Assets(params?: {
  dex_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Hip3AssetRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/assets`, toQuery(params ?? {}));
    return assertLtData<Hip3AssetRow[]>(raw);
  }, "fetching HIP-3 assets");
}

export async function fetchHip3Snapshots(params?: { dex_id?: string; coin?: string }): Promise<Hip3SnapshotRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/snapshots`, toQuery(params ?? {}));
    return assertLtData<Hip3SnapshotRow[]>(raw);
  }, "fetching HIP-3 snapshots");
}

export async function fetchHip3Fills(params?: Hip3FillsQuery): Promise<Hip3FillRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/fills`, toQuery(params ?? {}));
    return assertLtData<Hip3FillRow[]>(raw);
  }, "fetching HIP-3 fills");
}

export async function fetchHip3Leaderboard(params?: Hip3LeaderboardQuery): Promise<Hip3LeaderboardRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/leaderboard`, toQuery(params ?? {}));
    return assertLtData<Hip3LeaderboardRow[]>(raw);
  }, "fetching HIP-3 leaderboard");
}

export async function fetchHip3StatsTraders(params?: Hip3StatsTradersQuery): Promise<Hip3TraderStatRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/stats/traders`, toQuery(params ?? {}));
    return assertLtData<Hip3TraderStatRow[]>(raw);
  }, "fetching HIP-3 trader stats");
}

export async function fetchHip3Ohlcv(params: Hip3OhlcvQuery): Promise<Hip3OhlcvBar[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/ohlcv`, toQuery(params));
    return assertLtData<Hip3OhlcvBar[]>(raw);
  }, "fetching HIP-3 OHLCV");
}

export async function fetchHip3OracleStats(params: Hip3OracleStatsQuery): Promise<Hip3OracleBucket[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/oracle/stats`, toQuery(params));
    return assertLtData<Hip3OracleBucket[]>(raw);
  }, "fetching HIP-3 oracle stats");
}

export async function fetchHip3Auctions(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Hip3AuctionRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/auctions`, toQuery(params ?? {}));
    return assertLtData<Hip3AuctionRow[]>(raw);
  }, "fetching HIP-3 auctions");
}

export async function fetchHip3AuctionCurrent(): Promise<Hip3AuctionRow> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/auctions/current`);
    return assertLtData<Hip3AuctionRow>(raw);
  }, "fetching HIP-3 current auction");
}

export async function fetchHip3AuctionsHistory(params?: {
  dex_id?: string;
  limit?: number;
  offset?: number;
}): Promise<Hip3AuctionHistoryRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/auctions/history`, toQuery(params ?? {}));
    return assertLtData<Hip3AuctionHistoryRow[]>(raw);
  }, "fetching HIP-3 auction history");
}

export async function fetchHip3UserOverview(address: string): Promise<Hip3UserOverview> {
  return withErrorHandling(async () => {
    const enc = encodeURIComponent(address);
    const raw = await get<unknown>(`${HIP3}/users/${enc}/overview`);
    return assertLtData<Hip3UserOverview>(raw);
  }, "fetching HIP-3 user overview");
}

export async function fetchHip3UserCoins(address: string, params?: { limit?: number }): Promise<Hip3UserCoinRow[]> {
  return withErrorHandling(async () => {
    const enc = encodeURIComponent(address);
    const raw = await get<unknown>(`${HIP3}/users/${enc}/coins`, toQuery(params ?? {}));
    return assertLtData<Hip3UserCoinRow[]>(raw);
  }, "fetching HIP-3 user coins");
}

export async function fetchHip3UserFills(address: string, params?: Hip3UserFillsQuery): Promise<Hip3FillRow[]> {
  return withErrorHandling(async () => {
    const enc = encodeURIComponent(address);
    const raw = await get<unknown>(`${HIP3}/users/${enc}/fills`, toQuery(params ?? {}));
    return assertLtData<Hip3FillRow[]>(raw);
  }, "fetching HIP-3 user fills");
}

/** HIP-3 gossip priority-fee auction status (indexer). */
export async function fetchHip3GossipStatus(): Promise<Record<string, unknown>> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/priority-fees/gossip/status`);
    return assertLtData<Record<string, unknown>>(raw);
  }, "fetching HIP-3 gossip status");
}

/** HIP-3 gossip priority-fee auction history (indexer). */
export async function fetchHip3GossipHistory(params?: {
  limit?: number;
  offset?: number;
  order?: string;
}): Promise<unknown[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/priority-fees/gossip/history`, toQuery(params ?? {}));
    const d = assertLtData<unknown>(raw);
    if (Array.isArray(d)) return d;
    if (d && typeof d === "object" && "items" in d) {
      const items = (d as { items: unknown }).items;
      if (Array.isArray(items)) return items;
    }
    return [];
  }, "fetching HIP-3 gossip history");
}
