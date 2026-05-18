"use client";

import { PageHeader } from "@/components/common";
import { HeroPulse } from "@/components/dashboard/HeroPulse";
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
 * Layout bento : en-tête + chart/auction, puis Spot et Perp en pleine
 * largeur (tableaux complets), puis l'activité et la chaîne. La hiérarchie
 * est portée par la taille — les marchés ont le plus de place.
 */
export default function Home() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Ecosystem Overview"
        description="Real-time pulse of the HyperLiquid ecosystem — every corner of Liquid Terminal at a glance."
      />

      {/* En-tête — volume écosystème + KPI globaux */}
      <HeroPulse />

      {/* Tendance + auction live */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <Card className="xl:col-span-2 flex flex-col min-h-[380px]">
          <ChartSection />
        </Card>
        <div className="xl:col-span-1">
          <AuctionCard marketType="spot" />
        </div>
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
