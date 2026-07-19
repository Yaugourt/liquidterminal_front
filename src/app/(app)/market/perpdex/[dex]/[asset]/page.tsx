"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { ChartSkeleton } from "@/components/common";
import { TradingLayout } from "@/layouts/TradingLayout";
import { OrderBook } from "@/components/market/token";
import {
  Hip3AssetHeader,
  Hip3AssetKpiRibbon,
  Hip3SiblingMarkets,
  Hip3StatusBanner,
  Hip3VenueCard,
} from "@/components/market/hip3";
import { useHip3AssetView } from "@/services/market/hip3";
import { usePageTitle } from "@/store/use-page-title";

// lightweight-charts needs the DOM — same treatment as the spot/perp pages.
const TradingViewChart = dynamic(
  () =>
    import("@/components/market/token/TradingViewChart").then((mod) => ({
      default: mod.TradingViewChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export default function Hip3AssetPage() {
  const params = useParams();
  const dexParam = decodeURIComponent((params?.dex as string) ?? "");
  const assetParam = decodeURIComponent((params?.asset as string) ?? "");

  const view = useHip3AssetView(dexParam, assetParam);
  const { asset, venue, status, isLoading, error, notFound, coin, ticker, dexId } = view;

  const { setTitle } = usePageTitle();
  useEffect(() => {
    setTitle(`${ticker} · HIP-3`);
  }, [setTitle, ticker]);

  if (isLoading && !asset) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingState message="Loading market..." size="sm" withCard={false} />
      </div>
    );
  }

  if (error || notFound) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="p-6 flex flex-col items-center justify-center gap-4">
          <div className="text-xl font-bold text-text-primary">Market not found</div>
          <p className="text-sm text-text-secondary text-center max-w-sm">
            {coin} is not listed on Hyperliquid. It may have been delisted, or the venue id may be
            wrong.
          </p>
          <Button asChild className="bg-brand hover:bg-brand/90 text-brand-text-on font-bold">
            <Link href={`/market/perpdex/${dexId}`}>Back to venue</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!asset) return null;

  const venueName = venue?.fullName || venue?.name || dexId.toUpperCase();
  const isLive = status === "live";

  const venueCard = (
    <Hip3VenueCard
      venue={venue}
      oracleUpdater={view.oracleUpdater}
      liveCount={view.liveCount}
      totalCount={view.totalCount}
    />
  );

  // A venue whose markets are all delisted has no siblings to show. Keeping the
  // two-column grid there would strand the venue card next to an empty half.
  const bottomSection = view.siblings.length ? (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
      <div className="min-w-0">
        <Hip3SiblingMarkets siblings={view.siblings} dexId={dexId} venueName={venueName} />
      </div>
      {venueCard}
    </div>
  ) : (
    <div className="max-w-md">{venueCard}</div>
  );

  const headerBlock = (
    <div className="space-y-4">
      <Hip3StatusBanner status={status} venueName={venueName} />
      <Hip3AssetHeader view={view} />
      <Hip3AssetKpiRibbon view={view} />
    </div>
  );

  // A delisted market has no candles (`candleSnapshot` returns []) and no WS
  // traffic. Rendering an empty chart and an empty book would read as a loading
  // failure — the page degrades to an archive card instead.
  if (!isLive) {
    return (
      <div className="space-y-4">
        {headerBlock}
        <Card className="px-4 py-10 grid place-items-center">
          <div className="text-center space-y-1.5">
            <div className="text-[13px] text-text-secondary">Chart unavailable</div>
            <div className="text-[11.5px] text-text-tertiary">
              No candle history for a market that is no longer trading.
            </div>
          </div>
        </Card>
        {bottomSection}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TradingLayout
        marketType="hip3"
        tokenName={coin}
        tokenInfoSlot={headerBlock}
        chartSlot={
          <TradingViewChart
            symbol={coin}
            coinId={coin}
            tokenName={ticker}
            className="flex-1 min-h-[450px]"
          />
        }
        orderBookSlot={<OrderBook symbol={coin} perpCoinId={coin} tokenNameProp={ticker} />}
        bottomSectionSlot={bottomSection}
      />
    </div>
  );
}
