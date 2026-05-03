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
import { ChartSkeleton } from "@/components/common/charts/ChartSkeleton";
import { LoadingState } from "@/components/ui/loading-state";

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

export default function Hip4MarketDetailPage() {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const params = useParams();
  const coin = decodeURIComponent(params.coin as string);

  const [activeCoin, setActiveCoin] = useState(coin);

  const { markets, isLoading } = useHip4MarketsEnriched({ limit: 100 });
  const fillsResult = useHip4Fills({ coin: activeCoin, limit: 50 });

  const market = markets.find((m) => m.coin === coin) ?? null;

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
                    : "bg-white/[0.04] text-text-muted border border-border-subtle hover:bg-white/[0.07]"
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
          <TradingViewChart
            symbol={activeCoin}
            coinId={activeCoin}
          />
        </div>
        <div>
          <OrderBook perpCoinId={activeCoin} />
        </div>
      </div>

      <Hip4RecentFills
        fills={fillsResult.fills}
        isLoading={fillsResult.isLoading}
      />
    </div>
  );
}
