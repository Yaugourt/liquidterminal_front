"use client";

import { useEffect } from "react";
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

export default function Hip4MarketDetailPage() {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const params = useParams();
  const coin = decodeURIComponent(params.coin as string);

  const { markets, isLoading } = useHip4MarketsEnriched({ limit: 100 });
  const fillsResult = useHip4Fills({ coin, limit: 50 });

  const market = markets.find((m) => m.coin === coin) ?? null;

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

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        <div className="min-h-[480px]">
          <TradingViewChart
            symbol={coin}
            coinId={coin}
          />
        </div>
        <div>
          <OrderBook perpCoinId={coin} />
        </div>
      </div>

      <Hip4RecentFills
        fills={fillsResult.fills}
        isLoading={fillsResult.isLoading}
      />
    </div>
  );
}
