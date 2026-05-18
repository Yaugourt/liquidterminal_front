"use client";

import { PageHeader } from "@/components/common";
import { EcosystemStats } from "@/components/dashboard/EcosystemStats";
import { MoversCard } from "@/components/dashboard/MoversCard";
import { CapitalCard } from "@/components/dashboard/CapitalCard";
import { LiquidationsCard } from "@/components/dashboard/LiquidationsCard";
import { TwapCard } from "@/components/dashboard/TwapCard";
import { BuildersModule } from "@/components/dashboard/modules/BuildersModule";
import { PerpDexModule } from "@/components/dashboard/modules/PerpDexModule";
import { ChartSection } from "@/components/dashboard/chart/ChartSection";
import { AuctionCard } from "@/components/market/auction";
import { Card } from "@/components/ui/card";

/**
 * Dashboard — vue d'ensemble de Liquid Terminal.
 *
 * Bandeau de KPI en cartes + chart/auctions, puis Spot/Perp en pleine
 * largeur (tableaux complets), liquidations, TWAP, capital, chaîne.
 */
export default function Home() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Ecosystem Overview"
        description="Real-time pulse of the HyperLiquid ecosystem — every corner of Liquid Terminal at a glance."
      />

      {/* KPI écosystème — une carte par stat + carte Liquidations 24h */}
      <EcosystemStats />

      {/* Tendance + auctions live (spot & perp) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch">
        <Card className="xl:col-span-2 flex flex-col min-h-[380px]">
          <ChartSection />
        </Card>
        <AuctionCard marketType="spot" />
        <AuctionCard marketType="perp" />
      </div>

      {/* Marchés — pleine largeur, tableaux complets */}
      <MoversCard market="spot" />
      <MoversCard market="perp" />

      {/* Activité live */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <LiquidationsCard />
        <TwapCard />
      </div>

      {/* Capital — vaults + validators */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CapitalCard kind="vaults" />
        <CapitalCard kind="validators" />
      </div>

      {/* Chaîne — builders + perp dexes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BuildersModule />
        <PerpDexModule />
      </div>
    </div>
  );
}
