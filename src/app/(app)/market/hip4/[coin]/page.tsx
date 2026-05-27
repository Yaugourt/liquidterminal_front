"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { usePageTitle } from "@/store/use-page-title";
import {
  useHip4MarketsEnriched,
  useHip4Fills,
} from "@/services/indexer/hip4";
import { Hip4MarketDetailHeader } from "@/components/market/hip4/Hip4MarketDetailHeader";
import { Hip4RecentFills } from "@/components/market/hip4";
import { OrderBook } from "@/components/market/token";
import { ChartSkeleton } from "@/components/common";
import { LoadingState } from "@/components/ui/loading-state";
import { Card } from "@/components/ui/card";

const TradingViewChart = dynamic(
  () =>
    import("@/components/market/token/TradingViewChart").then((m) => ({
      default: m.TradingViewChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function parseCoinOutcomeId(coin: string): number | null {
  const m = coin.match(/^#(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

/** TradingView/OrderBook expect spot (`@N`) or perp (`BTC`) symbols. HIP-4
 * outcome coins (`#NNN`) don't exist in the global WS feed — render placeholders
 * for those instead of silently subscribing to a coin the singleton can't
 * resolve. Once a HIP-4-specific market data source ships, swap these. */
function isHip4OutcomeCoin(coin: string): boolean {
  return /^#\d+$/.test(coin);
}

export default function Hip4MarketDetailPage() {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const params = useParams();
  const coin = decodeURIComponent(params.coin as string);

  const [activeCoin, setActiveCoin] = useState(coin);

  // Reset side-tab selection whenever the URL coin changes so navigating
  // between markets doesn't keep showing the previous market's Yes/No fills.
  useEffect(() => {
    setActiveCoin(coin);
  }, [coin]);

  // Fetch the full enriched list (back caches the result under a single Redis
  // key, so this hits the same cache as `/market/hip4`). Previous `{ limit: 100 }`
  // capped the lookup and 404'd any deep link to a market beyond rank 100.
  const { markets, isLoading } = useHip4MarketsEnriched();
  const fillsResult = useHip4Fills({ coin: activeCoin, limit: 50 });

  const market = markets.find((m) => m.coin === coin) ?? null;

  const marketIndex = useMemo(() => {
    const idx: Record<string, { name: string; sideName: string | null; isBinary: boolean }> = {};
    for (const m of markets) {
      if (!m.coin) continue;
      const isBinary = (m.parsed_sides?.length ?? 0) === 2;
      idx[m.coin] = {
        name: m.short_name || m.display_name,
        sideName: m.side_name ?? (isBinary && m.side != null ? m.parsed_sides?.[m.side]?.name ?? null : null),
        isBinary,
      };
    }
    return idx;
  }, [markets]);

  // Find YES/NO sibling coins from the same binary market
  const outcomeTabs = useMemo(() => {
    const outcomeId = parseCoinOutcomeId(coin);
    if (outcomeId === null || outcomeId < 10) return null;

    const sideIdx = outcomeId % 10;
    if (sideIdx > 1) return null; // not a binary pair

    const baseId = Math.floor(outcomeId / 10);
    const yesCoin = `#${baseId * 10}`;
    const noCoin = `#${baseId * 10 + 1}`;

    const yesMarket = markets.find((m) => m.coin === yesCoin);
    const noMarket = markets.find((m) => m.coin === noCoin);

    if (!yesMarket && !noMarket) return null;

    return [
      { label: "Yes", coin: yesCoin, exists: !!yesMarket },
      { label: "No", coin: noCoin, exists: !!noMarket },
    ];
  }, [coin, markets]);

  useEffect(() => {
    if (market) setTitle(`${market.display_name} — HIP-4`);
  }, [setTitle, market]);

  if (isLoading && !market) {
    return <LoadingState message="Loading market…" withCard />;
  }

  if (!isLoading && !market) {
    router.replace("/market/hip4");
    return null;
  }

  return (
    <div className="space-y-6">
      {market && <Hip4MarketDetailHeader market={market} />}

      {outcomeTabs && (
        <div className="flex items-center gap-2">
          {outcomeTabs.map((tab) => {
            const isActive = activeCoin === tab.coin;
            const isYes = tab.label === "Yes";
            return (
              <button
                key={tab.coin}
                disabled={!tab.exists}
                onClick={() => setActiveCoin(tab.coin)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? isYes
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    : "bg-white/[0.04] text-text-tertiary border border-border-subtle hover:bg-white/[0.07]"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        <div className="min-h-[480px]">
          {isHip4OutcomeCoin(activeCoin) && market?.underlying ? (
            <TradingViewChart
              symbol={market.underlying}
              coinId={market.underlying}
              overlayStrikePrice={market.target_price ?? undefined}
            />
          ) : isHip4OutcomeCoin(activeCoin) ? (
            <Card className="flex h-[480px] items-center justify-center p-6 text-center">
              <div className="space-y-2 text-text-tertiary">
                <p className="text-[13px] font-semibold text-text-secondary">
                  Chart unavailable
                </p>
                <p className="text-[11.5px] max-w-sm">
                  HIP-4 outcome coins (#{parseCoinOutcomeId(activeCoin)}) don&apos;t expose
                  candlestick data through the shared market feed. Underlying asset chart
                  will appear here when the market exposes one.
                </p>
              </div>
            </Card>
          ) : (
            <TradingViewChart
              symbol={activeCoin}
              coinId={activeCoin}
              overlayPerpCoinId={market?.underlying ?? undefined}
              overlayStrikePrice={market?.target_price ?? undefined}
            />
          )}
        </div>
        <div>
          {isHip4OutcomeCoin(activeCoin) ? (
            <Card className="flex h-full min-h-[480px] items-center justify-center p-6 text-center">
              <div className="space-y-2 text-text-tertiary">
                <p className="text-[13px] font-semibold text-text-secondary">
                  Orderbook unavailable
                </p>
                <p className="text-[11.5px] max-w-sm">
                  HIP-4 outcome books aren&apos;t streamed through the shared market WS.
                  See recent fills below for the latest liquidity activity.
                </p>
              </div>
            </Card>
          ) : (
            <OrderBook perpCoinId={activeCoin} />
          )}
        </div>
      </div>

      <Hip4RecentFills
        fills={fillsResult.fills}
        isLoading={fillsResult.isLoading}
        marketIndex={marketIndex}
      />
    </div>
  );
}
