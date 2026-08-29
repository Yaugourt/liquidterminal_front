"use client";

import { MoversCard } from "@/components/dashboard/MoversCard";
import { AuctionsPanel } from "@/components/dashboard/AuctionsPanel";
import { LiquidationsPanel } from "@/components/dashboard/LiquidationsPanel";
import { TwapPanel } from "@/components/dashboard/TwapPanel";
import { BuildersConcentrationCard } from "@/components/dashboard/BuildersConcentrationCard";
import { Hip3MarketsPanel } from "@/components/dashboard/Hip3MarketsPanel";
import {
  Hip3PastAuctionsCard,
  Hip3TopDeployersCard,
} from "@/components/dashboard/Hip3AuctionRow";
import { Hip4OutcomesCard } from "@/components/dashboard/Hip4OutcomesCard";
import { TraderPnlCard } from "@/components/dashboard/TraderPnlCard";
import { SectionHead } from "@/components/dashboard/SectionHead";

/**
 * Dashboard · Market — the venues and what trades on them.
 *
 * Section flow: perpetuals & HIP-3 · spot markets · live activity · HIP-4.
 * Every module here already existed on the single-scroll dashboard; nothing
 * was redesigned, they simply stopped competing with capital and ecosystem.
 */
export default function DashboardMarket() {
  return (
    <div className="space-y-8">
      {/* Perpetuals & HIP-3 : trending + markets, then auctions & deployers */}
      <section className="space-y-2.5">
        <SectionHead
          title="Perpetuals & HIP-3"
          subtitle="Trending perpetuals · HIP-3 markets · auctions & deployers"
          linkLabel="All perpetuals →"
          linkHref="/market/perp"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MoversCard market="perp" />
          <Hip3MarketsPanel />
        </div>
        {/* xl, not lg: at 1024 a third of the content column is ~200px, which no
            dense table survives. */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,1.3fr)] gap-4">
          <AuctionsPanel market="perp" />
          <Hip3PastAuctionsCard />
          <Hip3TopDeployersCard />
        </div>
      </section>

      {/* Spot Markets : movers + listing auction + builders concentration */}
      <section className="space-y-2.5">
        <SectionHead
          title="Spot Markets"
          subtitle="Trending spot · live listing auction · builder fees concentration"
          linkLabel="All spot →"
          linkHref="/market/spot"
        />
        {/* xl, not lg: see above. */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_264px_minmax(0,1fr)] gap-4">
          <MoversCard market="spot" />
          <AuctionsPanel market="spot" />
          <BuildersConcentrationCard />
        </div>
      </section>

      {/* Live Activity : liquidations + TWAPs */}
      <section className="space-y-2.5">
        <SectionHead
          title="Live Activity"
          subtitle="Liquidations, TWAPs & orderflow pressure"
          linkLabel="All liquidations →"
          linkHref="/explorer/liquidations"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LiquidationsPanel />
          <TwapPanel />
        </div>
      </section>

      {/* Trader PnL by market */}
      <section className="space-y-2.5">
        <SectionHead
          title="Trader flows"
          subtitle="Where traders made and lost money, net realized · 10d"
        />
        <TraderPnlCard />
      </section>

      {/* HIP-4 Outcomes */}
      <section className="space-y-2.5">
        <SectionHead
          title="HIP-4 Outcomes"
          subtitle="Prediction-market positions"
          linkLabel="All outcome markets →"
          linkHref="/market/hip4"
        />
        <Hip4OutcomesCard />
      </section>
    </div>
  );
}
