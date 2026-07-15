"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { usePageTitle } from "@/store/use-page-title";
import {
  useHip4MarketsEnriched,
  useHip4QuestionsWithOutcomes,
  useHip4Fills,
  useHip4LiveMarkets,
  useHip4ProbabilityHistory,
  useHip4OutcomeCandles,
  type Hip4MarketEnrichedRow,
} from "@/services/indexer/hip4";
import {
  Hip4MarketDetailHeader,
  Hip4DetailKpiRibbon,
  Hip4OutcomeList,
  Hip4RulesCard,
  Hip4OrderBook,
  Hip4PositioningBar,
  Hip4TopTraders,
  Hip4RelatedMarkets,
  Hip4RecentFills,
} from "@/components/market/hip4";
import { OrderBook } from "@/components/market/token";
import { ChartSkeleton } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { LoadingState } from "@/components/ui/loading-state";
import { Card } from "@/components/ui/card";
import { effectiveStatus, isPlaceholderMarketName, isYesNoSides } from "@/lib/hip4/market-formatter";
import { rawOutcomeId } from "@/lib/hip4/outcome-meta";
import { buildMergedQuestions, findMergedQuestionByCoin } from "@/lib/hip4/merge-questions";
import { resolveHip4Layout, type Hip4ChartMode } from "@/lib/hip4/detail-layout";
import { buildTradeFlow } from "@/lib/hip4/trade-flow";
import type { ProbSeriesDef } from "@/lib/hip4/probability-series";
import type { Timeframe } from "@/lib/timeframe";
import type { Hip4CandleInterval } from "@/services/indexer/hip4";

const TF_OPTIONS: Timeframe[] = ["24h", "7d", "30d"];

/** Map a timeframe pill to a candle interval + lookback window (ms from now). */
function candleWindow(tf: Timeframe): { interval: Hip4CandleInterval; lookbackMs: number } {
  switch (tf) {
    case "7d":
      return { interval: "1h", lookbackMs: 7 * 86_400_000 };
    case "30d":
      return { interval: "4h", lookbackMs: 30 * 86_400_000 };
    default:
      return { interval: "15m", lookbackMs: 86_400_000 };
  }
}

