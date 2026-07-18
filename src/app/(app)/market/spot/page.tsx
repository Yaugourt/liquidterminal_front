"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { PageHeader, PageFaq } from "@/components/common";
import { SectionHead } from "@/components/dashboard/SectionHead";
import {
  SpotKpiStrip,
  SpotMarketShape,
  SpotAuctionBand,
  SpotDirectoryTable,
  SpotLeaderboards,
} from "@/components/market/spot";
import { useSpotDirectory } from "@/services/market/spot/hooks/useSpotDirectory";
import { useSpotStablecoins } from "@/services/market/stablecoins/hooks/useSpotStablecoins";
import { useFeesHistory } from "@/services/market/fees/hooks/useFeesHistory";
import { useTokenCandles } from "@/services/market/token/hooks/useTokenCandles";
import { SPOT_FAQ } from "@/lib/page-faqs";

const NINETY_DAYS_MS = 90 * 86_400_000;

/**
 * /market/spot — composed on the main-dashboard page-type (like /explorer/vaults):
 * PageHeader → SectionHead'd sections → primitive cards. The page owns the
 * shared data hooks (directory, stablecoins, fee history, HYPE candles) and
 * passes them down so no series is fetched twice.
 */
export default function SpotPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Spot Market");
  }, [setTitle]);

  const directory = useSpotDirectory();
  const stables = useSpotStablecoins();
  const feesHistory = useFeesHistory();

  // Stable across renders — an inline Date.now() would retrigger the fetch.
  const [candleStart] = useState(() => Date.now() - NINETY_DAYS_MS);
  const { candles: hypeCandles, isLoading: hypeCandlesLoading } = useTokenCandles({
    coin: directory.hype ? `@${directory.hype.marketIndex}` : null,
    interval: "1d",
    startTime: candleStart,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Spot"
        titleQualifier="market on Hyperliquid"
        description="Hyperliquid spot markets — volume, stablecoin liquidity, fees & deploy auctions."
      />

      <section className="space-y-2.5">
        <SectionHead
          title="Overview"
          subtitle="volume, fees, stablecoin depth & HIP-2 across Hyperliquid spot"
        />
        <SpotKpiStrip
          directory={directory}
          stables={stables}
          feesHistory={feesHistory}
          hypeCandles={hypeCandles}
        />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Market shape"
          subtitle="stablecoin depth · volume concentration · fee take · HYPE — real series only"
        />
        <SpotMarketShape
          directory={directory}
          stables={stables}
          feesHistory={feesHistory}
          hypeCandles={hypeCandles}
          hypeCandlesLoading={hypeCandlesLoading}
        />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Deploy auctions"
          subtitle="HIP-1 dutch auction — live state, gas history & recent deploys"
          linkLabel="Auction history →"
          linkHref="/market/spot/auction"
        />
        <SpotAuctionBand />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="All tokens"
          subtitle="Directory + movers · price, 24h change, volume & market cap"
        />
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start">
          <SpotDirectoryTable directory={directory} />
          <SpotLeaderboards directory={directory} stables={stables} />
        </div>
      </section>
      <PageFaq items={SPOT_FAQ} />
    </div>
  );
}
