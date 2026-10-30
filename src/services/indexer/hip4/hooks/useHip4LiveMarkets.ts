import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { isFinalError } from "./finalError";
import { acquireHip4Mids, useHip4MidsStore } from "../midsSocket";
import {
  fetchHip4OutcomeMeta,
  fetchHip4AllMids,
  fetchHip4OutcomeTemplates,
  fetchHip4LiveVolumes,
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

// Volumes refresh every 15s. The backend serves every outcome's volume from
// ONE aggregate it reads once for all visitors (15s, last copy kept), so a poll
// is a single request whatever the number of coins and tabs. The module memo
// lives just under the poll: it only dedupes the hook instances of one page.
// A failed read rejects: the hook keeps the volumes on screen and marks them
// stale. A partial read (a chunk failed or came back truncated) is merged
// over the last volumes, coin by coin, keeping the larger total — lifetime
// volume only grows — so a restarted or another backend instance with no
// history of its own never blanks or lowers a figure.
// Outcomes created since the last backend read show no volume until the next
// refresh.
const VOLUME_POLL_MS = 15_000;
const VOLUME_TTL_MS = 12_000;
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
  return { volumes, partial: lastVolumes.partial, updatedAt: fresh.updatedAt };
}

function loadOutcomeVolumes(): Promise<Hip4OutcomeVolumes> {
  if (volumeCache && Date.now() - volumeCache.at < VOLUME_TTL_MS) {
    return volumeCache.pending;
  }
  const pending = fetchHip4LiveVolumes().then((fresh) => {
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

interface MetaSnapshot {
  meta: Awaited<ReturnType<typeof fetchHip4OutcomeMeta>>;
  templates: Hip4TemplateIndex;
}

/** Outcome mids and when they were read (the fetch time, kept across skipped polls). */
interface RestMids {
  mids: Record<string, string>;
  at: number;
}

// outcomeMeta (113 KB) changes only when an outcome is created or settled: a
// minute is enough, and the mids below tell sooner (see META_FORCE_GAP_MS).
const META_POLL_MS = 60_000;
// The socket's frames come every ~5.5 s. REST allMids (25 KB) is the first
// paint and the fallback: its 15 s poll reads the network only when no frame
// arrived for this long, i.e. while the socket is down, paused or silent.
const MIDS_POLL_MS = 15_000;
const SOCKET_FRESH_MS = 12_000;
// A `#` coin in the mids that outcomeMeta does not list is an outcome created
// since the last meta read: read it again at once, but never more than once
// per gap (a coin the meta never lists must not turn into a poll).
const META_FORCE_GAP_MS = 10_000;

/**
 * Fetches the canonical outcomeMeta + the template registry (titles), both
 * from Hyperliquid, so the markets never wait on the indexer: their volumes
 * load on their own, above. The live mids come from the socket (REST first).
 */
async function fetchMetaSnapshot(): Promise<MetaSnapshot> {
  const [meta, templates] = await Promise.all([fetchHip4OutcomeMeta(), loadOutcomeTemplates()]);
  return { meta, templates };
}

/** Outcome ids (not coins) the meta lists. */
function listedOutcomeIds(meta: MetaSnapshot["meta"]): Set<number> {
  const ids = new Set<number>();
  for (const o of meta.outcomes) ids.add(o.outcome);
  return ids;
}

/** `#<10*outcome + side>` coins of `mids` whose outcome the meta does not list. */
function unknownMidCoins(mids: Record<string, string>, listed: Set<number>): string[] {
  const unknown: string[] = [];
  for (const coin of Object.keys(mids)) {
    const encoding = Number(coin.slice(1));
    if (Number.isInteger(encoding) && !listed.has(Math.floor(encoding / 10))) unknown.push(coin);
  }
  return unknown;
}

export function useHip4LiveMarkets(): UseHip4LiveMarketsResult {
  const {
    data: metaData,
    isLoading: metaLoading,
    error: metaError,
    isStale: metaStale,
    refetch: refetchMeta,
  } = useDataFetching<MetaSnapshot>({
    fetchFn: fetchMetaSnapshot,
    refreshInterval: META_POLL_MS,
    maxRetries: 2,
  });

  // The socket exists while this hook is mounted (a shared, ref-counted hold).
  useEffect(() => acquireHip4Mids(), []);
  const socketMids = useHip4MidsStore((s) => s.mids);
  const socketAt = useHip4MidsStore((s) => s.updatedAt);

  // REST allMids: first paint, then fallback. While frames keep coming the
  // poll returns the last read untouched (same object, no state change).
  const lastRestRef = useRef<RestMids | null>(null);
  const fetchRestMids = useCallback(async (): Promise<RestMids> => {
    const last = lastRestRef.current;
    const frameAt = useHip4MidsStore.getState().updatedAt;
    if (last && frameAt != null && Date.now() - frameAt < SOCKET_FRESH_MS) return last;
    const mids = await fetchHip4AllMids();
    const read = { mids, at: Date.now() };
    lastRestRef.current = read;
    return read;
  }, []);
  const {
    data: restData,
    isLoading: restLoading,
    error: restError,
    isStale: restStale,
    refetch: refetchRest,
  } = useDataFetching<RestMids>({
    fetchFn: fetchRestMids,
    refreshInterval: MIDS_POLL_MS,
    maxRetries: 2,
  });

  // Whichever read is newer drives the prices.
  const socketNewer = socketAt != null && (restData == null || socketAt >= restData.at);
  const mids = socketNewer ? socketMids : restData?.mids ?? null;
  const midsAt = socketNewer ? socketAt : restData?.at ?? null;
  // A failed REST read matters only while the socket is not supplying frames.
  const socketRecent = socketAt != null && Date.now() - socketAt < SOCKET_FRESH_MS;

  // An outcome in the mids that the meta does not know: read the meta now.
  const forcedRef = useRef<{ coins: Set<string>; at: number }>({ coins: new Set(), at: 0 });
  useEffect(() => {
    if (!metaData || !mids) return;
    const unknown = unknownMidCoins(mids, listedOutcomeIds(metaData.meta));
    const forced = forcedRef.current;
    if (!unknown.some((coin) => !forced.coins.has(coin))) return;
    // Too soon after the last forced read: the next frame asks again.
    if (Date.now() - forced.at < META_FORCE_GAP_MS) return;
    for (const coin of unknown) forced.coins.add(coin);
    forced.at = Date.now();
    refetchMeta();
  }, [metaData, mids, refetchMeta]);

  // Per-outcome volume, recovered from the indexer's analytics by the backend
  // (best-effort: the markets render with prices meanwhile, and still do if
  // analytics 402s: the last volumes stay, or none on a first failure). Polls
  // read the module cache above, which decides when to hit the network.
  const { data: volumes, error: volumesError } = useDataFetching<Hip4OutcomeVolumes>({
    fetchFn: loadOutcomeVolumes,
    refreshInterval: VOLUME_POLL_MS,
    maxRetries: 0,
  });

  const markets = useMemo<Hip4LiveMarketData | null>(
    () =>
      metaData && mids
        ? buildLiveMarkets(metaData.meta.outcomes, mids, volumes?.volumes, metaData.templates, metaData.meta.questions)
        : null,
    [metaData, mids, volumes]
  );

  const refetch = useCallback(() => {
    refetchMeta();
    refetchRest();
  }, [refetchMeta, refetchRest]);

  // The meta decides what is listed; the mids can come from either source, so
  // their error counts only when nothing supplies them.
  const midsError = mids == null ? restError : null;
  const error = metaError ?? midsError;

  return {
    liveQuestions: markets?.questions ?? EMPTY_QUESTIONS,
    liveMarketsByCoin: markets?.marketsByCoin ?? EMPTY_MARKETS_BY_COIN,
    mids: markets?.mids ?? EMPTY_MIDS,
    // No volumes at all (the first read failed): don't present bare zeros as
    // authoritative. Kept volumes after a failed poll stay as they were.
    volumesPartial: volumes ? volumes.partial : volumesError != null,
    volumesSettled: volumes != null || volumesError != null,
    volumesMissing: volumes == null && volumesError != null,
    isLoading: metaLoading || (mids == null && restLoading),
    isStale: metaStale || (restStale && !socketRecent),
    error,
    failed: isFinalError(error),
    dataUpdatedAt: metaData && midsAt != null ? midsAt : null,
    refetch,
  };
}
