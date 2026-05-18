"use client";

import { PageHeader } from "@/components/common";
import { HeroPulse } from "@/components/dashboard/HeroPulse";
import { SpotModule } from "@/components/dashboard/modules/SpotModule";
import { PerpModule } from "@/components/dashboard/modules/PerpModule";
import { PerpDexModule } from "@/components/dashboard/modules/PerpDexModule";
import { BuildersModule } from "@/components/dashboard/modules/BuildersModule";
import { ExplorerModule } from "@/components/dashboard/modules/ExplorerModule";
import { EcosystemModule } from "@/components/dashboard/modules/EcosystemModule";
import { WikiModule } from "@/components/dashboard/modules/WikiModule";
import { TwapModule } from "@/components/dashboard/modules/TwapModule";
import { ChartSection } from "@/components/dashboard/chart/ChartSection";
import { AuctionCard } from "@/components/market/auction";
import { Card } from "@/components/ui/card";

/**
 * Dashboard — vue d'ensemble de Liquid Terminal.
 *
 * Layout bento : en-tête + zones de tailles variées. La hiérarchie est
 * portée par la taille (le chart et les marchés prennent plus de place)
 * et chaque zone de l'app a son résumé + lien.
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

      {/* Marchés — Spot + Perp, plus de contenu (top 5) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SpotModule />
        <PerpModule />
      </div>

      {/* Chaîne — Explorer / Builders / PerpDexs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ExplorerModule />
        <BuildersModule />
        <PerpDexModule />
      </div>

      {/* Activité & ressources — TWAPs / Ecosystem / Wiki */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <TwapModule />
        <EcosystemModule />
        <WikiModule />
      </div>
    </div>
  );
}
