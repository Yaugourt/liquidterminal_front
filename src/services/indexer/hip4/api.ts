import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import type {
  Hip4MarketEnrichedRow,
  Hip4QuestionWithOutcomesRow,
  Hip4FillRow,
  Hip4SettlementRow,
  Hip4AnalyticsBucket,
  Hip4MarketsEnrichedQuery,
  Hip4QuestionsWithOutcomesQuery,
  Hip4FillsQuery,
  Hip4SettlementsQuery,
  Hip4AnalyticsQuery,
} from "./types";

const HIP4 = "/indexer/hip4";

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
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out;
}

/** Flat enriched markets — parsed side_specs, token_name, question_name, display_name. */
export async function fetchHip4MarketsEnriched(
  params?: Hip4MarketsEnrichedQuery
): Promise<Hip4MarketEnrichedRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/markets-enriched`, toQuery(params ?? {}));
    return assertLtData<Hip4MarketEnrichedRow[]>(raw);
  }, "fetching HIP-4 markets-enriched");
}

/** Questions with nested outcomes (singleton markets surfaced as 1-outcome questions). */
export async function fetchHip4QuestionsWithOutcomes(
  params?: Hip4QuestionsWithOutcomesQuery
): Promise<Hip4QuestionWithOutcomesRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/questions-with-outcomes`, toQuery(params ?? {}));
    return assertLtData<Hip4QuestionWithOutcomesRow[]>(raw);
  }, "fetching HIP-4 questions-with-outcomes");
}

/** Prediction market fills feed. */
export async function fetchHip4Fills(params?: Hip4FillsQuery): Promise<Hip4FillRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/fills`, toQuery(params ?? {}));
    return assertLtData<Hip4FillRow[]>(raw);
  }, "fetching HIP-4 fills");
}

/** Market resolutions with resolved winner_name. */
export async function fetchHip4Settlements(
  params?: Hip4SettlementsQuery
): Promise<Hip4SettlementRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/settlements`, toQuery(params ?? {}));
    return assertLtData<Hip4SettlementRow[]>(raw);
  }, "fetching HIP-4 settlements");
}

/** Time-bucketed analytics — volume, fills, fees, unique traders. */
export async function fetchHip4Analytics(
  params?: Hip4AnalyticsQuery
): Promise<Hip4AnalyticsBucket[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/analytics`, toQuery(params ?? {}));
    // LT backend wraps the HypeDexer response as { success, data: { status, count, data: [...] } }
    const envelope = assertLtData<{ status: string; count: number; data: Hip4AnalyticsBucket[] }>(raw);
    return Array.isArray(envelope) ? envelope : (envelope.data ?? []);
  }, "fetching HIP-4 analytics");
}
