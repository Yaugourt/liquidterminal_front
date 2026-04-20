import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";

export type LeaderboardSortBy = "volume" | "pnl" | "trades" | "priority_fees";

export interface LeaderboardEntry {
  user: string;
  total_volume?: number;
  fill_count?: number;
  unique_coins?: number;
  pnl?: number;
  [key: string]: unknown;
}

export interface LeaderboardResponse {
  by: string;
  hours: number;
  limit: number;
  data: LeaderboardEntry[];
}

const INDEXER_GET_OPTIONS = { retryOnError: false } as const;

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

/**
 * Fetch the HyperLiquid users leaderboard from the indexer.
 */
export async function fetchUsersLeaderboard(params?: {
  by?: LeaderboardSortBy;
  hours?: number;
  limit?: number;
}): Promise<LeaderboardEntry[]> {
  return withErrorHandling(async () => {
    const q: Record<string, unknown> = {};
    if (params?.by) q.by = params.by;
    if (params?.hours) q.hours = params.hours;
    if (params?.limit) q.limit = params.limit;
    const raw = await get<unknown>("/indexer/users/leaderboard", q, INDEXER_GET_OPTIONS);
    const data = assertLtData<unknown>(raw);
    // Response may be an array directly or have a nested data field
    if (Array.isArray(data)) return data as LeaderboardEntry[];
    if (data && typeof data === "object" && "data" in (data as object)) {
      return (data as { data: LeaderboardEntry[] }).data;
    }
    return data as LeaderboardEntry[];
  }, "fetching users leaderboard");
}
