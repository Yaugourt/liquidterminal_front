"use client";

import { PageHeader } from "@/components/common";
import { PulseBar } from "@/components/dashboard/PulseBar";
import { MoversCard } from "@/components/dashboard/MoversCard";
import { AuctionsPanel } from "@/components/dashboard/AuctionsPanel";
import { LiquidationsPanel } from "@/components/dashboard/LiquidationsPanel";
import { TwapPanel } from "@/components/dashboard/TwapPanel";
import { VaultsModule } from "@/components/dashboard/modules/VaultsModule";
import { ValidatorsModule } from "@/components/dashboard/modules/ValidatorsModule";
import { BuildersModule } from "@/components/dashboard/modules/BuildersModule";
import { BuildersConcentrationCard } from "@/components/dashboard/BuildersConcentrationCard";
import { Hip3MarketsPanel } from "@/components/dashboard/Hip3MarketsPanel";
import { Hip4OutcomesCard } from "@/components/dashboard/Hip4OutcomesCard";
import { ChartSection } from "@/components/dashboard/chart/ChartSection";
import { StablecoinsCard } from "@/components/dashboard/StablecoinsCard";
import { SectionHead } from "@/components/dashboard/SectionHead";
import { Card } from "@/components/ui/card";

/**
 * Dashboard — vue d'ensemble de Liquid Terminal (V4 — Variant A "thematic").
 *
 * 6 groupes thématiques, séparés par un `SectionHead` + `gap-8` :
 *  1. Network Pulse — état temps-réel de l'écosystème (PulseBar).
 *  2. Capital Flow — chart multi-séries + stablecoins.
 *  3. Markets — trending spot · auction spot · trending perp.
 *  4. Live Activity — liquidations + TWAPs (2 colonnes, respirent).
 *  5. Hyperliquid Extensions — HIP-3 perp DEXs + HIP-4 outcome markets.
 *  6. Capital Allocators — vaults + validators.
 *  7. Builder Ecosystem — top 5 builders + fees concentration donut.
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

      {/* 2 — Capital Flow : chart + stablecoins */}
      <section className="space-y-2.5">
        <SectionHead
          title="Capital Flow"
          subtitle="TVL, fees & stablecoin supply over time"
        />
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
          <Card className="flex flex-col min-h-[360px]">
            <ChartSection />
          </Card>
          <StablecoinsCard />
        </div>
      </section>

      {/* 3 — Markets : spot table + spot auction + perp table */}
      <section className="space-y-2.5">
        <SectionHead
          title="Markets"
          subtitle="Live trading activity across spot and perpetuals"
        />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_264px_minmax(0,1fr)] gap-4">
          <MoversCard market="spot" />
          <AuctionsPanel market="spot" />
          <MoversCard market="perp" />
        </div>
      </section>

      {/* 4 — Live Activity : liquidations + TWAPs (2 cols) */}
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

      {/* 5 — Hyperliquid Extensions : HIP-3 + HIP-4 */}
      <section className="space-y-2.5">
        <SectionHead
          title="Hyperliquid Extensions"
          subtitle="HIP-3 perp DEXs · HIP-4 outcome markets"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Hip3MarketsPanel />
          <Hip4OutcomesCard />
        </div>
      </section>

      {/* 6 — Capital Allocators : vaults + validators */}
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

      {/* 7 — Builder Ecosystem : top 5 + fees concentration */}
      <section className="space-y-2.5">
        <SectionHead
          title="Builder Ecosystem"
          subtitle="Builder code apps · who earns the fees and how concentrated the market is"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BuildersModule />
          <BuildersConcentrationCard />
        </div>
      </section>
    </div>
  );
}
