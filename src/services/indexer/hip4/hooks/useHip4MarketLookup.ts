import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4MarketsEnriched, fetchHip4QuestionsWithOutcomes } from "../api";
import { sideCoinsQuestion, withYesCoins } from "@/lib/hip4/merge-questions";
import type { Hip4MarketLookup, UseHip4MarketLookupResult } from "../types";

/**
 * The market behind a coin, looked up by id (`#60240` → outcome 6024, Yes
 * side), and the question to show it with: its indexer question, or its own
 * two sides. Always answers for the coin asked, `market: null` when unknown.
 */
async function fetchHip4MarketLookup(coin: string): Promise<Hip4MarketLookup> {
  const m = coin.match(/^#(\d+)$/);
  if (!m) return { coin, market: null, question: null };
  const id = parseInt(m[1], 10);
  // A backend without the `outcome_id` filter answers its default list: only
  // the row for this id counts.
  const market = (await fetchHip4MarketsEnriched({ outcome_id: id })).find((r) => r.outcome_id === id);
  if (!market) return { coin, market: null, question: null };
  if (market.question_id == null) return { coin, market, question: sideCoinsQuestion(market) };
  const [question] = await fetchHip4QuestionsWithOutcomes({ question_id: market.question_id });
  return {
    coin,
    market,
    question: question?.outcomes.length ? withYesCoins(question) : sideCoinsQuestion(market),
  };
}

/**
 * Deep links to a market outside the live list (settled, expired, or older than
 * the indexer lists): the detail page looks it up instead of bouncing to the
 * list. Fetched once per coin — such a market no longer trades.
 */
export function useHip4MarketLookup(coin: string, enabled: boolean): UseHip4MarketLookupResult {
  const { data, isLoading, error, refetch } = useDataFetching<Hip4MarketLookup | null>({
    fetchFn: () => (enabled ? fetchHip4MarketLookup(coin) : Promise.resolve(null)),
    refreshInterval: 0,
    dependencies: [coin, enabled],
    maxRetries: 2,
  });

  // `data` outlives a coin change until the next answer lands: only an answer
  // for this coin counts as resolved.
  const current = enabled && data?.coin === coin ? data : null;
  return {
    market: current?.market ?? null,
    question: current?.question ?? null,
    resolved: current != null,
    isLoading: enabled && isLoading,
    error: enabled ? error : null,
    refetch,
  };
}
