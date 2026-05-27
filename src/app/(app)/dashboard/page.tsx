"use client";

import { PageHeader } from "@/components/common";
import { PulseBar } from "@/components/dashboard/PulseBar";
import { MoversCard } from "@/components/dashboard/MoversCard";
import { AuctionsPanel } from "@/components/dashboard/AuctionsPanel";
import { Hip4DeployersComingSoon } from "@/components/dashboard/Hip4DeployersComingSoon";
import { LiquidationsPanel } from "@/components/dashboard/LiquidationsPanel";
import { TwapPanel } from "@/components/dashboard/TwapPanel";
import { VaultsModule } from "@/components/dashboard/modules/VaultsModule";
import { ValidatorsModule } from "@/components/dashboard/modules/ValidatorsModule";
import { BuildersConcentrationCard } from "@/components/dashboard/BuildersConcentrationCard";
import { Hip3MarketsPanel } from "@/components/dashboard/Hip3MarketsPanel";
import {
  Hip3PastAuctionsCard,
  Hip3TopDeployersCard,
} from "@/components/dashboard/Hip3AuctionRow";
import { Hip4OutcomesCard } from "@/components/dashboard/Hip4OutcomesCard";
import { FeesRevenuePanel } from "@/components/dashboard/FeesRevenuePanel";
import { StablecoinsCard } from "@/components/dashboard/StablecoinsCard";
import { SectionHead } from "@/components/dashboard/SectionHead";

/**
 * Dashboard — Liquid Terminal ecosystem overview (V4 — thematic).
 *
 * Section flow (top → bottom):
 *  1. Network Pulse        — real-time ecosystem metrics ribbon.
 *  2. Protocol Revenue     — 5-source stacked fees breakdown (perp · spot · HIP-1 · HIP-3 · HIP-4).
 *  3. Spot Markets         — spot movers · spot listing auction · stablecoin supply.
 *  4. Perpetuals & HIP-3   — perp movers · HIP-3 dex markets.
 *  5. HIP-4 Outcomes       — prediction markets (full width, pending mainnet).
 *  6. Live Activity        — liquidations · TWAP orders.
 *  7. Capital Allocators   — vaults · validators.
 *  8. Builder Ecosystem    — top builders · fee concentration donut.
 */
export default function Home() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Ecosystem Overview"
        description="Real-time pulse of the Hyperliquid ecosystem."
      />

      {/* 1 — Network Pulse */}
      <section className="space-y-2.5">
        <SectionHead
          title="Network Pulse"
          subtitle="Real-time ecosystem metrics"
        />
        <PulseBar />
      </section>

      {/* 2 — Protocol Revenue + Stablecoins side by side (50/50) */}
      <section className="space-y-2.5">
        <SectionHead
          title="Protocol Revenue &amp; Capital"
          subtitle="Daily fees decomposition · stablecoin supply on spot"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FeesRevenuePanel />
          <StablecoinsCard />
        </div>
      </section>

      {/* 3 — Perpetuals & HIP-3 : 2 rows
          Row 1: trending perp + HIP-3 markets panel
          Row 2: HIP-3 live auction · past auctions · top deployers */}
      <section className="space-y-4">
        <SectionHead
          title="Perpetuals & HIP-3"
          subtitle="Trending perpetuals · HIP-3 markets · auctions & deployers"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MoversCard market="perp" />
          <Hip3MarketsPanel />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,1.3fr)] gap-4">
          <AuctionsPanel market="perp" />
          <Hip3PastAuctionsCard />
          <Hip3TopDeployersCard />
        </div>
      </section>

      {/* 4 — Spot Markets : movers + listing auction (current) + builders code */}
      <section className="space-y-2.5">
        <SectionHead
          title="Spot Markets"
          subtitle="Trending spot · live listing auction · builder fees concentration"
        />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_264px_minmax(0,1fr)] gap-4">
          <MoversCard market="spot" />
          <AuctionsPanel market="spot" />
          <BuildersConcentrationCard />
        </div>
      </section>

      {/* 5 — Live Activity : liquidations + TWAPs (2 cols) */}
      <section className="space-y-2.5">
        <SectionHead
          title="Live Activity"
          subtitle="Liquidations, TWAPs & orderflow pressure"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LiquidationsPanel />
          <TwapPanel />
        </div>
      </section>

      {/* 6 — HIP-4 Outcomes + HIP-4 Deployers placeholder (50/50) */}
      <section className="space-y-2.5">
        <SectionHead
          title="HIP-4 Outcomes"
          subtitle="Prediction-market positions · upcoming deployer leaderboard"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Hip4OutcomesCard />
          <Hip4DeployersComingSoon />
        </div>
      </section>

      {/* 7 — Capital Allocators : vaults + validators */}
      <section className="space-y-2.5">
        <SectionHead
          title="Capital Allocators"
          subtitle="Top vaults & validators by TVL and stake"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <VaultsModule />
          <ValidatorsModule />
        </div>
      </section>
    </div>
  );
}
