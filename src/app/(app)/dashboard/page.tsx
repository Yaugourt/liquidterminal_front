"use client";

import { PageHeader } from "@/components/common";
import { PulseStrip } from "@/components/dashboard/PulseStrip";
import { MoversCard } from "@/components/dashboard/MoversCard";
import { CapitalCard } from "@/components/dashboard/CapitalCard";
import { LiquidationsCard } from "@/components/dashboard/LiquidationsCard";
import { TwapCard } from "@/components/dashboard/TwapCard";
import { AuctionsCard } from "@/components/dashboard/AuctionsCard";
import { ChartSection } from "@/components/dashboard/chart/ChartSection";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Ecosystem Overview"
        description="Real-time pulse of the HyperLiquid ecosystem — markets, capital, and live activity at a glance."
      />

      {/* Niveau 1 — Pulse de l'écosystème */}
      <PulseStrip />

      {/* Niveau 2 — Tendances */}
      <Card className="flex flex-col min-h-[420px]">
        <ChartSection />
      </Card>

      {/* Niveau 3 — Ce qui bouge : spot + perp côte à côte */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MoversCard market="spot" />
        <MoversCard market="perp" />
      </div>

      {/* Niveau 4 — Où est le capital : vaults + validators */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CapitalCard kind="vaults" />
        <CapitalCard kind="validators" />
      </div>

      {/* Niveau 5 — Activité live : auctions + liquidations + TWAPs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AuctionsCard />
        <LiquidationsCard />
      </div>
      <TwapCard />
    </div>
  );
}
