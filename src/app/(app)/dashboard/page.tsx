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
import { PerpDexModule } from "@/components/dashboard/modules/PerpDexModule";
import { ChartSection } from "@/components/dashboard/chart/ChartSection";
import { Card } from "@/components/ui/card";

/**
 * Dashboard — vue d'ensemble de Liquid Terminal.
 *
 * Forme convergée : pulse bar (l'état de l'écosystème) en haut · grille 12
 * colonnes — colonne principale (marchés + chart) et colonne live (auctions,
 * liquidations, TWAP) · capital & infrastructure en bas.
 */
export default function Home() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Ecosystem Overview"
        description="Real-time pulse of the Hyperliquid ecosystem."
      />

      {/* Pulse bar — l'état de l'écosystème */}
      <PulseBar />

      {/* Grille 12 col — principale (marchés + chart) + colonne live */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MoversCard market="spot" />
            <MoversCard market="perp" />
          </div>
          <Card className="flex flex-col min-h-[360px]">
            <ChartSection />
          </Card>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-4">
          <AuctionsPanel />
          <LiquidationsPanel />
          <TwapPanel />
        </div>
      </div>

      {/* Capital & infrastructure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <VaultsModule />
        <ValidatorsModule />
        <BuildersModule />
        <PerpDexModule />
      </div>
    </div>
  );
}
