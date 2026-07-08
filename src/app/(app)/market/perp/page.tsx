"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { PageHeader } from "@/components/common";
import { SectionHead } from "@/components/dashboard/SectionHead";
import {
  PerpKpiStrip,
  PerpMarketShape,
  PerpAuctionBand,
  PerpDirectoryTable,
  PerpLeaderboards,
} from "@/components/market/perp";
import { usePerpDirectory } from "@/services/market/perp/hooks/usePerpDirectory";
import { useFeesHistory } from "@/services/market/fees/hooks/useFeesHistory";
import { useTokenCandles } from "@/services/market/token/hooks/useTokenCandles";

const ONE_YEAR_MS = 365 * 86_400_000;

/**
 * /market/perp — composed on the main-dashboard page-type (like /market/spot):
 * PageHeader → SectionHead'd sections → primitive cards. The page owns the
 * shared data hooks (directory, fee history, BTC/ETH candles) and passes them
 * down so no series is fetched twice.
 */
export default function PerpPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Perpetuals");
  }, [setTitle]);

  const directory = usePerpDirectory();
  const feesHistory = useFeesHistory();

  // Stable across renders — an inline Date.now() would retrigger the fetch.
  const [candleStart] = useState(() => Date.now() - ONE_YEAR_MS);
  const { candles: btcCandles, isLoading: btcLoading } = useTokenCandles({
    coin: "BTC",
    interval: "1d",
    startTime: candleStart,
  });
  const { candles: ethCandles, isLoading: ethLoading } = useTokenCandles({
    coin: "ETH",
    interval: "1d",
    startTime: candleStart,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Perpetuals"
        description="HyperLiquid perpetual markets — volume, open interest, funding, fees & HIP-3 deploy auctions."
      />

      <section className="space-y-2.5">
        <SectionHead
          title="Overview"
          subtitle="volume, fees, open interest, HLP & the flagship perp across HyperLiquid"
        />
        <PerpKpiStrip
          directory={directory}
          feesHistory={feesHistory}
          flagshipCandles={btcCandles}
        />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Market shape"
          subtitle="flagship prices · open-interest concentration · fee take · funding — real series only"
        />
        <PerpMarketShape
          directory={directory}
          feesHistory={feesHistory}
          btcCandles={btcCandles}
          ethCandles={ethCandles}
          candlesLoading={btcLoading || ethLoading}
        />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Deploy auctions"
          subtitle="HIP-3 perp-DEX dutch auction — live state, gas history & recent deploys"
          linkLabel="Auction history →"
          linkHref="/market/perp/auction"
        />
        <PerpAuctionBand />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="All perps"
          subtitle="Directory + movers · price, 24h change, volume, OI & funding"
        />
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start">
          <PerpDirectoryTable directory={directory} />
          <PerpLeaderboards directory={directory} />
        </div>
      </section>
    </div>
  );
}
