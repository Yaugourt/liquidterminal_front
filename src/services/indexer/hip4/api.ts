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

/** The LT backend validates `coin` as a string of at most 256 chars. */
const ANALYTICS_COIN_PARAM_MAX = 256;
/** Backend max for `limit`, which caps the rows of a request across all its coins. */
const ANALYTICS_ROW_LIMIT = 2000;

/** Splits coin ids into batches whose comma-joined `coin` param fits the backend cap. */
function chunkCoinIds(coinIds: number[]): number[][] {
  const chunks: number[][] = [];
  let current: number[] = [];
  let length = 0;
  for (const id of coinIds) {
    const width = String(id).length;
    // +1 for the comma before every id but the first.
    if (current.length > 0 && length + 1 + width > ANALYTICS_COIN_PARAM_MAX) {
      chunks.push(current);
      current = [];
      length = 0;
    }
    length += (current.length > 0 ? 1 : 0) + width;
    current.push(id);
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

/** Outcome coin id of an analytics bucket (`"#60240"` → 60240), or null. */
function bucketCoinId(b: Hip4AnalyticsBucket): number | null {
  if (!b.coin) return null;
  const id = parseInt(b.coin.replace(/^#/, ""), 10);
  return Number.isNaN(id) ? null : id;
}

/** Daily buckets of one batch of coins. Volumes are best-effort (the markets
 * render without them), so a failure fails fast: one 8s attempt, no transport
 * retry chain; the caller's short failure TTL is the recovery layer. */
async function fetchVolumeBuckets(coins: number[]): Promise<Hip4AnalyticsBucket[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      `${HIP4}/analytics`,
      { coin: coins.join(","), interval: "1d", limit: ANALYTICS_ROW_LIMIT },
      { timeoutMs: 8000, retryOnError: false }
    );
    return assertLtData<Hip4AnalyticsBucket[]>(raw);
  }, "fetching HIP-4 outcome volumes");
}

/** Buckets of a batch, complete unless `partial`. A full page means some
 * buckets were cut off, so the batch is read again as two halves (down to a
 * single coin, whose 2,000 daily buckets cannot fill). A half that fails keeps
 * its coins' rows from the truncated page and flags the result partial. */
async function fetchCompleteVolumeBuckets(
  coins: number[]
): Promise<{ buckets: Hip4AnalyticsBucket[]; partial: boolean }> {
  const buckets = await fetchVolumeBuckets(coins);
  if (buckets.length < ANALYTICS_ROW_LIMIT) return { buckets, partial: false };
  if (coins.length === 1) return { buckets, partial: true };

  const mid = Math.ceil(coins.length / 2);
  const halves = [coins.slice(0, mid), coins.slice(mid)];
  const results = await Promise.allSettled(halves.map(fetchCompleteVolumeBuckets));
  const out: Hip4AnalyticsBucket[] = [];
  let partial = false;
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      out.push(...r.value.buckets);
      partial ||= r.value.partial;
      return;
    }
    partial = true;
    const ids = new Set(halves[i]);
    out.push(...buckets.filter((b) => ids.has(bucketCoinId(b) ?? -1)));
  });
  return { buckets: out, partial };
}

/** Cumulative notional volume per outcome coin, summed from the indexer's 1d
 * analytics buckets. HypeDexer ingests fills for the live coins even though it
 * omits them from markets-enriched, so this recovers their volume. The coin
 * list (~650 coins) is split into ≤256-char batches fetched in parallel, and a
 * batch that hits the row limit is split again. `partial` is set when a batch
 * failed or a single coin hit the row limit; throws only when every batch
 * failed (the indexer `/analytics` can 402). */
export async function fetchHip4OutcomeVolumes(
  coinIds: number[]
): Promise<Hip4OutcomeVolumes> {
  if (coinIds.length === 0) return { volumes: {}, partial: false };
  const results = await Promise.allSettled(
    chunkCoinIds(coinIds).map(fetchCompleteVolumeBuckets)
  );

  const firstFailure = results.find(
    (r): r is PromiseRejectedResult => r.status === "rejected"
  );
  if (firstFailure && results.every((r) => r.status === "rejected")) {
    throw firstFailure.reason;
  }

  const volumes: Record<number, number> = {};
  let partial = firstFailure !== undefined;
  for (const r of results) {
    if (r.status === "rejected") continue;
    partial ||= r.value.partial;
    for (const b of r.value.buckets) {
      const id = bucketCoinId(b);
      if (id == null) continue;
      volumes[id] = (volumes[id] ?? 0) + (b.volume ?? 0);
    }
  }
  return { volumes, partial };
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
