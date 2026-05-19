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
import { Hip3MarketsPanel } from "@/components/dashboard/Hip3MarketsPanel";
import { ChartSection } from "@/components/dashboard/chart/ChartSection";
import { StablecoinsCard } from "@/components/dashboard/StablecoinsCard";
import { SectionHead } from "@/components/dashboard/SectionHead";
import { Card } from "@/components/ui/card";

/**
 * Dashboard — vue d'ensemble de Liquid Terminal.
 *
 * Disposition analytics (mockup 3) : pulse bar (l'état de l'écosystème) en
 * haut · lignes empilées pleine largeur — chart + auction (g-main), marchés
 * spot/perp (g-2), flux live liquidations/TWAP/perp DEXs (g-3), capital
 * vaults/validators (g-2), leaderboard builders en pied.
 */
export default function Home() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Ecosystem Overview"
        description="Real-time pulse of the Hyperliquid ecosystem."
      />

      {/* Pulse bar — l'état de l'écosystème */}
      <div className="space-y-1.5">
        <SectionHead
          title="Network Pulse"
          subtitle="Real-time ecosystem metrics"
        />
        <PulseBar />
      </div>

      {/* g-main — chart + stablecoins */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
        <Card className="flex flex-col min-h-[360px]">
          <ChartSection />
        </Card>
        <StablecoinsCard />
      </div>

      {/* g-2 — table Spot + auction Spot + table Perp */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_264px_minmax(0,1fr)] gap-4">
        <MoversCard market="spot" />
        <AuctionsPanel market="spot" />
        <MoversCard market="perp" />
      </div>

      {/* g-3 — flux live : liquidations + TWAP + marchés HIP-3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LiquidationsPanel />
        <TwapPanel />
        <Hip3MarketsPanel />
      </div>

      {/* g-2 — capital : vaults + validators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VaultsModule />
        <ValidatorsModule />
      </div>

      {/* Builder leaderboard — pleine largeur */}
      <div className="space-y-1.5">
        <SectionHead
          title="Builder Leaderboard"
          subtitle="Apps generating fees via the builder code program"
        />
        <BuildersModule />
      </div>
    </div>
  );
}
