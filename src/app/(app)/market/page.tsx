"use client";

import { useEffect, useMemo } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { PageHeader, KpiRibbon, KpiCell, PageFaq } from "@/components/common";
import { MARKET_FAQ } from "@/lib/page-faqs";
import { compactUsd, compactCount, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useSpotGlobalStats } from "@/services/market/spot/hooks/useSpotGlobalStats";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { usePerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { useSpotStablecoins } from "@/services/market/stablecoins";
import { useTradingVolume24h, useActiveTraders24h, useTotalFees24h } from "@/services/indexer/overview";
import { useHip3Overview } from "@/services/indexer/hip3";
import { VenueSplitBar } from "@/components/market/hub/VenueSplitBar";
import { SpotVenueCard, PerpVenueCard } from "@/components/market/hub/VenueCards";
import { PerpDexsLane, Hip4Lane, BuildersLane } from "@/components/market/hub/HubLanes";
import { TopTradersCard, FundingWatchCard } from "@/components/market/hub/HubRail";

/** "+27.3% vs prior 24h" colored sub. */
function variationSub(pct: number | undefined | null): React.ReactNode {
  if (pct == null) return undefined;
  return (
    <span className={pct >= 0 ? "text-success" : "text-danger"}>
      {pct >= 0 ? "+" : ""}
      {pct.toFixed(1)}% vs prior 24h
    </span>
  );
}

export default function MarketHubPage() {
  const { setTitle } = usePageTitle();
  const { format } = useNumberFormat();
  useEffect(() => {
    setTitle("Market");
  }, [setTitle]);

  // One fetch per source; every module below is presentational.
  const { data: volume24h } = useTradingVolume24h();
  const { data: traders24h } = useActiveTraders24h();
  const { data: fees24h } = useTotalFees24h();
  const { stats: spotStats } = useSpotGlobalStats();
  const { stats: perpStats } = usePerpGlobalStats();
  const { data: hip3 } = useHip3Overview();
  const { stablecoins } = useSpotStablecoins();
  const { data: spotTokens } = useSpotTokens({ limit: 100, sortBy: "volume", sortOrder: "desc" });
  const { data: perpMarkets } = usePerpMarkets({ limit: 100, defaultParams: { sortBy: "volume", sortOrder: "desc" } });

  const hype = useMemo(() => spotTokens.find((t) => t.name === "HYPE") ?? null, [spotTokens]);

  const stableTotal = useMemo(() => {
    if (!stablecoins || stablecoins.length === 0) return null;
    const total = stablecoins.reduce((acc, s) => acc + s.supply, 0);
    if (total <= 0) return null;
    const usdc = stablecoins.find((s) => s.symbol === "USDC");
    const usdcPct = usdc ? (usdc.supply / total) * 100 : null;
    return { total, usdcPct };
  }, [stablecoins]);

  const cells = useMemo<KpiCell[]>(() => {
    const out: KpiCell[] = [];
    if (volume24h) {
      out.push({
        key: "vol",
        label: "Volume · 24h",
        value: compactUsd(volume24h.value),
        sub: variationSub(volume24h.variationPct),
      });
    }
    if (traders24h) {
      out.push({
        key: "traders",
        label: "Active traders · 24h",
        value: compactCount(traders24h.value),
        sub: variationSub(traders24h.variationPct),
      });
    }
    if (fees24h) {
      out.push({
        key: "fees",
        label: "Fees · 24h",
        value: compactUsd(fees24h.totalFees),
        tone: "gold",
        sub: `perps ${compactUsd(fees24h.feesPerpUsdc)} · spot ${compactUsd(fees24h.feesSpot)}`,
      });
    }
    if (hype) {
      out.push({
        key: "hype",
        label: "HYPE spot",
        value: formatPrice(hype.price, format),
        tone: hype.change24h >= 0 ? "success" : "danger",
        sub: `${hype.change24h >= 0 ? "+" : ""}${hype.change24h.toFixed(2)}% · 24h`,
      });
    }
    if (stableTotal) {
      out.push({
        key: "stables",
        label: "Stablecoins on spot",
        value: compactUsd(stableTotal.total),
        sub: stableTotal.usdcPct != null ? `USDC ${stableTotal.usdcPct.toFixed(1)}%` : undefined,
      });
    }
    if (perpStats) {
      out.push({
        key: "oi",
        label: "Open interest",
        value: compactUsd(perpStats.totalOpenInterest),
        sub: hip3 ? `core perps · +${compactUsd(hip3.total_open_interest)} HIP-3` : "core perps",
      });
    }
    return out;
  }, [volume24h, traders24h, fees24h, hype, stableTotal, perpStats, hip3, format]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Market"
        titleQualifier="· everything traded on Hyperliquid"
        description="Everything traded on Hyperliquid — spot, perps, builder DEXs and predictions, one door in."
      />

      {cells.length > 0 && <KpiRibbon cells={cells} />}

      <VenueSplitBar
        hip3Volume={hip3?.total_volume_24h ?? null}
        perpVolume={perpStats?.totalVolume24h ?? null}
        spotVolume={spotStats?.totalVolume24h ?? null}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-4 items-start">
        <div className="min-w-0 space-y-4">
          {/* The two order books — the sidebar replacements get the first visual rank. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SpotVenueCard stats={spotStats ?? undefined} tokens={spotTokens} />
            <PerpVenueCard stats={perpStats ?? undefined} markets={perpMarkets} />
          </div>

          {/* One lane per remaining sidebar sibling. */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <PerpDexsLane overview={hip3} />
            <Hip4Lane />
            <BuildersLane />
          </div>
        </div>

        <aside className="xl:sticky xl:top-6 space-y-4">
          <TopTradersCard />
          <FundingWatchCard markets={perpMarkets} />
        </aside>
      </div>

      <PageFaq items={MARKET_FAQ} />
    </div>
  );
}