// Charts are heavy (Lightweight-Charts / Recharts) and mutually exclusive per
// market type — code-split both so a price-binary page never ships Recharts and
// an odds page never ships Lightweight-Charts.
const TradingViewChart = dynamic(
  () =>
    import("@/components/market/token/TradingViewChart").then((m) => ({
      default: m.TradingViewChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const Hip4ProbabilityChart = dynamic(
  () =>
    import("@/components/market/hip4/Hip4ProbabilityChart").then((m) => ({
      default: m.Hip4ProbabilityChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function parseCoinOutcomeId(coin: string): number | null {
  const m = coin.match(/^#(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

/** HIP-4 outcome coins (`#NNN`) aren't on the shared market WS that powers the
 * spot/perp OrderBook + TradingView candle feed, so those components can't
 * resolve them. P1 swaps the placeholder for a REST-polled `l2Book`. */
function isHip4OutcomeCoin(coin: string): boolean {
  return /^#\d+$/.test(coin);
}

export default function Hip4MarketDetailPage() {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const params = useParams();
  const coin = decodeURIComponent(params.coin as string);

  const [activeCoin, setActiveCoin] = useState(coin);
  const [timeframe, setTimeframe] = useState<Timeframe>("24h");
  // Chart view for price-binary markets (underlying candle vs implied odds).
  const [chartMode, setChartMode] = useState<Hip4ChartMode>("underlying");

  // Reset per-market UI state whenever the URL coin changes.
  useEffect(() => {
    setActiveCoin(coin);
    setChartMode("underlying");
  }, [coin]);

  const { markets, isLoading } = useHip4MarketsEnriched();
  const questions = useHip4QuestionsWithOutcomes({ limit: 200 });
  // Live markets HypeDexer's enriched table omits (Fed/NBA/CPI/recurring BTC)
  // resolve from Hyperliquid's outcomeMeta + allMids so deep links don't bounce.
  const live = useHip4LiveMarkets();
  // Higher limit so the same feed powers recent fills AND the derived trade-flow
  // / top-traders aggregates (one fetch, three views — no extra network).
  const fillsResult = useHip4Fills({ coin: activeCoin, limit: 400 });

  const allMarkets = useMemo(
    () => [...markets, ...Object.values(live.liveMarketsByCoin)],
    [markets, live.liveMarketsByCoin]
  );

  // Resolve the market for the URL coin. Prices + side come from the live
  // (encoded) coin; richer metadata (underlying, class, target_price) for
  // grouped questions lives only on HypeDexer's raw-outcome enriched row, so we
  // join the two (see merge-questions / outcome-meta for the encoding rules).
  const market = useMemo<Hip4MarketEnrichedRow | null>(() => {
    const liveMarket = live.liveMarketsByCoin[coin] ?? null;
    if (!liveMarket) {
      const fallback = markets.find((m) => m.coin === coin) ?? null;
      // HypeDexer mislabels NBA/Fed raw rows as BTC priceBucket — strip the
      // price metadata unless the row's own sides are genuinely Yes/No.
      if (fallback && !isYesNoSides((fallback.parsed_sides ?? []).map((s) => s.name))) {
        return { ...fallback, underlying: null, target_price: null };
      }
      return fallback;
    }
    const encId = parseCoinOutcomeId(coin);
    const enrichedRaw =
      encId != null ? markets.find((m) => m.coin === `#${rawOutcomeId(encId)}`) ?? null : null;

    const sidesYesNo = isYesNoSides((liveMarket.parsed_sides ?? []).map((s) => s.name));
    const enriched = sidesYesNo ? enrichedRaw : null;

    const cls = liveMarket.class ?? enriched?.class ?? null;
    const isPriceBinary = cls === "priceBinary";
    return {
      ...liveMarket,
      class: cls,
      underlying: liveMarket.underlying ?? enriched?.underlying ?? null,
      target_price: liveMarket.target_price ?? enriched?.target_price ?? null,
      display_name: isPriceBinary
        ? liveMarket.display_name
        : enriched?.display_name || liveMarket.display_name,
    };
  }, [coin, markets, live.liveMarketsByCoin]);

  // Merge HypeDexer questions with the canonical live markets once, then reuse
  // the same list for the parent-question lookup AND the related-markets rail.
  const mergedQuestions = useMemo(
    () =>
      buildMergedQuestions(questions.questions, {
        liveQuestions: live.liveQuestions,
        mids: live.mids,
        liveMarketsByCoin: live.liveMarketsByCoin,
      }),
    [questions.questions, live.liveQuestions, live.mids, live.liveMarketsByCoin]
  );

  // The parent question of the active coin (CPI/buckets group several outcomes;
  // NBA/Fed are a single two-sided outcome). Drives the outcomes list + chart.
  const parentQuestion = useMemo(
    () => findMergedQuestionByCoin(mergedQuestions, coin),
    [mergedQuestions, coin]
  );

  // The single source for "how does this market type render".
  const layout = useMemo(
    () => resolveHip4Layout({ question: parentQuestion, market }),
    [parentQuestion, market]
  );

  // One probability series per outcome (the YES side coin).
  const seriesDefs = useMemo<ProbSeriesDef[]>(() => {
    if (!parentQuestion) return [];
    return parentQuestion.outcomes
      .map((o) => ({ coin: o.coin ?? `#${o.outcome_id}`, label: o.display_name }))
      .filter((d) => /^#\d+$/.test(d.coin));
  }, [parentQuestion]);

  // Price-binary can show EITHER the underlying candle + strike OR the implied
  // odds (toggle); everything else only has the universal odds chart.
  const canToggleChart = layout.hasUnderlyingChart && !!market?.underlying;
  const showUnderlyingChart = canToggleChart && chartMode === "underlying";
  const chartCoins = useMemo(
    () => (showUnderlyingChart ? [] : seriesDefs.map((d) => d.coin)),
    [showUnderlyingChart, seriesDefs]
  );

  const detailStatus = useMemo(
    () =>
      parentQuestion
        ? effectiveStatus(parentQuestion)
        : market
        ? effectiveStatus({
            status: market.is_settled ? "settled" : "live",
            expiry: market.expiry,
          })
        : "live",
    [parentQuestion, market]
  );

  // LIVE coins → clean candle source; EXPIRED coins → fills reconstruction. The
  // two are mutually exclusive so the same series is never double-fetched.
  const { interval, lookbackMs } = useMemo(() => candleWindow(timeframe), [timeframe]);
  const candleStart = useMemo(() => Date.now() - lookbackMs, [lookbackMs]);
  const candleEnabled = !showUnderlyingChart && detailStatus === "live" && chartCoins.length > 0;
  const candles = useHip4OutcomeCandles(
    candleEnabled ? chartCoins : [],
    interval,
    candleStart,
    candleEnabled
  );
  const probability = useHip4ProbabilityHistory(candleEnabled ? [] : chartCoins);

  // Selected outcome (for the KPI headline % + active-row highlight).
  const { activeOutcome, activeIndex } = useMemo(() => {
    const outs = parentQuestion?.outcomes ?? [];
    const idx = outs.findIndex((o) => (o.coin ?? `#${o.outcome_id}`) === activeCoin);
    return { activeOutcome: idx >= 0 ? outs[idx] : null, activeIndex: idx };
  }, [parentQuestion, activeCoin]);

  const marketIndex = useMemo(() => {
    const idx: Record<string, { name: string; sideName: string | null; isBinary: boolean }> = {};
    for (const m of allMarkets) {
      if (!m.coin) continue;
      const isBinary = (m.parsed_sides?.length ?? 0) === 2;
      idx[m.coin] = {
        name: m.short_name || m.display_name,
        sideName:
          m.side_name ??
          (isBinary && m.side != null ? m.parsed_sides?.[m.side]?.name ?? null : null),
        isBinary,
      };
    }
    return idx;
  }, [allMarkets]);

  // Observed trade flow + top traders for the selected outcome, derived from the
  // fills feed already fetched above (no extra network).
  const tradeFlow = useMemo(() => buildTradeFlow(fillsResult.fills), [fillsResult.fills]);

  useEffect(() => {
    if (market) setTitle(`${parentQuestion?.title || market.display_name} — HIP-4`);
  }, [setTitle, market, parentQuestion]);

  // Live-only coins resolve only from the live hook, so wait for it to *settle*
  // (succeed or hard-fail) before deciding the market is missing.
  const liveSettled = live.dataUpdatedAt !== null || (!live.isLoading && !!live.error);

  if ((isLoading || live.isLoading || !liveSettled) && !market) {
    return <LoadingState message="Loading market…" withCard />;
  }

  if (!isLoading && liveSettled && !market) {
    if (live.error) {
      return (
        <Card className="flex h-[320px] flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-[13px] font-semibold text-text-secondary">Couldn&apos;t load this market</p>
          <p className="max-w-sm text-[11.5px] text-text-tertiary">
            The prediction-market feed is temporarily unavailable. Retry, or head back to all markets.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => live.refetch()}
              className="rounded-md border border-border-default bg-surface-2 px-3 py-1.5 text-[11px] font-semibold text-text-primary transition-colors hover:bg-surface-3"
            >
              Retry
            </button>
            <Link
              href="/market/hip4"
              className="rounded-md border border-border-subtle px-3 py-1.5 text-[11px] font-semibold text-text-tertiary transition-colors hover:text-text-secondary"
            >
              All markets
            </Link>
          </div>
        </Card>
      );
    }
    router.replace("/market/hip4");
    return null;
  }

  return (
    <div className="space-y-5">
      {market && (
        <>
          <Hip4MarketDetailHeader
            market={market}
            // Placeholder names fall through to formatMarketTitle (ticker fallback).
            title={
              parentQuestion?.title && !isPlaceholderMarketName(parentQuestion.title)
                ? parentQuestion.title
                : undefined
            }
            typeLabel={layout.typeLabel}
            status={detailStatus}
          />
          <Hip4DetailKpiRibbon
            question={parentQuestion}
            market={market}
            layout={layout}
            activeOutcome={activeOutcome}
            activeIndex={activeIndex}
          />
        </>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Left rail — outcomes + resolution rules */}
        <div className="space-y-4">
          <Hip4OutcomeList
            question={parentQuestion}
            layout={layout}
            activeCoin={activeCoin}
            onSelectCoin={setActiveCoin}
          />
          {market && <Hip4RulesCard market={market} layout={layout} />}
        </div>

        {/* Main — chart + order book */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex flex-col gap-2">
            {canToggleChart && (
              <div className="flex justify-end">
                <PillTabs
                  tabs={[
                    { value: "underlying", label: `${market!.underlying} Price` },
                    { value: "probability", label: "Odds" },
                  ]}
                  activeTab={chartMode}
                  onTabChange={(v) => setChartMode(v as Hip4ChartMode)}
                />
              </div>
            )}
            <div className="min-h-[480px]">
            {showUnderlyingChart ? (
              <TradingViewChart
                symbol={market!.underlying!}
                coinId={market!.underlying!}
                overlayStrikePrice={market!.target_price ?? undefined}
              />
            ) : !isHip4OutcomeCoin(activeCoin) ? (
              <TradingViewChart
                symbol={activeCoin}
                coinId={activeCoin}
                overlayPerpCoinId={market?.underlying ?? undefined}
                overlayStrikePrice={market?.target_price ?? undefined}
              />
            ) : seriesDefs.length > 0 ? (
              <Hip4ProbabilityChart
                title={
                  [parentQuestion?.title, market?.display_name].find(
                    (n) => n && !isPlaceholderMarketName(n)
                  ) ?? "Implied probability"
                }
                defs={seriesDefs}
                fillsByCoin={probability.fillsByCoin}
                candlesByCoin={candles.candlesByCoin}
                isLoading={candleEnabled ? candles.isLoading : probability.isLoading}
                error={candleEnabled ? candles.error : probability.error}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                timeframeOptions={TF_OPTIONS}
              />
            ) : (
              <Card className="flex h-[480px] items-center justify-center p-6 text-center">
                <div className="space-y-2 text-text-tertiary">
                  <p className="text-[13px] font-semibold text-text-secondary">Chart unavailable</p>
                  <p className="max-w-sm text-[11.5px]">
                    This market has no trade history yet to plot an odds curve.
                  </p>
                </div>
              </Card>
            )}
            </div>
          </div>

          <div>
            {isHip4OutcomeCoin(activeCoin) ? (
              <Hip4OrderBook
                coin={activeCoin}
                sideName={activeOutcome?.display_name ?? null}
                enabled={detailStatus === "live"}
              />
            ) : (
              <OrderBook perpCoinId={activeCoin} />
            )}
          </div>
        </div>
      </div>

      {/* Trade flow + top traders for the selected outcome (observed fills) */}
      {isHip4OutcomeCoin(activeCoin) && (
        <Hip4PositioningBar
          flow={tradeFlow}
          outcomeLabel={activeOutcome?.display_name ?? undefined}
          isLoading={fillsResult.isLoading}
        />
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {isHip4OutcomeCoin(activeCoin) && (
          <Hip4TopTraders
            traders={tradeFlow.traders}
            totalVolume={tradeFlow.volume}
            outcomeLabel={activeOutcome?.display_name ?? undefined}
            isLoading={fillsResult.isLoading}
          />
        )}
        <Hip4RecentFills
          fills={fillsResult.fills}
          isLoading={fillsResult.isLoading}
          marketIndex={marketIndex}
        />
      </div>

      <Hip4RelatedMarkets questions={mergedQuestions} current={parentQuestion} />
    </div>
  );
}
