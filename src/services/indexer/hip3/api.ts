import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import type {
  Hip3CoinTrader,
  Hip3CoinTradersQuery,
  Hip3Fill,
  Hip3FillsQuery,
  Hip3Overview,
  Hip3Snapshot,
} from "./types";

const HIP3 = "/indexer/hip3";

/**
 * Unwrap the `{ success, data }` envelope the backend puts on every HypeDexer
 * proxy response. One level only — double-unwrapping silently yields undefined.
 */
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

function toQuery(params: object): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = value;
  }
  return out;
}

/**
 * `retryOnError: false` throughout: this proxy answers 402 when the HypeDexer
 * subscription lapses, and retrying a payment error only multiplies the noise.
 * `useDataFetching` already stops polling on a permanent 4xx.
 */
const OPTS = { retryOnError: false } as const;

export async function fetchHip3Overview(): Promise<Hip3Overview> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/overview`, undefined, OPTS);
    return assertLtData<Hip3Overview>(raw);
  }, "fetching HIP-3 overview");
}

/** Snapshot for one market. The endpoint returns an array; we take the head. */
export async function fetchHip3Snapshot(coin: string): Promise<Hip3Snapshot | null> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/snapshots`, { coin }, OPTS);
    const rows = assertLtData<Hip3Snapshot[]>(raw);
    return rows?.[0] ?? null;
  }, `fetching HIP-3 snapshot for ${coin}`);
}

export async function fetchHip3Fills(query: Hip3FillsQuery): Promise<Hip3Fill[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/fills`, toQuery(query), OPTS);
    return assertLtData<Hip3Fill[]>(raw) ?? [];
  }, `fetching HIP-3 fills for ${query.coin}`);
}

export async function fetchHip3CoinTraders(
  query: Hip3CoinTradersQuery
): Promise<Hip3CoinTrader[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP3}/stats/traders`, toQuery(query), OPTS);
    return assertLtData<Hip3CoinTrader[]>(raw) ?? [];
  }, `fetching HIP-3 traders for ${query.coin}`);
}
