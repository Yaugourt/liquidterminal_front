import { useDataFetching } from "@/hooks/useDataFetching";
import {
  fetchHip4OutcomeMeta,
  fetchHip4AllMids,
  fetchHip4OutcomeVolumes,
} from "../api";
import { buildLiveMarkets } from "@/lib/hip4/outcome-meta";
import type {
  Hip4LiveMarkets,
  Hip4MarketEnrichedRow,
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

/**
 * Fetches the canonical live markets that HypeDexer's aggregation tables omit:
 * `outcomeMeta` (metadata) + `allMids` (live implied probabilities), then
 * recovers per-outcome volume from the indexer's analytics (best-effort — the
 * markets still render with prices if analytics 402s).
 */
async function fetchHip4LiveMarkets(): Promise<Hip4LiveMarkets> {
  const [meta, mids] = await Promise.all([
    fetchHip4OutcomeMeta(),
    fetchHip4AllMids(),
  ]);

  const encodings = meta.flatMap((o) => [o.outcome * 10, o.outcome * 10 + 1]);
  let volByEncoding: Record<number, number> = {};
  let volumesUnavailable = false;
  try {
    volByEncoding = (await fetchHip4OutcomeVolumes(encodings)) ?? {};
  } catch (err) {
    // Analytics can 402 (indexer instability). Degrade to no volume rather than
    // dropping the markets, but surface it so the UI doesn't present a bare 0 as
    // authoritative.
    volumesUnavailable = true;
    console.warn(
      "[hip4] live-market volumes unavailable, showing partial totals:",
      err instanceof Error ? err.message : String(err)
    );
  }

  return { ...buildLiveMarkets(meta, mids, volByEncoding), volumesUnavailable };
}

export function useHip4LiveMarkets(): UseHip4LiveMarketsResult {
  const { data, isLoading, error, dataUpdatedAt, refetch } =
    useDataFetching<Hip4LiveMarkets>({
      fetchFn: fetchHip4LiveMarkets,
      refreshInterval: 15000, // prices are real-time; metadata changes slowly
      maxRetries: 2,
    });

  return {
    liveQuestions: data?.questions ?? EMPTY_QUESTIONS,
    liveMarketsByCoin: data?.marketsByCoin ?? EMPTY_MARKETS_BY_COIN,
    mids: data?.mids ?? EMPTY_MIDS,
    volumesUnavailable: data?.volumesUnavailable ?? false,
    isLoading,
    error,
    dataUpdatedAt,
    refetch,
  };
}
