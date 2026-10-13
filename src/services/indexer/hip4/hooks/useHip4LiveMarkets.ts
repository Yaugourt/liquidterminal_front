import { useMemo } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { isFinalError } from "./finalError";
import {
  fetchHip4OutcomeMeta,
  fetchHip4AllMids,
  fetchHip4OutcomeTemplates,
  fetchHip4OutcomeVolumes,
} from "../api";
import { buildLiveMarkets } from "@/lib/hip4/outcome-meta";
import {
  EMPTY_TEMPLATE_INDEX,
  indexOutcomeTemplates,
  type Hip4TemplateIndex,
} from "@/lib/hip4/market-names";
import type {
  Hip4LiveMarketData,
  Hip4MarketEnrichedRow,
  Hip4OutcomeVolumes,
  Hip4QuestionWithOutcomesRow,
  UseHip4LiveMarketsResult,
} from "../types";

// Stable empty fallbacks. Returning a fresh `[]`/`{}` while `data` is undefined
// gives `liveMarketsByCoin` etc. a new identity every render, which cascades
// through the detail page's `useMemo` chain and retriggers its title effect in
// an infinite loop ("Maximum update depth exceeded").
const EMPTY_QUESTIONS: Hip4QuestionWithOutcomesRow[] = [];
const EMPTY_MARKETS_BY_COIN: Record<string, Hip4MarketEnrichedRow> = {};
const EMPTY_MIDS: Record<string, string> = {};

// Volumes refresh every 30s. One read costs ~17 indexer calls (the coin
// filter is capped at 256 chars) whose answers the backend shares between
// visitors (hip4AnalyticsFiltered), so the upstream cost does not grow with
// the audience — but each call counts against the visitor IP's /indexer
// budget on our backend, so a 15s cadence would let a few dozen HIP-4 tabs
// behind one shared IP (office, CGNAT) crowd out every other indexer widget.
// The module memo lives just under the poll: it only dedupes the hook
// instances of one page.
// A failed read rejects: the hook keeps the volumes on screen and marks them
// stale. A partial read (a chunk failed or came back truncated) is merged
// over the last volumes, coin by coin, keeping the larger total — lifetime
// volume only grows — so a flaky chunk never blanks or lowers a figure.
// Outcomes created since the last load show no volume until the next refresh.
const VOLUME_POLL_MS = 30_000;
const VOLUME_TTL_MS = 25_000;
let volumeCache: { at: number; pending: Promise<Hip4OutcomeVolumes> } | null = null;
/** The volumes last returned, and whether a complete read stands behind them. */
let lastVolumes: Hip4OutcomeVolumes | null = null;

function mergePartialVolumes(fresh: Hip4OutcomeVolumes): Hip4OutcomeVolumes {
  if (!fresh.partial || !lastVolumes) return fresh;
  const volumes: Record<number, number> = { ...lastVolumes.volumes };
  for (const [id, volume] of Object.entries(fresh.volumes)) {
    const coin = Number(id);
    volumes[coin] = Math.max(volumes[coin] ?? 0, volume);
  }
  return { volumes, partial: lastVolumes.partial };
}

function loadOutcomeVolumes(encodings: number[]): Promise<Hip4OutcomeVolumes> {
  if (volumeCache && Date.now() - volumeCache.at < VOLUME_TTL_MS) {
    return volumeCache.pending;
  }
  const pending = fetchHip4OutcomeVolumes(encodings).then((fresh) => {
    lastVolumes = mergePartialVolumes(fresh);
    return lastVolumes;
  });
  volumeCache = { at: Date.now(), pending };
  return pending;
}

// The template registry changes when Hyperliquid approves a template: read it
// once an hour, and again after a minute when a read failed or came back empty
// (templated markets then fall back to their structured fields or id).
const TEMPLATES_TTL_MS = 60 * 60_000;
const TEMPLATES_RETRY_MS = 60_000;
let templatesCache: { at: number; ttlMs: number; pending: Promise<Hip4TemplateIndex> } | null = null;

