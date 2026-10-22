import { get, postExternal } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { API_URLS } from "@/services/api/constants";
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
  Hip4OutcomeMetaResponse,
  Hip4OutcomeTemplateEntry,
  Hip4L2Book,
  Hip4Candle,
  Hip4CandleInterval,
  Hip4OutcomeVolumes,
  Hip4Resolutions,
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

/** Questions with nested outcomes (a market with no question comes as a question of its own, with its two sides). */
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

/** Canonical list of currently-registered outcomes and the questions grouping
 * them, straight from Hyperliquid (`POST /info { type: "outcomeMeta" }`). This
 * is the source of truth for the live markets HypeDexer's lists omit. */
export async function fetchHip4OutcomeMeta(): Promise<Required<Hip4OutcomeMetaResponse>> {
  return withErrorHandling(async () => {
    const res = await postExternal<Hip4OutcomeMetaResponse>(
      `${API_URLS.HYPERLIQUID_API}/info`,
      { type: "outcomeMeta" },
      // Fast-fail: one 5s attempt. useDataFetching's 15s poll + maxRetries is the
      // only recovery layer — don't stack the inner 4×10s axios retry chain.
      { timeoutMs: 5000, retryOnError: false }
    );
    return {
      outcomes: Array.isArray(res?.outcomes) ? res.outcomes : [],
      questions: Array.isArray(res?.questions) ? res.questions : [],
    };
  }, "fetching HIP-4 outcomeMeta");
}

/** Hyperliquid's template registry (`POST /info { type: "outcomeTemplates" }`):
 * the title and rules formats of markets named `template:<id>`. */
export async function fetchHip4OutcomeTemplates(): Promise<Hip4OutcomeTemplateEntry[]> {
  return withErrorHandling(async () => {
    const res = await postExternal<Hip4OutcomeTemplateEntry[]>(
      `${API_URLS.HYPERLIQUID_API}/info`,
      { type: "outcomeTemplates" },
      { timeoutMs: 5000, retryOnError: false }
    );
    return Array.isArray(res) ? res : [];
  }, "fetching HIP-4 outcomeTemplates");
}

/** Live mid prices for outcome spot coins (`POST /info { type: "allMids" }`),
 * filtered to the `#`-prefixed outcome coins. Value is the implied probability
 * (YES + NO mids sum to 1.0). Only currently-tradeable coins are present. */
export async function fetchHip4AllMids(): Promise<Record<string, string>> {
  return withErrorHandling(async () => {
    const all = await postExternal<Record<string, string>>(
      `${API_URLS.HYPERLIQUID_API}/info`,
      { type: "allMids" },
      { timeoutMs: 5000, retryOnError: false }
    );
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(all ?? {})) {
      if (k.startsWith("#")) out[k] = v;
    }
    return out;
  }, "fetching HIP-4 allMids");
}

/** Cumulative notional volume per outcome side coin (10N, 10N+1), summed by the
 * backend from the indexer's 1d analytics buckets. HypeDexer ingests fills for
 * the live coins even though it omits them from markets-enriched, so this
 * recovers their volume. The backend reads the coin list itself and shares ONE
 * aggregate between all visitors; `partial` is set when a chunk of it failed
 * or a single coin hit the row limit. Throws when the backend has neither a
 * fresh read nor a last copy (the indexer `/analytics` can 402). Volumes are
 * best-effort (the markets render without them), so a failure fails fast:
 * one 8s attempt, no transport retry chain. */
export async function fetchHip4LiveVolumes(): Promise<Hip4OutcomeVolumes> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/live-volumes`, undefined, {
      timeoutMs: 8000,
      retryOnError: false,
    });
    return assertLtData<Hip4OutcomeVolumes>(raw);
  }, "fetching HIP-4 live volumes");
}

/** How the list's markets that no longer trade ended (last traded price and
 * winner per coin), one entry shared by every visitor. A cold backend computes
 * it once (~15 s), hence the longer timeout. */
export async function fetchHip4Resolutions(): Promise<Hip4Resolutions> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/resolutions`, undefined, { timeoutMs: 20000 });
    return assertLtData<Hip4Resolutions>(raw);
  }, "fetching HIP-4 resolutions");
}

/** Live L2 order book for an outcome coin (`POST /info { type:"l2Book" }`).
 * Returns `null` for expired/untradeable coins (Hyperliquid returns no book),
 * so callers degrade to a placeholder. `#NNN` coins aren't on the shared market
 * WS, hence this dedicated REST fetch instead of the streamed OrderBook. */
export async function fetchHip4OrderBook(coin: string): Promise<Hip4L2Book | null> {
  return withErrorHandling(async () => {
    const res = await postExternal<Hip4L2Book | null>(
      `${API_URLS.HYPERLIQUID_API}/info`,
      { type: "l2Book", coin },
      { timeoutMs: 5000, retryOnError: false }
    );
    if (!res || !Array.isArray(res.levels) || res.levels.length < 2) return null;
    return res;
  }, "fetching HIP-4 order book");
}

/** OHLC candles for an outcome coin (`POST /info { type:"candleSnapshot" }`).
 * o/c/h/l are the implied probability (0–1). Returns `[]` for expired coins
 * (no candle feed), so the chart falls back to the fills-reconstructed series. */
export async function fetchHip4OutcomeCandles(
  coin: string,
  interval: Hip4CandleInterval,
  startTime: number,
  endTime?: number
): Promise<Hip4Candle[]> {
  return withErrorHandling(async () => {
    const res = await postExternal<Hip4Candle[]>(
      `${API_URLS.HYPERLIQUID_API}/info`,
      { type: "candleSnapshot", req: { coin, interval, startTime, endTime } },
      { timeoutMs: 5000, retryOnError: false }
    );
    return Array.isArray(res) ? res : [];
  }, "fetching HIP-4 outcome candles");
}

/** Time-bucketed analytics — volume, fills, fees, unique traders.
 * LT backend unwraps HypeDexer's `{ status, count, data: [...] }` envelope
 * server-side, so `data` is already a flat bucket array. */
export async function fetchHip4Analytics(
  params?: Hip4AnalyticsQuery
): Promise<Hip4AnalyticsBucket[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/analytics`, toQuery(params ?? {}));
    return assertLtData<Hip4AnalyticsBucket[]>(raw);
  }, "fetching HIP-4 analytics");
}