function loadOutcomeTemplates(): Promise<Hip4TemplateIndex> {
  if (templatesCache && Date.now() - templatesCache.at < templatesCache.ttlMs) {
    return templatesCache.pending;
  }
  const entry = { at: Date.now(), ttlMs: TEMPLATES_TTL_MS, pending: Promise.resolve(EMPTY_TEMPLATE_INDEX) };
  entry.pending = fetchHip4OutcomeTemplates()
    .then((templates) => {
      if (templates.length === 0) entry.ttlMs = TEMPLATES_RETRY_MS;
      return indexOutcomeTemplates(templates);
    })
    .catch((err: unknown) => {
      entry.ttlMs = TEMPLATES_RETRY_MS;
      console.warn(
        "[hip4] outcome templates unavailable, templated markets fall back to their ids:",
        err instanceof Error ? err.message : String(err)
      );
      return EMPTY_TEMPLATE_INDEX;
    });
  templatesCache = entry;
  return entry.pending;
}

interface LiveMarketsSnapshot {
  meta: Awaited<ReturnType<typeof fetchHip4OutcomeMeta>>;
  mids: Record<string, string>;
  templates: Hip4TemplateIndex;
}

/**
 * Fetches the canonical live markets that HypeDexer's aggregation tables omit:
 * `outcomeMeta` (metadata) + `allMids` (live implied probabilities) + the
 * template registry (titles). All three come from Hyperliquid, so the markets
 * never wait on the indexer: their volumes load on their own, below.
 */
async function fetchLiveMarketsSnapshot(): Promise<LiveMarketsSnapshot> {
  const [meta, mids, templates] = await Promise.all([
    fetchHip4OutcomeMeta(),
    fetchHip4AllMids(),
    loadOutcomeTemplates(),
  ]);
  return { meta, mids, templates };
}

export function useHip4LiveMarkets(): UseHip4LiveMarketsResult {
  const { data, isLoading, error, dataUpdatedAt, refetch } =
    useDataFetching<LiveMarketsSnapshot>({
      fetchFn: fetchLiveMarketsSnapshot,
      refreshInterval: 15000, // prices are real-time; metadata changes slowly
      maxRetries: 2,
    });

  // Per-outcome volume, recovered from the indexer's analytics (best-effort:
  // the markets render with prices meanwhile, and still do if analytics 402s:
  // the last volumes stay, or none on a first failure). Polls read the module
  // cache above, which decides when to hit the network.
  const encodings = useMemo(
    () => (data?.meta.outcomes ?? []).flatMap((o) => [o.outcome * 10, o.outcome * 10 + 1]),
    [data?.meta.outcomes]
  );
  const encodingsKey = encodings.join(",");
  const { data: volumes, error: volumesError } = useDataFetching<Hip4OutcomeVolumes | null>({
    fetchFn: () => (encodings.length > 0 ? loadOutcomeVolumes(encodings) : Promise.resolve(null)),
    refreshInterval: VOLUME_POLL_MS,
    dependencies: [encodingsKey],
    maxRetries: 0,
  });

  const markets = useMemo<Hip4LiveMarketData | null>(
    () =>
      data
        ? buildLiveMarkets(data.meta.outcomes, data.mids, volumes?.volumes, data.templates, data.meta.questions)
        : null,
    [data, volumes]
  );

  return {
    liveQuestions: markets?.questions ?? EMPTY_QUESTIONS,
    liveMarketsByCoin: markets?.marketsByCoin ?? EMPTY_MARKETS_BY_COIN,
    mids: markets?.mids ?? EMPTY_MIDS,
    // No volumes at all (the first read failed): don't present bare zeros as
    // authoritative. Kept volumes after a failed poll stay as they were.
    volumesPartial: volumes ? volumes.partial : volumesError != null,
    isLoading,
    error,
    failed: isFinalError(error),
    dataUpdatedAt,
    refetch,
  };
}
